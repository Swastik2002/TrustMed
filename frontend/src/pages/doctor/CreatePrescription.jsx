import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Search, Plus, Minus, Save, ChevronLeft } from 'lucide-react';

const CreatePrescription = () => {
  const { appointmentId } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [comments, setComments] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      const response = await axios.get(`/api/appointments/${appointmentId}`);
      setAppointment(response.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Failed to load appointment details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get('/api/medicines', {
        params: { search: searchQuery }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching medicines:', error);
      toast.error('Failed to search medicines');
    }
  };

  const handleAddMedicine = (medicine) => {
    const newMedicine = {
      ...medicine,
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
      beforeMeal: false,
      afterMeal: true,
      dosage: '',
      comments: ''
    };
    setSelectedMedicines([...selectedMedicines, newMedicine]);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleRemoveMedicine = (index) => {
    setSelectedMedicines(selectedMedicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...selectedMedicines];
    updatedMedicines[index] = {
      ...updatedMedicines[index],
      [field]: value
    };
    setSelectedMedicines(updatedMedicines);
  };

  const handleSubmit = async () => {
    if (!diagnosis.trim()) {
      toast.error('Please enter a diagnosis');
      return;
    }

    if (selectedMedicines.length === 0) {
      toast.error('Please add at least one medicine');
      return;
    }

    setIsSubmitting(true);

    try {
      const prescriptionData = {
        appointmentId,
        doctorId: user.id,
        patientId: appointment.patient_id,
        diagnosis,
        comments,
        medicines: selectedMedicines.map(medicine => ({
          medicineId: medicine.id,
          morning: medicine.morning,
          afternoon: medicine.afternoon,
          evening: medicine.evening,
          night: medicine.night,
          beforeMeal: medicine.beforeMeal,
          afterMeal: medicine.afterMeal,
          dosage: medicine.dosage,
          comments: medicine.comments
        }))
      };

      await axios.post('/api/prescriptions', prescriptionData);
      toast.success('Prescription created successfully');
      navigate('/doctor/appointments');
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to create prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-gentle text-primary-500">Loading...</div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Appointment not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/doctor/appointments')}
          className="text-neutral-600 hover:text-neutral-800"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-heading text-2xl font-bold text-neutral-800">Create Prescription</h1>
      </div>

      <div className="bg-white rounded-lg shadow-card p-6">
        {/* Patient Info */}
        <div className="mb-6 pb-6 border-b border-neutral-200">
          <h2 className="text-lg font-semibold mb-4">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-600">Name</p>
              <p className="font-medium">{appointment.patientName}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Appointment Date</p>
              <p className="font-medium">
                {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
              </p>
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Diagnosis
          </label>
          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="textarea w-full"
            rows={3}
            placeholder="Enter diagnosis details"
          />
        </div>

        {/* Medicine Search */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Add Medicines
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch();
              }}
              className="input w-full pl-10"
              placeholder="Search medicines..."
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={20} />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((medicine) => (
                <button
                  key={medicine.id}
                  onClick={() => handleAddMedicine(medicine)}
                  className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{medicine.name}</p>
                    <p className="text-sm text-neutral-600">{medicine.category}</p>
                  </div>
                  <Plus size={16} className="text-primary-500" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Medicines */}
        <div className="space-y-4">
          {selectedMedicines.map((medicine, index) => (
            <div key={index} className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium">{medicine.name}</h3>
                  <p className="text-sm text-neutral-600">{medicine.category}</p>
                </div>
                <button
                  onClick={() => handleRemoveMedicine(index)}
                  className="text-error-600 hover:text-error-700"
                >
                  <Minus size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Timing
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={medicine.morning}
                        onChange={(e) => handleMedicineChange(index, 'morning', e.target.checked)}
                        className="text-primary-500"
                      />
                      <span>Morning</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={medicine.afternoon}
                        onChange={(e) => handleMedicineChange(index, 'afternoon', e.target.checked)}
                        className="text-primary-500"
                      />
                      <span>Afternoon</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={medicine.evening}
                        onChange={(e) => handleMedicineChange(index, 'evening', e.target.checked)}
                        className="text-primary-500"
                      />
                      <span>Evening</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={medicine.night}
                        onChange={(e) => handleMedicineChange(index, 'night', e.target.checked)}
                        className="text-primary-500"
                      />
                      <span>Night</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Meal Preference
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`meal-${index}`} // important to group them
                        checked={medicine.beforeMeal === true}
                        onChange={() => {
                          if (!medicine.beforeMeal) {
                            handleMedicineChange(index, 'beforeMeal', true);
                            handleMedicineChange(index, 'afterMeal', false);
                          }
                        }}
                        className="text-primary-500"
                      />
                      <span>Before Meal</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`meal-${index}`}
                        checked={medicine.afterMeal === true}
                        onChange={() => {
                          if (!medicine.afterMeal) {
                            handleMedicineChange(index, 'beforeMeal', false);
                            handleMedicineChange(index, 'afterMeal', true);
                          }
                        }}
                        className="text-primary-500"
                      />
                      <span>After Meal</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={medicine.dosage}
                    onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                    className="input w-full"
                    placeholder="e.g., 1 tablet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Comments
                  </label>
                  <input
                    type="text"
                    value={medicine.comments}
                    onChange={(e) => handleMedicineChange(index, 'comments', e.target.value)}
                    className="input w-full"
                    placeholder="Additional instructions"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Comments */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Additional Comments
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="textarea w-full"
            rows={3}
            placeholder="Any additional comments or instructions"
          />
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            <Save size={18} />
            <span>{isSubmitting ? 'Creating...' : 'Create Prescription'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePrescription;