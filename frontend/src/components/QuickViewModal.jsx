'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Heart, Star, ShoppingBag, ArrowRight, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { getImageUrl } from '@/lib/image';
import useCartStore from '@/store/cartStore';
import useWishlistStore from '@/store/wishlistStore';
import toast from 'react-hot-toast';

export default function QuickViewModal({ product, isOpen, onClose }) {
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSelectedImgIdx(0);
      setQuantity(1);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const isFavorited = isInWishlist(product._id);
  const images = product.images?.length > 0
    ? product.images.map(getImageUrl)
    : ['/placeholder.svg'];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast.success(`Added ${quantity} ${quantity === 1 ? 'piece' : 'pieces'} to cart`);
    onClose();
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    const added = toggleWishlist(product);
    toast.success(added ? 'Saved to Wishlist' : 'Removed from Wishlist');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-[#FAF8F5] border border-brand-200/90 rounded-3xl shadow-elevated overflow-hidden z-10 my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 text-charcoal-600 hover:text-charcoal-900 hover:bg-white shadow-soft transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Gallery side */}
          <div className="p-6 bg-white/60 flex flex-col justify-between border-b md:border-b-0 md:border-r border-brand-200/70">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-brand-100 shadow-inner">
              <Image
                src={images[selectedImgIdx]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[11px] font-semibold text-terracotta-600 tracking-wide shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-terracotta-500" />
                Handcrafted
              </span>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImgIdx(idx)}
                    className={`relative w-16 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImgIdx === idx ? 'border-terracotta-500 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details side */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
                  {product.category}
                </span>
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  className={`p-2 rounded-full border transition-colors ${
                    isFavorited
                      ? 'bg-blush-50 border-blush-200 text-terracotta-600'
                      : 'border-brand-200 text-charcoal-400 hover:text-charcoal-700'
                  }`}
                  aria-label="Wishlist toggle"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-terracotta-600' : ''}`} />
                </button>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-charcoal-900 leading-tight">
                  {product.name}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center text-amber-500 text-xs">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                    <span className="ml-1.5 font-semibold text-charcoal-800">4.9</span>
                  </div>
                  <span className="text-charcoal-300">•</span>
                  <span className="text-xs text-charcoal-500">28 verified reviews</span>
                </div>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-serif font-bold text-charcoal-900">
                  ₹{product.price?.toLocaleString()}
                </span>
                <span className="text-xs text-charcoal-400">All taxes included</span>
              </div>

              <p className="text-xs sm:text-sm text-charcoal-600 line-clamp-3 leading-relaxed">
                {product.description}
              </p>

              {/* Artisan highlights */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-brand-100/60 border border-brand-200/50 text-[11px] text-charcoal-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
                  <span>3-4 hrs artisan needlework</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                  <span>100% Cotton & Wool yarn</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-sage-500" />
                <span className="text-sage-700 font-medium">
                  {product.stock > 0 ? `In Stock (${product.stock} pieces crafted)` : 'Made to order (ships in 3 days)'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-brand-200/60 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-brand-300 rounded-2xl bg-white px-2 py-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-1 text-charcoal-500 hover:text-charcoal-900 disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-semibold text-charcoal-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 text-charcoal-500 hover:text-charcoal-900"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-6 rounded-2xl bg-charcoal-900 hover:bg-terracotta-600 text-white text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-soft"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag — ₹{(product.price * quantity).toLocaleString()}</span>
                </button>
              </div>

              <Link
                href={`/products/${product._id}`}
                onClick={onClose}
                className="w-full py-2.5 text-center text-xs text-charcoal-600 hover:text-terracotta-600 font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Full Artisan Details & Care Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
