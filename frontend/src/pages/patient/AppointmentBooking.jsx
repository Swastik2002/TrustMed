import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Calendar, Clock, Search, User } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const AppointmentBooking = () => {
  const { user } = useContext(UserContext);
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchSpecialization, setSearchSpecialization] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, [searchSpecialization]);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/doctors', {
        params: { specialization: searchSpecialization }
      });
      setDoctors(response.data);
      
      // Extract unique specializations
      const uniqueSpecializations = [...new Set(response.data.map(doc => doc.specialization))];
      setSpecializations(uniqueSpecializations);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;

    try {
      setIsLoading(true);
      const response = await axios.get('/api/appointments/available-slots', {
        params: {
          doctorId: selectedDoctor.id,
          date: selectedDate.toISOString().split('T')[0]
        }
      });

      console.log(response.data);
      
      if (response.data.available) {
        setAvailableSlots(response.data.slots);
      } else {
        setAvailableSlots([]);
        toast.info('No available slots for selected date');
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load available slots');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlot('');
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      toast.error('Please select all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post('/api/appointments', {
        patientId: user.id,
        doctorId: selectedDoctor.id,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedSlot,
        reason
      });

      toast.success('Appointment booked successfully!');
      // Reset form
      setSelectedDoctor(null);
      setSelectedDate(new Date());
      setSelectedSlot('');
      setReason('');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-card p-6">
        <h1 className="text-2xl font-bold mb-6">Book an Appointment</h1>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Search by Specialization
              </label>
              <select
                value={searchSpecialization}
                onChange={(e) => setSearchSpecialization(e.target.value)}
                className="select w-full"
              >
                <option value="">All Specializations</option>
                {specializations.map((spec, index) => (
                  <option key={index} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Doctor Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Select Doctor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedDoctor?.id === doctor.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-primary-300'
                }`}
                onClick={() => handleDoctorSelect(doctor)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Dr. {doctor.name}</h3>
                    <p className="text-sm text-neutral-600">{doctor.specialization}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedDoctor && (
          <>
            {/* Date Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Select Date</h2>
              <div className="w-full md:w-64">
                <DatePicker
                  selected={selectedDate}
                  onChange={setSelectedDate}
                  minDate={new Date()}
                  className="input w-full"
                  dateFormat="MMMM d, yyyy"
                />
              </div>
            </div>

            {/* Time Slot Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Select Time Slot</h2>
              {isLoading ? (
                <div className="animate-pulse-gentle text-primary-500">Loading available slots...</div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        selectedSlot === slot
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-neutral-200 hover:border-primary-300'
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-600">No available slots for selected date</p>
              )}
            </div>

            {/* Appointment Reason */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Reason for Visit</h2>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="textarea w-full"
                rows={4}
                placeholder="Please describe your reason for visit"
              />
            </div>

            {/* Book Button */}
            <button
              onClick={handleBookAppointment}
              disabled={isLoading || !selectedSlot}
              className="btn btn-primary w-full md:w-auto"
            >
              {isLoading ? 'Booking...' : 'Book Appointment'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentBooking;