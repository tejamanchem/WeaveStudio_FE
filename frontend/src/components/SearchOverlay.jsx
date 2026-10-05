'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { getProducts } from '@/lib/api';
import { getImageUrl } from '@/lib/image';
import useCartStore from '@/store/cartStore';
import toast from 'react-hot-toast';

const TRENDING_TAGS = [
  'Crochet Rose',
  'Sunflower Hair Clip',
  'Pooja Garland',
  'Pearl Drop Brooch',
  'Pink Rose',
  'Bridal Keepsake',
  'Handmade Bouquet',
];

const POPULAR_CATEGORIES = [
  { name: 'Garlands', icon: '🌿' },
  { name: 'Flowers', icon: '🌸' },
  { name: 'Hair Accessories', icon: '✨' },
  { name: 'Keychains', icon: '🔑' },
];

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      getProducts({ search: query.trim(), limit: 6 })
        .then((res) => {
          setResults(res.data.products || []);
        })
        .catch(() => {
          setResults([]);
        })
        .finally(() => setLoading(false));
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
  };

  const handleCategoryClick = (catName) => {
    onClose();
    router.push(`/products?category=${encodeURIComponent(catName)}`);
  };

  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    addItem(product);
    toast.success(`Added ${product.name} to cart`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-4 bg-charcoal-900/60 backdrop-blur-md transition-all">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-[#FCFAF7] border border-brand-200/80 rounded-3xl shadow-elevated overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Search header input */}
        <form onSubmit={handleSearchSubmit} className="relative border-b border-brand-200/60 p-4 sm:p-5 flex items-center gap-3">
          <Search className="w-5 h-5 text-brand-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search crochet roses, hair clips, garlands, gifts..."
            className="w-full bg-transparent text-charcoal-900 placeholder-charcoal-400 text-base sm:text-lg font-medium focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-brand-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-800 hover:bg-brand-100 transition-colors text-xs font-medium ml-1"
          >
            ESC
          </button>
        </form>

        {/* Content body */}
        <div className="max-h-[70vh] overflow-y-auto p-5 space-y-6">
          {/* Real-time search results */}
          {query.trim() && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider font-semibold text-brand-700">
                  {loading ? 'Searching handmade crafts...' : `Results for "${query}" (${results.length})`}
                </span>
                {results.length > 0 && (
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-medium text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1"
                  >
                    View all in shop <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-3 p-3 bg-white/70 rounded-2xl border border-brand-200/40 animate-pulse">
                      <div className="w-16 h-16 rounded-xl bg-brand-200/50" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-brand-200/50 rounded w-3/4" />
                        <div className="h-3 bg-brand-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => {
                        onClose();
                        router.push(`/products/${product._id}`);
                      }}
                      className="group cursor-pointer flex gap-3 p-2.5 bg-white rounded-2xl border border-brand-200/60 hover:border-terracotta-300 hover:shadow-soft transition-all"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 bg-brand-100">
                        <Image
                          src={getImageUrl(product.images?.[0])}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <p className="text-xs text-brand-600 font-medium truncate">{product.category}</p>
                          <h4 className="text-sm font-semibold text-charcoal-900 group-hover:text-terracotta-600 truncate transition-colors">
                            {product.name}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm font-bold text-charcoal-900">
                            ₹{product.price?.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleQuickAdd(e, product)}
                            className="text-xs px-2.5 py-1 bg-brand-100 text-charcoal-800 rounded-full font-medium hover:bg-terracotta-500 hover:text-white transition-colors"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-charcoal-600">
                    We couldn't find any handmade treasures matching <span className="font-semibold text-charcoal-900">"{query}"</span>
                  </p>
                  <p className="text-xs text-charcoal-400 mt-1">Try searching for "rose", "clip", or "garland"</p>
                </div>
              )}
            </div>
          )}

          {/* Trending Searches */}
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-brand-700 mb-2.5">
              <TrendingUp className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Trending Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-full bg-white border border-brand-200 text-charcoal-700 hover:border-terracotta-400 hover:text-terracotta-600 hover:bg-terracotta-50/50 transition-all shadow-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-brand-700 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-sage-600" />
              <span>Explore Categories</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {POPULAR_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategoryClick(cat.name)}
                  className="flex items-center gap-2 p-2.5 bg-white border border-brand-200/80 rounded-2xl text-left hover:border-brand-400 hover:shadow-soft transition-all group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <div>
                    <span className="block text-xs font-semibold text-charcoal-900 group-hover:text-terracotta-600 transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-charcoal-400">Handmade</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer help */}
        <div className="bg-brand-100/60 border-t border-brand-200/50 px-5 py-3 flex items-center justify-between text-xs text-charcoal-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sage-500" />
            Every piece is 100% handcrafted & made to order
          </span>
          <button
            onClick={() => {
              onClose();
              router.push('/products');
            }}
            className="text-terracotta-600 font-medium hover:underline flex items-center gap-1"
          >
            Browse all items <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
