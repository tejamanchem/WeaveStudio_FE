'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminOrders } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, placed: 0, shipped: 0, delivered: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAdminOrders({ limit: 5 });
        const orders = res.data.orders;

        setRecentOrders(orders);
        setStats({
          total: res.data.total,
          placed: orders.filter((o) => o.status === 'PLACED').length,
          shipped: orders.filter((o) => o.status === 'SHIPPED').length,
          delivered: orders.filter((o) => o.status === 'DELIVERED').length,
        });
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { label: 'Total Orders', value: stats.total, color: 'bg-black text-white' },
    { label: 'Placed', value: stats.placed, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Shipped', value: stats.shipped, color: 'bg-blue-50 text-blue-700' },
    { label: 'Delivered', value: stats.delivered, color: 'bg-green-50 text-green-700' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className={`${card.color} rounded-lg p-5`}>
            <p className="text-sm opacity-75">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
        <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-black">
          View all →
        </Link>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Order ID</th>
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-left px-4 py-3 font-medium">Total</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {recentOrders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{order.orderId}</td>
                <td className="px-4 py-3 text-gray-600">{order.customerName}</td>
                <td className="px-4 py-3">₹{order.totalAmount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.status === 'PLACED'
                        ? 'bg-yellow-100 text-yellow-700'
                        : order.status === 'SHIPPED'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
