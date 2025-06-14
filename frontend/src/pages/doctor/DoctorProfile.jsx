import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { User, Mail, Phone, Stethoscope, Save } from 'lucide-react';

const DoctorProfile = () => {
  const { user, login } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    specialization: user.specialization || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.put(`/api/doctors/${user.id}`, formData);
      
      // Update user context with new data
      login({
        ...user,
        ...formData
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-heading text-2xl font-bold text-neutral-800">Doctor Profile</h1>

      <div className="bg-white rounded-lg shadow-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-neutral-500" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input pl-10 w-full"
                placeholder="Dr. John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-neutral-500" />
              </div>
              <input
                type="email"
                value={user.email}
                disabled
                className="input pl-10 w-full bg-neutral-50"
              />
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-neutral-500" />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input pl-10 w-full"
                placeholder="+1 (123) 456-7890"
              />
            </div>
          </div>

          <div>
            <label htmlFor="specialization" className="block text-sm font-medium text-neutral-700 mb-1">
              Specialization
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Stethoscope size={18} className="text-neutral-500" />
              </div>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="input pl-10 w-full"
                placeholder="e.g., Cardiology"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full"
          >
            <Save size={18} />
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfile;