'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  // Don't protect the login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setReady(true);
      return;
    }
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
    } else {
      setReady(true);
    }
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) return children;
  if (!ready) return null;

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    router.push('/admin/login');
  };

  const navLink = (href, label) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`px-3 py-2 rounded-lg text-sm ${
          active ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="font-bold text-lg">
              WS Admin
            </Link>
            <div className="flex gap-1">
              {navLink('/admin/dashboard', 'Dashboard')}
              {navLink('/admin/orders', 'Orders')}
              {navLink('/admin/products', 'Products')}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-black">
              View Store
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
}
