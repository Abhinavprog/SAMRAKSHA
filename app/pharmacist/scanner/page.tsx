'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, QrCode, FileText, ArrowLeft, Loader2, Camera } from 'lucide-react';
import Link from 'next/link';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { extractEncryptedPayload } from '@/lib/prescriptionPayload';
import { decodeQrFromImageFileRobust } from '@/lib/qrDecode';
import { PharmacistPrescriptionFromQrCard } from '@/components/prescription/PharmacistPrescriptionFromQrCard';

export default function PharmacistScanner() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [prescriptionData, setPrescriptionData] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [scannerStatus, setScannerStatus] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [success, setSuccess] = useState('');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const startingRef = useRef(false);
  const scanInProgressRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/pharmacist/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'pharmacist') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const stopCamera = async () => {
    const qr = html5QrCodeRef.current;
    html5QrCodeRef.current = null;
    setCameraActive(false);
    if (!qr) {
      setScannerStatus('');
      return;
    }
    try {
      await qr.stop();
    } catch {
      /* ignore */
    }
    try {
      await qr.clear();
    } catch {
      /* ignore */
    }
    setScannerStatus('');
  };

  const verifyPrescription = async (encryptedData: string) => {
    const extracted = extractEncryptedPayload(encryptedData);
    if (!extracted || !extracted.trim()) {
      setError('No prescription data provided');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setVerificationResult(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        return;
      }

      const response = await fetch('/api/prescription/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ encryptedData: extracted }),
      });

      const ct = response.headers.get('content-type');
      if (!ct || !ct.includes('application/json')) {
        setError('Server error: invalid response.');
        return;
      }

      const result = await response.json();
      setVerificationResult(result);
      if (response.ok && result?.valid) {
        setSuccess('Scanned and dispensed successfully.');
      }
      if (!response.ok) setError(result?.error || 'Verification failed');
    } catch {
      setError('Failed to verify prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    if (startingRef.current || html5QrCodeRef.current) return;
    startingRef.current = true;
    setError('');
    setSuccess('');
    setScannerStatus('Preparing camera...');
    scanInProgressRef.current = false;

    try {
      if (!window.isSecureContext) {
        throw new Error('Camera requires secure context. Open this app on http://localhost:3000 or HTTPS.');
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API is not available in this browser.');
      }

      for (let i = 0; i < 60; i++) {
        if (document.getElementById('camera-scanner')) break;
        await new Promise((r) => setTimeout(r, 30));
      }
      if (!document.getElementById('camera-scanner')) throw new Error('Scanner container did not load.');

      const html5QrCode = new Html5Qrcode('camera-scanner', {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      } as any);
      html5QrCodeRef.current = html5QrCode;

      const onDecode = async (decodedText: string) => {
        if (!decodedText?.trim() || scanInProgressRef.current) return;
        scanInProgressRef.current = true;
        setScannerStatus('QR detected. Verifying...');
        const payload = extractEncryptedPayload(decodedText);
        await stopCamera();
        setPrescriptionData(payload);
        await verifyPrescription(payload);
      };

      const config = {
        fps: 12,
        qrbox: (vw: number, vh: number) => {
          const s = Math.floor(Math.min(vw, vh) * 0.82);
          const box = Math.max(200, Math.min(s, 520));
          return { width: box, height: box };
        },
        aspectRatio: 1,
      };

      setScannerStatus('Requesting back camera...');
      try {
        await html5QrCode.start({ facingMode: 'environment' }, config as any, onDecode, () => {});
      } catch {
        setScannerStatus('Back camera unavailable. Trying available cameras...');
        let started = false;
        const cameras = await Html5Qrcode.getCameras();
        const backCamera = cameras.find((cam) => /back|rear|environment/i.test(cam.label));
        if (backCamera?.id) {
          try {
            await html5QrCode.start({ deviceId: { exact: backCamera.id } }, config as any, onDecode, () => {});
            started = true;
          } catch {
            /* continue fallback */
          }
        }
        if (!started) {
          setScannerStatus('Trying front/default camera...');
          await html5QrCode.start({ facingMode: 'user' }, config as any, onDecode, () => {});
        }
      }

      setCameraActive(true);
      setScannerStatus('Camera live. Point at the QR code.');
    } catch (e: any) {
      await stopCamera();
      setError(e?.message || 'Failed to start camera.');
      scanInProgressRef.current = false;
    } finally {
      startingRef.current = false;
    }
  };

  useEffect(() => {
    if (!user) return;
    void startCamera();
    return () => {
      void stopCamera();
    };
  }, [user]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    const allowedExt = ['.png', '.jpg', '.jpeg'];
    const okType = !file.type || file.type.startsWith('image/');

    if (!allowedExt.includes(ext) && !okType) {
      setError('Only PNG, JPG, and JPEG files are allowed.');
      event.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Use an image under 10MB.');
      event.target.value = '';
      return;
    }

    event.target.value = '';
    setError('');
    setSuccess('');
    setLoading(true);
    setShowFileUpload(false);
    setScannerStatus('Decoding uploaded image...');

    try {
      const decodedText = await decodeQrFromImageFileRobust(file, 'hidden-scanner');
      if (!decodedText) {
        setError('No QR detected. Use the original Download QR PNG or a clearer image.');
        return;
      }

      const payload = extractEncryptedPayload(decodedText);
      setPrescriptionData(payload);
      await verifyPrescription(payload);
    } catch (err: any) {
      setError('Could not read QR from image. ' + (err?.message || ''));
    } finally {
      setLoading(false);
      if (!cameraActive) setScannerStatus('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/pharmacist/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10 border-b border-emerald-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/pharmacist/dashboard" className="flex items-center space-x-2 text-emerald-700 font-semibold">
            <ArrowLeft className="h-6 w-6" />
            <span>Back to Dashboard</span>
          </Link>
          <button onClick={handleLogout} className="px-5 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white rounded-3xl p-8 mb-8 shadow-xl">
          <h1 className="text-3xl md:text-4xl font-bold">Prescription Scanner</h1>
          <p className="text-emerald-100 text-lg mt-1">Scan QR codes and show prescription data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <Camera className="h-6 w-6 mr-2 text-emerald-600" />
                Camera Scanner
              </h3>
              <button
                type="button"
                onClick={() => void (cameraActive ? stopCamera() : startCamera())}
                disabled={loading}
                className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {cameraActive ? 'Stop Camera' : 'Start Camera'}
              </button>
            </div>
            {scannerStatus && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{scannerStatus}</span>
              </div>
            )}
            <div id="camera-scanner" className="w-full min-h-[min(70vh,520px)] rounded-xl bg-black/90" />
            {!cameraActive && (
              <p className="mt-2 text-xs text-gray-600">
                If it does not start, allow camera permission and use <strong>localhost</strong>, not network IP.
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-600" />
              Upload QR Code
            </h3>
            <button
              onClick={() => setShowFileUpload(true)}
              disabled={loading}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Select Image File'}
            </button>
            <p className="text-xs text-gray-600 mt-2">Accepts PNG, JPG, JPEG files</p>
          </div>
        </div>

        {showFileUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Upload QR Code Image</h3>
              <input type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" onChange={handleFileUpload} className="w-full mb-4" />
              <button onClick={() => setShowFileUpload(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            </div>
          </div>
        )}

        <div id="hidden-scanner" className="fixed left-0 top-0 -z-10 h-[min(90vw,640px)] w-[min(90vw,640px)] max-h-[640px] max-w-[640px] overflow-hidden opacity-0 pointer-events-none" aria-hidden />

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 px-6 py-4 rounded-xl mb-6">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 px-6 py-4 rounded-xl mb-6">
            <p className="font-medium">{success}</p>
          </div>
        )}

        {verificationResult && (
          <div className="rounded-2xl shadow-lg p-7 mb-8 border-l-4 bg-emerald-50 border-l-emerald-500">
            <h3 className="text-2xl font-bold mb-2 text-emerald-700">
              {verificationResult.valid ? '? Verified' : '?? Verification Result'}
            </h3>
            <p className="text-sm mb-4">{verificationResult.error || verificationResult.message}</p>
            {verificationResult.fromQR && <PharmacistPrescriptionFromQrCard data={verificationResult.fromQR} />}
          </div>
        )}
      </div>
    </div>
  );
}
