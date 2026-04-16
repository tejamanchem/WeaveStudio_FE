'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getProducts, getCategories } from '@/lib/api';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (selectedCategory) params.category = selectedCategory;
    if (search) params.search = search;

    getProducts(params)
      .then((res) => {
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, selectedCategory, search]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Handcrafted with Love
        </h1>
        <p className="mt-3 text-gray-500 text-lg">
          Discover our exquisite collection of handmade crochet garlands, hair accessories & more.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            className="bg-black text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          onClick={() => handleCategoryChange('')}
          className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
            !selectedCategory
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              selectedCategory === cat
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No products found.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-30 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-30 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
