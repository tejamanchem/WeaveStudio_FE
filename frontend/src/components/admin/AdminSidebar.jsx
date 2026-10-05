'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  BellRing,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import useAdminStore from '@/store/adminStore';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/notifications', label: 'Notifications', icon: BellRing },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarCollapsed = useAdminStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAdminStore((s) => s.toggleSidebar);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    router.push('/admin/login');
  };

  const adminEmail =
    (typeof window !== 'undefined' && localStorage.getItem('admin_email')) ||
    'admin@weavestudio.com';

  const isActive = (href) => {
    if (href === '/admin/dashboard') return pathname === '/admin/dashboard';
    return pathname?.startsWith(href);
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Top Brand & Links */}
      <div className="space-y-6">
        {/* Brand header */}
        <div className="flex items-center justify-between pb-4 border-b border-brand-200/80">
          <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center font-serif text-lg font-bold shadow-soft shrink-0">
              W
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <span className="font-serif text-base font-bold text-charcoal-900 truncate block">
                  WeaveStudio
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-600 block">
                  Atelier Control
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-xl text-charcoal-400 hover:text-charcoal-900 hover:bg-brand-100 transition-colors"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                  active
                    ? 'bg-charcoal-900 text-white shadow-soft'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-white/80'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    active ? 'text-terracotta-400' : 'text-charcoal-400 group-hover:text-charcoal-800'
                  }`}
                />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="pt-6 border-t border-brand-200/80 space-y-3">
        {/* View Boutique store link */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-medium text-charcoal-600 hover:text-terracotta-600 hover:bg-white/70 transition-colors"
          title={sidebarCollapsed ? 'View Storefront' : undefined}
        >
          <ExternalLink className="w-4 h-4 text-brand-500 shrink-0" />
          {!sidebarCollapsed && <span className="truncate">View Storefront</span>}
        </Link>

        {/* Admin profile & logout */}
        <div
          className={`flex items-center ${
            sidebarCollapsed ? 'justify-center' : 'justify-between'
          } p-2 rounded-2xl bg-white/70 border border-brand-200/70`}
        >
          {!sidebarCollapsed && (
            <div className="min-w-0 pr-2">
              <span className="block text-xs font-bold text-charcoal-900 truncate">Admin Atelier</span>
              <span className="block text-[10px] text-charcoal-400 truncate">{adminEmail}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-[#FAF8F5] border-r border-brand-200/80 p-5 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-[#FAF8F5] shadow-2xl p-5 z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
