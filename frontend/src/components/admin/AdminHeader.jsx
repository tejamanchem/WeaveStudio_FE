'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  BellRing,
  Plus,
  ExternalLink,
  ShoppingCart,
  Package,
  MessageSquare,
  Store,
} from 'lucide-react';
import useAdminStore from '@/store/adminStore';
import AdminGlobalSearch from './AdminGlobalSearch';

export default function AdminHeader({ setMobileOpen }) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const notifications = useAdminStore((s) => s.notifications);

  const unreadCount = notifications.length;

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-brand-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile menu toggle & Global Search bar */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl text-charcoal-600 hover:bg-brand-100 transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Trigger Input */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white border border-brand-200/90 hover:border-brand-300 text-xs text-charcoal-400 shadow-sm transition-all group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-brand-600 group-hover:text-charcoal-900" />
              <span className="font-medium">Search orders, customers, or products...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-brand-100 text-charcoal-600 rounded font-semibold">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Quick actions, notifications, store link */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action Dropdown */}
          <div className="relative">
            <button
              onClick={() => setQuickMenuOpen(!quickMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-charcoal-900 hover:bg-terracotta-600 text-white text-xs font-semibold shadow-soft transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quick Action</span>
            </button>

            {quickMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setQuickMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-brand-200 shadow-elevated p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setQuickMenuOpen(false);
                      router.push('/admin/products?action=new');
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-brand-50 text-charcoal-800 font-medium text-left transition-colors"
                  >
                    <Package className="w-4 h-4 text-amber-600" />
                    <span>Create New Product</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickMenuOpen(false);
                      router.push('/admin/orders?new=manual');
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-brand-50 text-charcoal-800 font-medium text-left transition-colors"
                  >
                    <Store className="w-4 h-4 text-terracotta-500" />
                    <span>Record Offline Order</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickMenuOpen(false);
                      router.push('/admin/notifications?compose=true');
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-brand-50 text-charcoal-800 font-medium text-left transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Send Order Notification</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickMenuOpen(false);
                      router.push('/admin/orders');
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-brand-50 text-charcoal-800 font-medium text-left transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4 text-sage-600" />
                    <span>View All Orders</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Notifications Bell */}
          <Link
            href="/admin/notifications"
            className="relative p-2 rounded-2xl text-charcoal-600 hover:text-charcoal-900 hover:bg-white transition-colors"
            title="Notification Center"
          >
            <BellRing className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-terracotta-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border border-brand-200 text-charcoal-700 hover:text-terracotta-600 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
        </div>
      </header>

      {/* Global Search Modal */}
      <AdminGlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
