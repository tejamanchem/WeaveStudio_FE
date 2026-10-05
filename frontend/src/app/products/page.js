'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  SlidersHorizontal,
  X,
  Search,
  Filter,
  Check,
  RotateCcw,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner, { ProductGridSkeleton } from '@/components/LoadingSpinner';
import QuickViewModal from '@/components/QuickViewModal';
import { getProducts, getCategories } from '@/lib/api';

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlCategory = searchParams.get('category') || '';
  const urlSearch = searchParams.get('search') || '';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [priceRange, setPriceRange] = useState('all'); // 'all', 'under-300', '300-600', 'above-600'
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');

  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Sync state if URL changes
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    const params = { limit: 50 };
    if (selectedCategory) params.category = selectedCategory;
    if (searchQuery) params.search = searchQuery;

    getProducts(params)
      .then((res) => {
        let list = res.data.products || [];

        // In-stock filter
        if (onlyInStock) {
          list = list.filter((p) => p.stock > 0);
        }

        // Price filter
        if (priceRange === 'under-300') {
          list = list.filter((p) => p.price < 300);
        } else if (priceRange === '300-600') {
          list = list.filter((p) => p.price >= 300 && p.price <= 600);
        } else if (priceRange === 'above-600') {
          list = list.filter((p) => p.price > 600);
        }

        // Sorting
        if (sortBy === 'price-asc') {
          list = [...list].sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-desc') {
          list = [...list].sort((a, b) => b.price - a.price);
        } else if (sortBy === 'newest') {
          list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        setProducts(list);
        setTotal(list.length);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery, priceRange, onlyInStock, sortBy]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    const params = new URLSearchParams(searchParams);
    if (cat) {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    router.replace(`/products?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setPriceRange('all');
    setOnlyInStock(false);
    setSortBy('recommended');
    router.replace('/products');
  };

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    Boolean(searchQuery) ||
    priceRange !== 'all' ||
    onlyInStock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-charcoal-400 mb-2">
          <span>Home</span>
          <span>/</span>
          <span className="text-charcoal-800 font-semibold">Artisan Shop</span>
          {selectedCategory && (
            <>
              <span>/</span>
              <span className="text-terracotta-600 font-semibold">{selectedCategory}</span>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
              {selectedCategory || (searchQuery ? `Search: "${searchQuery}"` : 'All Handmade Creations')}
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
              Showing {total} individually woven creations
            </p>
          </div>

          {/* Mobile Filter Trigger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white border border-brand-200 text-charcoal-800 text-xs font-semibold shadow-soft"
            >
              <Filter className="w-4 h-4 text-terracotta-600" />
              <span>Filters {hasActiveFilters && '• Active'}</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 rounded-full bg-white border border-brand-200 text-charcoal-800 text-xs font-semibold"
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-brand-100/60 rounded-2xl border border-brand-200/50">
          <span className="text-xs font-semibold text-charcoal-500 mr-1">Active:</span>

          {selectedCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-semibold text-charcoal-800 border border-brand-200 shadow-sm">
              <span>Category: {selectedCategory}</span>
              <button onClick={() => handleCategorySelect('')}>
                <X className="w-3.5 h-3.5 text-charcoal-400 hover:text-charcoal-900" />
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-semibold text-charcoal-800 border border-brand-200 shadow-sm">
              <span>Keyword: "{searchQuery}"</span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  const params = new URLSearchParams(searchParams);
                  params.delete('search');
                  router.replace(`/products?${params.toString()}`);
                }}
              >
                <X className="w-3.5 h-3.5 text-charcoal-400 hover:text-charcoal-900" />
              </button>
            </span>
          )}

          {priceRange !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-semibold text-charcoal-800 border border-brand-200 shadow-sm">
              <span>
                Price:{' '}
                {priceRange === 'under-300'
                  ? 'Under ₹300'
                  : priceRange === '300-600'
                  ? '₹300 - ₹600'
                  : 'Above ₹600'}
              </span>
              <button onClick={() => setPriceRange('all')}>
                <X className="w-3.5 h-3.5 text-charcoal-400 hover:text-charcoal-900" />
              </button>
            </span>
          )}

          {onlyInStock && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-semibold text-charcoal-800 border border-brand-200 shadow-sm">
              <span>In Stock Only</span>
              <button onClick={() => setOnlyInStock(false)}>
                <X className="w-3.5 h-3.5 text-charcoal-400 hover:text-charcoal-900" />
              </button>
            </span>
          )}

          <button
            onClick={handleClearFilters}
            className="text-xs text-terracotta-600 hover:underline font-semibold ml-2 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset all</span>
          </button>
        </div>
      )}

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sticky Filters Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 bg-white rounded-3xl border border-brand-200/80 p-6 shadow-soft sticky top-24 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-brand-100">
            <h3 className="font-serif text-lg font-bold text-charcoal-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-terracotta-600" />
              <span>Refine Craft</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-terracotta-600 hover:underline font-medium"
              >
                Reset
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500">Categories</h4>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${
                  !selectedCategory
                    ? 'bg-brand-100 text-charcoal-900 font-bold'
                    : 'text-charcoal-600 hover:bg-brand-50'
                }`}
              >
                <span>All Collections</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${
                    selectedCategory === cat
                      ? 'bg-brand-100 text-charcoal-900 font-bold'
                      : 'text-charcoal-600 hover:bg-brand-50'
                  }`}
                >
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-4 border-t border-brand-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500">Price (₹)</h4>
            <div className="space-y-2 text-xs text-charcoal-700">
              {[
                { id: 'all', label: 'All Prices' },
                { id: 'under-300', label: 'Under ₹300' },
                { id: '300-600', label: '₹300 — ₹600' },
                { id: 'above-600', label: 'Above ₹600' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    value={opt.id}
                    checked={priceRange === opt.id}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="accent-terracotta-600"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className="pt-4 border-t border-brand-100">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-charcoal-800">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded accent-terracotta-600 h-4 w-4"
              />
              <span className="font-semibold">Ready to Ship (In Stock)</span>
            </label>
          </div>

          {/* Sort By on Desktop */}
          <div className="pt-4 border-t border-brand-100 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500">Sort By</h4>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl bg-brand-50 border border-brand-200 text-charcoal-800 cursor-pointer"
            >
              <option value="recommended">Curated / Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Drops</option>
            </select>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {loading ? (
            <ProductGridSkeleton count={9} />
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-brand-200/80 p-8">
              <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4 text-terracotta-600">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-charcoal-900">
                We couldn't find that handmade treasure
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-500 max-w-sm mx-auto mt-2 mb-6">
                Try clearing your search or filters to see our full artisan catalog.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2.5 rounded-full bg-charcoal-900 text-white text-xs font-semibold hover:bg-terracotta-600 transition-colors shadow-soft"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom-Sheet Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />

          <div className="fixed inset-x-0 bottom-0 bg-[#FAF8F5] rounded-t-3xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-brand-200">
              <h3 className="font-serif text-lg font-bold text-charcoal-900">Filter Collections</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full text-charcoal-400 hover:text-charcoal-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-6">
              {/* Category */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2">Category</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategorySelect('')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      !selectedCategory ? 'bg-charcoal-900 text-white' : 'bg-white border text-charcoal-700'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleCategorySelect(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        selectedCategory === c ? 'bg-charcoal-900 text-white' : 'bg-white border text-charcoal-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2">Price</h4>
                <div className="space-y-2 text-xs">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under-300', label: 'Under ₹300' },
                    { id: '300-600', label: '₹300 — ₹600' },
                    { id: 'above-600', label: 'Above ₹600' },
                  ].map((opt) => (
                    <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mobilePrice"
                        value={opt.id}
                        checked={priceRange === opt.id}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="accent-terracotta-600"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* In stock */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="rounded accent-terracotta-600 h-4 w-4"
                  />
                  <span>Ready to Ship (In Stock)</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-200 flex gap-3">
              <button
                onClick={handleClearFilters}
                className="flex-1 py-3 rounded-2xl bg-brand-100 text-charcoal-800 text-xs font-semibold"
              >
                Reset All
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-charcoal-900 text-white text-xs font-semibold shadow-soft"
              >
                Apply Filters ({total})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}

export default function ProductsCatalogPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Opening the artisan catalog..." />}>
      <ProductsCatalogContent />
    </Suspense>
  );
}
