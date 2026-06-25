'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, LogOut, FileText, Download, Search, QrCode, Heart, User, Phone, Filter, MapPin, Stethoscope, Calendar, Plus, CheckCircle, AlertCircle, Home, Hash, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getSpecialtyShortcut } from '@/lib/specialtyShortcuts';

export default function PatientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nmcNumber, setNmcNumber] = useState('');
  const [showManualNmcInput, setShowManualNmcInput] = useState(false);
  const [doctorVerification, setDoctorVerification] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  // Doctor filtering states
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [filterName, setFilterName] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [showDoctorList, setShowDoctorList] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  
  // Appointment states
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showAppointments, setShowAppointments] = useState(false);
  
  // Prescriptions state
  const [showPrescriptions, setShowPrescriptions] = useState(false);

  // Symptom → specialty ML (server-side Naive Bayes) + matching doctors
  const [symptomText, setSymptomText] = useState('');
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [symptomError, setSymptomError] = useState('');
  const [symptomPredictions, setSymptomPredictions] = useState<
    { specialty: string; confidence: number; shortcut?: string }[]
  >([]);
  const [symptomDoctors, setSymptomDoctors] = useState<any[]>([]);
  const [symptomInfoMessage, setSymptomInfoMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/patient/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'patient') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    loadPrescriptions(parsedUser.phone);
  }, [router]);

  const loadPrescriptions = async (phone: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/patient?phone=${phone}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Prescriptions loaded:', data.prescriptions.length, 'items');
        data.prescriptions.forEach((p: any, i: number) => {
          console.log(`  [${i}] ID: ${p.id}, Doctor: ${p.doctorName}, Has QR Data: ${!!p.encryptedData}`);
        });
        setPrescriptions(data.prescriptions);
      }
    } catch (err) {
      console.error('Failed to load prescriptions');
    }
  };

  const loadDoctors = async (page: number = 1) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filterName) params.append('name', filterName);
      if (filterSpecialization) params.append('specialization', filterSpecialization);
      if (filterCity) params.append('city', filterCity);
      params.append('page', page.toString());
      params.append('limit', '10'); // 10 doctors per page
      
      const queryString = `?${params.toString()}`;
      
      const response = await fetch(`/api/patient/doctors${queryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors);
        setFilteredDoctors(data.doctors);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalDoctors(data.pagination.totalDoctors);
        setHasNextPage(data.pagination.hasNextPage);
        setHasPrevPage(data.pagination.hasPrevPage);
      } else {
        // Silently fail in UI (no error banner), but log for debugging
        console.error('Failed to load doctors', await response.text());
        setDoctors([]);
        setFilteredDoctors([]);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalDoctors(0);
        setHasNextPage(false);
        setHasPrevPage(false);
      }
    } catch (err) {
      console.error('Failed to load doctors', err);
      // Keep UI clean; show as "no doctors available" instead of error
      setDoctors([]);
      setFilteredDoctors([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalDoctors(0);
      setHasNextPage(false);
      setHasPrevPage(false);
    } finally {
      setLoading(false);
    }
  };

  const findDoctorsFromSymptoms = async () => {
    const trimmed = symptomText.trim();
    if (!trimmed) {
      setSymptomError('Please describe your symptoms.');
      return;
    }
    setSymptomError('');
    setSymptomInfoMessage('');
    setSymptomLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSymptomError('Please log in again.');
        return;
      }
      const response = await fetch('/api/patient/symptom-doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ symptoms: trimmed }),
      });
      const rawText = await response.text();
      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }
      if (!response.ok) {
        const apiError =
          (data && typeof data.error === 'string' && data.error) ||
          (data && typeof data.message === 'string' && data.message) ||
          (rawText && rawText.slice(0, 160)) ||
          `Could not analyze symptoms (HTTP ${response.status}).`;
        setSymptomError(apiError);
        setSymptomPredictions([]);
        setSymptomDoctors([]);
        return;
      }
      setSymptomPredictions((data && data.predictions) ?? []);
      setSymptomDoctors((data && data.doctors) ?? []);
      setSymptomInfoMessage((data && data.message) || '');
    } catch {
      setSymptomError('Something went wrong. Please try again.');
      setSymptomPredictions([]);
      setSymptomDoctors([]);
    } finally {
      setSymptomLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/patient/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Sort appointments by date (newest first)
        const sortedAppointments = data.appointments.sort((a: any, b: any) => 
          new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
        );
        setAppointments(sortedAppointments);
      } else {
        console.error('Failed to load appointments', await response.text());
        setAppointments([]);
      }
    } catch (err) {
      console.error('Failed to load appointments', err);
      setAppointments([]);
    }
  };

  const filterDoctors = () => {
    // Only filter if we have doctors data
    if (doctors.length === 0) return;
    
    let filtered = doctors;
    
    if (filterName) {
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }
    
    if (filterSpecialization) {
      filtered = filtered.filter(doctor => 
        doctor.specialization.toLowerCase().includes(filterSpecialization.toLowerCase())
      );
    }
    
    if (filterCity) {
      filtered = filtered.filter(doctor => 
        doctor.city.toLowerCase().includes(filterCity.toLowerCase())
      );
    }
    
    setFilteredDoctors(filtered);
  };

  const requestAppointment = async () => {
    if (!selectedDoctor || !appointmentDate || !appointmentTime || !appointmentReason) {
      setError('Please fill all appointment details');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication error. Please log in again.');
        return;
      }

      const response = await fetch('/api/patient/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          appointmentDate,
          appointmentTime,
          reason: appointmentReason
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Appointment request sent successfully!');
        setShowAppointmentModal(false);
        // Reset form
        setAppointmentDate('');
        setAppointmentTime('');
        setAppointmentReason('');
        // Reload appointments
        loadAppointments();
      } else {
        setError(data.error || 'Failed to request appointment');
      }
    } catch (err) {
      setError('Failed to request appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterDoctors();
  }, [filterName, filterSpecialization, filterCity, doctors]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/patient/login');
  };

  const verifyDoctor = async (providedNmc?: string) => {
    const targetNmc = (providedNmc ?? nmcNumber).trim();
    if (!targetNmc) {
      setError('Please enter NMC number');
      return;
    }

    setNmcNumber(targetNmc);
    setError('');
    setLoading(true);
    setDoctorVerification(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nmcNumber: targetNmc })
      });

      const data = await response.json();
      setDoctorVerification(data);
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Samraksha</span>
            </Link>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-3 bg-purple-50 px-4 py-2 rounded-lg">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">Patient</p>
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
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user.name}</h1>
                <p className="text-purple-100">Manage your prescriptions and verify doctors</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>{user.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => {
              loadDoctors(1);
              setShowDoctorList(true);
            }}
          >
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Find Doctors</h3>
                <p className="text-sm text-gray-500">Search by name, specialization</p>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => {
              loadAppointments();
              setShowAppointments(true);
            }}
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">My Appointments</h3>
                <p className="text-sm text-gray-500">View and manage appointments</p>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => {
              loadPrescriptions(user.phone);
              setShowPrescriptions(true);
            }}
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">My Prescriptions</h3>
                <p className="text-sm text-gray-500">View all prescriptions</p>
              </div>
            </div>
          </div>
          

        </div>

        {/* Symptom-based doctor finder (ML) */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-violet-100 p-3 rounded-xl shrink-0">
              <Sparkles className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Find doctors from your symptoms</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your symptoms</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="e.g. chest tightness and shortness of breath when walking uphill"
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
              />
            </div>

            {symptomError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {symptomError}
              </div>
            )}

            <button
              type="button"
              onClick={findDoctorsFromSymptoms}
              disabled={symptomLoading}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-lg font-medium hover:from-violet-700 hover:to-violet-800 disabled:opacity-50 transition-all shadow hover:shadow-lg"
            >
              {symptomLoading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Find matching doctors
                </>
              )}
            </button>

            {symptomPredictions.length > 0 && (
              <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
                <p className="text-sm font-semibold text-gray-800 mb-3">Predicted specialties (model confidence)</p>
                <ul className="space-y-2">
                  {symptomPredictions.map((p, idx) => {
                    const short =
                      p.shortcut && p.shortcut.trim() !== ''
                        ? p.shortcut.trim()
                        : getSpecialtyShortcut(p.specialty);
                    return (
                      <li
                        key={`${p.specialty}-${idx}`}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="font-medium text-gray-900">
                          {p.specialty}
                          {short !== p.specialty && (
                            <span className="text-gray-500 font-normal"> ({short})</span>
                          )}
                        </span>
                        <span className="text-violet-700 tabular-nums">{p.confidence}%</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {symptomInfoMessage && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                {symptomInfoMessage}
              </p>
            )}

            {symptomDoctors.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-violet-600" />
                  Matching verified doctors
                </h3>
                {symptomDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                        <p className="text-sm text-gray-500">NMC: {doctor.nmcRegistrationNumber}</p>
                        <p className="text-sm text-violet-600 mt-1">{doctor.specialization}</p>
                        <p className="text-sm text-gray-600 mt-1">Phone: {doctor.phone}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {doctor.address}, {doctor.city}, {doctor.state} - {doctor.pincode}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setShowManualNmcInput(true);
                            setNmcNumber('');
                            setDoctorVerification(null);
                            setTimeout(() => {
                              const el = document.getElementById('doctor-verification');
                              el?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }}
                          className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm hover:bg-purple-200 flex items-center justify-center"
                        >
                          <User className="w-4 h-4 mr-1" />
                          Verify
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDoctor(doctor);
                            setShowAppointmentModal(true);
                          }}
                          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-200 flex items-center justify-center"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Prescriptions Section */}
        {showPrescriptions && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                My Prescriptions
              </h2>
              <button 
                onClick={() => setShowPrescriptions(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            
            {/* Prescriptions List */}
            <div className="space-y-4">
              {prescriptions.length > 0 ? (
                prescriptions.map((prescription) => (
                  <div key={prescription.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{prescription.doctorName}</h3>
                        <p className="text-sm text-gray-500">NMC: {prescription.doctorNMC}</p>
                        <p className="text-sm text-purple-600 mt-1">{prescription.diagnosis}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          Issued: {new Date(prescription.createdAt).toLocaleDateString()}
                        </p>
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-900">Medications:</h4>
                          <ul className="mt-1 space-y-1">
                            {prescription.medicines && prescription.medicines.map((med: any, index: number) => (
                              <li key={index} className="text-sm text-gray-600">
                                • {med.name} - {med.dosage}, {med.frequency} for {med.duration}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="text-right">
                        <button
                          onClick={async () => {
                            try {
                              // Download QR code functionality
                              const token = localStorage.getItem('token');
                              if (!token) {
                                alert('Authentication error. Please log in again.');
                                return;
                              }
                              
                              console.log('📋 Prescription object:', prescription);
                              console.log('🆔 Prescription ID being used:', prescription.id);
                              console.log('Prescription ID type:', typeof prescription.id);
                              console.log('Prescription ID length:', prescription.id?.length);
                              console.log('Downloading QR for prescription:', prescription.id);
                              console.log('Full URL will be:', `/api/patient/download-qr/${prescription.id}`);
                              
                              const response = await fetch(`/api/patient/download-qr/${prescription.id}`, {
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                              });
                              
                              if (response.ok) {
                                const data = await response.json();
                                console.log('QR code generated successfully');
                                // Create a link to download the QR code
                                const link = document.createElement('a');
                                link.href = data.prescription.qrCode;
                                link.download = `prescription-${prescription.id}.png`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              } else {
                                const errorData = await response.json();
                                console.error('Download failed:', errorData.error);
                                alert(`Failed to download QR code: ${errorData.error || 'Prescription not found'}`);
                              }
                            } catch (err) {
                              console.error('Download error:', err);
                              alert('Failed to download QR code. Please try again.');
                            }
                          }}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200 flex items-center mb-2"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download QR
                        </button>
                        <p className="text-xs text-gray-500 mt-2">
                          Valid until: {new Date(prescription.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No prescriptions found</p>
                  <p className="text-sm text-gray-400 mt-2">Your prescriptions from doctors will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointments Section */}
        {showAppointments && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-600" />
                My Appointments
              </h2>
              <button 
                onClick={() => setShowAppointments(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            
            {/* Appointments List */}
            <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.doctorName}</h3>
                        <p className="text-sm text-gray-500">NMC: {appointment.doctorNMC}</p>
                        <p className="text-sm text-purple-600 mt-1">{appointment.doctorSpecialization}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {appointment.doctorAddress}, {appointment.doctorCity}, {appointment.doctorState} - {appointment.doctorPincode}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Reason: {appointment.reason}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        <p className="text-xs text-gray-500 mt-2">
                          Requested: {new Date(appointment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No appointments found</p>
                  <p className="text-sm text-gray-400 mt-2">Request an appointment with a doctor to see it here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Doctor List Section */}
        {showDoctorList && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Stethoscope className="h-5 w-5 mr-2 text-purple-600" />
                Find Doctors
              </h2>
              <button 
                onClick={() => setShowDoctorList(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            
            {/* Filter Inputs */}
            <form onSubmit={(e) => {
              e.preventDefault();
              loadDoctors(1);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Search by name"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Stethoscope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Search by specialization"
                      value={filterSpecialization}
                      onChange={(e) => setFilterSpecialization(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Search by city"
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mb-6">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all shadow hover:shadow-lg flex items-center"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search Doctors
                </button>
              </div>
            </form>

            {/* Doctors List */}
            <div className="space-y-4">
              {filteredDoctors.length > 0 ? (
                <>
                  {filteredDoctors.map((doctor) => (
                    <div key={doctor.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                          <p className="text-sm text-gray-500">NMC: {doctor.nmcRegistrationNumber}</p>
                          <p className="text-sm text-purple-600 mt-1">{doctor.specialization}</p>
                          <p className="text-sm text-gray-600 mt-1">Phone: {doctor.phone}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {doctor.address}, {doctor.city}, {doctor.state} - {doctor.pincode}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setShowManualNmcInput(true);
                              setNmcNumber('');
                              setDoctorVerification(null);
                              setShowDoctorList(false);
                              // Scroll to verification section and trigger verification
                              setTimeout(() => {
                                const element = document.getElementById('doctor-verification');
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth' });
                                }
                              }, 100);
                            }}
                            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm hover:bg-purple-200 flex items-center"
                          >
                            <User className="w-4 h-4 mr-1" />
                            Verify
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedDoctor(doctor);
                              setShowAppointmentModal(true);
                            }}
                            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-200 flex items-center"
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Book
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                  
                  {/* Pagination Controls */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing {filteredDoctors.length} of {totalDoctors} doctors
                    </div>
                    {totalPages > 1 ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => loadDoctors(currentPage - 1)}
                          disabled={!hasPrevPage}
                          className={`flex items-center px-4 py-2 rounded-lg ${
                            hasPrevPage 
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </button>
                        
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => loadDoctors(currentPage + 1)}
                          disabled={!hasNextPage}
                          className={`flex items-center px-4 py-2 rounded-lg ${
                            hasNextPage 
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>
                      </div>
                    )}
                  </div>

                </>
              ) : (
                <div className="text-center py-12">
                  <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No doctors available</p>
              <p className="text-sm text-gray-400 mt-2">Please try again later or adjust your search filters</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointment Modal */}
        {showAppointmentModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Request Appointment</h3>
                  <button 
                    onClick={() => setShowAppointmentModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {selectedDoctor && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900">{selectedDoctor.name}</h4>
                    <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                    <p className="text-sm text-gray-500">NMC: {selectedDoctor.nmcRegistrationNumber}</p>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Time
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Appointment
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Briefly describe the reason for your appointment"
                      value={appointmentReason}
                      onChange={(e) => setAppointmentReason(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowAppointmentModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={requestAppointment}
                      disabled={loading}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all"
                    >
                      {loading ? 'Requesting...' : 'Request Appointment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Doctor Verification Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center" id="doctor-verification">
            <User className="h-5 w-5 mr-2 text-purple-600" />
            Verify Doctor
          </h2>
          
          <div className="max-w-md">
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-700">
                Verify only from registered doctors. You can search doctors first, then verify with one click.
              </p>
              <button
                type="button"
                onClick={() => {
                  loadDoctors(1);
                  setShowDoctorList(true);
                }}
                className="mt-3 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-all"
              >
                <Search className="h-4 w-4 mr-2" />
                Search Doctors to Verify
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowManualNmcInput((prev) => !prev)}
              className="text-sm text-purple-700 hover:text-purple-800 font-medium mb-3"
            >
              {showManualNmcInput ? 'Hide manual NMC entry' : 'Enter NMC manually'}
            </button>

            {showManualNmcInput && (
              <div className="flex space-x-2 mb-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Patient should enter doctor NMC number"
                    value={nmcNumber}
                    onChange={(e) => setNmcNumber(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => verifyDoctor()}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 transition-all shadow hover:shadow-lg flex items-center"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : 'Verify'}
                </button>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}
            
            {doctorVerification && (
              <div className={`border rounded-lg p-4 ${doctorVerification.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                {doctorVerification.isValid ? (
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Valid Doctor</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-red-800 font-medium">Invalid Doctor</span>
                  </div>
                )}
                {doctorVerification.doctor && (
                  <div className="mt-3 text-sm text-gray-700">
                    <p><span className="font-medium">Name:</span> {doctorVerification.doctor.name}</p>
                    <p><span className="font-medium">Specialization:</span> {doctorVerification.doctor.specialization}</p>
                    <p><span className="font-medium">NMC:</span> {doctorVerification.doctor.nmcRegistrationNumber}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}