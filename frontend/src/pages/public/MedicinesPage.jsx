import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medicinesRes, categoriesRes] = await Promise.all([
          axios.get('/api/medicines'),
          axios.get('/api/medicines/categories/all')
        ]);
        setMedicines(medicinesRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load medicines');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/medicines', {
        params: {
          category: selectedCategory,
          search: searchQuery
        }
      });
      setMedicines(response.data);
    } catch (error) {
      console.error('Error searching medicines:', error);
      toast.error('Failed to search medicines');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (medicine) => {
    addToCart(medicine);
    toast.success(`${medicine.name} added to cart`);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Medicines</h1>
            <p className="text-xl text-white/90">
              Browse our extensive collection of quality medicines
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={20} />
                <input
                  type="text"
                  placeholder="Search medicines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={20} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="select pl-10 w-full"
                >
                  <option value="">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button onClick={handleSearch} className="btn btn-primary md:w-auto">
              <Search size={18} />
              <span>Search</span>
            </button>
          </div>
        </div>
      </section>

      {/* Medicines Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse-gentle text-primary-500">Loading medicines...</div>
            </div>
          ) : medicines.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {medicines.map((medicine) => (
                <div key={medicine.id} className="bg-white rounded-lg shadow-card p-4">
                  <div className="aspect-w-1 aspect-h-1 bg-neutral-100 rounded-lg mb-4">
                    {medicine.image_url ? (
                      <img
                        src={medicine.image_url}
                        alt={medicine.name}
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-48 bg-neutral-100 rounded-lg">
                        <span className="text-neutral-400">No image</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-1">{medicine.name}</h3>
                  <p className="text-neutral-600 text-sm mb-2">{medicine.description}</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className="text-lg font-semibold text-primary-600">
                        ₹{medicine.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-neutral-500 ml-2">per unit</span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(medicine)}
                      className="btn btn-primary btn-sm"
                    >
                      <ShoppingCart size={16} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-neutral-100 p-3 rounded-full inline-flex items-center justify-center mb-3">
                <Search size={24} className="text-neutral-500" />
              </div>
              <p className="text-neutral-600">No medicines found</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MedicinesPage;