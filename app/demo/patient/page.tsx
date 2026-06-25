'use client';

import { useState } from 'react';
import { Shield, Users, FileText, Calendar, CheckCircle, Download, Search, QrCode, AlertCircle } from 'lucide-react';

export default function PatientDemo() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Samraksha Patient Demo</h1>
            </div>
            <button 
              onClick={() => window.close()}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Patient Portal Walkthrough</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how patients can manage prescriptions, verify doctors, and securely access healthcare with Samraksha.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'doctors'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('doctors')}
            >
              Doctors
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'prescriptions'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('prescriptions')}
            >
              Prescriptions
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
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Doctor Verification</h4>
                    <p className="text-gray-600 text-sm">
                      Verify any doctor's credentials through the National Medical Commission database.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Prescription Access</h4>
                    <p className="text-gray-600 text-sm">
                      View complete prescription history with secure access to encrypted QR codes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Appointment Booking</h4>
                    <p className="text-gray-600 text-sm">
                      Book appointments with verified doctors and manage your healthcare schedule.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                    <Download className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">QR Code Management</h4>
                    <p className="text-gray-600 text-sm">
                      Download and share prescription QR codes securely with pharmacists.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-4 mt-1">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Register & Login</h4>
                    <p className="text-purple-100">
                      Patients create an account with basic information and can log in securely.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-4 mt-1">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Find & Verify Doctors</h4>
                    <p className="text-purple-100">
                      Search for doctors and verify their credentials through NMC registration.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-4 mt-1">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Book Appointments</h4>
                    <p className="text-purple-100">
                      Request appointments with verified doctors and receive confirmation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-4 mt-1">
                    <span className="font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Access Prescriptions</h4>
                    <p className="text-purple-100">
                      View, download, and share prescription QR codes with pharmacists.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Doctor Verification</h3>
              
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-gray-900">Find Doctors</h4>
                  <div className="relative w-64">
                    <input
                      type="text"
                      placeholder="Search by name, specialty..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mr-4" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h5 className="font-bold text-gray-900">Dr. Priya Sharma</h5>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified</span>
                        </div>
                        <p className="text-purple-600 font-medium">Cardiologist</p>
                        <p className="text-sm text-gray-600 mt-1">NMC: NMC123456</p>
                        <div className="mt-3 flex items-center text-sm text-gray-600">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded mr-2">4.8 ★</span>
                          <span>10+ years experience</span>
                        </div>
                        <div className="mt-3 text-sm">
                          <p className="font-medium">Apollo Hospitals</p>
                          <p className="text-gray-600">Bangalore, Karnataka</p>
                        </div>
                        <button className="mt-4 w-full bg-purple-100 text-purple-700 py-2 rounded-lg font-medium hover:bg-purple-200">
                          Book Appointment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-bold text-gray-900 mb-4">Verify Doctor Credentials</h4>
                <div className="flex">
                  <div className="flex-1 mr-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter Doctor's NMC Number</label>
                    <div className="flex">
                      <input 
                        type="text" 
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., NMC123456"
                        defaultValue="NMC123456"
                      />
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700">
                        Verify
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verification Result</label>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="font-medium text-green-700">Doctor is Verified</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">Dr. Priya Sharma is a registered practitioner with NMC.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">My Prescriptions</h3>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-900">Recent Prescriptions</h4>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search prescriptions..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mr-3" />
                          <div>
                            <h5 className="font-bold text-gray-900">Dr. Priya Sharma</h5>
                            <p className="text-sm text-gray-600">Cardiologist • Dec 12, 2025</p>
                          </div>
                        </div>
                        <div className="ml-15 mt-3">
                          <p className="font-medium">Diagnosis: Acute Bronchitis</p>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium">Azithromycin</p>
                                <p className="text-sm text-gray-600">500mg • Once daily</p>
                              </div>
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium">Paracetamol</p>
                                <p className="text-sm text-gray-600">650mg • Twice daily</p>
                              </div>
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <button className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm hover:bg-purple-200 flex items-center mb-2">
                          <QrCode className="w-4 h-4 mr-1" />
                          Show QR
                        </button>
                        <button className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200 flex items-center">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </button>
                        <p className="text-xs text-gray-500 mt-2">Valid until: Dec 31, 2025</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-bold text-gray-900 mb-4">Prescription Statistics</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-700">12</div>
                    <div className="text-sm text-purple-600">Total Prescriptions</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">8</div>
                    <div className="text-sm text-green-600">Active Prescriptions</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">4</div>
                    <div className="text-sm text-blue-600">Expired Prescriptions</div>
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