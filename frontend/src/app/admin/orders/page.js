'use client';

import { useState, useEffect } from 'react';
import { getAdminOrders, updateOrderStatus } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filterStatus) params.status = filterStatus;
      const res = await getAdminOrders(params);
      setOrders(res.data.orders);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, filterStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">All Statuses</option>
          <option value="PLACED">Placed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="bg-white rounded-lg border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Order ID</th>
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 font-medium">Phone</th>
                  <th className="text-left px-4 py-3 font-medium">Items</th>
                  <th className="text-left px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{order.orderId}</td>
                    <td className="px-4 py-3">
                      <div>{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.phone}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.items.map((item) => `${item.name} ×${item.quantity}`).join(', ')}
                    </td>
                    <td className="px-4 py-3 font-medium">₹{order.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-lg border font-medium ${
                          order.status === 'PLACED'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : order.status === 'SHIPPED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-30 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-30 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
