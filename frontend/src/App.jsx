import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserContext } from './contexts/UserContext';
import { CartProvider } from './contexts/CartContext';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import axios from 'axios';

// Public pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import MedicinesPage from './pages/public/MedicinesPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import MedicineManagement from './pages/admin/MedicineManagement';
import DoctorManagement from './pages/admin/DoctorManagement';
import PatientManagement from './pages/admin/PatientManagement';
import OrderManagement from './pages/admin/OrderManagement';

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard';
import AppointmentBooking from './pages/patient/AppointmentBooking';
import PrescriptionList from './pages/patient/PrescriptionList';
import PrescriptionDetail from './pages/patient/PrescriptionDetail';
import PrescriptionUpload from './pages/patient/PrescriptionUpload';
import CartPage from './pages/patient/CartPage';
import CheckoutPage from './pages/patient/CheckoutPage';
import OrderHistory from './pages/patient/OrderHistory';
import OrderDetail from './pages/patient/OrderDetail';
import PatientProfile from './pages/patient/PatientProfile';

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ScheduleManagement from './pages/doctor/ScheduleManagement';
import AppointmentList from './pages/doctor/AppointmentList';
import CreatePrescription from './pages/doctor/CreatePrescription';
import PatientHistory from './pages/doctor/PatientHistory';
import DoctorProfile from './pages/doctor/DoctorProfile';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Set up axios defaults
  axios.defaults.baseURL = 'http://localhost:5000';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse-gentle text-primary-500">
          Loading TrustMed...
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      <CartProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/medicines" element={<MedicinesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              user && user.role === 'admin' ? (
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="medicines" element={<MedicineManagement />} />
                    <Route path="doctors" element={<DoctorManagement />} />
                    <Route path="patients" element={<PatientManagement />} />
                    <Route path="orders" element={<OrderManagement />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Patient Routes */}
          <Route
            path="/patient/*"
            element={
              user && user.role === 'patient' ? (
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<PatientDashboard />} />
                    <Route path="book-appointment" element={<AppointmentBooking />} />
                    <Route path="prescriptions" element={<PrescriptionList />} />
                    <Route path="prescriptions/:id" element={<PrescriptionDetail />} />
                    <Route path="upload-prescription" element={<PrescriptionUpload />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="orders" element={<OrderHistory />} />
                    <Route path="orders/:id" element={<OrderDetail />} />
                    <Route path="profile" element={<PatientProfile />} />
                    <Route path="*" element={<Navigate to="/patient/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor/*"
            element={
              user && user.role === 'doctor' ? (
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<DoctorDashboard />} />
                    <Route path="schedule" element={<ScheduleManagement />} />
                    <Route path="appointments" element={<AppointmentList />} />
                    <Route path="prescriptions/create/:appointmentId" element={<CreatePrescription />} />
                    <Route path="patient-history/:patientId" element={<PatientHistory />} />
                    <Route path="profile" element={<DoctorProfile />} />
                    <Route path="*" element={<Navigate to="/doctor/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </UserContext.Provider>
  );
}

export default App;