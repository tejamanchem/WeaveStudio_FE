'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, Trash2, ArrowRight, Gift, ShoppingBag, Sparkles } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import { getImageUrl } from '@/lib/image';

const FREE_SHIPPING_THRESHOLD = 999;

export default function CartDrawer() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const isDrawerOpen = useCartStore((s) => s.isDrawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getTotal = useCartStore((s) => s.getTotal);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const giftWrap = useCartStore((s) => s.giftWrap);
  const setGiftWrap = useCartStore((s) => s.setGiftWrap);

  const subtotal = getSubtotal();
  const total = getTotal();
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    closeDrawer();
    router.push('/checkout');
  };

  const handleViewCart = () => {
    closeDrawer();
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col border-l border-brand-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-brand-200/80 bg-white/70 backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-charcoal-900">
                <ShoppingBag className="w-4 h-4 text-terracotta-600" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-charcoal-900">Your Craft Bag</h2>
                <p className="text-xs text-charcoal-500">
                  {items.length === 1 ? '1 unique piece' : `${items.length} unique pieces`}
                </p>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="p-2 text-charcoal-400 hover:text-charcoal-900 hover:bg-brand-100 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-brand-100/70 px-5 py-3 border-b border-brand-200/50">
            <div className="flex items-center justify-between text-xs font-medium text-charcoal-800 mb-1.5">
              {amountToFreeShipping > 0 ? (
                <span>
                  Add <strong className="text-terracotta-600">₹{amountToFreeShipping.toLocaleString()}</strong> more for{' '}
                  <strong className="text-sage-700">Free Artisan Shipping</strong>
                </span>
              ) : (
                <span className="text-sage-700 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-sage-600" /> You unlocked Free Shipping!
                </span>
              )}
              <span className="text-charcoal-500 text-[11px]">{shippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-brand-200/80 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  amountToFreeShipping === 0 ? 'bg-sage-500' : 'bg-terracotta-500'
                }`}
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-20 h-20 rounded-full bg-brand-100/80 flex items-center justify-center mb-4 text-brand-600">
                  <ShoppingBag className="w-9 h-9 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-1">
                  Your bag is waiting
                </h3>
                <p className="text-sm text-charcoal-500 max-w-xs mb-6">
                  Discover our handmade crochet roses, hair clips, and artisan treasures crafted just for you.
                </p>
                <button
                  onClick={() => {
                    closeDrawer();
                    router.push('/products');
                  }}
                  className="px-6 py-2.5 rounded-full bg-charcoal-900 text-white text-sm font-medium hover:bg-terracotta-600 transition-colors shadow-soft"
                >
                  Explore Handmade
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-3.5 p-3.5 bg-white rounded-2xl border border-brand-200/70 shadow-sm"
                >
                  <div className="w-20 h-24 rounded-xl overflow-hidden relative shrink-0 bg-brand-100">
                    <Image
                      src={getImageUrl(item.images?.[0])}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item._id}`}
                          onClick={closeDrawer}
                          className="text-sm font-semibold text-charcoal-900 hover:text-terracotta-600 line-clamp-1 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item._id)}
                          className="text-charcoal-400 hover:text-red-500 p-1 transition-colors shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-brand-600 font-medium">{item.category}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-100">
                      {/* Quantity adjuster */}
                      <div className="flex items-center border border-brand-200 rounded-full bg-brand-50/50">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 text-charcoal-600 hover:text-charcoal-900 disabled:opacity-30"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-charcoal-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-1 text-charcoal-600 hover:text-charcoal-900"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-charcoal-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer actions */}
          {items.length > 0 && (
            <div className="p-5 border-t border-brand-200/80 bg-white/80 backdrop-blur-sm space-y-4">
              {/* Gift Wrap option */}
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-brand-50 border border-brand-200/70 cursor-pointer hover:bg-brand-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.value === 'true' || e.target.checked)}
                  className="rounded text-terracotta-600 focus:ring-terracotta-500 h-4 w-4 accent-terracotta-600"
                />
                <Gift className="w-4 h-4 text-terracotta-500 shrink-0" />
                <div className="flex-1 text-xs text-charcoal-700">
                  <span className="font-semibold text-charcoal-900">Artisan Gift Packaging</span> (+₹49)
                  <p className="text-[11px] text-charcoal-500">Handmade box, dried flowers & handwritten note</p>
                </div>
              </label>

              {/* Price summary */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-charcoal-900">₹{subtotal.toLocaleString()}</span>
                </div>
                {giftWrap && (
                  <div className="flex justify-between text-charcoal-600 text-xs">
                    <span>Artisan Gift Box</span>
                    <span className="font-medium text-charcoal-900">₹49</span>
                  </div>
                )}
                <div className="flex justify-between text-charcoal-600 text-xs">
                  <span>Estimated Shipping</span>
                  <span className="font-medium text-sage-700">
                    {subtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : '₹50'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-charcoal-900 pt-2 border-t border-brand-100">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 px-6 rounded-2xl bg-charcoal-900 text-white font-semibold text-sm hover:bg-terracotta-600 transition-all duration-200 shadow-soft flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleViewCart}
                  className="w-full py-2.5 px-6 rounded-2xl bg-brand-100/80 text-charcoal-800 font-medium text-xs hover:bg-brand-200/80 transition-colors"
                >
                  View Full Cart & Details
                </button>
              </div>

              <p className="text-center text-[11px] text-charcoal-400">
                🔒 Safe & encrypted checkout • 100% Artisan Guarantee
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
