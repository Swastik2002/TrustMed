import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Calendar, FileText, ChevronLeft } from 'lucide-react';

const PatientHistory = () => {
  const { patientId } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [patientHistory, setPatientHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatientHistory();
  }, [patientId, user.id]);

  const fetchPatientHistory = async () => {
    try {
      const response = await axios.get(`/api/doctors/${user.id}/patient-history/${patientId}`);
      setPatientHistory(response.data);
    } catch (error) {
      console.error('Error fetching patient history:', error);
      toast.error('Failed to load patient history');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-gentle text-primary-500">Loading patient history...</div>
      </div>
    );
  }

  if (!patientHistory) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Patient history not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="text-neutral-600 hover:text-neutral-800"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-heading text-2xl font-bold text-neutral-800">Patient History</h1>
      </div>

      {/* Patient Information */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h2 className="text-lg font-semibold mb-4">Patient Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-neutral-600">Name</p>
            <p className="font-medium">{patientHistory.patient.name}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600">Email</p>
            <p className="font-medium">{patientHistory.patient.email}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600">Phone</p>
            <p className="font-medium">{patientHistory.patient.phone}</p>
          </div>
        </div>
      </div>

      {/* Past Appointments */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h2 className="text-lg font-semibold mb-4">Past Appointments</h2>
        {patientHistory.appointments.length > 0 ? (
          <div className="space-y-4">
            {patientHistory.appointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-neutral-50"
              >
                <div className="bg-primary-100 p-2 rounded-full">
                  <Calendar size={20} className="text-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <p className="font-medium">
                        {new Date(appointment.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-neutral-600">{appointment.time}</p>
                    </div>
                    <div className="text-sm">
                      <span className={`badge ${
                        appointment.status === 'completed' ? 'badge-success' :
                        appointment.status === 'cancelled' ? 'badge-error' :
                        appointment.status === 'no-show' ? 'badge-warning' :
                        'badge-primary'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                  {appointment.reason && (
                    <p className="text-sm text-neutral-600 mt-2">
                      Reason: {appointment.reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-600">No past appointments found</p>
        )}
      </div>

      {/* Past Prescriptions */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h2 className="text-lg font-semibold mb-4">Past Prescriptions</h2>
        {patientHistory.prescriptions.length > 0 ? (
          <div className="space-y-4">
            {patientHistory.prescriptions.map((prescription) => (
              <div 
                key={prescription.id}
                className="p-4 rounded-lg bg-neutral-50"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-success-100 p-2 rounded-full">
                    <FileText size={20} className="text-success-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <p className="font-medium">
                          {new Date(prescription.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-neutral-600">
                          Diagnosis: {prescription.diagnosis}
                        </p>
                      </div>
                    </div>

                    {/* Medicines */}
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Prescribed Medicines:</p>
                      <div className="space-y-2">
                        {prescription.medicines.map((medicine, index) => (
                          <div key={index} className="bg-white p-3 rounded">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{medicine.name}</p>
                                <p className="text-sm text-neutral-600">
                                  {[
                                    medicine.morning && 'Morning',
                                    medicine.afternoon && 'Afternoon',
                                    medicine.evening && 'Evening',
                                    medicine.night && 'Night'
                                  ].filter(Boolean).join(', ')}
                                </p>
                              </div>
                              <p className="text-sm text-neutral-600">
                                {medicine.before_meal ? 'Before Meal' : 'After Meal'}
                              </p>
                            </div>
                            {medicine.comments && (
                              <p className="text-sm text-neutral-600 mt-1">
                                {medicine.comments}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {prescription.comments && (
                      <div className="mt-4">
                        <p className="text-sm font-medium">Additional Comments:</p>
                        <p className="text-sm text-neutral-600">{prescription.comments}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-600">No past prescriptions found</p>
        )}
      </div>
    </div>
  );
};

export default PatientHistory;