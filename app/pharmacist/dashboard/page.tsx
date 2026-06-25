'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Pill, LogOut, QrCode, FileText, CheckCircle, XCircle, Search, MapPin, Home, Hash, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { extractEncryptedPayload } from '@/lib/prescriptionPayload';
import { decodeQrFromImageFileRobust } from '@/lib/qrDecode';
import { PharmacistPrescriptionFromQrCard } from '@/components/prescription/PharmacistPrescriptionFromQrCard';

export default function PharmacistDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [prescriptionData, setPrescriptionData] = useState('');
  const [stats, setStats] = useState({
    verifiedToday: 0,
    scanned: 0,
    prescriptions: 0,
    invalid: 0
  });
  const [recentVerifications, setRecentVerifications] = useState<any[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [scannerStatus, setScannerStatus] = useState('');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const verifyPrescriptionRef = useRef<(data: string) => Promise<void>>(async () => {});
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
    fetchStats(token);
    fetchRecentVerifications(token);
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch('/api/pharmacist/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchRecentVerifications = async (token: string) => {
    try {
      const response = await fetch('/api/pharmacist/verifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRecentVerifications(data.verifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch verifications:', err);
    }
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
        setLoading(false);
        return;
      }

      const response = await fetch('/api/prescription/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ encryptedData: extracted })
      });

      const ct = response.headers.get('content-type');
      if (!ct || !ct.includes('application/json')) {
        setError('Server error: invalid response. Please try again.');
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        setError(result?.error || 'Verification failed');
        return;
      }

      setVerificationResult(result);
      if (result?.valid) {
        setSuccess('Scanned and dispensed successfully.');
      }

      await fetchStats(token);
      await fetchRecentVerifications(token);
    } catch (err) {
      setError('Failed to verify prescription. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyPrescriptionRef.current = verifyPrescription;
  });

  const decodeQrFromImageFile = (file: File) =>
    decodeQrFromImageFileRobust(file, 'hidden-file-scanner');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    const allowedExt = ['.png', '.jpg', '.jpeg'];
    const looksLikeImage =
      allowedExt.includes(ext) || !file.type || file.type.startsWith('image/');

    if (!looksLikeImage) {
      setError('Please upload a PNG or JPG image.');
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

    try {
      const decodedText = await decodeQrFromImageFile(file);

      if (!decodedText) {
        setError('No QR code visible in this image. Use a clear, full QR (PNG/JPG from the portal).');
        return;
      }

      const payload = extractEncryptedPayload(decodedText);
      if (decodedText.startsWith('INVALID_QR_')) {
        setError('This QR is a test/invalid code. Use a real prescription QR from a doctor.');
        return;
      }

      setPrescriptionData(payload);
      await verifyPrescription(payload);
    } catch (err: any) {
      const msg = (err?.message || String(err)).toLowerCase();
      if (
        msg.includes('notfound') ||
        msg.includes('no multiformat') ||
        msg.includes('no qr') ||
        msg.includes('unable to detect')
      ) {
        setError('No QR code visible in this image. Try a sharper photo or the original download.');
      } else {
        setError('Could not read QR from image. Try another file or use the camera scanner. ' + (err?.message || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showScanner) {
      setScannerStatus('');
      return;
    }

    let cancelled = false;

    const run = async () => {
      setScannerStatus('Preparing camera…');
      scanInProgressRef.current = false;
      for (let i = 0; i < 60; i++) {
        if (cancelled) return;
        if (document.getElementById('scanner-container')) break;
        await new Promise((r) => setTimeout(r, 30));
      }

      if (cancelled || !document.getElementById('scanner-container')) {
        setError('Scanner did not load. Close and tap Scan Prescription again.');
        setScannerStatus('');
        setShowScanner(false);
        return;
      }

      const html5QrCode = new Html5Qrcode('scanner-container', {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      } as any);
      html5QrCodeRef.current = html5QrCode;

      const onDecode = async (decodedText: string) => {
        if (!decodedText?.trim() || cancelled || scanInProgressRef.current) return;
        scanInProgressRef.current = true;
        cancelled = true;
        setScannerStatus('QR detected — verifying…');
        try {
          await html5QrCode.stop();
        } catch {
          /* ignore */
        }
        try {
          await html5QrCode.clear();
        } catch {
          /* ignore */
        }
        html5QrCodeRef.current = null;
        setShowScanner(false);
        setScannerStatus('');
        const payload = extractEncryptedPayload(decodedText);
        setPrescriptionData(payload);
        await verifyPrescriptionRef.current(payload);
      };

      const config = {
        fps: 12,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const s = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.82);
          const box = Math.max(200, Math.min(s, 520));
          return { width: box, height: box };
        },
        aspectRatio: 1,
      };

      const tryStart = async (constraints: { facingMode: string } | { deviceId: { exact: string } }) => {
        await html5QrCode.start(
          constraints as any,
          config,
          onDecode,
          () => {}
        );
      };

      try {
        setScannerStatus('Requesting camera (back camera)…');
        try {
          await tryStart({ facingMode: 'environment' });
        } catch {
          if (cancelled) return;
          setScannerStatus('Back camera unavailable — trying available cameras…');
          let started = false;
          const cameras = await Html5Qrcode.getCameras();
          const backCamera = cameras.find((cam) => /back|rear|environment/i.test(cam.label));
          if (backCamera?.id) {
            try {
              await tryStart({ deviceId: { exact: backCamera.id } });
              started = true;
            } catch {
              /* continue fallback */
            }
          }
          if (!started) {
            setScannerStatus('Trying front/default camera…');
            await tryStart({ facingMode: 'user' });
          }
        }
        if (!cancelled) setScannerStatus('Camera on — point at the QR code. It will scan automatically.');
      } catch (e: any) {
        if (!cancelled) {
          const msg = e?.message || e?.name || 'Unknown error';
          setError(
            `Camera could not start (${msg}). Allow camera access in the browser, or use Upload QR / Manual paste.`
          );
          setShowScanner(false);
        }
        html5QrCodeRef.current = null;
        setScannerStatus('');
      }
    };

    void run();

    return () => {
      cancelled = true;
      setScannerStatus('');
      const qr = html5QrCodeRef.current;
      html5QrCodeRef.current = null;
      if (qr) {
        void Promise.resolve(qr.stop()).catch(() => {});
        void Promise.resolve(qr.clear()).catch(() => {});
      }
    };
  }, [showScanner]);

  const startScanner = () => {
    setError('');
    setSuccess('');
    setVerificationResult(null);
    setScannerStatus('Opening scanner…');
    setShowScanner(true);
  };

  const stopScanner = async () => {
    const qr = html5QrCodeRef.current;
    html5QrCodeRef.current = null;
    if (qr) {
      try {
        await Promise.resolve(qr.stop());
      } catch {
        /* ignore */
      }
      try {
        await Promise.resolve(qr.clear());
      } catch {
        /* ignore */
      }
    }
    setShowScanner(false);
    scanInProgressRef.current = false;
  };

  const handleManualVerify = () => {
    if (!prescriptionData.trim()) {
      setError('Please enter prescription data');
      return;
    }
    verifyPrescription(prescriptionData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/pharmacist/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10 border-b border-emerald-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-md">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Samraksha</span>
              </Link>
              <nav className="hidden md:flex items-center space-x-4">
                <Link 
                  href="/pharmacist/dashboard" 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/pharmacist/scanner" 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Scanner
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-3 bg-emerald-50 px-5 py-3 rounded-xl border border-emerald-100 shadow-sm">
                <div className="bg-emerald-100 p-2.5 rounded-lg">
                  <Pill className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">Pharmacist: {user?.name || 'Loading...'}</p>
                  <p className="text-xs text-emerald-600 font-medium">{user?.pharmacyName || ''}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all shadow-md hover:shadow-lg"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-500 via-teal-500 to-green-600 text-white rounded-3xl p-8 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <Pill className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Welcome, {user.name}</h1>
                <p className="text-emerald-100 text-lg mt-1">{user.pharmacyName}</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center shadow-md">
              <CheckCircle className="h-6 w-6 text-emerald-300 mr-2" />
              <span className="font-medium">License Verified</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5 text-base">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-3 text-emerald-200" />
              <span className="text-emerald-100">{user.city}, {user.state}</span>
            </div>
            <div className="flex items-center">
              <Home className="h-5 w-5 mr-3 text-emerald-200" />
              <span className="text-emerald-100">{user.address}</span>
            </div>
            <div className="flex items-center">
              <Hash className="h-5 w-5 mr-3 text-emerald-200" />
              <span className="text-emerald-100">{user.pincode}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-lg p-6 border border-emerald-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3.5 rounded-xl shadow-md">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-emerald-600 font-medium">Verified Today</p>
                <p className="text-2xl font-bold text-gray-800">{stats.verifiedToday}</p>
                <p className="text-xs text-gray-500 mt-1">Valid QR you dispensed today</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3.5 rounded-xl shadow-md">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-blue-600 font-medium">Scanned</p>
                <p className="text-2xl font-bold text-gray-800">{stats.scanned}</p>
                <p className="text-xs text-gray-500 mt-1">Distinct Rx you scanned</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3.5 rounded-xl shadow-md">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-purple-600 font-medium">Prescriptions</p>
                <p className="text-2xl font-bold text-gray-800">{stats.prescriptions}</p>
                <p className="text-xs text-gray-500 mt-1">Total in system</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-rose-50 to-white rounded-2xl shadow-lg p-6 border border-rose-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-3.5 rounded-xl shadow-md">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-rose-600 font-medium">Invalid</p>
                <p className="text-2xl font-bold text-gray-800">{stats.invalid}</p>
                <p className="text-xs text-gray-500 mt-1">Expired or already used</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-5">
          <button
            onClick={startScanner}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 via-teal-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:via-teal-600 hover:to-green-700 font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <QrCode className="h-6 w-6" />
            <span>Scan Prescription</span>
          </button>
          
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            disabled={loading}
            className="flex items-center space-x-3 px-7 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FileText className="h-6 w-6" />
            <span>{loading ? 'Processing...' : 'Upload QR Code (PNG/JPG)'}</span>
          </button>
        </div>

        {/* Off-screen but in layout — display:none breaks html5-qrcode file scan on some browsers */}
        <div
          id="hidden-file-scanner"
          className="fixed left-0 top-0 -z-10 h-[min(90vw,640px)] w-[min(90vw,640px)] max-h-[640px] max-w-[640px] overflow-hidden opacity-0 pointer-events-none"
          aria-hidden
        />

        {/* File Upload */}
        {showFileUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-gray-800">Upload QR Code Image</h3>
                <button onClick={() => setShowFileUpload(false)} className="text-gray-500 hover:text-gray-900 text-2xl">&times;</button>
              </div>
              <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-center mb-5 bg-emerald-50">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  onChange={handleFileUpload}
                  className="w-full"
                />
                <p className="text-xs text-gray-600 mt-2">Accepts PNG, JPG, JPEG files from doctor portal</p>
                <p className="text-xs text-gray-500 mt-1">Ensure QR code is clear and visible in the image</p>
              </div>
            </div>
          </div>
        )}

        {/* Scanner */}
        {showScanner && (
          <div className="mb-8 bg-white rounded-2xl shadow-xl p-6 border-2 border-emerald-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Camera Scanner</h3>
              <button type="button" onClick={stopScanner} className="text-gray-500 hover:text-gray-900 text-2xl" aria-label="Close scanner">
                &times;
              </button>
            </div>
            {scannerStatus && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-900">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                <span>{scannerStatus}</span>
              </div>
            )}
            <div
              id="scanner-container"
              className="w-full max-w-lg mx-auto rounded-xl bg-black/90 min-h-[min(70vh,520px)]"
            />
          </div>
        )}

        {/* Manual Input */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg p-7 mb-8 border border-blue-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Manual Verification</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Paste encrypted prescription data here..."
              value={prescriptionData}
              onChange={(e) => setPrescriptionData(e.target.value)}
              className="flex-1 px-5 py-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300"
            />
            <button
              onClick={handleManualVerify}
              disabled={loading || !prescriptionData.trim()}
              className="px-7 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-rose-50 to-red-50 border-l-4 border-l-rose-500 text-rose-700 px-6 py-4 rounded-xl mb-6">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-l-emerald-500 text-emerald-800 px-6 py-4 rounded-xl mb-6">
            <p className="font-medium">{success}</p>
          </div>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <div className={`mb-8 rounded-3xl border p-7 shadow-xl ${
            verificationResult.valid 
              ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50' 
              : verificationResult.reason === 'EXPIRED'
              ? 'border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50'
              : verificationResult.reason === 'ALREADY_USED' || verificationResult.reason === 'ALREADY_DISPENSED_BY_OTHER'
              ? 'border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50'
              : verificationResult.reason === 'NOT_FOUND'
              ? 'border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50'
              : 'border-rose-200 bg-gradient-to-br from-rose-50 via-white to-red-50'
          }`}>
            <h3 className={`text-2xl font-bold mb-2 ${
              verificationResult.valid ? 'text-emerald-700' : 
              verificationResult.reason === 'EXPIRED' ? 'text-amber-700' :
              verificationResult.reason === 'ALREADY_USED' || verificationResult.reason === 'ALREADY_DISPENSED_BY_OTHER' ? 'text-orange-700' :
              verificationResult.reason === 'NOT_FOUND' ? 'text-sky-800' :
              'text-rose-700'
            }`}>
              {verificationResult.valid ? '✅ Prescription Verified' : 
               verificationResult.reason === 'EXPIRED' ? '⚠️ Prescription Expired' :
               verificationResult.reason === 'ALREADY_USED' ? '⚠️ Already Verified by Your Pharmacy' :
               verificationResult.reason === 'ALREADY_DISPENSED_BY_OTHER' ? '⚠️ Already Verified by Another Pharmacy' :
               verificationResult.reason === 'NOT_FOUND' ? 'ℹ️ Decrypted but not in this database' :
               verificationResult.reason === 'INVALID_FORMAT' ? '❌ Unreadable QR / wrong payload' :
               verificationResult.reason === 'TAMPERED_DATA' ? '❌ Could not decrypt payload' :
               '❌ Invalid Prescription'}
            </h3>
            <p className="mb-4 text-sm text-slate-700">{verificationResult.error || verificationResult.message}</p>
            {verificationResult.fromQR && (
              <PharmacistPrescriptionFromQrCard
                title={
                  verificationResult.reason === 'NOT_FOUND'
                    ? 'Full details decoded from this QR (not found in database)'
                    : verificationResult.valid
                      ? 'Prescription details (read from QR — verified)'
                      : 'Prescription details read from this QR'
                }
                data={verificationResult.fromQR}
              />
            )}
            {verificationResult.valid && verificationResult.prescription?.id && (
              <p className="mt-3 text-xs text-gray-500">
                System record ID: <span className="font-mono">{String(verificationResult.prescription.id)}</span>
              </p>
            )}

            {!verificationResult.fromQR && verificationResult.prescription && (
              <div className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border">
                    <p className="text-sm text-emerald-600 font-semibold mb-1">Doctor</p>
                    <p className="font-bold">{verificationResult.prescription.doctorName}</p>
                    <p className="text-sm text-gray-600">NMC: {verificationResult.prescription.doctorNMC}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border">
                    <p className="text-sm text-blue-600 font-semibold mb-1">Patient</p>
                    <p className="font-bold">{verificationResult.prescription.patientName}</p>
                    <p className="text-sm text-gray-600">{verificationResult.prescription.patientAge} years, {verificationResult.prescription.patientGender}</p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border">
                  <p className="text-sm text-purple-600 font-semibold mb-2">Diagnosis</p>
                  <p className="font-bold">{verificationResult.prescription.diagnosis}</p>
                </div>
                
                <div className="bg-white p-4 rounded-xl border">
                  <p className="text-sm text-blue-600 font-semibold mb-3">Medicines</p>
                  <div className="space-y-2">
                    {verificationResult.prescription.medicines.map((medicine: any, index: number) => (
                      <div key={index} className="flex justify-between bg-blue-50 p-3 rounded-lg">
                        <div>
                          <p className="font-bold">{medicine.name}</p>
                          <p className="text-sm text-gray-600">{medicine.dosage}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{medicine.frequency}</p>
                          <p className="text-sm text-gray-600">{medicine.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Verifications */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg p-7 border border-blue-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-5">Recent Verifications</h3>
          {recentVerifications.length > 0 ? (
            <div className="space-y-4">
              {recentVerifications.map((rx: any) => (
                <div key={rx.id} className="bg-white rounded-xl p-5 border shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">{rx.doctorName}</h4>
                      <p className="text-gray-700">Patient: {rx.patientName}</p>
                      <p className="text-sm text-purple-600">Diagnosis: {rx.diagnosis}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{new Date(rx.createdAt).toLocaleDateString()}</p>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                        rx.isUsed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rx.isUsed ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No recent verifications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

