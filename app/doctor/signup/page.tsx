'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Stethoscope, User, Mail, Lock, Phone, BadgeAlert, FileText, FlaskConical, MapPin, Home, Hash, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

export default function DoctorSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    aadhaar: '',
    nmcRegistrationNumber: '',
    specialization: '',
    city: '',
    state: '',
    address: '',
    pincode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const showPopupMessage = (message: string) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 5000);
  };

  const validateForm = () => {
    // Name: letters, spaces, hyphens, apostrophes (2-50 chars)
    const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
    if (!nameRegex.test(formData.name.trim())) {
      showPopupMessage('Invalid full name. Only letters, spaces, hyphens, and apostrophes are allowed (2–50 characters).');
      return false;
    }

    // Basic email shape; backend will still enforce correctness
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      showPopupMessage('Please enter a valid email address.');
      return false;
    }

    // Password minimum length
    if (!formData.password || formData.password.length < 6) {
      showPopupMessage('Password must be at least 6 characters long.');
      return false;
    }

    // Phone: 10‑digit Indian mobile
    const cleanPhone = formData.phone.replace(/\D/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      showPopupMessage('Invalid phone number. Please enter a valid 10‑digit Indian mobile number.');
      return false;
    }

    // Aadhaar: 10–12 digits
    const aadhaarRegex = /^\d{10,12}$/;
    if (!aadhaarRegex.test(formData.aadhaar.replace(/\D/g, ''))) {
      showPopupMessage('Invalid Aadhaar number. It must be 10–12 digits.');
      return false;
    }

    // NMC: letters, numbers, hyphens (3–20 chars)
    const nmcRegex = /^[a-zA-Z0-9\-]{3,20}$/;
    if (!nmcRegex.test(formData.nmcRegistrationNumber.trim())) {
      showPopupMessage('Invalid NMC Registration Number. Only letters, numbers, and hyphens are allowed (3–20 characters).');
      return false;
    }

    // Specialization: letters, spaces, commas, hyphens, parentheses, periods (2–100)
    const specializationRegex = /^[a-zA-Z\s\-\,\.\(\)]{2,100}$/;
    if (!specializationRegex.test(formData.specialization.trim())) {
      showPopupMessage('Invalid specialization. Only letters, spaces, commas, hyphens, parentheses, and periods are allowed.');
      return false;
    }

    // City / State: letters, spaces, hyphens (2–50)
    const cityStateRegex = /^[a-zA-Z\s\-]{2,50}$/;
    if (!cityStateRegex.test(formData.city.trim())) {
      showPopupMessage('Invalid city. Only letters, spaces, and hyphens are allowed.');
      return false;
    }
    if (!cityStateRegex.test(formData.state.trim())) {
      showPopupMessage('Invalid state. Only letters, spaces, and hyphens are allowed.');
      return false;
    }

    // Address: letters, numbers, spaces, commas, hyphens, periods, #, / (5–200)
    const addressRegex = /^[a-zA-Z0-9\s\-\,\.\(\)#\/]{5,200}$/;
    if (!addressRegex.test(formData.address.trim())) {
      showPopupMessage('Invalid address. Use only letters, numbers, spaces, commas, hyphens, periods, and common symbols.');
      return false;
    }

    // Pincode: exactly 6 digits
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(formData.pincode.replace(/\D/g, ''))) {
      showPopupMessage('Invalid pincode. It must be exactly 6 digits.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Front‑end validation aligned with backend rules
    if (!validateForm()) {
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/auth/doctor/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        showPopupMessage('Doctor registered successfully!');
        setTimeout(() => router.push('/doctor/login'), 2000);
      } else {
        showPopupMessage(data.error || 'Signup failed');
      }
    } catch (err) {
      showPopupMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
          <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">Your account has been verified. Redirecting to login...</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-600 h-2.5 rounded-full w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8 px-4">
      {/* Popup Message */}
      {showPopup && (
        <div className="fixed top-4 right-4 z-50 animate-fadeIn">
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{popupMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl shadow-xl">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </Link>
            <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl">
              <Stethoscope className="h-7 w-7 text-blue-700" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Doctor Registration</h1>
          </div>
          <p className="text-gray-600 text-lg">Register with NMC & Aadhaar Verification</p>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 border border-blue-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all bg-white shadow-sm"
                    placeholder="Dr. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all bg-white shadow-sm"
                    placeholder="doctor@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all bg-white shadow-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    type="tel"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all bg-white shadow-sm"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                  Aadhaar Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BadgeAlert className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    placeholder="1234 5678 9012"
                    className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all bg-white shadow-sm"
                    value={formData.aadhaar}
                    onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                  NMC Registration Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g., NMC123456"
                    className="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-white shadow-sm"
                    value={formData.nmcRegistrationNumber}
                    onChange={(e) => setFormData({ ...formData, nmcRegistrationNumber: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialization *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FlaskConical className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g., General Physician, Cardiologist"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mumbai"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g., Maharashtra"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Home className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g., 123 Main Street, Sector 5"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g., 400001"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                  maxLength={6}
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">
                    Important Note
                  </p>
                  <p className="text-sm text-blue-700">
                    Your Aadhaar and NMC Registration Number will be verified against the NMC registry.
                    Only verified doctors can access the prescription generation system. NMC number must be unique for every doctor.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </div>
              ) : 'Register & Verify'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/doctor/login" className="text-blue-600 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}