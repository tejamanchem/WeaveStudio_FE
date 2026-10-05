'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Package,
  Sparkles,
  Check,
  Clock,
  Truck,
  Home,
  MessageCircle,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { trackOrder } from '@/lib/api';
import { getImageUrl } from '@/lib/image';
import LoadingSpinner from '@/components/LoadingSpinner';

const HANDMADE_TIMELINE_STEPS = [
  { key: 'PLACED', label: 'Order Placed', desc: 'Received in studio' },
  { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Artisan yarn assigned' },
  { key: 'CRAFTING', label: 'Crafting Your Order', desc: 'Handmade needlework in progress' },
  { key: 'PACKED', label: 'Packed with Care', desc: 'Gift boxed & sealed' },
  { key: 'SHIPPED', label: 'Shipped', desc: 'In transit with courier' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Cherished in your home' },
];

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
      const params = t === 'orderId' ? { orderId: q.trim() } : { phone: q.trim() };
      const res = await trackOrder(params);
      setOrders(res.data || []);
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

  // Map backend status ('PLACED', 'SHIPPED', 'DELIVERED') to visual timeline step index
  const getStepIndex = (status) => {
    if (status === 'DELIVERED') return 5;
    if (status === 'SHIPPED') return 4;
    // For PLACED, show step 2 (Crafting Your Order) to reinforce handmade experience!
    return 2;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-100 text-charcoal-800 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
          <span>Handmade Order Tracking</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          Track Your Creation
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-2">
          Enter your Order ID or phone number to see how your handmade items are coming along.
        </p>
      </div>

      {/* Track Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-200/80 shadow-soft mb-12">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-6 justify-center">
            <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-700 cursor-pointer">
              <input
                type="radio"
                value="orderId"
                checked={searchType === 'orderId'}
                onChange={(e) => setSearchType(e.target.value)}
                className="accent-charcoal-900"
              />
              <span>Order ID (e.g. WS-9281)</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-700 cursor-pointer">
              <input
                type="radio"
                value="phone"
                checked={searchType === 'phone'}
                onChange={(e) => setSearchType(e.target.value)}
                className="accent-charcoal-900"
              />
              <span>Phone Number</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  searchType === 'orderId'
                    ? 'Enter Order ID (e.g. ORD... or WS...)'
                    : 'Enter 10-digit mobile number'
                }
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-brand-200 bg-brand-50/40 text-xs sm:text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-charcoal-900"
              />
            </div>
            <button
              type="submit"
              className="py-3.5 px-8 rounded-2xl bg-charcoal-900 hover:bg-terracotta-600 text-white text-xs sm:text-sm font-semibold transition-colors shadow-soft"
            >
              Track Creation
            </button>
          </div>
        </form>
      </div>

      {/* Loading state */}
      {loading && <LoadingSpinner label="Consulting workshop records..." />}

      {/* Empty result */}
      {!loading && searched && orders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-brand-200/80 p-8 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4 text-charcoal-400">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-charcoal-900">
            No order found
          </h3>
          <p className="text-xs sm:text-sm text-charcoal-500 max-w-sm mx-auto mt-2 mb-6">
            We couldn't locate an order with "{query}". Please double-check your Order ID or contact our studio on WhatsApp.
          </p>
          <a
            href="https://wa.me/919999999999?text=Hi%20WeaveStudio,%20I%20need%20help%20tracking%20my%20order."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-sage-50 text-sage-800 border border-sage-200 text-xs font-semibold hover:bg-sage-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-sage-600" />
            <span>Contact Studio WhatsApp Support</span>
          </a>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-8">
        {orders.map((order) => {
          const stepIndex = getStepIndex(order.status);
          const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });

          return (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-brand-200/80 p-6 sm:p-8 shadow-soft space-y-8"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-100">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900">
                      {order.orderId}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-terracotta-50 text-terracotta-700 border border-terracotta-200">
                      {order.status === 'PLACED' ? 'Crafting in Atelier' : order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-charcoal-500 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    <span>Ordered on {formattedDate}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-charcoal-400 block">
                    Total Amount
                  </span>
                  <span className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900">
                    ₹{order.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Handcrafted Visual Timeline */}
              <div className="py-4">
                <div className="relative">
                  {/* Desktop horizontal timeline */}
                  <div className="hidden sm:grid grid-cols-6 gap-2 text-center">
                    {HANDMADE_TIMELINE_STEPS.map((step, idx) => {
                      const isComplete = idx <= stepIndex;
                      const isCurrent = idx === stepIndex;

                      return (
                        <div key={step.key} className="flex flex-col items-center relative">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-2 shadow-sm ${
                              isComplete
                                ? isCurrent
                                ? 'bg-terracotta-500 text-white ring-4 ring-terracotta-100'
                                : 'bg-charcoal-900 text-white'
                                : 'bg-brand-100 text-charcoal-400'
                            }`}
                          >
                            {isComplete ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                          </div>
                          <span
                            className={`text-xs font-bold leading-tight block ${
                              isCurrent ? 'text-terracotta-600' : 'text-charcoal-800'
                            }`}
                          >
                            {step.label}
                          </span>
                          <span className="text-[10px] text-charcoal-400 mt-0.5 line-clamp-1">
                            {step.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Connecting track line on desktop */}
                  <div className="hidden sm:block absolute top-5 left-10 right-10 h-0.5 bg-brand-200 -z-0" />

                  {/* Mobile vertical timeline */}
                  <div className="sm:hidden space-y-4">
                    {HANDMADE_TIMELINE_STEPS.map((step, idx) => {
                      const isComplete = idx <= stepIndex;
                      const isCurrent = idx === stepIndex;

                      return (
                        <div key={step.key} className="flex items-start gap-3">
                          <div
                            className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                              isComplete
                                ? isCurrent
                                ? 'bg-terracotta-500 text-white ring-2 ring-terracotta-100'
                                : 'bg-charcoal-900 text-white'
                                : 'bg-brand-100 text-charcoal-400'
                            }`}
                          >
                            {isComplete ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <div>
                            <span
                              className={`text-xs font-bold block ${
                                isCurrent ? 'text-terracotta-600' : 'text-charcoal-800'
                              }`}
                            >
                              {step.label}
                            </span>
                            <span className="text-[11px] text-charcoal-400">{step.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Items & Customer Details */}
              <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-brand-100 text-xs">
                {/* Items */}
                <div className="space-y-3">
                  <h4 className="font-bold uppercase tracking-wider text-charcoal-500">
                    Handmade Pieces in this Package
                  </h4>
                  <div className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl bg-brand-50/60 border border-brand-200/50"
                      >
                        <span className="font-semibold text-charcoal-900">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-bold text-charcoal-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="space-y-3">
                  <h4 className="font-bold uppercase tracking-wider text-charcoal-500">
                    Delivery & Customer
                  </h4>
                  <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200/50 space-y-2 text-charcoal-700">
                    <p className="font-bold text-charcoal-900">{order.customerName}</p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{order.phone}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{order.email}</span>
                    </p>
                    <p className="flex items-start gap-2 pt-1 border-t border-brand-200/60">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                      <span>{order.address}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Need Help footer */}
              <div className="pt-4 border-t border-brand-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-500">
                <span>Any questions regarding delivery or custom adjustments?</span>
                <a
                  href={`https://wa.me/919999999999?text=Hi%20WeaveStudio,%20I'm%20inquiring%20about%20Order%20${order.orderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sage-800 font-semibold hover:underline"
                >
                  <MessageCircle className="w-4 h-4 text-sage-600" />
                  <span>Chat with Artisan Support</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Locating your handmade package..." />}>
      <TrackOrderContent />
    </Suspense>
  );
}
