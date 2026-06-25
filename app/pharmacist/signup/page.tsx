'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Pill, User, Mail, Lock, Phone, BadgeAlert, FileText, MapPin, Home, Hash, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

export default function PharmacistSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    pharmacyName: '',
    licenseNumber: '',
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
    // Name: letters, spaces, hyphens, apostrophes (2–50)
    const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
    if (!nameRegex.test(formData.name.trim())) {
      showPopupMessage('Invalid full name. Only letters, spaces, hyphens, and apostrophes are allowed (2–50 characters).');
      return false;
    }

    // Email basic shape
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

    // Pharmacy name: at least 3 characters
    if (!formData.pharmacyName.trim() || formData.pharmacyName.trim().length < 3) {
      showPopupMessage('Pharmacy name must be at least 3 characters long.');
      return false;
    }

    // License number: at least 3 chars (backend only checks presence + uniqueness)
    if (!formData.licenseNumber.trim() || formData.licenseNumber.trim().length < 3) {
      showPopupMessage('License number must be at least 3 characters long.');
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

    // Address: 5–200 characters
    if (!formData.address.trim() || formData.address.trim().length < 5) {
      showPopupMessage('Address must be at least 5 characters long.');
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
    if (!validateForm()) {
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/auth/pharmacist/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        showPopupMessage('Pharmacist registered successfully!');
        setTimeout(() => router.push('/pharmacist/login'), 2000);
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 px-4">
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
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-4 rounded-2xl shadow-xl">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </Link>
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-3 rounded-xl">
              <Pill className="h-7 w-7 text-emerald-700" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Pharmacist Registration</h1>
          </div>
          <p className="text-gray-600 text-lg">Register with Pharmacy License Verification</p>
        </div>

        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-xl p-8 border border-emerald-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-emerald-500" />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-white shadow-sm"
                    placeholder="John Smith"
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
                    <Mail className="h-5 w-5 text-emerald-500" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-white shadow-sm"
                    placeholder="pharmacist@example.com"
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
                    <Lock className="h-5 w-5 text-emerald-500" />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-white shadow-sm"
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
                    <Phone className="h-5 w-5 text-emerald-500" />
                  </div>
                  <input
                    type="tel"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-white shadow-sm"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                  Pharmacy Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Pill className="h-5 w-5 text-emerald-500" />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-white shadow-sm"
                    placeholder="e.g., HealthCare Pharmacy"
                    value={formData.pharmacyName}
                    onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                  License Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BadgeAlert className="h-5 w-5 text-emerald-500" />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-white shadow-sm"
                    placeholder="e.g., PHA123456"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                City *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-emerald-500" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mumbai"
                  className="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-white shadow-sm"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                State *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-emerald-500" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g., Maharashtra"
                  className="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-white shadow-sm"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Home className="h-5 w-5 text-emerald-500" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g., 123 Main Street, Sector 5"
                  className="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-white shadow-sm"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                Pincode *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-emerald-500" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g., 400001"
                  className="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-white shadow-sm"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                  maxLength={6}
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-green-800 font-medium">
                    Verification Notice
                  </p>
                  <p className="text-sm text-green-700">
                    Your license will be verified against the pharmacy board registry. 
                    Only verified pharmacists can access prescription verification features. License number must be unique for every pharmacist.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
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

          <div className="mt-8 pt-6 border-t border-emerald-100 text-center">
            <p className="text-gray-600 font-medium">
              Already have an account?{' '}
              <Link href="/pharmacist/login" className="text-emerald-600 hover:text-emerald-700 font-bold underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center justify-center font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}