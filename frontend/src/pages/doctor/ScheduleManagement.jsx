import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Plus, X, Calendar, Clock, Save } from 'lucide-react';

const ScheduleManagement = () => {
  const { user } = useContext(UserContext);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // New schedule form data
  const [newSchedule, setNewSchedule] = useState({
    date: new Date(),
    startTime: '',
    endTime: '',
    slotDuration: 30, // Default 30 minutes per appointment
  });
  
  // Time slots for select options (every 30 minutes from 8 AM to 8 PM)
  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 20 && minute === 30) continue; // Skip 8:30 PM
      
      const formattedHour = hour % 12 || 12;
      const period = hour < 12 ? 'AM' : 'PM';
      const formattedMinute = minute === 0 ? '00' : minute;
      
      timeSlots.push(`${formattedHour}:${formattedMinute} ${period}`);
    }
  }

  useEffect(() => {
    fetchSchedules();
  }, [user.id]);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`/api/doctors/${user.id}/schedules`);
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setNewSchedule(prev => ({ ...prev, date }));
  };

  const addSchedule = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newSchedule.startTime || !newSchedule.endTime) {
      toast.error('Please select both start and end time');
      return;
    }
    
    // Check if end time is after start time
    const startParts = newSchedule.startTime.split(/[: ]/);
    const endParts = newSchedule.endTime.split(/[: ]/);
    
    let startHour = parseInt(startParts[0]);
    const startMinute = parseInt(startParts[1]);
    const startPeriod = startParts[2];
    
    let endHour = parseInt(endParts[0]);
    const endMinute = parseInt(endParts[1]);
    const endPeriod = endParts[2];
    
    // Convert to 24-hour format for comparison
    if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
    if (startPeriod === 'AM' && startHour === 12) startHour = 0;
    
    if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
    if (endPeriod === 'AM' && endHour === 12) endHour = 0;
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    if (startMinutes >= endMinutes) {
      toast.error('End time must be after start time');
      return;
    }
    
    try {
      const formattedDate = newSchedule.date.toISOString().split('T')[0];
      const scheduleData = {
        doctorId: user.id,
        date: formattedDate,
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
        slotDuration: newSchedule.slotDuration
      };
      
      await axios.post(`/api/doctors/${user.id}/schedules`, scheduleData);
      
      toast.success('Schedule added successfully');
      fetchSchedules();
      setIsAdding(false);
      setNewSchedule({
        date: new Date(),
        startTime: '',
        endTime: '',
        slotDuration: 30,
      });
    } catch (error) {
      console.error('Error adding schedule:', error);
      toast.error('Failed to add schedule');
    }
  };

  const deleteSchedule = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await axios.delete(`/api/doctors/${user.id}/schedules/${scheduleId}`);
        toast.success('Schedule deleted');
        fetchSchedules();
      } catch (error) {
        console.error('Error deleting schedule:', error);
        toast.error('Failed to delete schedule');
      }
    }
  };

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
          <h1 className="font-heading text-2xl font-bold text-neutral-800">Schedule Management</h1>
          <p className="text-neutral-600">Manage your availability for appointments</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="btn btn-primary"
            >
              <Plus size={18} />
              <span>Add Schedule</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Schedule Form */}
      {isAdding && (
        <div className="bg-white rounded-lg shadow-card p-4 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading font-semibold text-lg">Add New Schedule</h2>
            <button
              onClick={() => setIsAdding(false)}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={addSchedule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={18} className="text-neutral-500" />
                  </div>
                  <DatePicker
                    selected={newSchedule.date}
                    onChange={handleDateChange}
                    className="input pl-10 w-full"
                    minDate={new Date()}
                    dateFormat="MMMM d, yyyy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Appointment Duration (minutes)
                </label>
                <select
                  name="slotDuration"
                  value={newSchedule.slotDuration}
                  onChange={handleInputChange}
                  className="select w-full"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Start Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size={18} className="text-neutral-500" />
                  </div>
                  <select
                    name="startTime"
                    value={newSchedule.startTime}
                    onChange={handleInputChange}
                    className="select pl-10 w-full"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((time, index) => (
                      <option key={`start-${index}`} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  End Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size={18} className="text-neutral-500" />
                  </div>
                  <select
                    name="endTime"
                    value={newSchedule.endTime}
                    onChange={handleInputChange}
                    className="select pl-10 w-full"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((time, index) => (
                      <option key={`end-${index}`} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={18} />
                <span>Save Schedule</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schedule List */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="p-4 border-b border-neutral-200">
          <h2 className="font-heading font-semibold text-lg">Your Schedule</h2>
        </div>

        {schedules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Time Slot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Appointment Duration
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
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(schedule.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {schedule.startTime} - {schedule.endTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {schedule.slotDuration} minutes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(schedule.date) < new Date() ? (
                        <span className="badge badge-error">Passed</span>
                      ) : (
                        <span className="badge badge-success">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteSchedule(schedule.id)}
                        className="text-error-600 hover:text-error-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8">
            <div className="bg-neutral-100 p-3 rounded-full inline-flex items-center justify-center mb-3">
              <Calendar size={24} className="text-neutral-500" />
            </div>
            <p className="text-neutral-600 mb-3">You haven't added any schedules yet</p>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="btn btn-outline"
              >
                <Plus size={18} />
                <span>Add Your First Schedule</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleManagement;