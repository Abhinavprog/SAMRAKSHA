'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Stethoscope, LogOut, Plus, FileText, User, Phone, Calendar, Heart, Pill, Download, CheckCircle, AlertCircle, MapPin, Home, Hash, Eye } from 'lucide-react';
import Link from 'next/link';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Prescription {
  id: string;
  patientName: string;
  diagnosis: string;
  createdAt: Date;
  isUsed: boolean;
  expiryDate?: string | Date;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [encryptedData, setEncryptedData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientAge: '',
    patientGender: 'male',
    diagnosis: '',
    notes: '',
    validityDays: '7'
  });
  const [stats, setStats] = useState({
    totalPrescriptions: 0,
    verifiedToday: 0,
    patientsServed: 0
  });
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
  
  // Appointment states
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showAppointments, setShowAppointments] = useState(false);

  // Profile states
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    city: '',
    state: '',
    address: '',
    pincode: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/doctor/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'doctor') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    fetchStats(parsedUser);
    fetchRecentPrescriptions(token!);
    loadAppointments();
    loadProfile();
  }, [router]);

  const fetchStats = async (user: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('/api/doctor/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchRecentPrescriptions = async (token: string) => {
    try {
      const response = await fetch('/api/doctor/prescriptions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecentPrescriptions(data.prescriptions || []);
      }
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
    }
  };

  const loadAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/doctor/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error('Failed to load appointments');
    }
  };

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/doctor/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData({
          city: data.doctor.city || '',
          state: data.doctor.state || '',
          address: data.doctor.address || '',
          pincode: data.doctor.pincode || ''
        });
      }
    } catch (err) {
      console.error('Failed to load profile');
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication error. Please log in again.');
        return;
      }

      const response = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        // Update user data in localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          parsedUser.city = profileData.city;
          parsedUser.state = profileData.state;
          localStorage.setItem('user', JSON.stringify(parsedUser));
        }
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: 'approved' | 'rejected' | 'completed') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication error. Please log in again.');
        return;
      }

      const response = await fetch('/api/doctor/appointments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId,
          status
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update the appointment in the local state
        setAppointments(prev => prev.map(app => 
          app.id === appointmentId ? { ...app, status } : app
        ));
        alert(`Appointment ${status} successfully!`);
      } else {
        setError(data.error || `Failed to ${status} appointment`);
      }
    } catch (err) {
      setError(`Failed to ${status} appointment. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/doctor/login');
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedicine = (index: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Client-side validation
    if (!formData.patientName.trim()) {
      setError('Patient name is required');
      setLoading(false);
      return;
    }
    
    if (!formData.patientPhone.trim()) {
      setError('Patient phone number is required');
      setLoading(false);
      return;
    }
    
    // Validate phone number format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.patientPhone.replace(/\D/g, ''))) {
      setError('Invalid phone number format. Please enter a valid 10-digit Indian mobile number.');
      setLoading(false);
      return;
    }
    
    if (!formData.patientAge.trim()) {
      setError('Patient age is required');
      setLoading(false);
      return;
    }
    
    // Validate age
    const age = parseInt(formData.patientAge);
    if (isNaN(age) || age < 1 || age > 120) {
      setError('Invalid age. Please enter a valid age between 1 and 120 years.');
      setLoading(false);
      return;
    }
    
    // Note: Additional validation for matching registered patient details happens on the server-side
    
    // Client-side validation for medicines
    const validMedicines = [];
    for (const medicine of medicines) {
      if (!medicine.name || !medicine.dosage || !medicine.frequency || !medicine.duration) {
        setError('Please fill in all fields for each medicine');
        setLoading(false);
        return;
      }
      
      // Validate medicine name - only allow letters, numbers, spaces, hyphens, parentheses, and periods
      const medicineNameRegex = /^[a-zA-Z0-9\s\-\(\)\.]+$/;
      if (!medicineNameRegex.test(medicine.name)) {
        setError('Invalid medicine name. Only letters, numbers, spaces, hyphens, parentheses, and periods are allowed.');
        setLoading(false);
        return;
      }
      
      // Validate dosage - only allow numbers, letters, spaces, hyphens, and common units
      const dosageRegex = /^[0-9\s\+\-\*\/\(\)\.a-zA-Z]+$/;
      if (!dosageRegex.test(medicine.dosage)) {
        setError('Invalid dosage format. Only numbers, operators, and letters are allowed.');
        setLoading(false);
        return;
      }
      
      // Validate frequency - only allow letters, numbers, spaces, and common symbols
      const frequencyRegex = /^[a-zA-Z0-9\s\-\,\(\)\.\/]+$/;
      if (!frequencyRegex.test(medicine.frequency)) {
        setError('Invalid frequency format. Only letters, numbers, spaces, commas, hyphens, and slashes are allowed.');
        setLoading(false);
        return;
      }
      
      // Validate duration - only allow letters, numbers, spaces, and common symbols
      const durationRegex = /^[a-zA-Z0-9\s\-\,\(\)\.\/]+$/;
      if (!durationRegex.test(medicine.duration)) {
        setError('Invalid duration format. Only letters, numbers, spaces, commas, hyphens, and slashes are allowed.');
        setLoading(false);
        return;
      }
      
      validMedicines.push(medicine);
    }
    
    if (validMedicines.length === 0) {
      setError('Please add at least one medicine');
      setLoading(false);
      return;
    }
    
    // Validate diagnosis - only allow letters, numbers, spaces, punctuation, and medical terms
    const diagnosisRegex = /^[a-zA-Z0-9\s\-\,\.\(\)\[\]\:\;\/\']+$/;
    if (!diagnosisRegex.test(formData.diagnosis)) {
      setError('Invalid diagnosis format. Only letters, numbers, spaces, and common punctuation are allowed.');
      setLoading(false);
      return;
    }
    
    // Validate patient name - only allow letters, spaces, hyphens, and apostrophes
    const patientNameRegex = /^[a-zA-Z\s\-\']{2,50}$/;
    if (!patientNameRegex.test(formData.patientName)) {
      setError('Invalid patient name. Only letters, spaces, hyphens, and apostrophes are allowed.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication error. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/prescription/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          patientAge: parseInt(formData.patientAge),
          validityDays: parseInt(formData.validityDays),
          medicines: validMedicines
        })
      });

      const data = await response.json();

      if (response.ok) {
        setQrCode(data.prescription.qrCode);
        setEncryptedData(data.prescription.encryptedData);
        setSuccess('Prescription generated successfully!');
        // Reset form
        setFormData({
          patientName: '',
          patientPhone: '',
          patientAge: '',
          patientGender: 'male',
          diagnosis: '',
          notes: '',
          validityDays: '7'
        });
        setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }]);
        
        // Refresh stats and prescriptions
        setTimeout(() => {
          fetchStats(user);
          const token = localStorage.getItem('token');
          if (token) {
            fetchRecentPrescriptions(token);
          }
        }, 1000);
      } else {
        setError(data.error || 'Failed to generate prescription');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `prescription-${formData.patientName || 'patient'}.png`;
    link.click();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Samraksha</span>
            </Link>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Dr. {user.name}</p>
                  <p className="text-xs text-gray-500">NMC: {user.nmcNumber}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow hover:shadow-lg"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Stethoscope className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Welcome, Dr. {user.name}</h1>
                <p className="text-blue-100">Specialization: {user.specialization}</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPrescriptions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Verified Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verifiedToday}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-xl">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Patients Served</p>
                <p className="text-2xl font-bold text-gray-900">{stats.patientsServed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-5 w-5" />
            <span>{showForm ? 'Hide Prescription Form' : 'Generate New Prescription'}</span>
          </button>
          
          <button
            onClick={() => {
              loadAppointments();
              setShowAppointments(!showAppointments);
              setShowProfile(false);
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <User className="h-5 w-5" />
            <span>{showAppointments ? 'Hide Appointments' : 'Manage Appointments'}</span>
          </button>
          
          <button
            onClick={() => {
              loadProfile();
              setShowProfile(!showProfile);
              setShowAppointments(false);
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <MapPin className="h-5 w-5" />
            <span>{showProfile ? 'Hide Profile' : 'Update Location'}</span>
          </button>
        </div>

        {/* Profile Section */}
        {showProfile && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-green-600" />
              Update Location Information
            </h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {success}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="e.g., Mumbai"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="e.g., Maharashtra"
                    value={profileData.state}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Home className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="e.g., 123 Main Street, Sector 5"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="e.g., 400001"
                    value={profileData.pincode}
                    onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value.replace(/\D/g, '') })}
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={updateProfile}
                disabled={loading}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow hover:shadow-lg disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Location'}
              </button>
            </div>
          </div>
        )}

        {/* Appointments Section */}
        {showAppointments && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-purple-600" />
              Patient Appointments
            </h3>
            
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{appointment.patientName}</h4>
                        <p className="text-sm text-gray-600">Phone: {appointment.patientPhone}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {appointment.doctorAddress}, {appointment.doctorCity}, {appointment.doctorState} - {appointment.doctorPincode}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Reason: {appointment.reason}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-xs px-2 py-1 rounded-full mb-2 ${
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        {appointment.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'approved')}
                              disabled={loading}
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'rejected')}
                              disabled={loading}
                              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {appointment.status === 'approved' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            disabled={loading}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                          >
                            Mark as Completed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No appointment requests</p>
                <p className="text-sm text-gray-400 mt-2">Patients will appear here when they request appointments</p>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {success}
            {qrCode && (
              <button 
                onClick={downloadQR}
                className="ml-auto bg-green-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-green-700 flex items-center"
              >
                <Download className="h-4 w-4 mr-1" />
                Download QR
              </button>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* QR Code Display */}
        {qrCode && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Generated Prescription QR Code
              </h3>
              <button 
                onClick={() => {
                  const viewerUrl = `/demo/qr-viewer?image=${encodeURIComponent(qrCode)}&data=${encodeURIComponent(encryptedData)}&info=${encodeURIComponent(JSON.stringify({
                    doctorName: user.name,
                    patientName: formData.patientName || 'Patient',
                    diagnosis: formData.diagnosis || '',
                    createdAt: new Date().toISOString(),
                    expiryDate: new Date(Date.now() + (parseInt(formData.validityDays || '7') * 24 * 60 * 60 * 1000)).toISOString(),
                    validityDays: formData.validityDays || '7'
                  }))}`;
                  window.open(viewerUrl, '_blank');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-medium shadow hover:shadow-lg"
              >
                <Eye className="h-4 w-4" />
                <span>View Full Screen</span>
              </button>
            </div>
            <div className="flex flex-col md:flex-row items-center">
              <div className="bg-gray-100 p-4 rounded-xl mb-4 md:mb-0 md:mr-6">
                <img src={qrCode} alt="Prescription QR Code" className="w-48 h-48" />
              </div>
              <div>
                <p className="text-gray-600 mb-4">
                  Share this QR code with your patient. They can download it from their portal or show it at the pharmacy.
                </p>
                <div className="flex space-x-3">
                  <button 
                    onClick={downloadQR}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow hover:shadow-lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prescription Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <span>New Prescription</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Patient Information */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Patient Information
                </h3>
                <p className="text-sm text-gray-600 mb-4">Note: All patient information must be accurate and properly formatted to generate a valid prescription.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter full patient name"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="10-digit mobile number (e.g., 9876543210)"
                        value={formData.patientPhone}
                        onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Age between 1-120 years"
                      value={formData.patientAge}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        // Only allow values between 1-120
                        if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 120)) {
                          setFormData({ ...formData, patientAge: value });
                        }
                      }}
                      onBlur={(e) => {
                        // Ensure value is within valid range on blur
                        const value = e.target.value.replace(/\D/g, '');
                        if (value && (parseInt(value) < 1 || parseInt(value) > 120)) {
                          setFormData({ ...formData, patientAge: '' });
                        }
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={formData.patientGender}
                      onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-green-600" />
                  Diagnosis
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis *
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Additional notes (optional)"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescription Validity (Days) *
                  </label>
                  <select
                    className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={formData.validityDays}
                    onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                  >
                    <option value="3">3 Days</option>
                    <option value="7">7 Days</option>
                    <option value="15">15 Days</option>
                    <option value="30">30 Days</option>
                  </select>
                </div>
              </div>

              {/* Medicines */}
              <div className="bg-purple-50 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Pill className="h-5 w-5 mr-2 text-purple-600" />
                    Medicines
                  </h3>
                  <button
                    type="button"
                    onClick={addMedicine}
                    className="flex items-center px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Medicine
                  </button>
                </div>
                
                {medicines.map((medicine, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">Medicine {index + 1}</h4>
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedicine(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Medicine Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="e.g., Paracetamol"
                          value={medicine.name}
                          onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                        />
                      </div>
                                            
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dosage *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="e.g., 500mg"
                          value={medicine.dosage}
                          onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                        />
                      </div>
                                            
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="e.g., Twice daily"
                          value={medicine.frequency}
                          onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                        />
                      </div>
                                            
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="e.g., 5 days"
                          value={medicine.duration}
                          onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Prescription...
                    </div>
                  ) : 'Generate Prescription'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recent Prescriptions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Prescriptions</h3>
          {recentPrescriptions.length > 0 ? (
            <div className="space-y-4">
              {recentPrescriptions.slice(0, 5).map((prescription) => (
                <div key={prescription.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-900">{prescription.patientName}</h4>
                      <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
                    </div>
                    <div className="text-right">
                      {(() => {
                        const isExpired =
                          !prescription.isUsed &&
                          !!prescription.expiryDate &&
                          new Date(prescription.expiryDate).getTime() < Date.now();
                        const statusLabel = prescription.isUsed ? 'Verified' : isExpired ? 'Expired' : 'Pending';
                        const statusClass = prescription.isUsed
                          ? 'bg-green-100 text-green-800'
                          : isExpired
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-yellow-100 text-yellow-800';

                        return (
                          <>
                      <p className="text-sm text-gray-500">
                        {new Date(prescription.createdAt).toLocaleDateString()}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusClass}`}>
                        {statusLabel}
                      </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent prescriptions found</p>
              <p className="text-sm text-gray-400 mt-2">Generate your first prescription using the form above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}