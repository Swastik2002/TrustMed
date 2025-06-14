import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FileText, Calendar, User, ShoppingCart } from 'lucide-react';

const PrescriptionList = () => {
  const { user } = useContext(UserContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await axios.get(`/api/patients/${user.id}/prescriptions`);
        setPrescriptions(response.data);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        toast.error('Failed to load prescriptions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, [user.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-800">My Prescriptions</h1>
          <p className="text-neutral-600">View and manage your prescriptions</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/patient/upload-prescription" className="btn btn-primary">
            <FileText size={18} />
            <span>Upload Prescription</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse-gentle text-primary-500">Loading prescriptions...</div>
          </div>
        ) : prescriptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Diagnosis
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {prescriptions.map((prescription) => (
                  <tr key={prescription.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">
                            Dr. {prescription.doctor_name}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {prescription.specialization}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">
                        {new Date(prescription.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {new Date(prescription.appointment_date).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-900">
                        {prescription.diagnosis || 'General Checkup'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <Link
                          to={`/patient/prescriptions/${prescription.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View Details
                        </Link>
                        <Link
                          to={`/patient/cart`}
                          state={{ prescriptionId: prescription.id }}
                          className="text-secondary-600 hover:text-secondary-900"
                        >
                          Order Medicines
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
              <FileText size={24} className="text-neutral-500" />
            </div>
            <p className="text-neutral-600 mb-3">No prescriptions found</p>
            <Link to="/patient/upload-prescription" className="btn btn-outline">
              Upload Prescription
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionList;