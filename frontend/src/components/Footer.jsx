'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Sparkles, ShieldCheck, Truck, RotateCcw, MessageCircle, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-[#261F1A] text-brand-100 border-t border-[#3A3029] mt-auto pb-16 md:pb-0">
      {/* Trust & Craft Value Propositions */}
      <div className="border-b border-[#3A3029] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-terracotta-500/20 text-terracotta-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">100% Handcrafted</h4>
                <p className="text-xs text-brand-300/80 mt-0.5">Every piece uniquely stitched with artisanal patience</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sage-500/20 text-sage-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Careful Courier Delivery</h4>
                <p className="text-xs text-brand-300/80 mt-0.5">Free delivery across India on orders over ₹999</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Everlasting Quality</h4>
                <p className="text-xs text-brand-300/80 mt-0.5">Premium grade wool & yarn that never wilts</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blush-500/20 text-blush-300 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Custom Artisan Orders</h4>
                <p className="text-xs text-brand-300/80 mt-0.5">Personalised colors & sets via direct WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-terracotta-500 text-white flex items-center justify-center font-serif text-lg font-bold">
                W
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                WeaveStudio
              </span>
            </Link>
            <p className="text-sm text-brand-200/80 max-w-sm leading-relaxed">
              WeaveStudio is an independent handmade boutique dedicated to the quiet elegance of slow craft.
              From everlasting crochet roses to delicate hair accessories, every piece carries human warmth and timeless charm.
            </p>
            <div className="pt-2 text-xs text-brand-300 flex items-center gap-2">
              <span className="font-handwriting text-lg text-terracotta-400">Made uniquely for you</span>
              <span>•</span>
              <span>Handcrafted in India</span>
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Artisan Collections</h4>
            <ul className="space-y-2 text-sm text-brand-300">
              <li>
                <Link href="/products?category=Flowers" className="hover:text-white transition-colors">
                  Crochet Roses & Bouquets
                </Link>
              </li>
              <li>
                <Link href="/products?category=Hair Accessories" className="hover:text-white transition-colors">
                  Handmade Hair Clips
                </Link>
              </li>
              <li>
                <Link href="/products?category=Garlands" className="hover:text-white transition-colors">
                  Traditional Pooja Garlands
                </Link>
              </li>
              <li>
                <Link href="/products?category=Keychains" className="hover:text-white transition-colors">
                  Handmade Keychains
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  All Handmade Drops
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Experience */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Customer Care</h4>
            <ul className="space-y-2 text-sm text-brand-300">
              <li>
                <Link href="/track" className="hover:text-white transition-colors">
                  Track Your Package
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white transition-colors">
                  Saved Pieces (Wishlist)
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Your Craft Bag
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Our Artisans
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/919999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors text-terracotta-300"
                >
                  Request Custom Colors
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Studio */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">The Studio</h4>
            <div className="space-y-2 text-sm text-brand-300">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-terracotta-400 shrink-0" />
                <a href="mailto:contact@weavestudio.com" className="hover:text-white">
                  contact@weavestudio.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-sage-400 shrink-0" />
                <a
                  href="https://wa.me/919999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  WhatsApp: +91 99999 99999
                </a>
              </p>
              <p className="text-xs text-brand-400 pt-2 leading-relaxed">
                Open Monday – Saturday for custom order consultations and bridal inquiries.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-12 pt-8 border-t border-[#3A3029] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-400">
          <p>© {new Date().getFullYear()} WeaveStudio. Handcrafted with devotion.</p>
          <div className="flex items-center gap-1 text-brand-300">
            <span>Slowly woven with</span>
            <Heart className="w-3.5 h-3.5 text-terracotta-500 fill-terracotta-500 inline" />
            <span>for cherished memories</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
