'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Heart, ShoppingBag, Package } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useWishlistStore from '@/store/wishlistStore';

export default function BottomNavigation() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());
  const openDrawer = useCartStore((s) => s.openDrawer);
  const wishlistCount = useWishlistStore((s) => s.items?.length || 0);

  if (pathname?.startsWith('/admin')) return null;

  const isActive = (path) => pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-lg border-t border-brand-200/80 px-2 py-1 shadow-lg pb-[env(safe-area-inset-bottom,4px)]">
      <div className="flex items-center justify-around">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-colors ${
            isActive('/') ? 'text-terracotta-600 font-semibold' : 'text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        {/* Shop */}
        <Link
          href="/products"
          className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-colors ${
            isActive('/products') ? 'text-terracotta-600 font-semibold' : 'text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Shop</span>
        </Link>

        {/* Wishlist */}
        <Link
          href="/wishlist"
          className={`relative flex flex-col items-center py-1.5 px-3 rounded-2xl transition-colors ${
            isActive('/wishlist') ? 'text-terracotta-600 font-semibold' : 'text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          <Heart className="w-5 h-5" />
          {wishlistCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-terracotta-500 text-white text-[9px] font-bold flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Wishlist</span>
        </Link>

        {/* Cart Drawer Trigger */}
        <button
          type="button"
          onClick={openDrawer}
          className="relative flex flex-col items-center py-1.5 px-3 rounded-2xl text-charcoal-500 hover:text-charcoal-800 transition-colors"
        >
          <ShoppingBag className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-charcoal-900 text-white text-[9px] font-bold flex items-center justify-center">
              {itemCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Bag</span>
        </button>

        {/* Track */}
        <Link
          href="/track"
          className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-colors ${
            isActive('/track') ? 'text-terracotta-600 font-semibold' : 'text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Track</span>
        </Link>
      </div>
    </nav>
  );
}
