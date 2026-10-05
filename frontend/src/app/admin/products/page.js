'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
  Image as ImageIcon,
  Link2,
  Grid,
  List,
  ChevronDown,
  Layers,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadImages } from '@/lib/api';
import { getImageUrl } from '@/lib/image';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

const CATEGORY_SUGGESTIONS = [
  'Crochet Flowers',
  'Hair Accessories',
  'Garlands',
  'Home Decor',
  'Bags & Pouches',
  'Amigurumi & Plushies',
  'Seasonal Keepsakes',
];

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: 'Crochet Flowers',
  stock: '15',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price_low' | 'price_high' | 'stock_low'
  
  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ limit: 200 });
      setProducts(res.data.products || []);
    } catch {
      toast.error('Failed to load atelier catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Previews for local file selection
  useEffect(() => {
    if (newFiles.length === 0) {
      setPreviews([]);
      return;
    }
    const urls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [newFiles]);

  // Derived stats
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => (p.stock || 0) >= 10).length;
    const lowStock = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) < 10).length;
    const outOfStock = products.filter((p) => (p.stock || 0) === 0).length;
    return { total, inStock, lowStock, outOfStock };
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const matchName = p.name?.toLowerCase().includes(q);
          const matchCategory = p.category?.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          if (!matchName && !matchCategory && !matchDesc) return false;
        }
        // Category
        if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
          return false;
        }
        // Stock filter
        if (stockFilter === 'IN_STOCK' && (p.stock || 0) < 10) return false;
        if (stockFilter === 'LOW_STOCK' && ((p.stock || 0) >= 10 || (p.stock || 0) === 0)) return false;
        if (stockFilter === 'OUT_OF_STOCK' && (p.stock || 0) > 0) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'stock_low') return (a.stock || 0) - (b.stock || 0);
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [products, searchTerm, selectedCategory, stockFilter, sortBy]);

  const allCategories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [products]);

  // Stock quick adjustment
  const handleQuickStockChange = async (product, delta) => {
    const nextStock = Math.max(0, (product.stock || 0) + delta);
    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, stock: nextStock } : p))
    );
    try {
      await updateProduct(product._id, { stock: nextStock });
      toast.success(`Updated stock for ${product.name} to ${nextStock}`);
    } catch {
      toast.error('Could not update stock');
      fetchProducts();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setNewFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const handleAddUrlImage = () => {
    if (!imageUrlInput.trim()) return;
    setExistingImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
    toast.success('Image link attached');
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setExistingImages([]);
    setNewFiles([]);
    setImageUrlInput('');
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price || 0),
      category: product.category || 'Crochet Flowers',
      stock: String(product.stock || 0),
    });
    setExistingImages(product.images || []);
    setNewFiles([]);
    setImageUrlInput('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category.trim()) {
      toast.error('Please enter product name and category');
      return;
    }
    setSaving(true);

    try {
      let uploadedUrls = [];
      if (newFiles.length > 0) {
        setUploading(true);
        const formData = new FormData();
        newFiles.forEach((file) => formData.append('images', file));
        const uploadRes = await uploadImages(formData);
        uploadedUrls = uploadRes.data?.urls || [];
        setUploading(false);
      }

      const allImages = [...existingImages, ...uploadedUrls];

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price) || 0,
        images: allImages,
        category: form.category.trim(),
        stock: parseInt(form.stock, 10) || 0,
      };

      if (editingId) {
        await updateProduct(editingId, payload);
        toast.success('Atelier piece updated successfully');
      } else {
        await createProduct(payload);
        toast.success('New piece published to Atelier catalogue');
      }

      setShowForm(false);
      setEditingId(null);
      setNewFiles([]);
      setExistingImages([]);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget._id);
      toast.success('Piece removed from collection');
      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to remove product');
    } finally {
      setDeleting(false);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <LoadingSpinner />
        <p className="text-xs text-charcoal-400 font-sans tracking-wide">
          Loading WeaveStudio Atelier catalogue...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Catalogue & Inventory</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight">
            Handmade Products
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Manage your crochet creations, stock thresholds, pricing, and high-resolution artisan photography.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            className="p-2.5 rounded-2xl border border-brand-200 bg-white text-charcoal-600 hover:text-charcoal-900 hover:bg-brand-50 transition-colors shadow-soft"
            title="Refresh catalogue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-charcoal-900 hover:bg-terracotta-600 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shadow-soft group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            <span>Add New Creation</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-brand-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500">
              Total Pieces
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-100 text-charcoal-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-charcoal-900">
            {stats.total}
          </div>
          <span className="text-[11px] text-charcoal-400 mt-1 block">
            Across {allCategories.length - 1} craft categories
          </span>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-brand-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500">
              Ready in Atelier
            </span>
            <div className="w-8 h-8 rounded-xl bg-sage-50 text-sage-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-sage-700">
            {stats.inStock}
          </div>
          <span className="text-[11px] text-charcoal-400 mt-1 block">
            Stock ≥ 10 units ready to ship
          </span>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-brand-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500">
              Low Needles
            </span>
            <div className="w-8 h-8 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-terracotta-600">
            {stats.lowStock}
          </div>
          <span className="text-[11px] text-charcoal-400 mt-1 block">
            Stock between 1 and 9 units
          </span>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-brand-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500">
              Out of Yarn
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <X className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-red-600">
            {stats.outOfStock}
          </div>
          <span className="text-[11px] text-charcoal-400 mt-1 block">
            Requires artisan restock
          </span>
        </div>
      </div>

      {/* Search, Filter & View Controls */}
      <div className="bg-white rounded-3xl p-4 border border-brand-200 shadow-soft space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search by piece title, craft category, materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:bg-white text-charcoal-900 transition-all placeholder:text-charcoal-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Stock filter select */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="text-xs bg-brand-50/70 border border-brand-200 rounded-2xl px-3 py-2 text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="IN_STOCK">In Stock (≥10)</option>
              <option value="LOW_STOCK">Low Stock (1-9)</option>
              <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            </select>

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-brand-50/70 border border-brand-200 rounded-2xl px-3 py-2 text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
            >
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="stock_low">Stock: Lowest First</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-brand-100 rounded-2xl p-0.5 border border-brand-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-charcoal-900 shadow-sm'
                    : 'text-charcoal-500 hover:text-charcoal-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-charcoal-900 shadow-sm'
                    : 'text-charcoal-500 hover:text-charcoal-900'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-[11px] font-semibold text-charcoal-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Categories:
          </span>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-charcoal-900 text-white shadow-soft'
                  : 'bg-brand-50 text-charcoal-600 hover:bg-brand-100 border border-brand-200/60'
              }`}
            >
              {cat === 'ALL' ? 'All Collections' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Content */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-brand-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-50/80 border-b border-brand-200 text-[11px] font-semibold uppercase tracking-wider text-charcoal-600">
                  <th className="py-3.5 px-4 pl-6">Creation / Craft</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Inventory & Quick Adjust</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100 text-xs">
                {filteredProducts.map((product) => {
                  const stockNum = product.stock || 0;
                  const isLow = stockNum > 0 && stockNum < 10;
                  const isOut = stockNum === 0;

                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-brand-50/50 transition-colors group"
                    >
                      {/* Product Thumbnail & Title */}
                      <td className="py-3.5 px-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-brand-100 relative shrink-0 border border-brand-200">
                            {product.images?.[0] ? (
                              <Image
                                src={getImageUrl(product.images[0])}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="48px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-charcoal-400">
                                <Package className="w-5 h-5 opacity-40" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <span className="font-semibold text-charcoal-900 truncate block group-hover:text-terracotta-600 transition-colors">
                              {product.name}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-charcoal-400 mt-0.5">
                              <span>{product.images?.length || 0} images</span>
                              <span>•</span>
                              <Link
                                href={`/products/${product._id}`}
                                target="_blank"
                                className="text-terracotta-600 hover:underline flex items-center gap-0.5"
                              >
                                <span>Preview</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-brand-100 text-charcoal-700 text-[11px] font-medium border border-brand-200/60">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-serif font-bold text-charcoal-900 text-sm">
                        ₹{(product.price || 0).toLocaleString()}
                      </td>

                      {/* Inventory & Quick Adjust */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuickStockChange(product, -1)}
                            disabled={stockNum === 0}
                            className="w-6 h-6 rounded-lg bg-brand-100 hover:bg-brand-200 text-charcoal-700 flex items-center justify-center font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Decrease stock by 1"
                          >
                            -
                          </button>
                          <span
                            className={`min-w-8 text-center font-semibold text-xs ${
                              isOut
                                ? 'text-red-600 font-bold'
                                : isLow
                                ? 'text-terracotta-600'
                                : 'text-charcoal-800'
                            }`}
                          >
                            {stockNum}
                          </span>
                          <button
                            onClick={() => handleQuickStockChange(product, 1)}
                            className="w-6 h-6 rounded-lg bg-brand-100 hover:bg-brand-200 text-charcoal-700 flex items-center justify-center font-bold text-xs transition-colors"
                            title="Increase stock by 1"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-terracotta-50 text-terracotta-700 border border-terracotta-200">
                            Low Needles ({stockNum})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sage-50 text-sage-800 border border-sage-200">
                            Ready in Studio
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-2 rounded-xl text-charcoal-600 hover:text-charcoal-900 hover:bg-brand-100 transition-colors"
                            title="Edit creation"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Delete creation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-charcoal-400">
                      <div className="max-w-xs mx-auto flex flex-col items-center">
                        <Package className="w-10 h-10 stroke-1 opacity-30 mb-2" />
                        <p className="font-serif text-sm font-semibold text-charcoal-700">
                          No crochet creations found
                        </p>
                        <p className="text-xs text-charcoal-400 mt-1">
                          Try adjusting your search keywords or stock filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const stockNum = product.stock || 0;
            const isLow = stockNum > 0 && stockNum < 10;
            const isOut = stockNum === 0;

            return (
              <div
                key={product._id}
                className="bg-white rounded-3xl border border-brand-200 overflow-hidden shadow-soft hover:shadow-card transition-all flex flex-col group"
              >
                {/* Image Cover */}
                <div className="aspect-square relative bg-brand-100 overflow-hidden">
                  {product.images?.[0] ? (
                    <Image
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-charcoal-400">
                      <Package className="w-10 h-10 opacity-30" />
                    </div>
                  )}

                  {/* Stock pill overlay */}
                  <div className="absolute top-3 left-3">
                    {isOut ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white shadow-soft">
                        Out of Stock
                      </span>
                    ) : isLow ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-terracotta-600 text-white shadow-soft">
                        Only {stockNum} Left
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-charcoal-900/80 backdrop-blur-md text-white shadow-soft">
                        {stockNum} In Stock
                      </span>
                    )}
                  </div>

                  {/* Category overlay */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur-md text-charcoal-800 shadow-soft">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-charcoal-900 line-clamp-1 group-hover:text-terracotta-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-charcoal-500 line-clamp-2 mt-1">
                      {product.description || 'Artisan handmade crochet piece with premium cotton and wool blend.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-brand-100 flex items-center justify-between">
                    <span className="font-serif font-bold text-base text-charcoal-900">
                      ₹{(product.price || 0).toLocaleString()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 rounded-xl text-charcoal-600 hover:text-charcoal-900 hover:bg-brand-100 transition-colors"
                        title="Edit piece"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                        title="Delete piece"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/products/${product._id}`}
                        target="_blank"
                        className="p-2 rounded-xl text-charcoal-400 hover:text-terracotta-600 hover:bg-brand-100 transition-colors"
                        title="Open on Storefront"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-brand-200 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-brand-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-charcoal-900">
                    {editingId ? 'Edit Artisan Creation' : 'Add New Artisan Creation'}
                  </h2>
                  <p className="text-[11px] text-charcoal-400">
                    Configure piece metadata, high-definition photography, and inventory count.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setNewFiles([]);
                  setExistingImages([]);
                }}
                className="p-1.5 rounded-xl text-charcoal-400 hover:text-charcoal-900 hover:bg-brand-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Product Title */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Piece Title *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Blossom Crochet Rose Bouquet, Daisy Hair Barrettes"
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:bg-white text-charcoal-900 transition-all font-medium"
                />
              </div>

              {/* Category & Category Suggestions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
                    Craft Category *
                  </label>
                  <span className="text-[10px] text-charcoal-400">Click below to auto-fill</span>
                </div>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Crochet Flowers"
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:bg-white text-charcoal-900 transition-all font-medium mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_SUGGESTIONS.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`text-[10px] px-2.5 py-1 rounded-xl transition-all ${
                        form.category === cat
                          ? 'bg-terracotta-600 text-white font-semibold'
                          : 'bg-brand-100 text-charcoal-600 hover:bg-brand-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Price (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 font-serif font-bold text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="1"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                      placeholder="499"
                      className="w-full text-xs pl-8 pr-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:bg-white text-charcoal-900 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Available Stock (Units) *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                    placeholder="15"
                    className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:bg-white text-charcoal-900 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Artisan Story & Specifications *
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detail the materials (e.g., 100% milk cotton yarn), crafting technique, dimensions, and care instructions..."
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:bg-white text-charcoal-900 transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Photography Gallery Management */}
              <div className="pt-2 border-t border-brand-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
                    High-Definition Product Photography
                  </label>
                  <span className="text-[10px] text-charcoal-400">
                    First image will serve as primary display cover
                  </span>
                </div>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider block mb-1.5">
                      Attached Images ({existingImages.length})
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {existingImages.map((img, i) => (
                        <div
                          key={`existing-${i}`}
                          className="relative w-20 h-20 rounded-2xl overflow-hidden border border-brand-200 bg-brand-100 group shadow-sm"
                        >
                          <Image
                            src={getImageUrl(img)}
                            alt={`Product pic ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                          {i === 0 && (
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-charcoal-900/80 text-[8px] font-bold uppercase tracking-wider text-white">
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeExistingImage(i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Selected Files */}
                {previews.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[10px] font-semibold text-sage-700 uppercase tracking-wider block mb-1.5">
                      Ready to Upload ({previews.length})
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {previews.map((src, i) => (
                        <div
                          key={`new-${i}`}
                          className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-sage-400 bg-brand-100 group shadow-sm"
                        >
                          <img
                            src={src}
                            alt={`New preview ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-sage-700 text-[8px] font-bold uppercase tracking-wider text-white">
                            NEW
                          </span>
                          <button
                            type="button"
                            onClick={() => removeNewFile(i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload or Link Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {/* File upload button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-brand-300 hover:border-terracotta-500 rounded-2xl py-3 px-4 text-xs text-charcoal-600 hover:text-terracotta-700 transition-colors flex items-center justify-center gap-2 bg-brand-50/50"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Upload Device Images</span>
                  </button>

                  {/* Add URL image */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      placeholder="Or paste HD image URL..."
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 text-xs px-3 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrlImage}
                      disabled={!imageUrlInput.trim()}
                      className="px-3 py-2.5 bg-charcoal-900 text-white rounded-2xl text-xs font-medium hover:bg-terracotta-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Attach
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-brand-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-charcoal-900 hover:bg-terracotta-600 text-white py-3 rounded-2xl text-xs font-semibold shadow-soft disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <LoadingSpinner />
                      <span>Uploading photography...</span>
                    </>
                  ) : saving ? (
                    <>
                      <LoadingSpinner />
                      <span>Saving piece...</span>
                    </>
                  ) : editingId ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Publish Creation</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setNewFiles([]);
                    setExistingImages([]);
                  }}
                  className="px-5 py-3 border border-brand-300 rounded-2xl text-xs font-medium text-charcoal-700 hover:bg-brand-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-brand-200 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-charcoal-900">
                Remove from Atelier?
              </h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Are you sure you want to remove{' '}
                <strong className="text-charcoal-800">{deleteTarget.name}</strong> from your collection? Customers will no longer be able to purchase it.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-2xl text-xs font-semibold shadow-soft transition-colors disabled:opacity-50"
              >
                {deleting ? 'Removing...' : 'Confirm Remove'}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 border border-brand-300 rounded-2xl text-xs font-medium text-charcoal-700 hover:bg-brand-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
