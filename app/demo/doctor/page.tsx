'use client';

import { useState } from 'react';
import { Shield, Stethoscope, FileText, Calendar, Users, CheckCircle, AlertCircle, QrCode, Download, Search } from 'lucide-react';

export default function DoctorDemo() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Samraksha Doctor Demo</h1>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Doctor Portal Walkthrough</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how doctors can securely generate prescriptions, manage patients, and track prescription history with Samraksha.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'prescription'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('prescription')}
            >
              Prescription
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'patients'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('patients')}
            >
              Patients
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
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <Stethoscope className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">NMC Verification</h4>
                    <p className="text-gray-600 text-sm">
                      All doctors are verified through the National Medical Commission database before accessing the portal.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Secure Prescriptions</h4>
                    <p className="text-gray-600 text-sm">
                      Generate tamper-proof prescriptions with AES-256 encryption and QR codes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Appointment Management</h4>
                    <p className="text-gray-600 text-sm">
                      Review and manage patient appointments with secure communication channels.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Patient History</h4>
                    <p className="text-gray-600 text-sm">
                      Access complete prescription history for each patient with search capabilities.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-4 mt-1">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Login & Verification</h4>
                    <p className="text-blue-100">
                      Doctors log in with NMC credentials and undergo verification before accessing the portal.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-4 mt-1">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Create Prescription</h4>
                    <p className="text-blue-100">
                      Generate digital prescriptions with patient details, medications, and dosage instructions.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-4 mt-1">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Encryption & QR Generation</h4>
                    <p className="text-blue-100">
                      Prescriptions are encrypted and converted to secure QR codes for patient and pharmacist use.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-4 mt-1">
                    <span className="font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Track & Manage</h4>
                    <p className="text-blue-100">
                      Monitor prescription usage, patient history, and appointment scheduling from the dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prescription' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Prescription Creation Process</h3>
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">Sample Prescription Form</h4>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                      Save Draft
                    </button>
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
                      Generate QR
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter patient name"
                        defaultValue="Rajesh Kumar"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Patient Age</label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter patient age"
                        defaultValue="45"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                    <textarea 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Enter diagnosis"
                      defaultValue="Acute Bronchitis"
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-bold text-gray-900">Medications</h5>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        + Add Medication
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Medication name"
                            defaultValue="Azithromycin"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Dosage"
                            defaultValue="500mg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            <option>Once daily</option>
                            <option>Twice daily</option>
                            <option>Thrice daily</option>
                            <option>As needed</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Medication name"
                            defaultValue="Paracetamol"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Dosage"
                            defaultValue="650mg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            <option>Twice daily</option>
                            <option>Once daily</option>
                            <option>Thrice daily</option>
                            <option>As needed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Save Prescription
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-bold text-gray-900 mb-4">Generated Prescription</h4>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="flex items-center">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mr-4" />
                            <div>
                              <h5 className="font-bold text-gray-900">Dr. Priya Sharma</h5>
                              <p className="text-blue-600 font-medium">Cardiologist</p>
                              <p className="text-sm text-gray-600">NMC: NMC123456</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <p className="font-medium">Patient: Rajesh Kumar (45)</p>
                            <p className="text-sm text-gray-600">Diagnosis: Acute Bronchitis</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Date: Dec 12, 2025</p>
                          <p className="text-sm text-gray-600">Valid Until: Dec 31, 2025</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">Azithromycin</p>
                            <p className="text-sm text-gray-600">500mg • Once daily</p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">Paracetamol</p>
                            <p className="text-sm text-gray-600">650mg • Twice daily</p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p className="mb-1">Signature:</p>
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-12" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-48 h-48 mb-4 flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-400" />
                    </div>
                    <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Download QR
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">Share this QR code with your patient</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Patient Management</h3>
              
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-gray-900">Recent Patients</h4>
                  <div className="relative w-64">
                    <input
                      type="text"
                      placeholder="Search patients..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mr-4" />
                        <div>
                          <h5 className="font-bold text-gray-900">Rajesh Kumar</h5>
                          <p className="text-sm text-gray-600">Last visit: Dec 12, 2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">5 prescriptions</p>
                        <p className="text-xs text-gray-500">2 active</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mr-4" />
                        <div>
                          <h5 className="font-bold text-gray-900">Priya Menon</h5>
                          <p className="text-sm text-gray-600">Last visit: Dec 10, 2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">3 prescriptions</p>
                        <p className="text-xs text-gray-500">1 active</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mr-4" />
                        <div>
                          <h5 className="font-bold text-gray-900">Anil Reddy</h5>
                          <p className="text-sm text-gray-600">Last visit: Dec 8, 2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">7 prescriptions</p>
                        <p className="text-xs text-gray-500">3 active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-bold text-gray-900 mb-4">Appointment Requests</h4>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mr-4" />
                        <div>
                          <h5 className="font-bold text-gray-900">Sunita Verma</h5>
                          <p className="text-sm text-gray-600">Request sent: Dec 12, 2025</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                          Decline
                        </button>
                        <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                          Approve
                        </button>
                      </div>
                    </div>
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