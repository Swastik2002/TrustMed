import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import { Calendar, Users, Clock, FileText, Plus, Activity } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useContext(UserContext);
  const [dashboardData, setDashboardData] = useState({
    todayAppointments: [],
    upcomingAppointments: [],
    recentPatients: [],
    pendingPrescriptions: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`/api/doctors/${user.id}/dashboard`);
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

  // Today's date formatted
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-800">Doctor Dashboard</h1>
          <p className="text-neutral-600">Welcome back, Dr. {user.name}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/doctor/schedule" className="btn btn-primary">
            <Clock size={18} />
            <span>Manage Schedule</span>
          </Link>
        </div>
      </div>

      {/* Today's Overview */}
      <div className="bg-white rounded-lg shadow-card p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-lg">Today's Overview</h2>
          <p className="text-neutral-600">{today}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm">Today's Appointments</p>
                <p className="text-2xl font-semibold">{dashboardData.todayAppointments.length}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full">
                <Calendar size={24} className="text-primary-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm">Upcoming Appointments</p>
                <p className="text-2xl font-semibold">{dashboardData.upcomingAppointments.length}</p>
              </div>
              <div className="bg-secondary-100 p-3 rounded-full">
                <Clock size={24} className="text-secondary-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm">Total Patients</p>
                <p className="text-2xl font-semibold">{dashboardData.recentPatients.length}</p>
              </div>
              <div className="bg-success-100 p-3 rounded-full">
                <Users size={24} className="text-success-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm">Pending Prescriptions</p>
                <p className="text-2xl font-semibold">{dashboardData.pendingPrescriptions.length}</p>
              </div>
              <div className="bg-warning-100 p-3 rounded-full">
                <FileText size={24} className="text-warning-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow-card">
          <div className="flex items-center justify-between border-b border-neutral-200 p-4">
            <h2 className="font-heading font-semibold text-lg">Today's Appointments</h2>
            <Link to="/doctor/appointments" className="text-primary-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          
          <div className="p-4">
            {dashboardData.todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-start gap-4 p-3 rounded-md hover:bg-neutral-50 transition-colors">
                    <div className="bg-primary-100 p-2 rounded-full">
                      <Users size={20} className="text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-sm text-neutral-600">{appointment.reason || 'General Checkup'}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={16} className="text-neutral-500" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link 
                          to={`/doctor/prescriptions/create/${appointment.id}`} 
                          className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                        >
                          <FileText size={16} />
                          <span>Create Prescription</span>
                        </Link>
                        <Link 
                          to={`/doctor/patient-history/${appointment.patientId}`} 
                          className="text-sm text-secondary-600 hover:underline flex items-center gap-1"
                        >
                          <Activity size={16} />
                          <span>View History</span>
                        </Link>
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
                <p className="text-neutral-600 mb-3">No appointments for today</p>
                <Link to="/doctor/schedule" className="btn btn-outline">
                  Manage Schedule
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-lg shadow-card">
          <div className="flex items-center justify-between border-b border-neutral-200 p-4">
            <h2 className="font-heading font-semibold text-lg">Recent Patients</h2>
          </div>
          
          <div className="p-4">
            {dashboardData.recentPatients.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-start gap-4 p-3 rounded-md hover:bg-neutral-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-neutral-600">
                            Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}
                          </p>
                        </div>
                        <Link 
                          to={`/doctor/patient-history/${patient.id}`}
                          className="text-sm text-primary-600 hover:underline"
                        >
                          View History
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="bg-neutral-100 p-3 rounded-full inline-flex items-center justify-center mb-3">
                  <Users size={24} className="text-neutral-500" />
                </div>
                <p className="text-neutral-600">No patients yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Prescriptions */}
      <div className="bg-white rounded-lg shadow-card">
        <div className="p-4 border-b border-neutral-200">
          <h2 className="font-heading font-semibold text-lg">Pending Prescriptions</h2>
        </div>
        
        <div className="p-4">
          {dashboardData.pendingPrescriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Appointment Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {dashboardData.pendingPrescriptions.map((prescription) => (
                    <tr key={prescription.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900">{prescription.patientName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-600">
                          {new Date(prescription.appointmentDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-600">{prescription.reason || 'General Checkup'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link 
                          to={`/doctor/prescriptions/create/${prescription.appointmentId}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Create Prescription
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="bg-neutral-100 p-3 rounded-full inline-flex items-center justify-center mb-3">
                <FileText size={24} className="text-neutral-500" />
              </div>
              <p className="text-neutral-600">No pending prescriptions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;