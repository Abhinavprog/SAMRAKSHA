'use client';

import { useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Upload, CheckCircle, XCircle, FileText } from 'lucide-react';

export default function QRCodeTester() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState<any>(null);

  const testQRCode = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setResult('');

    setFileInfo({
      name: file.name,
      type: file.type,
      size: (file.size / 1024).toFixed(2) + ' KB',
      lastModified: new Date(file.lastModified).toLocaleString()
    });

    console.log('🧪 QR Code Test Started');
    console.log('File:', file.name, file.type, file.size);

    try {
      const html5QrCode = new Html5Qrcode('test-scanner');
      const anyQr = html5QrCode as any;
      
      let decodedText: string | null = null;
      
      try {
        console.log('Attempting to scan with scanFileV2...');
        if (typeof anyQr.scanFileV2 === 'function') {
          const scanResult = await anyQr.scanFileV2(file, false);
          console.log('✅ scanFileV2 result:', scanResult);
          decodedText = scanResult?.text || scanResult?.result?.text || null;
        } else {
          console.log('Attempting to scan with scanFile...');
          decodedText = await html5QrCode.scanFile(file, true);
          console.log('✅ scanFile result:', decodedText);
        }
      } catch (scanError: any) {
        console.error('❌ Scan error:', scanError);
        console.error('Error name:', scanError?.name);
        console.error('Error message:', scanError?.message);
        
        if (scanError?.name === 'NotFoundException') {
          throw new Error('No QR code found in image. The image may be blurry, too small, or not contain a valid QR code.');
        }
        throw scanError;
      }

      await html5QrCode.clear();

      if (decodedText && decodedText.trim()) {
        console.log('📝 Decoded text length:', decodedText.length);
        console.log('📝 Decoded preview:', decodedText.substring(0, 100));
        
        // Check format
        if (decodedText.startsWith('U2FsdGVkX')) {
          console.log('✅ Valid encrypted prescription QR code');
          setResult(`✅ SUCCESS! Valid QR Code Detected\n\n📊 Details:\n• Length: ${decodedText.length} characters\n• Format: Encrypted (AES)\n• Starts with: U2FsdGVkX\n• Status: Ready for pharmacist verification\n\n📝 Preview (first 100 chars):\n${decodedText.substring(0, 100)}...`);
        } else if (decodedText.startsWith('INVALID_QR_')) {
          console.log('⚠️ Old test QR code detected');
          setError('⚠️ This is an old test QR code (INVALID_QR_). Please generate a new prescription from the doctor portal.');
        } else {
          console.log('⚠️ Unknown format');
          setResult(`⚠️ QR Code Detected but Unknown Format\n\n📊 Details:\n• Length: ${decodedText.length} characters\n• Preview: ${decodedText.substring(0, 100)}\n\nThis QR code was read successfully, but it doesn't appear to be a prescription QR code.`);
        }
      } else {
        setError('❌ No data found in QR code');
      }

    } catch (err: any) {
      console.error('❌ Test failed:', err);
      setError(`❌ Failed to read QR code\n\nError: ${err.message || 'Unknown error'}\n\nPossible reasons:\n• Image doesn't contain a QR code\n• QR code is too small or blurry\n• Image quality is poor\n• QR code is damaged or incomplete`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">QR Code Scanner Test Tool</h1>
          <p className="text-gray-600 mb-6">
            Upload a QR code image to test if it can be scanned and read properly.
            This tool uses the same scanning library as the pharmacist portal.
          </p>

          <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50 mb-6">
            <Upload className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <p className="text-lg font-semibold mb-2">Upload QR Code Image</p>
            <p className="text-sm text-gray-600 mb-4">Supports PNG, JPG, JPEG files</p>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              onChange={testQRCode}
              className="block mx-auto"
              disabled={loading}
            />
          </div>

          {fileInfo && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">File Information:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">{fileInfo.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <p className="font-medium">{fileInfo.type}</p>
                </div>
                <div>
                  <span className="text-gray-600">Size:</span>
                  <p className="font-medium">{fileInfo.size}</p>
                </div>
                <div>
                  <span className="text-gray-600">Modified:</span>
                  <p className="font-medium">{fileInfo.lastModified}</p>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-blue-700 font-medium">Scanning QR code...</p>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 mb-6 rounded-r-lg">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-emerald-600 mr-3 mt-0.5" />
                <div className="whitespace-pre-line text-emerald-800">
                  <p className="font-bold text-lg mb-2">Test Result: Success</p>
                  <p className="text-sm">{result}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-6 mb-6 rounded-r-lg">
              <div className="flex items-start">
                <XCircle className="h-6 w-6 text-rose-600 mr-3 mt-0.5" />
                <div className="whitespace-pre-line text-rose-800">
                  <p className="font-bold text-lg mb-2">Test Result: Failed</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-2 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              How to Use This Tool:
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-amber-800">
              <li>Generate a prescription from the doctor portal</li>
              <li>Download the QR code image</li>
              <li>Upload it here to test if it's scannable</li>
              <li>If this tool can read it, the pharmacist portal will too</li>
              <li>Check browser console (F12) for detailed logs</li>
            </ol>
          </div>
        </div>

        {/* Hidden scanner element */}
        <div id="test-scanner" style={{ display: 'none' }}></div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-4">Expected Results</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-emerald-700">✅ Valid QR Code</p>
                <p className="text-gray-600">Shows encrypted data starting with U2FsdGVkX</p>
              </div>
            </div>
            <div className="flex items-start">
              <XCircle className="h-5 w-5 text-rose-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-rose-700">❌ Invalid QR Code</p>
                <p className="text-gray-600">NotFoundException - image quality issue or no QR code</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-amber-600 mr-2 mt-0.5 flex-shrink-0">⚠️</div>
              <div>
                <p className="font-semibold text-amber-700">⚠️ Test QR Code</p>
                <p className="text-gray-600">Contains INVALID_QR_ - needs regeneration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
