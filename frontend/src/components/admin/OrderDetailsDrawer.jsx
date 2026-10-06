'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  MessageCircle,
  BellRing,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { getImageUrl } from '@/lib/image';

const TIMELINE_STEPS = [
  { key: 'PLACED', label: 'Order Placed', desc: 'Received in studio' },
  { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Yarn allocated' },
  { key: 'CRAFTING', label: 'Crafting in Atelier', desc: 'Needlework underway' },
  { key: 'PACKED', label: 'Packed with Care', desc: 'Gift boxed & sealed' },
  { key: 'SHIPPED', label: 'Dispatched', desc: 'In courier transit' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'In patron home' },
];

export default function OrderDetailsDrawer({ order, isOpen, onClose, onStatusUpdate, onDeleteOrder }) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const getStepIndex = (status) => {
    if (status === 'DELIVERED') return 5;
    if (status === 'SHIPPED') return 4;
    return 2; // Crafting in atelier for PLACED
  };

  const currentStep = getStepIndex(order.status);

  const handleNotifyCustomer = () => {
    onClose();
    router.push(
      `/admin/notifications?orderId=${encodeURIComponent(
        order.orderId
      )}&customerEmail=${encodeURIComponent(
        order.email
      )}&customerName=${encodeURIComponent(order.customerName)}`
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-xl bg-[#FAF8F5] shadow-2xl flex flex-col border-l border-brand-200 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-brand-200/80 bg-white/70 backdrop-blur-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-terracotta-600 block">
                Order Management
              </span>
              <div className="flex items-center gap-3 mt-1">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900">
                  {order.orderId}
                </h2>
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                    order.status === 'PLACED'
                      ? 'bg-amber-100 text-amber-800'
                      : order.status === 'SHIPPED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-sage-100 text-sage-800'
                  }`}
                >
                  {order.status === 'PLACED' ? 'CRAFTING' : order.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onDeleteOrder && (
                <button
                  onClick={() => onDeleteOrder(order)}
                  className="p-2 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete Order & Restore Stock"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-charcoal-400 hover:text-charcoal-900 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
            {/* Status Workflow Selector */}
            <div className="p-4 rounded-2xl bg-white border border-brand-200 shadow-sm space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-600">
                Update Order Lifecycle Status
              </label>
              <div className="flex gap-2">
                {['PLACED', 'SHIPPED', 'DELIVERED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => onStatusUpdate(order._id, st)}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-colors ${
                      order.status === st
                        ? 'bg-charcoal-900 text-white shadow-sm'
                        : 'bg-brand-50 text-charcoal-700 hover:bg-brand-100'
                    }`}
                  >
                    {st === 'PLACED' ? 'CRAFTING' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Handcrafted Visual Timeline */}
            <div className="p-4 rounded-2xl bg-white border border-brand-200 shadow-sm space-y-3">
              <h3 className="font-serif text-sm font-bold text-charcoal-900">
                Handcrafted Lifecycle Track
              </h3>
              <div className="space-y-3 pt-1">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={step.key} className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isDone
                            ? isCurrent
                              ? 'bg-terracotta-500 text-white ring-4 ring-terracotta-100'
                              : 'bg-charcoal-900 text-white'
                            : 'bg-brand-100 text-charcoal-400'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div>
                        <span
                          className={`font-bold block ${
                            isCurrent ? 'text-terracotta-600' : 'text-charcoal-900'
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="text-[11px] text-charcoal-500">{step.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="p-4 rounded-2xl bg-white border border-brand-200 shadow-sm space-y-3">
              <h3 className="font-serif text-sm font-bold text-charcoal-900">
                Pieces in this Order ({order.items?.length})
              </h3>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-brand-50/50 border border-brand-100"
                  >
                    <div>
                      <span className="font-semibold text-charcoal-900 block">{item.name}</span>
                      <span className="text-[11px] text-charcoal-500">
                        Qty: {item.quantity} × ₹{item.price?.toLocaleString()}
                      </span>
                    </div>
                    <span className="font-bold text-charcoal-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-3 border-t border-brand-100 font-bold text-sm text-charcoal-900">
                  <span>Total Amount</span>
                  <span className="font-serif text-base">₹{order.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="p-4 rounded-2xl bg-white border border-brand-200 shadow-sm space-y-2.5">
              <h3 className="font-serif text-sm font-bold text-charcoal-900">Customer & Delivery</h3>
              <div className="space-y-1.5 text-charcoal-700">
                <p className="font-bold text-charcoal-900">{order.customerName}</p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>{order.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>{order.email}</span>
                </p>
                <p className="flex items-start gap-2 pt-1 border-t border-brand-100">
                  <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{order.address}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-brand-200/80 bg-white/80 backdrop-blur-sm space-y-2">
            <button
              onClick={handleNotifyCustomer}
              className="w-full py-3 px-4 rounded-2xl bg-charcoal-900 hover:bg-terracotta-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-soft"
            >
              <BellRing className="w-4 h-4" />
              <span>Compose Email / SMS Notification</span>
            </button>

            <a
              href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(
                order.customerName
              )},%20this%20is%20WeaveStudio%20regarding%20Order%20${order.orderId}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-2xl bg-sage-50 hover:bg-sage-100 text-sage-800 border border-sage-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-sage-600" />
              <span>Message Patron on WhatsApp</span>
            </a>

            {onDeleteOrder && (
              <button
                onClick={() => onDeleteOrder(order)}
                className="w-full py-2.5 px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Delete Order Record & Restore Stock</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
