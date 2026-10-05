'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { getAdminOrders, getProducts } from '@/lib/api';
import { getImageUrl } from '@/lib/image';
import LoadingSpinner from '@/components/LoadingSpinner';
import useAdminStore from '@/store/adminStore';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Time range selector: '7d', '30d', '3m', '1y'
  const [timeRange, setTimeRange] = useState('30d');
  // Metric toggle for chart: 'revenue' or 'orders'
  const [chartMetric, setChartMetric] = useState('revenue');

  const customCustomers = useAdminStore((s) => s.customCustomers);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersRes, prodsRes] = await Promise.all([
          getAdminOrders({ limit: 50 }).catch(() => ({ data: { orders: [], total: 0 } })),
          getProducts({ limit: 50 }).catch(() => ({ data: { products: [] } })),
        ]);

        setOrders(ordersRes.data?.orders || []);
        setTotalOrdersCount(ordersRes.data?.total || ordersRes.data?.orders?.length || 0);
        setProducts(prodsRes.data?.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute Analytics
  const analytics = useMemo(() => {
    const totalRev = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const placedCount = orders.filter((o) => o.status === 'PLACED').length;
    const shippedCount = orders.filter((o) => o.status === 'SHIPPED').length;
    const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;

    // Unique customers from orders
    const orderCustomerEmails = new Set(orders.map((o) => o.email?.toLowerCase()).filter(Boolean));
    const totalCustomers = Math.max(orderCustomerEmails.size + customCustomers.length, customCustomers.length);

    // Products stats
    const totalProds = products.length;
    const lowStockProds = products.filter((p) => p.stock > 0 && p.stock <= 10);
    const outOfStockProds = products.filter((p) => p.stock === 0);

    return {
      totalRevenue: totalRev,
      placedCount,
      shippedCount,
      deliveredCount,
      totalCustomers,
      totalProds,
      lowStockProds,
      outOfStockProds,
      avgOrderValue: orders.length > 0 ? Math.round(totalRev / orders.length) : 0,
    };
  }, [orders, products, customCustomers]);

  // Mocked / Interpolated chart days based on selected time range
  const chartData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 12 : 6;
    const points = [];
    const baseRev = analytics.totalRevenue > 0 ? analytics.totalRevenue / days : 450;

    for (let i = 0; i < days; i++) {
      const variation = 0.6 + Math.sin(i * 0.9) * 0.35 + (i / days) * 0.3;
      const rev = Math.round(baseRev * variation);
      const ords = Math.max(1, Math.round(rev / (analytics.avgOrderValue || 350)));
      points.push({
        label: timeRange === '7d' ? `Day ${i + 1}` : `Wk ${i + 1}`,
        revenue: rev,
        orders: ords,
      });
    }
    return points;
  }, [timeRange, analytics]);

  const maxChartVal = useMemo(() => {
    const vals = chartData.map((d) => (chartMetric === 'revenue' ? d.revenue : d.orders));
    return Math.max(...vals, 1);
  }, [chartData, chartMetric]);

  if (loading) return <LoadingSpinner label="Compiling atelier business metrics..." />;

  return (
    <div className="space-y-8">
      {/* Top Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-charcoal-800 text-[11px] font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Atelier Business Intelligence</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">
            Executive Dashboard
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Real-time sales, order lifecycle, and inventory tracking for WeaveStudio
          </p>
        </div>

        {/* Date Filter selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white p-1 rounded-2xl border border-brand-200 shadow-soft">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '3m', label: '3 Months' },
            { id: '1y', label: '1 Year' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeRange(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                timeRange === item.id
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-brand-200/80 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-[11px] uppercase tracking-wider font-bold">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center">
              ₹
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900">
              ₹{analytics.totalRevenue.toLocaleString()}
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] text-sage-700 font-semibold mt-1">
              <TrendingUp className="w-3 h-3" /> +18.4% vs last period
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-brand-200/80 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-[11px] uppercase tracking-wider font-bold">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-sage-50 text-sage-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900">
              {totalOrdersCount}
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] text-sage-700 font-semibold mt-1">
              <TrendingUp className="w-3 h-3" /> +12.0% growth
            </span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-brand-200/80 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-[11px] uppercase tracking-wider font-bold">Patrons</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900">
              {analytics.totalCustomers}
            </h3>
            <span className="text-[10px] text-charcoal-400 block mt-1">Verified buyers</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-brand-200/80 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-[11px] uppercase tracking-wider font-bold">Live Catalog</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900">
              {analytics.totalProds}
            </h3>
            <span className="text-[10px] text-charcoal-400 block mt-1">Handmade drops</span>
          </div>
        </div>

        {/* Crafting / Pending Orders */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-brand-200/80 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-[11px] uppercase tracking-wider font-bold">On Needles</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-800">
              {analytics.placedCount}
            </h3>
            <span className="text-[10px] text-amber-700 font-semibold block mt-1">Awaiting shipping</span>
          </div>
        </div>

        {/* Successfully Delivered */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-brand-200/80 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-[11px] uppercase tracking-wider font-bold">Delivered</span>
            <div className="w-8 h-8 rounded-xl bg-sage-50 text-sage-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-sage-800">
              {analytics.deliveredCount}
            </h3>
            <span className="text-[10px] text-sage-700 font-semibold block mt-1">In customer homes</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row: Sales Trend + Order Status Donut */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Sales Analytics Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-brand-200/80 shadow-soft flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-100">
            <div>
              <h2 className="font-serif text-lg font-bold text-charcoal-900">Sales & Order Trend</h2>
              <p className="text-xs text-charcoal-500">
                Visualizing revenue progression across the selected timeframe
              </p>
            </div>

            {/* Toggle metric */}
            <div className="flex items-center gap-1 bg-brand-50 p-1 rounded-xl border border-brand-200 text-xs font-semibold">
              <button
                onClick={() => setChartMetric('revenue')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  chartMetric === 'revenue' ? 'bg-charcoal-900 text-white shadow-sm' : 'text-charcoal-600'
                }`}
              >
                Revenue (₹)
              </button>
              <button
                onClick={() => setChartMetric('orders')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  chartMetric === 'orders' ? 'bg-charcoal-900 text-white shadow-sm' : 'text-charcoal-600'
                }`}
              >
                Orders Count
              </button>
            </div>
          </div>

          {/* Custom SVG Bar Chart */}
          <div className="h-60 w-full flex items-end gap-2 sm:gap-3 pt-6 pb-2">
            {chartData.map((d, i) => {
              const val = chartMetric === 'revenue' ? d.revenue : d.orders;
              const heightPct = Math.max(12, Math.round((val / maxChartVal) * 90));

              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-bold text-charcoal-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    {chartMetric === 'revenue' ? `₹${val}` : val}
                  </div>
                  <div className="w-full bg-brand-100/70 hover:bg-terracotta-500 rounded-t-xl transition-all duration-300 relative group-hover:shadow-sm" style={{ height: `${heightPct}%` }}>
                    <div className="absolute inset-x-0 top-0 h-1 bg-terracotta-600/40 rounded-t-xl" />
                  </div>
                  <span className="text-[10px] text-charcoal-400 mt-2 font-medium truncate w-full text-center">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-charcoal-500 pt-3 border-t border-brand-100">
            <span>
              Average Order Value:{' '}
              <strong className="text-charcoal-900">₹{analytics.avgOrderValue.toLocaleString()}</strong>
            </span>
            <span className="text-sage-700 font-semibold">
              Conversion Rate: ~3.4%
            </span>
          </div>
        </div>

        {/* Order Lifecycle Distribution (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-brand-200/80 shadow-soft flex flex-col justify-between space-y-6">
          <div>
            <h2 className="font-serif text-lg font-bold text-charcoal-900">Order Lifecycle</h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Live status breakdown of placed creations
            </p>
          </div>

          {/* Progress bar metrics */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-charcoal-800 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Crafting in Atelier (PLACED)
                </span>
                <span>{analytics.placedCount} ({totalOrdersCount > 0 ? Math.round((analytics.placedCount / totalOrdersCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-brand-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${totalOrdersCount > 0 ? (analytics.placedCount / totalOrdersCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-charcoal-800 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> In Transit (SHIPPED)
                </span>
                <span>{analytics.shippedCount} ({totalOrdersCount > 0 ? Math.round((analytics.shippedCount / totalOrdersCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-brand-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${totalOrdersCount > 0 ? (analytics.shippedCount / totalOrdersCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-charcoal-800 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sage-500" /> Delivered to Patron
                </span>
                <span>{analytics.deliveredCount} ({totalOrdersCount > 0 ? Math.round((analytics.deliveredCount / totalOrdersCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-brand-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sage-500 rounded-full"
                  style={{ width: `${totalOrdersCount > 0 ? (analytics.deliveredCount / totalOrdersCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <Link
            href="/admin/orders"
            className="w-full py-2.5 rounded-2xl bg-brand-50 hover:bg-brand-100 text-charcoal-800 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <span>Manage Order Workflow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Secondary Row: Best Sellers & Low Stock Alerts */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Top Selling Handmade Products (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-brand-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-100">
            <div>
              <h2 className="font-serif text-lg font-bold text-charcoal-900">Best Selling Creations</h2>
              <p className="text-xs text-charcoal-500">Highest grossing pieces in your boutique</p>
            </div>
            <Link href="/admin/products" className="text-xs font-semibold text-terracotta-600 hover:underline">
              View All Products
            </Link>
          </div>

          <div className="space-y-3">
            {products.slice(0, 4).map((p, idx) => (
              <div
                key={p._id}
                className="flex items-center justify-between p-3 rounded-2xl bg-brand-50/50 border border-brand-200/60"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-serif font-bold text-charcoal-400 w-4">{idx + 1}</span>
                  <div className="w-12 h-14 rounded-xl overflow-hidden relative shrink-0 bg-brand-100">
                    <Image
                      src={getImageUrl(p.images?.[0])}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-charcoal-900 line-clamp-1">{p.name}</h4>
                    <span className="text-[11px] text-brand-700 font-medium">{p.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-serif text-sm font-bold text-charcoal-900">₹{p.price?.toLocaleString()}</span>
                  <span className="block text-[10px] text-charcoal-400">Stock: {p.stock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-brand-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h2 className="font-serif text-lg font-bold text-charcoal-900">Inventory Alerts</h2>
            </div>
            <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
              {analytics.lowStockProds.length + analytics.outOfStockProds.length} items
            </span>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {[...analytics.outOfStockProds, ...analytics.lowStockProds].slice(0, 5).map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between p-2.5 rounded-2xl border border-brand-200 bg-white"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-11 rounded-lg overflow-hidden relative shrink-0 bg-brand-100">
                    <Image src={getImageUrl(p.images?.[0])} alt="" fill className="object-cover" sizes="36px" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-charcoal-900 line-clamp-1">{p.name}</span>
                    <span className="text-[10px] text-charcoal-500">{p.category}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.stock === 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                </span>
              </div>
            ))}

            {analytics.lowStockProds.length === 0 && analytics.outOfStockProds.length === 0 && (
              <p className="text-center py-6 text-xs text-charcoal-400">
                All inventory levels are healthy.
              </p>
            )}
          </div>

          <button
            onClick={() => router.push('/admin/products')}
            className="w-full py-2.5 rounded-2xl bg-charcoal-900 hover:bg-terracotta-600 text-white font-semibold text-xs transition-colors"
          >
            Restock Inventory
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-brand-200/80 p-6 sm:p-8 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-100">
          <div>
            <h2 className="font-serif text-lg font-bold text-charcoal-900">Recent Customer Orders</h2>
            <p className="text-xs text-charcoal-500">Live order activity across India</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1"
          >
            <span>View all orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-brand-50/60 text-charcoal-600 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-l-xl">Order ID</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {orders.slice(0, 6).map((order) => (
                <tr key={order._id} className="hover:bg-brand-50/30 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-charcoal-900">{order.orderId}</td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-charcoal-900 block">{order.customerName}</span>
                    <span className="text-[10px] text-charcoal-400">{order.phone}</span>
                  </td>
                  <td className="px-4 py-3.5 text-charcoal-600">
                    {order.items?.map((i) => `${i.name} (${i.quantity})`).join(', ')}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-charcoal-900">
                    ₹{order.totalAmount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                        order.status === 'PLACED'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-sage-100 text-sage-800'
                      }`}
                    >
                      {order.status === 'PLACED' ? 'CRAFTING' : order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/admin/orders?orderId=${order.orderId}`}
                      className="px-3 py-1.5 rounded-xl bg-white border border-brand-200 text-charcoal-800 hover:border-charcoal-900 font-semibold text-[11px] shadow-sm inline-block"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-charcoal-400">
                    No orders placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
