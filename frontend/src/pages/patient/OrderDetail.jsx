import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Package, MapPin, CreditCard, ChevronLeft } from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`/api/patients/${user.id}/orders/${id}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, user.id]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'badge badge-warning';
      case 'processing':
        return 'badge badge-primary';
      case 'shipped':
        return 'badge badge-secondary';
      case 'delivered':
        return 'badge badge-success';
      case 'cancelled':
        return 'badge badge-error';
      default:
        return 'badge';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-gentle text-primary-500">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <div className="bg-neutral-100 p-3 rounded-full inline-flex items-center justify-center mb-3">
          <Package size={24} className="text-neutral-500" />
        </div>
        <p className="text-neutral-600 mb-4">Order not found</p>
        <Link to="/patient/orders" className="btn btn-primary">
          View All Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/patient/orders" className="text-neutral-600 hover:text-neutral-800">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="font-heading text-2xl font-bold text-neutral-800">Order Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-neutral-600">Order ID</p>
                <p className="font-medium">#{order.id}</p>
              </div>
              <span className={getStatusBadgeClass(order.status)}>
                {order.status}
              </span>
            </div>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-neutral-600">{item.category}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <p className="text-sm">Quantity: {item.quantity}</p>
                      <p className="text-sm text-primary-600">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium">₹{order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Delivery Fee</span>
                <span className="font-medium">₹5.00</span>
              </div>
              <div className="border-t border-neutral-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">₹{(order.total_amount + 5).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-neutral-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Delivery Address</p>
                  <p className="text-neutral-600">{order.address}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CreditCard size={20} className="text-neutral-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Payment Method</p>
                  <p className="text-neutral-600">
                    {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Card Payment'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;