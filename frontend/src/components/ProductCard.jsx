'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Eye, ShoppingBag, Star, Sparkles, Check, Move } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useWishlistStore from '@/store/wishlistStore';
import { getImageUrl } from '@/lib/image';
import QuickViewModal from '@/components/QuickViewModal';
import toast from 'react-hot-toast';

export default function ProductCard({
  product,
  badge,
  onQuickView,
  rotation = 0,
  isMovable = false,
  isDragging = false,
  className = '',
}) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const isFavorited = isInWishlist(product._id);
  const imageUrl = getImageUrl(product.images?.[0]);

  // Determine badge if not explicitly passed
  const displayBadge =
    badge ||
    product.badge ||
    (product.stock > 0 && product.stock <= 5
      ? 'Low Stock'
      : product.price >= 700
      ? 'Bestseller'
      : 'Handmade');

  const badgeColor =
    {
      Handmade: 'bg-brand-100 text-charcoal-800 border-brand-300',
      Bestseller: 'bg-amber-50 text-amber-900 border-amber-200',
      'Low Stock': 'bg-rose-50 text-rose-800 border-rose-200',
      New: 'bg-sage-50 text-sage-900 border-sage-200',
      'Limited Drop': 'bg-terracotta-50 text-terracotta-800 border-terracotta-200',
      Trending: 'bg-purple-50 text-purple-900 border-purple-200',
    }[displayBadge] || 'bg-brand-100 text-charcoal-800 border-brand-300';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addItem(product);
    toast.success(`Added ${product.name} to cart`);
    setTimeout(() => {
      setIsAdding(false);
      openDrawer();
    }, 300);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    toast.success(added ? 'Saved to Wishlist' : 'Removed from Wishlist');
  };

  const handleOpenQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      setQuickViewOpen(true);
    }
  };

  const cardContent = (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col bg-white rounded-3xl border border-brand-200/90 p-3 sm:p-3.5 transition-all duration-300 select-none ${
        isMovable ? 'cursor-grab active:cursor-grabbing shadow-card hover:shadow-elevated' : 'shadow-soft hover:shadow-boutique'
      } ${className}`}
    >
      {/* Subtle Washi Tape Accent for Handcrafted Physical Tabletop Aesthetic */}
      {isMovable && (
        <div
          aria-hidden="true"
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-amber-100/80 backdrop-blur-xs border border-amber-200/60 rounded-xs shadow-xs z-20 pointer-events-none transform -rotate-1 opacity-90 group-hover:rotate-0 transition-transform"
        />
      )}

      {/* Image Container */}
      <Link
        href={`/products/${product._id}`}
        onClick={(e) => {
          if (isDragging) e.preventDefault();
        }}
        className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-brand-100/60 block"
      >
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border backdrop-blur-md shadow-xs ${badgeColor}`}
          >
            {displayBadge}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label="Save to Wishlist"
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
            isFavorited
              ? 'bg-white text-terracotta-600 scale-105'
              : 'bg-white/85 backdrop-blur-sm text-charcoal-500 hover:text-terracotta-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-terracotta-600' : ''}`} />
        </button>

        {/* Drag Hint Pill when in Movable Mode */}
        {isMovable && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-charcoal-900/80 backdrop-blur-sm text-white text-[9px] font-medium pointer-events-none shadow-xs">
            <Move className="w-2.5 h-2.5" />
            <span>Drag card</span>
          </div>
        )}

        {/* Hover Quick Action overlay on desktop */}
        <div className="absolute inset-x-2 bottom-2.5 hidden sm:flex items-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
          <button
            type="button"
            onClick={handleOpenQuickView}
            className="flex-1 py-2 px-3 bg-white/95 backdrop-blur-md text-charcoal-800 hover:bg-white hover:text-terracotta-600 rounded-xl text-xs font-semibold shadow-soft flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-9 h-9 bg-charcoal-900 hover:bg-terracotta-600 text-white rounded-xl shadow-soft flex items-center justify-center transition-colors shrink-0"
            title="Quick Add to Bag"
          >
            {isAdding ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </Link>

      {/* Product Details */}
      <div className="pt-3 pb-1 px-1 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-brand-700 font-medium mb-1">
            <span className="truncate">{product.category}</span>
            <div className="flex items-center text-amber-500 gap-0.5 shrink-0 ml-1">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="font-semibold text-charcoal-700">
                {product.rating || '4.9'}
              </span>
            </div>
          </div>

          <Link
            href={`/products/${product._id}`}
            onClick={(e) => {
              if (isDragging) e.preventDefault();
            }}
          >
            <h3 className="font-serif text-sm sm:text-base font-semibold text-charcoal-900 group-hover:text-terracotta-600 line-clamp-1 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Craft specification or materials */}
          {product.materials && (
            <p className="text-[10px] text-charcoal-400 truncate mt-0.5">
              🪡 {product.materials}
            </p>
          )}
        </div>

        <div className="mt-2.5 pt-2 border-t border-brand-100 flex items-center justify-between">
          <div>
            <span className="text-sm sm:text-base font-bold text-charcoal-900">
              ₹{product.price?.toLocaleString()}
            </span>
            {product.price > 300 && (
              <span className="ml-1.5 text-[11px] text-charcoal-400 line-through">
                ₹{Math.round(product.price * 1.25).toLocaleString()}
              </span>
            )}
          </div>

          {/* Mobile quick add button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="sm:hidden px-3 py-1.5 bg-charcoal-900 text-white rounded-full text-xs font-medium active:scale-95 transition-transform"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isMovable ? (
        <motion.div
          layout
          initial={{ rotate: rotation, y: 0, scale: 1 }}
          animate={{
            rotate: isHovered ? rotation * 0.2 : rotation,
            y: isHovered ? -8 : 0,
            scale: 1,
          }}
          whileHover={{
            scale: 1.01,
            transition: { type: 'spring', stiffness: 400, damping: 22 },
          }}
          whileTap={{ scale: 0.98 }}
          whileDrag={{
            scale: 1.05,
            rotate: 0,
            zIndex: 60,
            boxShadow:
              '0 25px 50px -12px rgba(26, 23, 19, 0.28), 0 12px 24px -8px rgba(26, 23, 19, 0.2)',
            transition: { duration: 0.1 },
          }}
          transition={{
            type: 'spring',
            stiffness: 350,
            damping: 25,
            mass: 0.8,
          }}
          className="relative h-full"
        >
          {cardContent}
        </motion.div>
      ) : (
        cardContent
      )}

      {!onQuickView && (
        <QuickViewModal
          product={product}
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </>
  );
}
