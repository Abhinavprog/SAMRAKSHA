'use client';

import { useState } from 'react';
import { Shield, Pill, Scan, CheckCircle, AlertCircle, Clock, FileText, QrCode, Upload, Download, Search } from 'lucide-react';

interface PrescriptionData {
  valid: boolean;
  prescriptionId: string;
  patientName: string;
  doctorName: string;
  doctorNMC: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  validUntil: string;
  scannedAt: string;
}

export default function PharmacistDemo() {
  const [activeTab, setActiveTab] = useState('overview');
  const [scanResult, setScanResult] = useState<PrescriptionData | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        valid: true,
        prescriptionId: 'RX-789456',
        patientName: 'Rajesh Kumar',
        doctorName: 'Dr. Priya Sharma',
        doctorNMC: 'NMC123456',
        medications: [
          { name: 'Azithromycin', dosage: '500mg', frequency: 'Once daily' },
          { name: 'Paracetamol', dosage: '650mg', frequency: 'Twice daily' }
        ],
        validUntil: 'December 31, 2025',
        scannedAt: new Date().toLocaleString()
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Samraksha Pharmacist Demo</h1>
            </div>
            <div className="flex space-x-3">
              <a 
                href="/pharmacist/scanner"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                target="_blank"
              >
                Open Scanner
              </a>
              <button 
                onClick={() => window.close()}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Pharmacist Portal Walkthrough</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how pharmacists can verify prescriptions and prevent fraud with Samraksha's secure platform.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'verification'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('verification')}
            >
              Verification
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Portal Features</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <Scan className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">QR Code Scanning</h4>
                    <p className="text-gray-600 text-sm">
                      Instantly verify prescriptions by scanning QR codes with built-in camera or file upload.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Doctor Verification</h4>
                    <p className="text-gray-600 text-sm">
                      Automatically verify doctor credentials through the National Medical Commission database.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <AlertCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Fraud Detection</h4>
                    <p className="text-gray-600 text-sm">
                      Identify expired, forged, or duplicate prescriptions with advanced detection algorithms.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                    <Clock className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Verification History</h4>
                    <p className="text-gray-600 text-sm">
                      Track all prescription verifications with timestamps and detailed logs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-4 mt-1">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Receive Prescription</h4>
                    <p className="text-green-100">
                      Patient presents a printed prescription or shows the QR code on their mobile device.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-4 mt-1">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Scan QR Code</h4>
                    <p className="text-green-100">
                      Use the built-in scanner to capture the QR code or upload an image file.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-4 mt-1">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Automatic Verification</h4>
                    <p className="text-green-100">
                      System decrypts the prescription and verifies doctor credentials in real-time.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-4 mt-1">
                    <span className="font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Review Results</h4>
                    <p className="text-green-100">
                      Check verification results and medication details before dispensing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Prescription Verification</h3>
              
              <div className="mb-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Scan QR Code</h4>
                    
                    <div className="mb-6">
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-400 transition-colors">
                        <Scan className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Click to scan QR code with camera</p>
                        <p className="text-sm text-gray-500">or drag & drop QR image here</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button 
                        className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center ${
                          isScanning 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        onClick={handleScan}
                        disabled={isScanning}
                      >
                        {isScanning ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Scanning...
                          </>
                        ) : (
                          <>
                            <Scan className="h-5 w-5 mr-2" />
                            Scan QR Code
                          </>
                        )}
                      </button>
                      
                      <button className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center">
                        <Upload className="h-5 w-5 mr-2" />
                        Upload
                      </button>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Manual Entry</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prescription ID</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter prescription ID"
                        />
                      </div>
                      
                      <button className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                        Verify Prescription
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {scanResult && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-bold text-gray-900 mb-4">Verification Result</h4>
                  
                  {scanResult.valid ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                        <div>
                          <h5 className="font-bold text-green-700 text-lg">Prescription Valid</h5>
                          <p className="text-green-600">This prescription is authentic and verified</p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">Prescription ID</p>
                            <p className="font-medium">{scanResult.prescriptionId}</p>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">Patient Name</p>
                            <p className="font-medium">{scanResult.patientName}</p>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">Doctor</p>
                            <p className="font-medium">{scanResult.doctorName}</p>
                            <p className="text-sm text-gray-600">NMC: {scanResult.doctorNMC}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">Valid Until</p>
                            <p className="font-medium">{scanResult.validUntil}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium mb-3">Medications</p>
                          <div className="space-y-3">
                            {scanResult.medications.map((med, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                                <div>
                                  <p className="font-medium">{med.name}</p>
                                  <p className="text-sm text-gray-600">{med.dosage} • {med.frequency}</p>
                                </div>
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-4 flex justify-end">
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                              <Download className="h-4 w-4 mr-2" />
                              Dispense Medication
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                        <div>
                          <h5 className="font-bold text-red-700 text-lg">Invalid Prescription</h5>
                          <p className="text-red-600">This prescription could not be verified</p>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-gray-700 mb-2">Possible reasons:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          <li>Prescription has expired</li>
                          <li>Doctor credentials could not be verified</li>
                          <li>QR code has been tampered with</li>
                          <li>Prescription has already been used</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Verification History</h3>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-900">Recent Verifications</h4>
                  <div className="relative w-64">
                    <input
                      type="text"
                      placeholder="Search verifications..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prescription</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">RX-789456</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Rajesh Kumar</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Dr. Priya Sharma</div>
                          <div className="text-sm text-gray-500">NMC123456</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Valid
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Dec 12, 2025 14:30
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">RX-246810</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Priya Menon</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Dr. Anil Reddy</div>
                          <div className="text-sm text-gray-500">NMC654321</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Invalid
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Dec 12, 2025 11:15
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">RX-135792</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Sunita Verma</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Dr. Priya Sharma</div>
                          <div className="text-sm text-gray-500">NMC123456</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Valid
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Dec 11, 2025 16:45
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-bold text-gray-900 mb-4">Statistics</h4>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">127</div>
                    <div className="text-sm text-green-600">Total Verified</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">89</div>
                    <div className="text-sm text-blue-600">Today</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-700">12</div>
                    <div className="text-sm text-yellow-600">Suspicious</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-700">3</div>
                    <div className="text-sm text-red-600">Invalid</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}