'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadImages } from '@/lib/api';
import { getImageUrl } from '@/lib/image';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
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
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ limit: 100 });
      setProducts(res.data.products);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Generate previews for newly selected files
  useEffect(() => {
    if (newFiles.length === 0) {
      setPreviews([]);
      return;
    }
    const urls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [newFiles]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setNewFiles((prev) => [...prev, ...files]);
    // Reset input so the same file can be re-selected
    e.target.value = '';
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
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
    });
    setExistingImages(product.images || []);
    setNewFiles([]);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Upload new files if any
      let uploadedUrls = [];
      if (newFiles.length > 0) {
        setUploading(true);
        const formData = new FormData();
        newFiles.forEach((file) => formData.append('images', file));
        const uploadRes = await uploadImages(formData);
        uploadedUrls = uploadRes.data.urls;
        setUploading(false);
      }

      const allImages = [...existingImages, ...uploadedUrls];

      const data = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        images: allImages,
        category: form.category,
        stock: parseInt(form.stock, 10),
      };

      if (editingId) {
        await updateProduct(editingId, data);
        toast.success('Product updated');
      } else {
        await createProduct(data);
        toast.success('Product created');
      }
      setShowForm(false);
      setForm(emptyForm);
      setExistingImages([]);
      setNewFiles([]);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error('Failed to delete product');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={openCreate}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
        >
          + Add Product
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g. Hair Accessories, Garlands"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images
                </label>

                {/* Existing images (when editing) */}
                {existingImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {existingImages.map((img, i) => (
                      <div key={`existing-${i}`} className="relative group">
                        <div className="w-20 h-20 rounded-lg overflow-hidden border relative">
                          <Image
                            src={getImageUrl(img)}
                            alt={`Image ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New file previews */}
                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {previews.map((src, i) => (
                      <div key={`new-${i}`} className="relative group">
                        <div className="w-20 h-20 rounded-lg overflow-hidden border">
                          <img
                            src={src}
                            alt={`New ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewFile(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <span className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-[10px] text-center">
                          NEW
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
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
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-sm text-gray-500 hover:border-black hover:text-black transition-colors flex flex-col items-center gap-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m0 0l-3 3m3-3l3 3M3 16.5V18a2.5 2.5 0 002.5 2.5h13A2.5 2.5 0 0021 18v-1.5M16.5 12L12 7.5 7.5 12" />
                  </svg>
                  Click to upload images
                  <span className="text-xs text-gray-400">JPEG, PNG, WebP — Max 5MB each</span>
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {uploading ? 'Uploading images...' : saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setNewFiles([]);
                    setExistingImages([]);
                  }}
                  className="px-6 py-2.5 border rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Table */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Product</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-left px-4 py-3 font-medium">Price</th>
              <th className="text-left px-4 py-3 font-medium">Stock</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 relative flex-shrink-0">
                      {product.images?.[0] ? (
                        <Image
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">—</div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">{product.name}</span>
                      <span className="text-xs text-gray-400 ml-2">({product.images?.length || 0} img)</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{product.category}</td>
                <td className="px-4 py-3">₹{product.price.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span
                    className={`${
                      product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-yellow-600' : 'text-gray-600'
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="text-xs px-3 py-1 border rounded-md hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-xs px-3 py-1 border border-red-200 text-red-500 rounded-md hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No products yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
