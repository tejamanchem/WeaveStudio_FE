'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  Lock,
  Gift,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import useCartStore from '@/store/cartStore';
import { placeOrder } from '@/lib/api';
import { getImageUrl } from '@/lib/image';
import toast from 'react-hot-toast';

const FREE_SHIPPING_THRESHOLD = 999;

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const giftWrap = useCartStore((s) => s.giftWrap);
  const giftNote = useCartStore((s) => s.giftNote);

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    notes: '',
  });

  const subtotal = getSubtotal();
  const deliveryFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 50;
  const grandTotal = getTotal() + deliveryFee;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Your craft bag is empty');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      }));

      // Combine full address
      const fullAddress = `${form.address}, ${form.city || ''} - ${form.pincode || ''}${
        form.notes ? ` (Note: ${form.notes})` : ''
      }${giftWrap ? ` [Gift Packaging: ${giftNote || 'Yes'}]` : ''}`.trim();

      const res = await placeOrder({
        customerName: form.customerName,
        phone: form.phone,
        email: form.email,
        address: fullAddress,
        items: orderItems,
      });

      const orderId = res.data.order.orderId;
      clearCart();
      toast.success(`Order placed successfully! ID: ${orderId}`);
      router.push(`/track?orderId=${orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-6 text-brand-600">
          <ShoppingBag className="w-9 h-9" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">
          Nothing to checkout
        </h1>
        <p className="text-sm text-charcoal-500 mt-2 mb-8">
          Your cart is currently empty. Discover our handmade collections to begin.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-charcoal-900 text-white text-xs font-semibold hover:bg-terracotta-600 transition-colors shadow-soft"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Checkout Progress Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-charcoal-400 mb-2">
          <Link href="/cart" className="hover:text-charcoal-800">
            Cart
          </Link>
          <span>→</span>
          <span className="text-charcoal-900 font-bold">Delivery & Payment</span>
          <span>→</span>
          <span className="text-charcoal-400">Handmade Preparation</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          Complete Your Order
        </h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Form Fields (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Customer & Delivery Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-200/80 shadow-soft space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-brand-100">
                <div className="w-8 h-8 rounded-full bg-terracotta-500 text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-charcoal-900">
                    Delivery Address
                  </h2>
                  <p className="text-xs text-charcoal-500">
                    Where our courier should deliver your parcel
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    value={form.customerName}
                    onChange={handleChange}
                    placeholder="e.g. Radhika Sharma"
                    className="w-full p-3 rounded-2xl border border-brand-200 bg-brand-50/30 text-xs sm:text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                    Phone Number (for Courier SMS) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full p-3 rounded-2xl border border-brand-200 bg-brand-50/30 text-xs sm:text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="radhika@example.com"
                    className="w-full p-3 rounded-2xl border border-brand-200 bg-brand-50/30 text-xs sm:text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                    House / Flat No., Street, Landmark *
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Flat 302, Rosewood Heights, Near MG Road"
                    className="w-full p-3 rounded-2xl border border-brand-200 bg-brand-50/30 text-xs sm:text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-charcoal-900 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={form.city}
                    onChange={handleChange}
                    placeholder="e.g. Hyderabad"
                    className="w-full p-3 rounded-2xl border border-brand-200 bg-brand-50/30 text-xs sm:text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 500001"
                    className="w-full p-3 rounded-2xl border border-brand-200 bg-brand-50/30 text-xs sm:text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-charcoal-900"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-200/80 shadow-soft space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-brand-100">
                <div className="w-8 h-8 rounded-full bg-terracotta-500 text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-charcoal-900">
                    Payment Selection
                  </h2>
                  <p className="text-xs text-charcoal-500">
                    Choose how you would like to complete your purchase
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-charcoal-900 bg-brand-50/70 shadow-sm'
                      : 'border-brand-200 hover:bg-brand-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-charcoal-900 h-4 w-4"
                    />
                    <div>
                      <span className="block text-xs sm:text-sm font-bold text-charcoal-900">
                        Cash on Delivery / UPI on Delivery
                      </span>
                      <span className="text-[11px] text-charcoal-500">
                        Pay peacefully when the courier brings your handmade parcel
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sage-700 bg-sage-50 px-2.5 py-1 rounded-full">
                    Zero Extra Fee
                  </span>
                </label>

                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'online'
                      ? 'border-charcoal-900 bg-brand-50/70 shadow-sm'
                      : 'border-brand-200 hover:bg-brand-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="accent-charcoal-900 h-4 w-4"
                    />
                    <div>
                      <span className="block text-xs sm:text-sm font-bold text-charcoal-900">
                        Direct UPI / Artisan Bank Transfer
                      </span>
                      <span className="text-[11px] text-charcoal-500">
                        Instant QR code & confirmation after placing order
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-700 bg-terracotta-50 px-2.5 py-1 rounded-full">
                    Fast Track
                  </span>
                </label>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-8 rounded-2xl bg-charcoal-900 hover:bg-terracotta-600 text-white font-semibold text-sm sm:text-base transition-all duration-200 shadow-soft flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>
                {loading
                  ? 'Confirming with Studio...'
                  : `Place Order — ₹${grandTotal.toLocaleString()}`}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Right: Order Summary Preview (5 Cols) */}
        <aside className="lg:col-span-5 bg-white rounded-3xl border border-brand-200/80 p-6 sm:p-7 shadow-soft sticky top-24 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-brand-100">
            <h2 className="font-serif text-lg font-bold text-charcoal-900">
              Bag Summary ({items.length})
            </h2>
            <Link href="/cart" className="text-xs text-terracotta-600 hover:underline font-semibold">
              Edit Bag
            </Link>
          </div>

          {/* Items preview list */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item._id} className="flex gap-3 items-center">
                <div className="w-14 h-16 rounded-xl overflow-hidden relative shrink-0 bg-brand-100">
                  <Image
                    src={getImageUrl(item.images?.[0])}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-charcoal-900 truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-charcoal-400">
                    Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                  </p>
                </div>
                <span className="text-xs font-bold text-charcoal-900">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing breakdown */}
          <div className="space-y-2 pt-4 border-t border-brand-100 text-xs">
            <div className="flex justify-between text-charcoal-600">
              <span>Subtotal</span>
              <span className="font-semibold text-charcoal-900">₹{subtotal.toLocaleString()}</span>
            </div>

            {giftWrap && (
              <div className="flex justify-between text-charcoal-600">
                <span className="flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-terracotta-500" /> Artisan Gift Box & Note
                </span>
                <span className="font-semibold text-charcoal-900">₹49</span>
              </div>
            )}

            <div className="flex justify-between text-charcoal-600">
              <span>Shipping Fee</span>
              <span className="font-semibold text-sage-700">
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>

            <div className="flex justify-between text-charcoal-600">
              <span>Taxes (GST)</span>
              <span className="text-charcoal-400">Included</span>
            </div>

            <div className="pt-3 border-t border-brand-100 flex justify-between items-baseline text-sm sm:text-base">
              <span className="font-serif font-bold text-charcoal-900">Total Due</span>
              <span className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900">
                ₹{grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Security & artisan badge */}
          <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200/60 space-y-2 text-[11px] text-charcoal-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0" />
              <span>We never share your contact information.</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-terracotta-500 shrink-0" />
              <span>You will receive tracking updates as each piece is prepared.</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
