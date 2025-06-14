import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Users, Pill as Pills, Package, TrendingUp, Download } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    doctorsCount: 0,
    patientsCount: 0,
    medicinesCount: 0,
    ordersCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await axios.get('/api/admin/export');
      const data = response.data;
      
      // Convert data to CSV format
      const csvContent = `data:text/csv;charset=utf-8,${
        Object.keys(data).map(key => {
          const rows = data[key].map(item => Object.values(item).join(','));
          return `${key}\n${rows.join('\n')}`;
        }).join('\n\n')
      }`;
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'trustmed-summary.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Summary exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export summary');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-gentle text-primary-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-800">Admin Dashboard</h1>
          <p className="text-neutral-600">Manage your hospital system</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button onClick={handleExportData} className="btn btn-primary">
            <Download size={18} />
            <span>Export Summary</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm">Total Doctors</p>
              <p className="text-2xl font-semibold">{stats.doctorsCount}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <Users size={24} className="text-primary-600" />
            </div>
          </div>
          <Link 
            to="/admin/doctors"
            className="text-sm text-primary-600 hover:underline mt-4 inline-block"
          >
            View all doctors
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm">Total Patients</p>
              <p className="text-2xl font-semibold">{stats.patientsCount}</p>
            </div>
            <div className="bg-secondary-100 p-3 rounded-full">
              <Users size={24} className="text-secondary-600" />
            </div>
          </div>
          <Link 
            to="/admin/patients"
            className="text-sm text-primary-600 hover:underline mt-4 inline-block"
          >
            View all patients
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm">Total Medicines</p>
              <p className="text-2xl font-semibold">{stats.medicinesCount}</p>
            </div>
            <div className="bg-success-100 p-3 rounded-full">
              <Pills size={24} className="text-success-600" />
            </div>
          </div>
          <Link 
            to="/admin/medicines"
            className="text-sm text-primary-600 hover:underline mt-4 inline-block"
          >
            View all medicines
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm">Total Orders</p>
              <p className="text-2xl font-semibold">{stats.ordersCount}</p>
            </div>
            <div className="bg-warning-100 p-3 rounded-full">
              <Package size={24} className="text-warning-600" />
            </div>
          </div>
          <Link 
            to="/admin/orders"
            className="text-sm text-primary-600 hover:underline mt-4 inline-block"
          >
            View all orders
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h2 className="font-heading text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/doctors" className="btn btn-outline w-full">
            <Users size={18} />
            <span>Manage Doctors</span>
          </Link>
          <Link to="/admin/patients" className="btn btn-outline w-full">
            <Users size={18} />
            <span>Manage Patients</span>
          </Link>
          <Link to="/admin/medicines" className="btn btn-outline w-full">
            <Pills size={18} />
            <span>Manage Medicine</span>
          </Link>
          <Link to="/admin/orders" className="btn btn-outline w-full">
            <Package size={18} />
            <span>Track Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;