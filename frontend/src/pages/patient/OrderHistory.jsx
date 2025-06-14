import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Package, Clock, MapPin, CreditCard } from 'lucide-react';

const OrderHistory = () => {
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`/api/patients/${user.id}/orders`);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user.id]);

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

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-neutral-800">My Orders</h1>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse-gentle text-primary-500">Loading orders...</div>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-card p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="text-primary-600" size={20} />
                    <span className="font-medium">Order #{order.id}</span>
                    <span className={getStatusBadgeClass(order.status)}>
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{order.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} />
                      <span>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-neutral-600">Total Amount</p>
                    <p className="font-medium text-lg">₹{order.total_amount.toFixed(2)}</p>
                  </div>
                  <Link
                    to={`/patient/orders/${order.id}`}
                    className="btn btn-outline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-card">
          <div className="bg-neutral-100 p-3 rounded-full inline-flex items-center justify-center mb-3">
            <Package size={24} className="text-neutral-500" />
          </div>
          <p className="text-neutral-600 mb-4">No orders found</p>
          <Link to="/medicines" className="btn btn-primary">
            Browse Medicines
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;