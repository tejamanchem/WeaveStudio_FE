'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  BellRing,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { getAdminOrders } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import useAdminStore from '@/store/adminStore';
import toast from 'react-hot-toast';

function CustomersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  // Store data
  const customCustomers = useAdminStore((s) => s.customCustomers);
  const addCustomer = useAdminStore((s) => s.addCustomer);
  const updateCustomer = useAdminStore((s) => s.updateCustomer);
  const deleteCustomer = useAdminStore((s) => s.deleteCustomer);

  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    status: 'Active',
    notes: '',
  });

  useEffect(() => {
    getAdminOrders({ limit: 100 })
      .then((res) => setOrders(res.data?.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Aggregate customers from real orders + custom customers
  const customersList = useMemo(() => {
    const map = new Map();

    // 1. Ingest from orders
    orders.forEach((o) => {
      const key = (o.email || o.phone || o.customerName).toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          id: `ORD-CUST-${key.slice(0, 8)}`,
          name: o.customerName,
          email: o.email,
          phone: o.phone,
          address: o.address,
          ordersCount: 1,
          totalSpent: o.totalAmount || 0,
          lastOrderDate: o.createdAt,
          orders: [o],
          status: 'Active',
          isSystem: true,
        });
      } else {
        const existing = map.get(key);
        existing.ordersCount += 1;
        existing.totalSpent += o.totalAmount || 0;
        existing.orders.push(o);
        if (new Date(o.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = o.createdAt;
        }
      }
    });

    // 2. Ingest custom created patrons
    customCustomers.forEach((c) => {
      const key = (c.email || c.phone || c.name).toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          address: c.address,
          city: c.city,
          pincode: c.pincode,
          ordersCount: 0,
          totalSpent: 0,
          lastOrderDate: c.createdAt,
          orders: [],
          status: c.status || 'Active',
          notes: c.notes,
          isSystem: false,
        });
      }
    });

    let list = Array.from(map.values());

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.includes(q)
      );
    }

    return list;
  }, [orders, customCustomers, searchQuery]);

  const handleOpenAdd = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      pincode: '',
      status: 'Active',
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error('Name, email, and phone are required');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, form);
      toast.success('Patron details updated');
      setEditingCustomer(null);
    } else {
      addCustomer(form);
      toast.success('Patron registered successfully');
      setShowAddModal(false);
    }
  };

  const handleDeletePatron = (id) => {
    if (!confirm('Remove this customer record?')) return;
    deleteCustomer(id);
    toast.success('Customer record removed');
  };

  if (loading) return <LoadingSpinner label="Compiling patron database..." />;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-charcoal-800 text-[11px] font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Patron Relations</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">
            Customers & Patrons
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Manage your customer database, order histories, and personalized contact channels
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-charcoal-900 hover:bg-terracotta-600 text-white text-xs font-semibold shadow-soft transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-brand-200/80 shadow-soft">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patrons by name, email, or mobile..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-brand-200 bg-brand-50/40 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-brand-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-brand-50/60 text-charcoal-600 text-left border-b border-brand-100">
              <tr>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px]">Patron</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px]">Contact</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px]">Orders</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px]">Total Spent</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px]">Last Activity</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {customersList.map((cust) => (
                <tr key={cust.id} className="hover:bg-brand-50/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-200 text-charcoal-900 font-bold flex items-center justify-center text-xs">
                        {cust.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-charcoal-900 block">{cust.name}</span>
                        <span className="text-[10px] text-charcoal-400">{cust.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-charcoal-800 block">{cust.email}</span>
                    <span className="text-[11px] text-charcoal-400">{cust.phone}</span>
                  </td>
                  <td className="px-5 py-4 font-bold text-charcoal-900">
                    {cust.ordersCount} orders
                  </td>
                  <td className="px-5 py-4 font-serif font-bold text-charcoal-900">
                    ₹{cust.totalSpent?.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-charcoal-400">
                    {new Date(cust.lastOrderDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sage-50 text-sage-800 border border-sage-200">
                      {cust.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-charcoal-800 font-semibold text-[11px]"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/notifications?customerEmail=${encodeURIComponent(
                              cust.email
                            )}&customerName=${encodeURIComponent(cust.name)}`
                          )
                        }
                        className="p-1.5 rounded-xl text-charcoal-500 hover:text-terracotta-600 hover:bg-brand-50"
                        title="Send Notification"
                      >
                        <BellRing className="w-4 h-4" />
                      </button>
                      {!cust.isSystem && (
                        <button
                          onClick={() => handleDeletePatron(cust.id)}
                          className="p-1.5 rounded-xl text-charcoal-400 hover:text-red-500 hover:bg-red-50"
                          title="Delete Patron Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {customersList.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-charcoal-400">
                    No customers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Side Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm"
            onClick={() => setSelectedCustomer(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
            <div className="w-screen max-w-xl bg-[#FAF8F5] shadow-2xl flex flex-col border-l border-brand-200 p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-brand-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-terracotta-500 text-white flex items-center justify-center font-serif text-lg font-bold">
                    {selectedCustomer.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-charcoal-900">
                      {selectedCustomer.name}
                    </h3>
                    <span className="text-xs text-charcoal-400">{selectedCustomer.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 text-charcoal-400 hover:text-charcoal-900 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Patron stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-white border border-brand-200/80">
                  <span className="block text-[10px] uppercase font-bold text-charcoal-400">Total Spent</span>
                  <span className="font-serif text-base font-bold text-charcoal-900">
                    ₹{selectedCustomer.totalSpent?.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-brand-200/80">
                  <span className="block text-[10px] uppercase font-bold text-charcoal-400">Orders</span>
                  <span className="font-serif text-base font-bold text-charcoal-900">
                    {selectedCustomer.ordersCount}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-brand-200/80">
                  <span className="block text-[10px] uppercase font-bold text-charcoal-400">Status</span>
                  <span className="text-xs font-bold text-sage-800">{selectedCustomer.status}</span>
                </div>
              </div>

              {/* Contact info */}
              <div className="p-4 rounded-2xl bg-white border border-brand-200/80 space-y-2 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-charcoal-500">Contact Details</h4>
                <p className="flex items-center gap-2 text-charcoal-800">
                  <Phone className="w-3.5 h-3.5 text-brand-600" />
                  <span>{selectedCustomer.phone}</span>
                </p>
                <p className="flex items-center gap-2 text-charcoal-800">
                  <Mail className="w-3.5 h-3.5 text-brand-600" />
                  <span>{selectedCustomer.email}</span>
                </p>
                <p className="flex items-start gap-2 pt-1 border-t border-brand-100 text-charcoal-800">
                  <MapPin className="w-3.5 h-3.5 text-brand-600 mt-0.5" />
                  <span>{selectedCustomer.address || 'No address on file'}</span>
                </p>
              </div>

              {/* Order History */}
              <div className="p-4 rounded-2xl bg-white border border-brand-200/80 space-y-3 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-charcoal-500">
                  Order History ({selectedCustomer.orders?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedCustomer.orders?.map((o) => (
                    <div
                      key={o._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-brand-50/50 border border-brand-100"
                    >
                      <div>
                        <span className="font-bold text-charcoal-900 block">{o.orderId}</span>
                        <span className="text-[10px] text-charcoal-400">
                          {new Date(o.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-serif font-bold text-charcoal-900 block">
                          ₹{o.totalAmount?.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-sage-800">{o.status}</span>
                      </div>
                    </div>
                  ))}
                  {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) && (
                    <p className="text-charcoal-400 py-3 text-center">No orders yet.</p>
                  )}
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  router.push(
                    `/admin/notifications?customerEmail=${encodeURIComponent(
                      selectedCustomer.email
                    )}&customerName=${encodeURIComponent(selectedCustomer.name)}`
                  );
                }}
                className="w-full py-3 rounded-2xl bg-charcoal-900 hover:bg-terracotta-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-soft"
              >
                <BellRing className="w-4 h-4" />
                <span>Send Notification / Message</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm">
          <div className="bg-[#FAF8F5] border border-brand-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-elevated">
            <div className="flex items-center justify-between pb-4 border-b border-brand-200 mb-5">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">
                Register New Patron
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-charcoal-400 hover:text-charcoal-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Radhika Sharma"
                  className="w-full p-2.5 rounded-xl border border-brand-200 bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="radhika@example.com"
                    className="w-full p-2.5 rounded-xl border border-brand-200 bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 rounded-xl border border-brand-200 bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">Delivery Address</label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, locality, apartment"
                  className="w-full p-2.5 rounded-xl border border-brand-200 bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Hyderabad"
                    className="w-full p-2.5 rounded-xl border border-brand-200 bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    placeholder="e.g. 500001"
                    className="w-full p-2.5 rounded-xl border border-brand-200 bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-100 text-charcoal-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-charcoal-900 text-white font-semibold hover:bg-terracotta-600 transition-colors"
                >
                  Create Patron Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading customer database..." />}>
      <CustomersPageContent />
    </Suspense>
  );
}
