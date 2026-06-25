'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Stethoscope, Pill, Users, Check, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const scrollToPortals = () => {
    document.getElementById('portals')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Samraksha</h1>
            </div>
            <p className="text-sm text-gray-600 hidden md:block">
              Secure Medical Prescription Verification System
            </p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-6">
            <Shield className="h-5 w-5 mr-2" />
            <span className="font-semibold">Secure Healthcare Solution</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Eliminating Fake Prescriptions,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">Protecting Patients</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            A secure, encrypted, and multi-role medical prescription verification system
            designed to eliminate fake doctors, forged prescriptions, and unsafe medication practices.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              type="button"
              onClick={scrollToPortals}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={() => router.push('/demo')}
              className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Role Cards */}
        <div id="portals" className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16 scroll-mt-24">
          {/* Doctor Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 transform hover:-translate-y-2">
            <Link href="/doctor/login">
              <div className="cursor-pointer">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Doctor Portal</h3>
                <p className="text-gray-600 mb-6">
                  Verified with NMC Registration. Generate secure encrypted prescriptions with QR codes.
                </p>
                <ul className="text-sm text-gray-500 space-y-2 mb-6">
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    NMC & Aadhaar Verification
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    Generate Digital Prescriptions
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    AES-256 Encrypted QR Codes
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    Track Prescription History
                  </li>
                </ul>
              </div>
            </Link>
            <div 
              className="text-blue-600 font-semibold flex items-center hover:underline cursor-pointer"
              onClick={() => window.open('/demo/doctor', '_blank')}
            >
              View Demo 
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>

          {/* Pharmacist Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-500 transform hover:-translate-y-2">
            <Link href="/pharmacist/login">
              <div className="cursor-pointer">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <Pill className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Pharmacist Portal</h3>
                <p className="text-gray-600 mb-6">
                  Verify prescriptions by scanning QR codes. Ensure authenticity and prevent fraud.
                </p>
                <ul className="text-sm text-gray-500 space-y-2 mb-6">
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    Scan QR Codes
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    Verify Prescription Authenticity
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    Check Doctor Credentials
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    Detect Expired/Forged Prescriptions
                  </li>
                </ul>
              </div>
            </Link>
            <div 
              className="text-green-600 font-semibold flex items-center hover:underline cursor-pointer"
              onClick={() => window.open('/demo/pharmacist', '_blank')}
            >
              View Demo 
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>

          {/* Patient Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-500 transform hover:-translate-y-2">
            <Link href="/patient/login">
              <div className="cursor-pointer">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Patient Portal</h3>
                <p className="text-gray-600 mb-6">
                  View prescription history, verify doctors, and download QR codes securely.
                </p>
                <ul className="text-sm text-gray-500 space-y-2 mb-6">
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    Verify Doctor by NMC ID
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    View Prescription History
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    Download QR Codes
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    Confirm Prescription Validity
                  </li>
                </ul>
              </div>
            </Link>
            <div 
              className="text-purple-600 font-semibold flex items-center hover:underline cursor-pointer"
              onClick={() => window.open('/demo/patient', '_blank')}
            >
              View Demo 
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Samraksha?</h3>
            <p className="text-gray-300 max-w-2xl mx-auto">Protecting patients from fake prescriptions and ensuring healthcare security</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-xl mb-2">Secure Encryption</h4>
              <p className="text-sm text-gray-300">AES-256 encryption prevents tampering</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 text-center">
              <div className="bg-green-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-xl mb-2">NMC Verification</h4>
              <p className="text-sm text-gray-300">Only certified doctors can prescribe</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 text-center">
              <div className="bg-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Pill className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-xl mb-2">Fraud Prevention</h4>
              <p className="text-sm text-gray-300">Detect fake and forged prescriptions</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 text-center">
              <div className="bg-red-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-xl mb-2">Patient Safety</h4>
              <p className="text-sm text-gray-300">Complete prescription history tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Secure Healthcare?</h3>
          <p className="text-blue-100 text-xl mb-8 max-w-2xl mx-auto">Join thousands of healthcare professionals using Samraksha to protect patients</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={scrollToPortals}
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started Today
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">Samraksha</span>
              </div>
              <p className="text-gray-400">Securing Healthcare Across India</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Portals</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/doctor/login" className="hover:text-white">Doctor Portal</Link></li>
                <li><Link href="/pharmacist/login" className="hover:text-white">Pharmacist Portal</Link></li>
                <li><Link href="/patient/login" className="hover:text-white">Patient Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API Reference</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Samraksha. All rights reserved. Securing Healthcare Across India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}