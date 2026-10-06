'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  ShoppingCart,
  Clock,
  Truck,
  CheckCircle2,
  Eye,
  BellRing,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Store,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { getAdminOrders, updateOrderStatus, deleteOrder } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import OrderDetailsDrawer from '@/components/admin/OrderDetailsDrawer';
import ManualOrderModal from '@/components/admin/ManualOrderModal';
import toast from 'react-hot-toast';

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlOrderId = searchParams.get('orderId') || '';

  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState(urlOrderId);
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Selected Order for Drawer
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Delete Order Confirmation Modal
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Manual Offline Order Modal
  const [showManualModal, setShowManualModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('new') === 'manual') {
      setShowManualModal(true);
    }
  }, [searchParams]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25 };
      if (statusFilter) params.status = statusFilter;
      const res = await getAdminOrders(params);
      let list = res.data.orders || [];

      // Client search filter (Order ID, Customer name, phone, email)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        list = list.filter(
          (o) =>
            o.orderId.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.phone.toLowerCase().includes(q) ||
            o.email.toLowerCase().includes(q)
        );
      }

      // Price filter
      if (priceRange === 'under-500') {
        list = list.filter((o) => o.totalAmount < 500);
      } else if (priceRange === '500-1000') {
        list = list.filter((o) => o.totalAmount >= 500 && o.totalAmount <= 1000);
      } else if (priceRange === 'above-1000') {
        list = list.filter((o) => o.totalAmount > 1000);
      }

      // Sorting
      if (sortBy === 'amount-desc') {
        list = [...list].sort((a, b) => b.totalAmount - a.totalAmount);
      } else if (sortBy === 'amount-asc') {
        list = [...list].sort((a, b) => a.totalAmount - b.totalAmount);
      }

      setOrders(list);
      setTotalCount(res.data.total || list.length);
      setTotalPages(res.data.totalPages || 1);

      // Auto-open if query matches specific order
      if (urlOrderId) {
        const matched = list.find((o) => o.orderId.toLowerCase() === urlOrderId.toLowerCase());
        if (matched) setSelectedOrder(matched);
      }
    } catch {
      toast.error('Failed to load orders from studio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, priceRange, sortBy, searchQuery]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      toast.success(`Order status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOrder(orderToDelete._id);
      setOrders((prev) => prev.filter((o) => o._id !== orderToDelete._id));
      setTotalCount((c) => Math.max(0, c - 1));
      if (selectedOrder && selectedOrder._id === orderToDelete._id) {
        setSelectedOrder(null);
      }
      toast.success(`Order ${orderToDelete.orderId} and associated records deleted`);
      setOrderToDelete(null);
    } catch {
      toast.error('Failed to delete order and respective records');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setSearchQuery('');
    setPriceRange('all');
    setSortBy('newest');
    setPage(1);
    router.replace('/admin/orders');
  };

  // Metrics for top cards
  const placedCount = orders.filter((o) => o.status === 'PLACED').length;
  const shippedCount = orders.filter((o) => o.status === 'SHIPPED').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-charcoal-800 text-[11px] font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Atelier Fulfillment Hub</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">
            Order Lifecycle Management
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Track crafting progress, delivery updates, and direct customer communication
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-charcoal-900 hover:bg-terracotta-600 text-white text-xs font-semibold shadow-soft hover:shadow-card transition-all group"
          >
            <Store className="w-4 h-4 text-terracotta-400 group-hover:text-white transition-colors" />
            <span>+ Record Offline Order</span>
          </button>
        </div>
      </div>

      {/* Summary Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => {
            setStatusFilter('');
            setPage(1);
          }}
          className={`p-4 rounded-3xl border text-left transition-all ${
            !statusFilter
              ? 'bg-charcoal-900 text-white shadow-soft border-charcoal-900'
              : 'bg-white text-charcoal-800 border-brand-200/80 hover:bg-brand-50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">All Orders</span>
          <p className="font-serif text-2xl font-bold mt-1">{totalCount}</p>
        </button>

        <button
          onClick={() => {
            setStatusFilter('PLACED');
            setPage(1);
          }}
          className={`p-4 rounded-3xl border text-left transition-all ${
            statusFilter === 'PLACED'
              ? 'bg-amber-600 text-white shadow-soft border-amber-600'
              : 'bg-white text-charcoal-800 border-brand-200/80 hover:bg-brand-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">Crafting (PLACED)</span>
            <Clock className="w-4 h-4 opacity-70" />
          </div>
          <p className="font-serif text-2xl font-bold mt-1">{placedCount}</p>
        </button>

        <button
          onClick={() => {
            setStatusFilter('SHIPPED');
            setPage(1);
          }}
          className={`p-4 rounded-3xl border text-left transition-all ${
            statusFilter === 'SHIPPED'
              ? 'bg-blue-600 text-white shadow-soft border-blue-600'
              : 'bg-white text-charcoal-800 border-brand-200/80 hover:bg-brand-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">In Transit (SHIPPED)</span>
            <Truck className="w-4 h-4 opacity-70" />
          </div>
          <p className="font-serif text-2xl font-bold mt-1">{shippedCount}</p>
        </button>

        <button
          onClick={() => {
            setStatusFilter('DELIVERED');
            setPage(1);
          }}
          className={`p-4 rounded-3xl border text-left transition-all ${
            statusFilter === 'DELIVERED'
              ? 'bg-sage-700 text-white shadow-soft border-sage-700'
              : 'bg-white text-charcoal-800 border-brand-200/80 hover:bg-brand-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">Delivered</span>
            <CheckCircle2 className="w-4 h-4 opacity-70" />
          </div>
          <p className="font-serif text-2xl font-bold mt-1">{deliveredCount}</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-brand-200/80 shadow-soft space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Global Order Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, patron name, phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-brand-200 bg-brand-50/40 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
            />
          </div>

          {/* Filters & Sorters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Status dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-2xl bg-brand-50/70 border border-brand-200 text-xs font-semibold text-charcoal-800 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PLACED">Crafting in Atelier (PLACED)</option>
              <option value="SHIPPED">Dispatched (SHIPPED)</option>
              <option value="DELIVERED">Delivered to Patron</option>
            </select>

            {/* Price range */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-brand-50/70 border border-brand-200 text-xs font-semibold text-charcoal-800 cursor-pointer"
            >
              <option value="all">All Amounts</option>
              <option value="under-500">Under ₹500</option>
              <option value="500-1000">₹500 — ₹1,000</option>
              <option value="above-1000">Above ₹1,000</option>
            </select>

            {/* Sorter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-brand-50/70 border border-brand-200 text-xs font-semibold text-charcoal-800 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>

            {(statusFilter || searchQuery || priceRange !== 'all') && (
              <button
                onClick={handleClearFilters}
                className="p-2 text-charcoal-400 hover:text-terracotta-600 rounded-xl"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <LoadingSpinner label="Refreshing atelier orders..." />
      ) : (
        <div className="bg-white rounded-3xl border border-brand-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-brand-50/60 text-charcoal-600 text-left border-b border-brand-100">
                <tr>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px]">Order ID</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px]">Patron</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px]">Pieces</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px]">Total</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px]">Order Date</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px]">Status</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-5 py-4 font-bold text-charcoal-900">{order.orderId}</td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-charcoal-900 block">{order.customerName}</span>
                      <span className="text-[11px] text-charcoal-400">{order.phone}</span>
                    </td>
                    <td className="px-5 py-4 text-charcoal-700">
                      {order.items?.map((item) => `${item.name} ×${item.quantity}`).join(', ')}
                    </td>
                    <td className="px-5 py-4 font-serif font-bold text-charcoal-900">
                      ₹{order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-charcoal-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-xl font-bold border transition-colors cursor-pointer ${
                          order.status === 'PLACED'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : order.status === 'SHIPPED'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-sage-50 text-sage-800 border-sage-200'
                        }`}
                      >
                        <option value="PLACED">Crafting (PLACED)</option>
                        <option value="SHIPPED">Dispatched (SHIPPED)</option>
                        <option value="DELIVERED">Delivered to Patron</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-charcoal-800 font-semibold text-xs transition-colors flex items-center gap-1"
                          title="View Order Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-600" />
                          <span>Inspect</span>
                        </button>
                        <button
                          onClick={() => setOrderToDelete(order)}
                          className="p-1.5 rounded-xl bg-brand-50 hover:bg-red-50 text-charcoal-400 hover:text-red-600 transition-colors"
                          title="Delete Order & Restore Stock"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-charcoal-400">
                      No orders match your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-brand-100 flex items-center justify-between text-xs text-charcoal-500">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-brand-200 rounded-xl hover:bg-brand-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 border border-brand-200 rounded-xl hover:bg-brand-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slide-over Drawer for Order Inspection */}
      <OrderDetailsDrawer
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusUpdate={handleStatusChange}
        onDeleteOrder={(order) => setOrderToDelete(order)}
      />

      {/* Delete Order Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-brand-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-charcoal-900">
                  Delete Order Record
                </h3>
                <p className="text-xs text-charcoal-500">
                  Order ID: <span className="font-bold text-charcoal-800">{orderToDelete.orderId}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-charcoal-600 leading-relaxed">
              Are you sure you want to delete this order? The order record will be permanently deleted, and the inventory stock for each ordered piece will be automatically restored.
            </p>

            <div className="p-3.5 rounded-2xl bg-brand-50/60 border border-brand-200/60 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-charcoal-500">Patron:</span>
                <span className="font-semibold text-charcoal-900">{orderToDelete.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Total Amount:</span>
                <span className="font-serif font-bold text-charcoal-900">₹{orderToDelete.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Pieces to Restock:</span>
                <span className="font-semibold text-charcoal-900">
                  {orderToDelete.items?.reduce((sum, item) => sum + (item.quantity || 1), 0)} unit(s)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-2xl border border-brand-200 text-charcoal-700 hover:bg-brand-50 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-soft flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete & Restock</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual / Offline Order Creation Modal */}
      <ManualOrderModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onOrderCreated={(newOrder) => {
          setOrders((prev) => [newOrder, ...prev]);
          setTotalCount((c) => c + 1);
          fetchOrders();
        }}
      />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading orders hub..." />}>
      <OrdersPageContent />
    </Suspense>
  );
}
