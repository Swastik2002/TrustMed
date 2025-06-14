import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Calendar, Clock, FileText, User, Activity } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const AppointmentList = () => {
  const { user } = useContext(UserContext);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, user.id]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/appointments/doctor/${user.id}`, {
        params: {
          date: selectedDate.toISOString().split('T')[0]
        }
      });
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await axios.put(`/api/appointments/${appointmentId}/status`, { status });
      toast.success('Appointment status updated');
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'scheduled':
        return 'badge badge-primary';
      case 'completed':
        return 'badge badge-success';
      case 'cancelled':
        return 'badge badge-error';
      case 'no-show':
        return 'badge badge-warning';
      default:
        return 'badge badge-neutral';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-800">Appointments</h1>
          <p className="text-neutral-600">Manage your patient appointments</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            className="input"
            dateFormat="MMMM d, yyyy"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse-gentle text-primary-500">Loading appointments...</div>
          </div>
        ) : appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">
                            {appointment.patientName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">{appointment.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-900">
                        {appointment.reason || 'General Checkup'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadgeClass(appointment.status)}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        {appointment.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              className="text-success-600 hover:text-success-900"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'no-show')}
                              className="text-warning-600 hover:text-warning-900"
                            >
                              No Show
                            </button>
                          </>
                        )}
                        <Link
                          to={`/doctor/prescriptions/create/${appointment.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Prescription
                        </Link>
                        <Link
                          to={`/doctor/patient-history/${appointment.patientId}`}
                          className="text-secondary-600 hover:text-secondary-900"
                        >
                          History
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-neutral-100 p-3 rounded-full inline-flex items-center justify-center mb-3">
              <Calendar size={24} className="text-neutral-500" />
            </div>
            <p className="text-neutral-600 mb-2">No appointments for this date</p>
            <p className="text-sm text-neutral-500">
              Select a different date or wait for new appointments
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentList;