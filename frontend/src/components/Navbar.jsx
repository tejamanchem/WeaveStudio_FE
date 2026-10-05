'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  Sparkles,
  Truck,
  Compass,
  Package,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useWishlistStore from '@/store/wishlistStore';
import SearchOverlay from '@/components/SearchOverlay';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const itemCount = useCartStore((s) => s.getItemCount());
  const openDrawer = useCartStore((s) => s.openDrawer);
  const wishlistCount = useWishlistStore((s) => s.items?.length || 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (pathname?.startsWith('/admin')) return null;

  const isActive = (path) =>
    pathname === path
      ? 'text-terracotta-600 font-semibold'
      : 'text-charcoal-700 hover:text-terracotta-600 font-medium';

  return (
    <>
      {/* Top Boutique Announcement Bar */}
      <div className="bg-[#2D241E] text-brand-100 text-[11px] sm:text-xs py-2 px-4 border-b border-[#3D322A]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sage-400 animate-pulse" />
            <span className="tracking-wide">
              Every creation is <strong>100% hand-crocheted</strong> with premium yarn
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-brand-300">
            <span>Free Shipping over ₹999</span>
            <span>•</span>
            <Link href="/track" className="hover:text-white transition-colors">
              Track Order
            </Link>
            <span>•</span>
            <a
              href="https://wa.me/919999999999?text=Hi%20WeaveStudio,%20I'd%20like%20to%20inquire%20about%20a%20custom%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1 text-terracotta-300"
            >
              Custom Requests
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FAF8F5]/95 backdrop-blur-md shadow-soft border-b border-brand-200/80 py-2.5'
            : 'bg-[#FAF8F5] border-b border-brand-200/50 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-charcoal-700 hover:bg-brand-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full bg-terracotta-500 text-white flex items-center justify-center font-serif text-lg font-bold shadow-soft group-hover:bg-terracotta-600 transition-colors">
                W
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900 group-hover:text-terracotta-600 transition-colors">
                  WeaveStudio
                </span>
                <span className="text-[9px] uppercase tracking-widest text-brand-600 font-semibold -mt-1 hidden sm:block">
                  Handmade Boutique
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-sm">
              <Link href="/" className={isActive('/')}>
                Home
              </Link>
              <Link href="/products" className={isActive('/products')}>
                Shop All
              </Link>
              <Link
                href="/products?category=Flowers"
                className={isActive('/products?category=Flowers')}
              >
                Flowers & Roses
              </Link>
              <Link
                href="/products?category=Hair Accessories"
                className={isActive('/products?category=Hair Accessories')}
              >
                Hair Clips
              </Link>
              <Link
                href="/products?category=Garlands"
                className={isActive('/products?category=Garlands')}
              >
                Pooja Garlands
              </Link>
              <Link href="/about" className={isActive('/about')}>
                Artisan Story
              </Link>
              <Link href="/track" className={isActive('/track')}>
                Track Order
              </Link>
            </nav>

            {/* Actions: Search, Wishlist, Cart */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Search Trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-charcoal-700 hover:bg-brand-100 hover:text-charcoal-900 transition-all text-sm group"
                aria-label="Search products"
              >
                <Search className="w-4 h-4 text-brand-600 group-hover:text-charcoal-900" />
                <span className="hidden xl:inline text-xs text-charcoal-400">Search craft...</span>
                <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] bg-brand-200/70 text-charcoal-600 rounded">
                  /
                </kbd>
              </button>

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="relative p-2 rounded-full text-charcoal-700 hover:bg-brand-100 hover:text-charcoal-900 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 text-charcoal-700" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-terracotta-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openDrawer}
                className="relative flex items-center gap-2 py-2 px-3 sm:px-4 rounded-full bg-charcoal-900 text-white hover:bg-terracotta-600 transition-all duration-200 shadow-soft"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-semibold">Bag</span>
                {itemCount > 0 && (
                  <span className="bg-terracotta-500 text-white text-xs font-bold px-1.5 py-0.2 rounded-full">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-[#FAF8F5] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-brand-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-terracotta-500 text-white flex items-center justify-center font-serif font-bold">
                    W
                  </div>
                  <span className="font-serif text-lg font-bold text-charcoal-900">WeaveStudio</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-charcoal-400 hover:text-charcoal-900 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Quick Search Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="w-full mt-4 flex items-center gap-3 p-3 rounded-2xl bg-white border border-brand-200 text-charcoal-400 text-sm shadow-sm"
              >
                <Search className="w-4 h-4 text-brand-600" />
                <span>Search handmade crafts...</span>
              </button>

              <div className="mt-6 space-y-1">
                <Link
                  href="/"
                  className="flex items-center justify-between p-3 rounded-2xl text-charcoal-800 hover:bg-brand-100 font-medium text-sm"
                >
                  <span>Home</span>
                  <Sparkles className="w-4 h-4 text-brand-400" />
                </Link>
                <Link
                  href="/products"
                  className="flex items-center justify-between p-3 rounded-2xl text-charcoal-800 hover:bg-brand-100 font-medium text-sm"
                >
                  <span>Shop All Collection</span>
                  <Compass className="w-4 h-4 text-brand-400" />
                </Link>
                <Link
                  href="/products?category=Flowers"
                  className="flex items-center justify-between p-3 rounded-2xl text-charcoal-800 hover:bg-brand-100 font-medium text-sm"
                >
                  <span>Handmade Flowers & Roses</span>
                  <span className="text-xs text-brand-500">🌸</span>
                </Link>
                <Link
                  href="/products?category=Hair Accessories"
                  className="flex items-center justify-between p-3 rounded-2xl text-charcoal-800 hover:bg-brand-100 font-medium text-sm"
                >
                  <span>Crochet Hair Clips</span>
                  <span className="text-xs text-brand-500">✨</span>
                </Link>
                <Link
                  href="/products?category=Garlands"
                  className="flex items-center justify-between p-3 rounded-2xl text-charcoal-800 hover:bg-brand-100 font-medium text-sm"
                >
                  <span>Everlasting Pooja Garlands</span>
                  <span className="text-xs text-brand-500">🌿</span>
                </Link>
                <Link
                  href="/about"
                  className="flex items-center justify-between p-3 rounded-2xl text-charcoal-800 hover:bg-brand-100 font-medium text-sm"
                >
                  <span>Our Artisan Story</span>
                  <Sparkles className="w-4 h-4 text-terracotta-500" />
                </Link>
                <Link
                  href="/track"
                  className="flex items-center justify-between p-3 rounded-2xl text-charcoal-800 hover:bg-brand-100 font-medium text-sm"
                >
                  <span>Track Your Order</span>
                  <Package className="w-4 h-4 text-brand-400" />
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center justify-between p-3 rounded-2xl text-charcoal-800 hover:bg-brand-100 font-medium text-sm"
                >
                  <span>My Wishlist ({wishlistCount})</span>
                  <Heart className="w-4 h-4 text-terracotta-500" />
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-brand-200 space-y-3">
              <a
                href="https://wa.me/919999999999?text=Hi%20WeaveStudio,%20I'm%20looking%20for%20custom%20handmade%20crochet%20items"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-sage-50 text-sage-800 border border-sage-200 text-xs font-semibold hover:bg-sage-100 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-sage-600" />
                <span>Chat with Artisan for Custom Designs</span>
              </a>
              <p className="text-[11px] text-charcoal-400 text-center">
                Handmade. Woven with care. Made uniquely for you.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Overlay Modal */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
