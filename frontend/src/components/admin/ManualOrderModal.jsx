'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Store,
  Plus,
  Trash2,
  CheckCircle2,
  Package,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Banknote,
  QrCode,
  MapPin,
  Phone,
  User,
  Mail,
  Search,
} from 'lucide-react';
import { getProducts, placeOrder, updateOrderStatus } from '@/lib/api';
import { getImageUrl } from '@/lib/image';
import useAdminStore from '@/store/adminStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

const ORDER_CHANNELS = [
  { id: 'STUDIO_WALKIN', label: 'Studio Walk-in', icon: '🏪' },
  { id: 'EXHIBITION', label: 'Craft Exhibition / Pop-up', icon: '🎪' },
  { id: 'WHATSAPP', label: 'WhatsApp / Instagram DM', icon: '💬' },
  { id: 'PHONE', label: 'Phone Inquiry / Bespoke', icon: '📞' },
];

const PAYMENT_METHODS = [
  { id: 'CASH', label: 'Cash in Hand', icon: Banknote },
  { id: 'UPI', label: 'Offline UPI (QR Code / GPay)', icon: QrCode },
  { id: 'CARD', label: 'POS Machine / Card', icon: CreditCard },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer / IMPS', icon: CreditCard },
];

export default function ManualOrderModal({ isOpen, onClose, onOrderCreated }) {
  const { addCustomer } = useAdminStore();

  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Selected Order Items: [ { product, quantity, customPrice } ]
  const [selectedItems, setSelectedItems] = useState([]);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('Studio Atelier Pickup (In-Person)');
  const [channel, setChannel] = useState('STUDIO_WALKIN');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [initialStatus, setInitialStatus] = useState('DELIVERED'); // 'DELIVERED' | 'PLACED' | 'SHIPPED'
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  // Fetch available products when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function loadProducts() {
      setLoadingProducts(true);
      try {
        const res = await getProducts({ limit: 100 });
        setAvailableProducts(res.data.products || []);
      } catch {
        toast.error('Could not load products for order builder');
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter available products
  const filteredProducts = availableProducts.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  // Add product to order
  const handleAddItem = (product) => {
    const existingIndex = selectedItems.findIndex((it) => it.product._id === product._id);
    if (existingIndex >= 0) {
      const next = [...selectedItems];
      if (next[existingIndex].quantity < (product.stock || 99)) {
        next[existingIndex].quantity += 1;
        setSelectedItems(next);
      } else {
        toast.error(`Only ${product.stock} units available in atelier stock`);
      }
    } else {
      if ((product.stock || 0) <= 0) {
        toast.error('This creation is out of stock');
        return;
      }
      setSelectedItems([
        ...selectedItems,
        {
          product,
          quantity: 1,
          customPrice: product.price,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (productId, delta) => {
    setSelectedItems((prev) =>
      prev
        .map((it) => {
          if (it.product._id === productId) {
            const nextQty = it.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > it.product.stock) {
              toast.error(`Max ${it.product.stock} units in stock`);
              return it;
            }
            return { ...it, quantity: nextQty };
          }
          return it;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (productId) => {
    setSelectedItems((prev) => prev.filter((it) => it.product._id !== productId));
  };

  // Calculations
  const subtotal = selectedItems.reduce(
    (sum, it) => sum + (it.customPrice || it.product.price) * it.quantity,
    0
  );
  const finalTotal = Math.max(0, subtotal - (Number(discount) || 0));

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error('Please enter customer full name');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please enter customer phone number');
      return;
    }
    if (selectedItems.length === 0) {
      toast.error('Please select at least one handmade product');
      return;
    }

    setSubmitting(true);

    try {
      // If email is empty, generate an offline fallback email to satisfy backend validator
      const cleanEmail =
        email.trim() ||
        `offline.${phone.replace(/\D/g, '').slice(-6) || Date.now()}@weavestudio.com`;

      const formattedAddress = `${address.trim()}${
        channel ? ` [Source: ${channel}]` : ''
      }${notes ? ` [Notes: ${notes.trim()}]` : ''} [Payment: ${paymentMethod}]`;

      const payload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: cleanEmail,
        address: formattedAddress,
        items: selectedItems.map((it) => ({
          productId: it.product._id,
          quantity: it.quantity,
        })),
      };

      const res = await placeOrder(payload);
      const createdOrder = res.data.order;

      // If user specified DELIVERED or SHIPPED status, update it immediately in backend
      if (initialStatus !== 'PLACED' && createdOrder?._id) {
        try {
          await updateOrderStatus(createdOrder._id, initialStatus);
          createdOrder.status = initialStatus;
        } catch {
          // Non-fatal, status remains placed
        }
      }

      // Add customer to local patron directory if needed
      addCustomer({
        name: customerName.trim(),
        phone: phone.trim(),
        email: email.trim() || cleanEmail,
        address: address.trim(),
        notes: `Offline customer from ${channel}. ${notes ? `(${notes})` : ''}`,
      });

      toast.success(
        `Offline order #${createdOrder.orderId} recorded successfully!`,
        { duration: 4000 }
      );

      // Callback to refresh orders table in parent
      if (onOrderCreated) {
        onOrderCreated(createdOrder);
      }

      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to record offline order'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] rounded-3xl max-w-4xl w-full border border-brand-200 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-brand-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center shadow-soft">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-charcoal-900">
                  Record Offline / Manual Sale
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-terracotta-100 text-terracotta-800">
                  Direct Sale
                </span>
              </div>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Log in-studio walk-ins, craft pop-up fairs, exhibitions, and direct WhatsApp custom sales.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-charcoal-400 hover:text-charcoal-900 hover:bg-brand-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* 1. Channel Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-2">
              1. Sale Origin / Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ORDER_CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setChannel(ch.id)}
                  className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center gap-2 ${
                    channel === ch.id
                      ? 'border-charcoal-900 bg-charcoal-900 text-white shadow-soft'
                      : 'border-brand-200 bg-white text-charcoal-700 hover:bg-brand-50'
                  }`}
                >
                  <span className="text-base">{ch.icon}</span>
                  <span className="text-[11px] leading-tight truncate">{ch.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Patron Information */}
          <div className="bg-white p-5 rounded-3xl border border-brand-200 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-brand-100">
              <User className="w-4 h-4 text-terracotta-600" />
              <h3 className="font-serif text-sm font-bold text-charcoal-900">
                2. Patron Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                  Patron Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. radhika@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                  Pickup / Delivery Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. In-Person Studio Pickup or delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900"
                />
              </div>
            </div>
          </div>

          {/* 3. Products & Inventory Selection */}
          <div className="bg-white p-5 rounded-3xl border border-brand-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-brand-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-terracotta-600" />
                <h3 className="font-serif text-sm font-bold text-charcoal-900">
                  3. Select Atelier Pieces
                </h3>
              </div>
              <span className="text-[11px] text-charcoal-400">
                Inventory will automatically decrement
              </span>
            </div>

            {/* Product Quick Picker Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="text"
                placeholder="Search catalogue by piece title or category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900"
              />
            </div>

            {/* Product Quick Cards Grid */}
            <div className="max-h-48 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5 border border-brand-100 rounded-2xl p-2 bg-brand-50/30">
              {loadingProducts ? (
                <div className="col-span-3 py-6 text-center text-xs text-charcoal-400">
                  <LoadingSpinner />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-3 py-6 text-center text-xs text-charcoal-400">
                  No products found.
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const isSelected = selectedItems.some((it) => it.product._id === p._id);
                  const inStock = (p.stock || 0) > 0;

                  return (
                    <button
                      key={p._id}
                      type="button"
                      disabled={!inStock}
                      onClick={() => handleAddItem(p)}
                      className={`p-2 rounded-2xl border text-left transition-all flex items-center gap-2 group ${
                        isSelected
                          ? 'border-terracotta-500 bg-terracotta-50/70'
                          : inStock
                          ? 'border-brand-200 bg-white hover:border-brand-300 hover:shadow-sm'
                          : 'border-brand-100 bg-brand-100/50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-100 shrink-0 relative">
                        {p.images?.[0] ? (
                          <Image
                            src={getImageUrl(p.images[0])}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-xs">
                            🌸
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[11px] font-bold text-charcoal-900 truncate">
                          {p.name}
                        </span>
                        <div className="flex items-center justify-between text-[10px] text-charcoal-500 mt-0.5">
                          <span className="font-serif font-bold text-charcoal-800">
                            ₹{p.price}
                          </span>
                          <span className={p.stock < 5 ? 'text-amber-700' : ''}>
                            {p.stock} left
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Selected Items Line-item Cart */}
            {selectedItems.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-brand-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-600 block">
                  Items In This Offline Order ({selectedItems.length})
                </span>
                <div className="space-y-2">
                  {selectedItems.map((item) => (
                    <div
                      key={item.product._id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-brand-50 border border-brand-200/80 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-brand-200 relative shrink-0">
                          {item.product.images?.[0] && (
                            <Image
                              src={getImageUrl(item.product.images[0])}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-charcoal-900 block truncate max-w-[180px] sm:max-w-xs">
                            {item.product.name}
                          </span>
                          <span className="text-[10px] text-charcoal-400">
                            ₹{item.customPrice || item.product.price} each
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-white rounded-xl border border-brand-200 p-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product._id, -1)}
                            className="w-6 h-6 flex items-center justify-center font-bold text-charcoal-700 hover:bg-brand-100 rounded-lg"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-bold text-xs text-charcoal-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product._id, 1)}
                            className="w-6 h-6 flex items-center justify-center font-bold text-charcoal-700 hover:bg-brand-100 rounded-lg"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-serif font-bold text-charcoal-900 min-w-16 text-right">
                          ₹{((item.customPrice || item.product.price) * item.quantity).toLocaleString()}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.product._id)}
                          className="p-1 rounded-lg text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Payment & Initial Order Status */}
          <div className="bg-white p-5 rounded-3xl border border-brand-200 shadow-soft space-y-4">
            <h3 className="font-serif text-sm font-bold text-charcoal-900 pb-2 border-b border-brand-100">
              4. Payment & Order Fulfillment Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((pm) => {
                    const Icon = pm.icon;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`p-2.5 rounded-2xl border text-xs font-medium transition-all flex items-center gap-2 ${
                          paymentMethod === pm.id
                            ? 'border-terracotta-600 bg-terracotta-50 text-terracotta-800 font-bold'
                            : 'border-brand-200 bg-brand-50/50 text-charcoal-700 hover:bg-brand-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] truncate">{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Initial Status */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                  Fulfillment Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'DELIVERED', label: 'Handed Over (Delivered)' },
                    { id: 'PLACED', label: 'In Crafting (Placed)' },
                    { id: 'SHIPPED', label: 'In Transit (Shipped)' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setInitialStatus(st.id)}
                      className={`p-2.5 rounded-2xl border text-xs text-center transition-all ${
                        initialStatus === st.id
                          ? 'border-charcoal-900 bg-charcoal-900 text-white font-bold shadow-soft'
                          : 'border-brand-200 bg-brand-50/50 text-charcoal-700 hover:bg-brand-100'
                      }`}
                    >
                      <span className="text-[10px] block leading-tight font-semibold">
                        {st.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes & Discount */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                  Artisan / Exhibition Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid in 500 cash bill, requested pastel packaging ribbon"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                  Exhibition Discount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* 5. Summary & Bottom Bar */}
          <div className="bg-white p-5 rounded-3xl border border-brand-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-3 text-xs text-charcoal-500">
                <span>Subtotal: ₹{subtotal.toLocaleString()}</span>
                {Number(discount) > 0 && (
                  <span className="text-terracotta-600 font-semibold">
                    - Discount: ₹{Number(discount).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-xs">
                <span className="font-semibold text-charcoal-600 uppercase tracking-wider text-[11px] mr-2">
                  Total Payable Amount:
                </span>
                <span className="font-serif text-2xl font-bold text-charcoal-900">
                  ₹{finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl border border-brand-200 text-xs font-semibold text-charcoal-600 hover:bg-brand-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || selectedItems.length === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-charcoal-900 hover:bg-terracotta-600 text-white text-xs font-semibold shadow-soft hover:shadow-card transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner />
                    <span>Recording in Atelier...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Record Sale</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
