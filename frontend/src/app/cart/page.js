'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Gift,
  Sparkles,
  ShieldCheck,
  Truck,
  Heart,
} from 'lucide-react';
import useCartStore from '@/store/cartStore';
import { getImageUrl } from '@/lib/image';
import { getProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

const FREE_SHIPPING_THRESHOLD = 999;

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getTotal = useCartStore((s) => s.getTotal);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const giftWrap = useCartStore((s) => s.giftWrap);
  const setGiftWrap = useCartStore((s) => s.setGiftWrap);
  const giftNote = useCartStore((s) => s.giftNote);
  const setGiftNote = useCartStore((s) => s.setGiftNote);

  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    getProducts({ limit: 4 })
      .then((res) => {
        const itemIds = new Set(items.map((i) => i._id));
        setRecommendations((res.data.products || []).filter((p) => !itemIds.has(p._id)).slice(0, 3));
      })
      .catch(() => {});
  }, [items]);

  const subtotal = getSubtotal();
  const total = getTotal();
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-6 text-brand-600">
          <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          Your handmade collection is waiting for you
        </h1>
        <p className="text-sm text-charcoal-500 max-w-md mx-auto mt-3 mb-8">
          Every piece in our boutique is individually shaped by hand. Explore our everlasting flowers, hair clips, and garlands.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-charcoal-900 hover:bg-terracotta-600 text-white text-xs sm:text-sm font-semibold transition-colors shadow-soft"
        >
          <span>Explore Handmade Creations</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          Your Shopping Bag
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
          Review your chosen pieces before our artisans prepare your package
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Cart Items List (8 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Free Shipping Alert Bar */}
          <div className="bg-white rounded-3xl p-5 border border-brand-200/80 shadow-soft">
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal-800 mb-2">
              {amountToFreeShipping > 0 ? (
                <span>
                  Add <strong className="text-terracotta-600">₹{amountToFreeShipping.toLocaleString()}</strong> more to unlock{' '}
                  <strong className="text-sage-700">Free Artisan Shipping</strong>
                </span>
              ) : (
                <span className="text-sage-700 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sage-600" /> You qualified for Free Shipping across India!
                </span>
              )}
              <span className="text-charcoal-400 text-[11px]">{shippingProgress}%</span>
            </div>
            <div className="w-full h-2 bg-brand-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  amountToFreeShipping === 0 ? 'bg-sage-500' : 'bg-terracotta-500'
                }`}
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-brand-200/80 p-4 sm:p-5 shadow-soft flex gap-4 sm:gap-6 items-center"
              >
                <div className="w-20 sm:w-24 aspect-[4/5] rounded-2xl overflow-hidden relative shrink-0 bg-brand-100">
                  <Image
                    src={getImageUrl(item.images?.[0])}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-brand-700">
                      {item.category}
                    </span>
                    <Link
                      href={`/products/${item._id}`}
                      className="font-serif text-base sm:text-lg font-bold text-charcoal-900 hover:text-terracotta-600 line-clamp-1 transition-colors block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      ₹{item.price.toLocaleString()} each
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-brand-100">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-brand-300 rounded-2xl bg-white px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1 text-charcoal-500 hover:text-charcoal-900 disabled:opacity-30"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-charcoal-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-1 text-charcoal-500 hover:text-charcoal-900"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-serif text-base sm:text-lg font-bold text-charcoal-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-charcoal-400 hover:text-red-500 p-1.5 transition-colors"
                        title="Remove piece"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gift Wrap & Note Customization Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-brand-200/80 shadow-soft space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-charcoal-900">
                    Artisan Gift Packaging
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Handmade kraft box, botanical wax seal & calligraphy note (+₹49)
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-brand-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-brand-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta-500" />
              </label>
            </div>

            {giftWrap && (
              <div className="pt-2 animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Personalized Message for the Artisan to Handwrite:
                </label>
                <textarea
                  rows={2}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="e.g. Happy Birthday Di! May your year bloom with smiles..."
                  className="w-full p-3 rounded-2xl border border-brand-200 text-xs text-charcoal-800 bg-brand-50/50 focus:outline-none focus:ring-1 focus:ring-charcoal-900 resize-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Sticky Order Summary (5 Cols) */}
        <aside className="lg:col-span-5 bg-white rounded-3xl border border-brand-200/80 p-6 sm:p-7 shadow-soft sticky top-24 space-y-6">
          <h2 className="font-serif text-xl font-bold text-charcoal-900 pb-4 border-b border-brand-100">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between text-charcoal-600">
              <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} pieces)</span>
              <span className="font-semibold text-charcoal-900">₹{subtotal.toLocaleString()}</span>
            </div>

            {giftWrap && (
              <div className="flex justify-between text-charcoal-600">
                <span>Artisan Gift Box & Note</span>
                <span className="font-semibold text-charcoal-900">₹49</span>
              </div>
            )}

            <div className="flex justify-between text-charcoal-600">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-sage-700">
                {subtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : '₹50'}
              </span>
            </div>

            <div className="flex justify-between text-charcoal-600">
              <span>Estimated Taxes (GST)</span>
              <span className="text-charcoal-400">Included in prices</span>
            </div>

            <div className="pt-4 border-t border-brand-100 flex justify-between items-baseline">
              <span className="font-serif text-lg font-bold text-charcoal-900">Total</span>
              <span className="font-serif text-2xl font-bold text-charcoal-900">
                ₹{(total + (subtotal < FREE_SHIPPING_THRESHOLD && subtotal > 0 ? 50 : 0)).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/checkout"
              className="w-full py-4 px-6 rounded-2xl bg-charcoal-900 hover:bg-terracotta-600 text-white font-semibold text-sm transition-all duration-200 shadow-soft flex items-center justify-center gap-2 group"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/products"
              className="w-full py-3 px-6 rounded-2xl bg-brand-50 hover:bg-brand-100 text-charcoal-800 font-semibold text-xs transition-colors flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>

          <div className="pt-4 border-t border-brand-100 space-y-2 text-[11px] text-charcoal-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-sage-600 shrink-0" />
              <span>100% Secure Checkout & Cash on Delivery Available</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
              <span>Ships in protective cushioned boutique package</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Cross-Sell Recommendations ("You Might Also Like") */}
      {recommendations.length > 0 && (
        <section className="mt-20 pt-12 border-t border-brand-200/80">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
              Artisan Pairing
            </span>
            <h2 className="font-serif text-2xl font-bold text-charcoal-900 mt-1">
              You Might Also Cherish
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {recommendations.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
