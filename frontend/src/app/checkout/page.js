'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useCartStore from '@/store/cartStore';
import { placeOrder } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      }));

      const res = await placeOrder({ ...form, items: orderItems });
      const orderId = res.data.order.orderId;

      clearCart();
      toast.success(`Order placed! ID: ${orderId}`);
      router.push(`/track?orderId=${orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Nothing to checkout</h1>
        <Link
          href="/"
          className="inline-block mt-6 bg-black text-white px-6 py-3 rounded-lg text-sm hover:bg-gray-800"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="+91 9999999999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
              placeholder="Full address with pincode"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Placing Order...' : `Place Order — ₹${getTotal().toLocaleString()}`}
          </button>
        </form>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} × {item.quantity}
                </span>
                <span>₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{getTotal().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
