'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import useWishlistStore from '@/store/wishlistStore';
import useCartStore from '@/store/cartStore';
import { getImageUrl } from '@/lib/image';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const handleMoveToCart = (product) => {
    addItem(product);
    removeItem(product._id);
    toast.success(`Moved ${product.name} to bag`);
    openDrawer();
  };

  const handleAddAllToCart = () => {
    items.forEach((item) => addItem(item));
    clearWishlist();
    toast.success('Moved all saved pieces to your bag');
    openDrawer();
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-6 text-terracotta-500">
          <Heart className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          Save the pieces you love
        </h1>
        <p className="text-sm text-charcoal-500 max-w-md mx-auto mt-3 mb-8">
          Keep track of your favorite handmade crochet flowers, clips, and garlands in your personal curation.
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-charcoal-400 mb-1">
            <Link href="/" className="hover:text-charcoal-800">
              Home
            </Link>
            <span>/</span>
            <span className="text-charcoal-900 font-semibold">Wishlist</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
            Saved Artisan Pieces
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            {items.length === 1 ? '1 cherished piece saved' : `${items.length} cherished pieces saved`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddAllToCart}
            className="px-5 py-2.5 rounded-full bg-charcoal-900 hover:bg-terracotta-600 text-white text-xs font-semibold transition-colors shadow-soft flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Move All to Bag</span>
          </button>
          <button
            onClick={clearWishlist}
            className="text-xs text-charcoal-500 hover:text-red-600 font-medium px-3 py-2"
          >
            Clear Wishlist
          </button>
        </div>
      </div>

      {/* Grid of Wishlist Items */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-3xl border border-brand-200/80 p-3 sm:p-4 shadow-soft flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <Link
                href={`/products/${product._id}`}
                className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-brand-100 block"
              >
                <Image
                  src={getImageUrl(product.images?.[0])}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeItem(product._id);
                    toast.success('Removed from wishlist');
                  }}
                  className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 text-charcoal-400 hover:text-red-500 shadow-sm transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </Link>

              <div>
                <span className="text-[10px] uppercase font-bold text-brand-700">
                  {product.category}
                </span>
                <Link href={`/products/${product._id}`}>
                  <h3 className="font-serif text-sm sm:text-base font-semibold text-charcoal-900 hover:text-terracotta-600 line-clamp-1 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="font-serif text-sm sm:text-base font-bold text-charcoal-900 mt-1">
                  ₹{product.price?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-brand-100">
              <button
                onClick={() => handleMoveToCart(product)}
                className="w-full py-2.5 px-3 rounded-2xl bg-charcoal-900 hover:bg-terracotta-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-soft"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move to Bag</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
