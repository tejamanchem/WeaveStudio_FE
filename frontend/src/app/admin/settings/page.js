'use client';

import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sparkles,
  Store,
  Truck,
  Bell,
  ShieldCheck,
  Phone,
  Mail,
  Clock,
  Save,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import useAdminStore from '@/store/adminStore';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { settings, updateSettings } = useAdminStore();

  const [form, setForm] = useState({
    storeName: settings?.storeName || 'WeaveStudio Atelier',
    tagline: settings?.tagline || 'Handmade. Woven with care. Made uniquely for you.',
    adminEmail: settings?.adminEmail || 'admin@weavestudio.com',
    whatsappPhone: settings?.whatsappPhone || '+91 99999 99999',
    supportEmail: settings?.supportEmail || 'contact@weavestudio.com',
    freeShippingThreshold: settings?.freeShippingThreshold || 999,
    standardDeliveryFee: settings?.standardDeliveryFee || 50,
    craftingLeadTimeDays: settings?.craftingLeadTimeDays || 3,
    autoSendConfirmation: settings?.autoSendConfirmation ?? true,
    autoSendTracking: settings?.autoSendTracking ?? true,
    studioAddress: 'Studio 14, Crafts Guild Lane, Jubilee Hills, Hyderabad - 500033',
    craftStory: 'WeaveStudio was born from a deep love for tactile yarn craft and slow living. Every petal, hairpin, and decorative heirloom is hand-crocheted by artisan women across India.',
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      updateSettings({
        storeName: form.storeName,
        tagline: form.tagline,
        adminEmail: form.adminEmail,
        whatsappPhone: form.whatsappPhone,
        supportEmail: form.supportEmail,
        freeShippingThreshold: Number(form.freeShippingThreshold) || 999,
        standardDeliveryFee: Number(form.standardDeliveryFee) || 50,
        craftingLeadTimeDays: Number(form.craftingLeadTimeDays) || 3,
        autoSendConfirmation: form.autoSendConfirmation,
        autoSendTracking: form.autoSendTracking,
      });
      toast.success('Atelier configuration saved successfully!');
    } catch {
      toast.error('Failed to update settings');
    } finally {
      setTimeout(() => setSaving(false), 300);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Storefront & Atelier Control</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight">
            Atelier Settings
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Configure brand identity, shipping thresholds, artisan crafting lead times, and dispatch notifications.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-charcoal-900 hover:bg-terracotta-600 text-white px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all shadow-soft self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Brand & Atelier Identity */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-brand-200 shadow-soft space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-100">
            <div className="w-8 h-8 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-charcoal-900">
                Atelier Brand Identity
              </h2>
              <p className="text-[11px] text-charcoal-400">
                Visible to customers across invoices, tracking pages, and email letters.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Atelier Brand Name
              </label>
              <input
                type="text"
                name="storeName"
                value={form.storeName}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Brand Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Artisan Story / Manifesto
              </label>
              <textarea
                name="craftStory"
                rows={3}
                value={form.craftStory}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900 resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Concierge Channels */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-brand-200 shadow-soft space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-100">
            <div className="w-8 h-8 rounded-xl bg-sage-50 text-sage-700 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-charcoal-900">
                Contact & Concierge Channels
              </h2>
              <p className="text-[11px] text-charcoal-400">
                Used for the floating WhatsApp button, support links, and order inquiries.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Support Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="email"
                  name="supportEmail"
                  value={form.supportEmail}
                  onChange={handleChange}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                WhatsApp Concierge Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="text"
                  name="whatsappPhone"
                  value={form.whatsappPhone}
                  onChange={handleChange}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Physical Workshop / Atelier Address
              </label>
              <input
                type="text"
                name="studioAddress"
                value={form.studioAddress}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Shipping & Slow Craft Lead Times */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-brand-200 shadow-soft space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-100">
            <div className="w-8 h-8 rounded-xl bg-brand-100 text-charcoal-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-charcoal-900">
                Shipping & Slow Craft Logistics
              </h2>
              <p className="text-[11px] text-charcoal-400">
                Delivery rate calculations and handcraft preparation lead estimates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Free Delivery Threshold (₹)
              </label>
              <input
                type="number"
                name="freeShippingThreshold"
                value={form.freeShippingThreshold}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900 font-semibold"
              />
              <span className="text-[10px] text-charcoal-400 mt-1 block">
                Orders above this amount receive complimentary shipping
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Standard Shipping Fee (₹)
              </label>
              <input
                type="number"
                name="standardDeliveryFee"
                value={form.standardDeliveryFee}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900 font-semibold"
              />
              <span className="text-[10px] text-charcoal-400 mt-1 block">
                Applied to cart orders below free shipping threshold
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Handcraft Lead Time (Days)
              </label>
              <input
                type="number"
                name="craftingLeadTimeDays"
                value={form.craftingLeadTimeDays}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900 font-semibold"
              />
              <span className="text-[10px] text-charcoal-400 mt-1 block">
                Displayed in product cards and checkout delivery timeline
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Automated Communications */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-brand-200 shadow-soft space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-charcoal-900">
                Automated Milestone Triggers
              </h2>
              <p className="text-[11px] text-charcoal-400">
                Trigger patron updates automatically upon order status updates.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-brand-200 bg-brand-50/40 hover:bg-brand-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                name="autoSendConfirmation"
                checked={form.autoSendConfirmation}
                onChange={handleChange}
                className="mt-0.5 rounded text-charcoal-900 focus:ring-terracotta-400 w-4 h-4 accent-charcoal-900"
              />
              <div>
                <span className="text-xs font-semibold text-charcoal-900 block">
                  Automatic Order Confirmation Dispatch
                </span>
                <span className="text-[11px] text-charcoal-500">
                  Instantly dispatch confirmation letter when a patron completes checkout.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-brand-200 bg-brand-50/40 hover:bg-brand-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                name="autoSendTracking"
                checked={form.autoSendTracking}
                onChange={handleChange}
                className="mt-0.5 rounded text-charcoal-900 focus:ring-terracotta-400 w-4 h-4 accent-charcoal-900"
              />
              <div>
                <span className="text-xs font-semibold text-charcoal-900 block">
                  Carrier Dispatch & Live Tracking Alerts
                </span>
                <span className="text-[11px] text-charcoal-500">
                  Notify patrons with tracking URLs when order status changes to "Shipped".
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 5: Admin Account & Security */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-brand-200 shadow-soft space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-100">
            <div className="w-8 h-8 rounded-xl bg-brand-100 text-charcoal-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-charcoal-900">
                Admin Account & Credentials
              </h2>
              <p className="text-[11px] text-charcoal-400">
                Primary credentials for accessing this WeaveStudio Atelier control console.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Admin Login Email
              </label>
              <input
                type="email"
                name="adminEmail"
                value={form.adminEmail}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Atelier Role & Permission
              </label>
              <input
                type="text"
                disabled
                value="Atelier Founder & Master Artisan (Super Admin)"
                className="w-full text-xs px-3.5 py-2.5 bg-brand-100 border border-brand-200 rounded-2xl text-charcoal-500 font-medium cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-charcoal-900 hover:bg-terracotta-600 text-white px-6 py-3 rounded-2xl text-xs font-semibold transition-all shadow-soft disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving changes...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
