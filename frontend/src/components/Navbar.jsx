'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useCartStore from '@/store/cartStore';

export default function Navbar() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());

  const isActive = (path) =>
    pathname === path ? 'text-black font-semibold' : 'text-gray-600 hover:text-black';

  // Don't show main navbar on admin pages
  if (pathname?.startsWith('/admin')) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            WeaveStudio
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/" className={`text-sm ${isActive('/')}`}>
              Home
            </Link>
            <Link href="/track" className={`text-sm ${isActive('/track')}`}>
              Track Order
            </Link>
            <Link href="/cart" className="relative text-sm text-gray-600 hover:text-black">
              Cart
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
