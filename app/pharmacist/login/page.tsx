'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Pill, Mail, Lock, AlertCircle, ArrowLeft, User } from 'lucide-react';

export default function PharmacistLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/pharmacist/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/pharmacist/dashboard');
      } else {
        setError(data.error || 'Login failed');
        setShowPopup(true);
        // Hide popup after 3 seconds
        setTimeout(() => setShowPopup(false), 3000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setShowPopup(true);
      // Hide popup after 3 seconds
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Popup Message */}
      {showPopup && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-fadeIn flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">{error}</span>
          <button 
            onClick={() => setShowPopup(false)}
            className="ml-4 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
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
              <h1 className="text-3xl font-bold text-gray-800">Pharmacist Login</h1>
            </div>
            <p className="text-gray-600 text-lg">Access your verified pharmacist account</p>
          </div>

          {/* Login Form */}
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-xl p-8 border border-emerald-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-emerald-500" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-white shadow-sm"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                  Password
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

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-emerald-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 font-medium">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-emerald-600 hover:text-emerald-700">
                    Forgot password?
                  </a>
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
                    Logging in...
                  </div>
                ) : 'Login to Dashboard'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-emerald-100">
              <p className="text-gray-600 text-center font-medium">
                Don't have an account?{' '}
                <Link href="/pharmacist/signup" className="text-emerald-600 hover:text-emerald-700 font-bold underline">
                  Sign Up
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
    </div>
  );
}