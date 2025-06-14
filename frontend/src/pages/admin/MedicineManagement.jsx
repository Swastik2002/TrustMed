import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Search, Edit, Trash2, Plus, Upload } from 'lucide-react';

const MedicineManagement = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageFile: null,
    imageUrl: ''
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const resp = await axios.get('/api/medicines', {
        params: { search: searchQuery }
      });
      setMedicines(resp.data);
    } catch (err) {
      console.error('Error fetching medicines:', err);
      toast.error('Failed to load medicines');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    fetchMedicines();
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      imageFile: null,
      imageUrl: ''
    });
    setIsAdding(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setFormData({ ...formData, imageFile: file, imageUrl: '' });
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('description', formData.description);
    payload.append('price', formData.price);
    payload.append('category', formData.category);
  
    if (formData.imageUrl) {
      payload.append('imageUrl', formData.imageUrl);
    } else if (formData.imageFile) {
      payload.append('image', formData.imageFile);
    }
  
    try {
      await axios.post('/api/admin/medicines', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Medicine added successfully');
      setIsAdding(false);
      fetchMedicines();
    } catch (err) {
      console.error('Error adding medicine:', err);
      toast.error('Failed to add medicine');
    }
  };  

  const handleEditClick = (med) => {
    setSelectedMedicine(med);
    setFormData({
      name: med.name,
      description: med.description || '',
      price: med.price.toString(),
      category: med.category || '',
      imageFile: null,
      imageUrl: ''
    });
    setIsEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('description', formData.description);
    payload.append('price', formData.price);
    payload.append('category', formData.category);
  
    if (formData.imageUrl) {
      payload.append('imageUrl', formData.imageUrl);
    } else if (formData.imageFile) {
      payload.append('image', formData.imageFile);
    }
  
    try {
      await axios.put(`/api/admin/medicines/${selectedMedicine.id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Medicine updated successfully');
      setIsEditing(false);
      fetchMedicines();
    } catch (err) {
      console.error('Error updating medicine:', err);
      toast.error('Failed to update medicine');
    }
  };  

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      await axios.delete(`/api/admin/medicines/${id}`);
      toast.success('Medicine deleted successfully');
      fetchMedicines();
    } catch (err) {
      console.error('Error deleting medicine:', err);
      toast.error('Failed to delete medicine');
    }
  };

  const MedicineForm = ({ onSubmit, isAdd }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
        <input
          autoFocus
          type="text"
          value={formData.name}
          onChange={(e) => setFormData((fd) => ({ ...fd, name: e.target.value }))}
          className="input w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((fd) => ({ ...fd, description: e.target.value }))}
          className="textarea w-full"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Price</label>
        <input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData((fd) => ({ ...fd, price: e.target.value }))}
          className="input w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData((fd) => ({ ...fd, category: e.target.value }))}
          className="input w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Image</label>
        <div className="flex items-center gap-4">
          <input
            id="medicine-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <label htmlFor="medicine-image" className="btn btn-outline flex items-center gap-2">
            <Upload size={18} /><span>Upload Image</span>
          </label>
          {formData.image && (
            <span className="text-sm text-neutral-600">{formData.image.name}</span>
          )}
        </div>

        <div>
            <label className="block text-sm font-medium mb-1">
                OR Image URL
            </label>
            <input
                type="url"
                value={formData.imageUrl}
                onChange={e => setFormData(f => ({ ...f, imageUrl: e.target.value, imageFile: null }))}
                placeholder="https://example.com/image.jpg"
                className="input w-full"
            />
        </div>

      </div>
      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={() => (isAdd ? setIsAdding(false) : setIsEditing(false))}
          className="btn btn-outline"
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {isAdd ? 'Add Medicine' : 'Save Changes'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-800">
            Medicine Management
          </h1>
          <p className="text-neutral-600">Manage hospital medicines</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary mt-4 md:mt-0">
          <Plus size={18} /> <span>Add Medicine</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-card p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <button onClick={handleSearch} className="btn btn-primary">
            Search
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse-gentle text-primary-500">
              Loading medicines...
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {medicines.map((med) => (
                  <tr key={med.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {med.image_url && (
                          <img
                            src={med.image_url}
                            alt={med.name}
                            className="w-10 h-10 rounded mr-3 object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-neutral-900">{med.name}</div>
                          <div className="text-sm text-neutral-500">
                            {med.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-600">
                      {med.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-600">
                      ₹{Number(med.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(med)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(med.id)}
                        className="text-error-600 hover:text-error-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Medicine</h2>
            <MedicineForm onSubmit={handleAdd} isAdd={true} />
          </div>
        </div>
      )}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Medicine</h2>
            <MedicineForm onSubmit={handleUpdate} isAdd={false} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineManagement;
