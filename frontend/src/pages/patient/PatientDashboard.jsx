import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import { Calendar, Clock, FileText, AlertTriangle, ShoppingBag, Plus, Activity } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useContext(UserContext);
  const [dashboardData, setDashboardData] = useState({
    upcomingAppointments: [],
    recentPrescriptions: [],
    pendingOrders: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`/api/patients/${user.id}/dashboard`);
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-gentle text-primary-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-800">Patient Dashboard</h1>
          <p className="text-neutral-600">Welcome back, {user.name}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/patient/book-appointment" className="btn btn-primary">
            <Plus size={18} />
            <span>Book Appointment</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm">Upcoming Appointments</p>
              <p className="text-2xl font-semibold">{dashboardData.upcomingAppointments.length}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <Calendar size={24} className="text-primary-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm">Active Prescriptions</p>
              <p className="text-2xl font-semibold">{dashboardData.recentPrescriptions.length}</p>
            </div>
            <div className="bg-success-100 p-3 rounded-full">
              <FileText size={24} className="text-success-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm">Pending Orders</p>
              <p className="text-2xl font-semibold">{dashboardData.pendingOrders.length}</p>
            </div>
            <div className="bg-warning-100 p-3 rounded-full">
              <ShoppingBag size={24} className="text-warning-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm">Health Status</p>
              <p className="text-2xl font-semibold">Good</p>
            </div>
            <div className="bg-secondary-100 p-3 rounded-full">
              <Activity size={24} className="text-secondary-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-card">
          <div className="flex items-center justify-between border-b border-neutral-200 p-4">
            <h2 className="font-heading font-semibold text-lg">Upcoming Appointments</h2>
            <Link to="/patient/book-appointment" className="text-primary-600 text-sm hover:underline">
              Book New
            </Link>
          </div>
          
          <div className="p-4">
            {dashboardData.upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-start gap-4 p-3 rounded-md hover:bg-neutral-50 transition-colors">
                    <div className="bg-primary-100 p-2 rounded-full">
                      <Calendar size={20} className="text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <p className="font-medium">{appointment.doctorName}</p>
                          <p className="text-sm text-neutral-600">{appointment.specialization}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={16} className="text-neutral-500" />
                          <span>{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="bg-neutral-100 p-3 rounded-full inline-flex items-center justify-center mb-3">
                  <Calendar size={24} className="text-neutral-500" />
                </div>
                <p className="text-neutral-600 mb-3">No upcoming appointments</p>
                <Link to="/patient/book-appointment" className="btn btn-outline">
                  Schedule Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="bg-white rounded-lg shadow-card">
          <div className="flex items-center justify-between border-b border-neutral-200 p-4">
            <h2 className="font-heading font-semibold text-lg">Recent Prescriptions</h2>
            <Link to="/patient/prescriptions" className="text-primary-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          
          <div className="p-4">
            {dashboardData.recentPrescriptions.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="flex items-start gap-4 p-3 rounded-md hover:bg-neutral-50 transition-colors">
                    <div className="bg-success-100 p-2 rounded-full">
                      <FileText size={20} className="text-success-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <p className="font-medium">Dr. {prescription.doctorName}</p>
                          <p className="text-sm text-neutral-600">{prescription.condition || 'General Checkup'}</p>
                        </div>
                        <Link 
                          to={`/patient/prescriptions/${prescription.id}`}
                          className="text-sm text-primary-600 hover:underline"
                        >
                          View Details
                        </Link>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {prescription.medicines.slice(0, 3).map((medicine, index) => (
                          <span key={index} className="badge badge-primary">{medicine.name}</span>
                        ))}
                        {prescription.medicines.length > 3 && (
                          <span className="badge badge-primary">+{prescription.medicines.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="bg-neutral-100 p-3 rounded-full inline-flex items-center justify-center mb-3">
                  <FileText size={24} className="text-neutral-500" />
                </div>
                <p className="text-neutral-600">No recent prescriptions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Reminders */}
      <div className="bg-white rounded-lg shadow-card">
        <div className="p-4 border-b border-neutral-200">
          <h2 className="font-heading font-semibold text-lg">Health Reminders</h2>
        </div>
        
        <div className="p-4">
          <div className="flex items-start gap-4 p-3 bg-warning-50 rounded-md">
            <div className="bg-warning-100 p-2 rounded-full">
              <AlertTriangle size={20} className="text-warning-600" />
            </div>
            <div>
              <p className="font-medium text-warning-700">Medication Reminder</p>
              <p className="text-sm text-warning-600">
                Don't forget to take your medications as prescribed. Keeping a regular schedule helps improve effectiveness.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;