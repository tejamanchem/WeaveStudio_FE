'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ShoppingCart, Users, Package, ArrowRight } from 'lucide-react';
import { getAdminOrders, getProducts } from '@/lib/api';
import useAdminStore from '@/store/adminStore';

export default function AdminGlobalSearch({ isOpen, onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ orders: [], products: [], customers: [] });
  const [loading, setLoading] = useState(false);
  const customCustomers = useAdminStore((s) => s.customCustomers);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults({ orders: [], products: [], customers: [] });
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ orders: [], products: [], customers: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const q = query.trim().toLowerCase();

      try {
        // Fetch matching orders
        const ordersRes = await getAdminOrders({ limit: 20 }).catch(() => ({ data: { orders: [] } }));
        const matchedOrders = (ordersRes.data?.orders || []).filter(
          (o) =>
            o.orderId.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.phone.toLowerCase().includes(q)
        ).slice(0, 4);

        // Fetch matching products
        const prodsRes = await getProducts({ limit: 20, search: query.trim() }).catch(() => ({ data: { products: [] } }));
        const matchedProducts = (prodsRes.data?.products || []).slice(0, 4);

        // Filter customers
        const matchedCustomers = customCustomers.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.phone.toLowerCase().includes(q)
        ).slice(0, 4);

        setResults({
          orders: matchedOrders,
          products: matchedProducts,
          customers: matchedCustomers,
        });
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, customCustomers]);

  if (!isOpen) return null;

  const totalCount = results.orders.length + results.products.length + results.customers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-charcoal-900/60 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-2xl bg-[#FCFAF7] border border-brand-200 rounded-3xl shadow-elevated overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-brand-200/80 flex items-center gap-3">
          <Search className="w-5 h-5 text-brand-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders (e.g. ORD...), customers, or products..."
            className="w-full bg-transparent text-charcoal-900 text-sm sm:text-base font-semibold focus:outline-none placeholder-charcoal-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-charcoal-400 hover:text-charcoal-700 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[11px] font-bold text-charcoal-400 hover:text-charcoal-800 bg-brand-100 px-2 py-1 rounded-lg ml-1"
          >
            ESC
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-6">
          {query.trim() && totalCount === 0 && !loading && (
            <p className="text-center py-8 text-xs text-charcoal-500">
              No orders, customers, or products found matching "{query}"
            </p>
          )}

          {/* Orders Results */}
          {results.orders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2">
                <ShoppingCart className="w-3.5 h-3.5 text-terracotta-500" />
                <span>Orders ({results.orders.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.orders.map((o) => (
                  <div
                    key={o._id}
                    onClick={() => {
                      onClose();
                      router.push(`/admin/orders?orderId=${o.orderId}`);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white border border-brand-200/70 hover:border-terracotta-300 hover:shadow-soft cursor-pointer transition-all"
                  >
                    <div>
                      <span className="font-bold text-xs text-charcoal-900">{o.orderId}</span>
                      <span className="text-xs text-charcoal-500 ml-2">by {o.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-xs text-charcoal-900">₹{o.totalAmount?.toLocaleString()}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-charcoal-700">
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers Results */}
          {results.customers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2">
                <Users className="w-3.5 h-3.5 text-sage-600" />
                <span>Customers ({results.customers.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.customers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onClose();
                      router.push(`/admin/customers?search=${c.name}`);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white border border-brand-200/70 hover:border-sage-300 hover:shadow-soft cursor-pointer transition-all"
                  >
                    <div>
                      <span className="font-bold text-xs text-charcoal-900">{c.name}</span>
                      <span className="text-xs text-charcoal-400 ml-2">{c.email}</span>
                    </div>
                    <span className="text-xs text-charcoal-600 font-medium">{c.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Results */}
          {results.products.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2">
                <Package className="w-3.5 h-3.5 text-amber-600" />
                <span>Products ({results.products.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.products.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => {
                      onClose();
                      router.push(`/admin/products?search=${p.name}`);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white border border-brand-200/70 hover:border-amber-300 hover:shadow-soft cursor-pointer transition-all"
                  >
                    <div>
                      <span className="font-bold text-xs text-charcoal-900">{p.name}</span>
                      <span className="text-xs text-brand-700 ml-2">({p.category})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-xs text-charcoal-900">₹{p.price?.toLocaleString()}</span>
                      <span className="text-[10px] text-charcoal-500">Stock: {p.stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
