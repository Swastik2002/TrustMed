import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Search, Package, ChevronDown, ChevronUp, Download } from 'lucide-react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    (order.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
    (order.email?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
    order.id.toString().includes(searchQuery)
  );

  const toggleExpand = (orderId) => {
    setExpandedOrder(prev => (prev === orderId ? null : orderId));
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const exportOrders = () => {
    const csvRows = [
      ['Order ID', 'Patient Name', 'Email', 'Total', 'Status', 'Date'],
      ...orders.map(order => [
        order.id,
        order.patientName,
        order.email,
        `$${order.total.toFixed(2)}`,
        order.status,
        new Date(order.createdAt).toLocaleString()
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(row => row.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6" /> Order Management
        </h1>
        <button
          className="btn btn-outline flex items-center gap-2"
          onClick={exportOrders}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-neutral-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or ID"
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-primary-500 animate-pulse">Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-neutral-600">No orders found</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="border rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-neutral-600">{order.patientName} • {order.email}</p>
                  <p className="text-sm text-neutral-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button onClick={() => toggleExpand(order.id)}>
                    {expandedOrder === order.id ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="mt-4 border-t pt-4 text-sm space-y-2 text-neutral-700">
                  <p><span className="font-medium">Delivery Address:</span> {order.address}</p>
                  <div>
                    <span className="font-medium">Items:</span>
                    <ul className="list-disc ml-5 mt-1">
                      {order.items.map((item, idx) => (
                        <li key={idx}>{item.name} × {item.quantity} — ${item.price.toFixed(2)}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="font-medium">Total: <span className="text-primary-600">${order.total.toFixed(2)}</span></p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
