import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { CreditCard, Truck, MapPin } from 'lucide-react';

const CheckoutPage = () => {
  const { user } = useContext(UserContext);
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'cod'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        patientId: user.id,
        items: cartItems.map(item => ({
          medicineId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: getCartTotal() + 5, // Including delivery fee
        address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        paymentMethod: formData.paymentMethod
      };

      const response = await axios.post('/api/orders', orderData);
      
      toast.success('Order placed successfully!');
      clearCart();
      navigate(`/patient/orders/${response.data.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="font-heading text-2xl font-bold text-neutral-800">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Checkout Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="input w-full"
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="input w-full"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="input w-full"
                    placeholder="State"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                  className="input w-full"
                  placeholder="12345"
                />
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleChange}
                  className="text-primary-600"
                />
                <span>Cash on Delivery</span>
              </label>
              
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer opacity-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  disabled
                  className="text-primary-600"
                />
                <span>Credit/Debit Card (Coming Soon)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-neutral-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            
            <div className="border-t border-neutral-200 pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium">₹{getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Delivery Fee</span>
                <span className="font-medium">₹5.00</span>
              </div>
              <div className="border-t border-neutral-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">₹{(getCartTotal() + 5).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || cartItems.length === 0}
              className="btn btn-primary w-full mt-4"
            >
              {isLoading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
