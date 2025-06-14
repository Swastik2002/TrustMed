import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { Home, Calendar, FileText, User, Upload, ShoppingCart, Package, Settings, LogOut, Clock, Menu, X, Pill as Pills } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role;
  const isPatient = role === 'patient';
  const isDoctor  = role === 'doctor';
  const isAdmin   = role === 'admin';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  let menuItems = [];

  // Patient menu
  if (isPatient) {
    menuItems = [
      { path: '/patient/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
      { path: '/patient/book-appointment', label: 'Book Appointment', icon: <Calendar size={20} /> },
      { path: '/patient/prescriptions', label: 'My Prescriptions', icon: <FileText size={20} /> },
      { path: '/patient/upload-prescription', label: 'Upload Prescription', icon: <Upload size={20} /> },
      { path: '/patient/cart', label: 'Cart', icon: <ShoppingCart size={20} /> },
      { path: '/patient/orders', label: 'My Orders', icon: <Package size={20} /> },
      { path: '/patient/profile', label: 'Profile', icon: <User size={20} /> },
    ];
  } 
  // Doctor menu
  else if (isDoctor) {
    menuItems = [
      { path: '/doctor/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
      { path: '/doctor/schedule', label: 'Manage Schedule', icon: <Clock size={20} /> },
      { path: '/doctor/appointments', label: 'Appointments', icon: <Calendar size={20} /> },
      { path: '/doctor/profile', label: 'Profile', icon: <User size={20} /> },
    ];
  }
  // Admin menu
  else if (isAdmin) {
    menuItems = [
      { path: '/admin/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
      { path: '/admin/medicines', label: 'Medicines', icon: <Pills size={20} /> },
      { path: '/admin/doctors', label: 'Doctors', icon: <User size={20} /> },
      { path: '/admin/patients', label: 'Patients', icon: <User size={20} /> },
      { path: '/admin/orders', label: 'Orders', icon: <Package size={20} /> },
      { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
    ];
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Mobile sidebar toggle */}
      <div className="fixed z-30 top-4 left-4 md:hidden">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white shadow-md text-neutral-700 hover:bg-primary-50"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:relative inset-y-0 left-0 z-20 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-neutral-200">
            <Link to="/" className="flex items-center gap-2">
              <img src="/img/logo.png" alt="TrustMed Logo" className="w-100 h-12 object-contain" />
            </Link>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-neutral-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-neutral-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;