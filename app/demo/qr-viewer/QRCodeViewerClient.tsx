'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QrCode, Download, ArrowLeft, Eye, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function QRCodeViewerClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [qrData, setQrData] = useState<string>('');
  const [qrImage, setQrImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prescriptionInfo, setPrescriptionInfo] = useState<any>(null);

  useEffect(() => {
    const qrParam = searchParams.get('data');
    const imageParam = searchParams.get('image');
    const infoParam = searchParams.get('info');

    if (qrParam) {
      try {
        setQrData(decodeURIComponent(qrParam));
      } catch (err) {
        setError('Invalid QR data');
      }
    }

    if (imageParam) {
      setQrImage(decodeURIComponent(imageParam));
    }

    if (infoParam) {
      try {
        setPrescriptionInfo(JSON.parse(decodeURIComponent(infoParam)));
      } catch (err) {
        console.error('Failed to parse prescription info');
      }
    }

    setLoading(false);
  }, [searchParams]);

  const handleDownload = () => {
    if (qrImage) {
      const link = document.createElement('a');
      link.href = qrImage;
      link.download = `prescription-qr-${Date.now()}.png`;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading QR Code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Error Loading QR Code</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/doctor/dashboard"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/doctor/dashboard"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            <Download className="h-5 w-5" />
            <span>Download</span>
          </button>
        </div>

        {/* Main QR Display */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl inline-block mb-4">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Prescription QR Code</h1>
            <p className="text-gray-600">Show this QR code to be scanned or download it</p>
          </div>

          <div className="bg-white border-4 border-blue-100 rounded-2xl p-6 mb-6">
            {qrImage ? (
              <div className="relative">
                <img
                  src={qrImage}
                  alt="Prescription QR Code"
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  style={{ imageRendering: 'crisp-edges' }}
                />
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                    Scan This QR Code
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <QrCode className="h-24 w-24 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No QR code image available</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <Smartphone className="h-5 w-5 mr-2 text-blue-600" />
              How to Use This QR Code
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Show on Screen</p>
                  <p className="text-sm text-gray-600">Keep this page open on your phone or computer</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Pharmacist Scans It</p>
                  <p className="text-sm text-gray-600">Pharmacist will scan using their portal</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Or Download & Share</p>
                  <p className="text-sm text-gray-600">Click download button to save and share the image</p>
                </div>
              </div>
            </div>
          </div>

          {prescriptionInfo && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-purple-600" />
                Prescription Details
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Doctor</p>
                    <p className="font-semibold">{prescriptionInfo.doctorName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Patient</p>
                    <p className="font-semibold">{prescriptionInfo.patientName || 'N/A'}</p>
                  </div>
                </div>
                {prescriptionInfo.diagnosis && (
                  <div>
                    <p className="text-sm text-gray-600">Diagnosis</p>
                    <p className="font-semibold">{prescriptionInfo.diagnosis}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-semibold">
                      {prescriptionInfo.createdAt ? new Date(prescriptionInfo.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expires</p>
                    <p className="font-semibold">
                      {prescriptionInfo.expiryDate ? new Date(prescriptionInfo.expiryDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {qrData && (
            <details className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <summary className="cursor-pointer font-medium text-amber-900">View Encrypted Data (Technical)</summary>
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">This is the encrypted prescription data:</p>
                <div className="bg-white rounded-lg p-3 border border-amber-200">
                  <p className="text-xs font-mono break-all text-gray-700">{qrData.substring(0, 200)}...</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Length: {qrData.length} characters | Starts with: {qrData.substring(0, 10)}
                </p>
              </div>
            </details>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg"
          >
            <Download className="h-5 w-5" />
            <span className="font-semibold">Download PNG</span>
          </button>
          <Link
            href="/demo/qr-tester"
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 shadow-lg"
          >
            <QrCode className="h-5 w-5" />
            <span className="font-semibold">Test QR Code</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-lg mb-3">ℹ️ About This QR Code</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✅</span>
              <span>Contains encrypted prescription data</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✅</span>
              <span>Can be scanned by pharmacist portal</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✅</span>
              <span>High quality 800x800 pixel image</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✅</span>
              <span>Valid for {prescriptionInfo?.validityDays || 7} days from creation</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <span>Can only be used once by a pharmacy</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
