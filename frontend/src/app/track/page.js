'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackOrder } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('orderId') || '');
  const [searchType, setSearchType] = useState('orderId');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
      setQuery(orderId);
      setSearchType('orderId');
      handleTrack(orderId, 'orderId');
    }
  }, [searchParams]);

  const handleTrack = async (value, type) => {
    const q = value || query;
    const t = type || searchType;
    if (!q.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const params = t === 'orderId' ? { orderId: q } : { phone: q };
      const res = await trackOrder(params);
      setOrders(res.data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTrack();
  };

  const statusColors = {
    PLACED: 'bg-yellow-100 text-yellow-800',
    SHIPPED: 'bg-blue-100 text-blue-800',
    DELIVERED: 'bg-green-100 text-green-800',
  };

  const statusSteps = ['PLACED', 'SHIPPED', 'DELIVERED'];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Track Your Order</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <div className="flex gap-4 justify-center">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              value="orderId"
              checked={searchType === 'orderId'}
              onChange={(e) => setSearchType(e.target.value)}
              className="accent-black"
            />
            Order ID
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              value="phone"
              checked={searchType === 'phone'}
              onChange={(e) => setSearchType(e.target.value)}
              className="accent-black"
            />
            Phone Number
          </label>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchType === 'orderId' ? 'e.g. ORD12345' : 'e.g. +91 9999999999'}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            className="bg-black text-white px-6 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition-colors"
          >
            Track
          </button>
        </div>
      </form>

      {loading && <LoadingSpinner />}

      {!loading && searched && orders.length === 0 && (
        <p className="text-center text-gray-500">No orders found.</p>
      )}

      {orders.map((order) => {
        const currentStep = statusSteps.indexOf(order.status);
        return (
          <div key={order._id} className="border border-gray-100 rounded-lg p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">{order.orderId}</h3>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                {order.status}
              </span>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-1 mb-6">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center w-full">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        i <= currentStep ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {i <= currentStep ? '✓' : i + 1}
                    </div>
                    <span className="text-xs mt-1 text-gray-500">{step}</span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`h-0.5 w-full mx-1 ${i < currentStep ? 'bg-black' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Items */}
            <div className="space-y-1">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-gray-600">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-semibold pt-2 border-t mt-2">
                <span>Total</span>
                <span>₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TrackOrderContent />
    </Suspense>
  );
}
