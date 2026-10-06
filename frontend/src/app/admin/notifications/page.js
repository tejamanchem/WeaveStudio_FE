'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BellRing,
  Send,
  Mail,
  MessageSquare,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Smartphone,
  Copy,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Eye,
  Info,
  ChevronDown,
} from 'lucide-react';
import useAdminStore from '@/store/adminStore';
import { getAdminOrders, sendNotification, getNotificationHistory } from '@/lib/api';
import toast from 'react-hot-toast';

function NotificationCenterInner() {
  const searchParams = useSearchParams();
  const prefillCustomer = searchParams.get('customer') || '';
  const prefillOrder = searchParams.get('order') || '';

  const {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    notifications,
    addNotification,
    customCustomers,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'history' | 'templates'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Sending state
  const [isSending, setIsSending] = useState(false);

  // Backend API History State
  const [apiHistory, setApiHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Composer State
  const [channel, setChannel] = useState('EMAIL'); // 'EMAIL' | 'SMS'
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const [customerName, setCustomerName] = useState(prefillCustomer || '');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderId, setOrderId] = useState(prefillOrder || '');
  const [productName, setProductName] = useState('Blossom Crochet Rose Bouquet');
  const [orderAmount, setOrderAmount] = useState('899');
  const [orderStatus, setOrderStatus] = useState('Crafting in Atelier');
  const [trackingUrl, setTrackingUrl] = useState('https://weavestudio.in/track?order=');
  const [deliveryAddress, setDeliveryAddress] = useState('124 Jubilee Hills, Hyderabad');

  // Custom subject & body state
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  // History search/filter
  const [historySearch, setHistorySearch] = useState('');
  const [historyChannel, setHistoryChannel] = useState('ALL');

  // Template Modal
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [tplForm, setTplForm] = useState({
    name: '',
    category: 'General',
    subject: '',
    smsText: '',
    emailBody: '',
  });

  // Fetch real orders to populate customer & order dropdowns
  useEffect(() => {
    async function loadOrders() {
      setLoadingOrders(true);
      try {
        const res = await getAdminOrders();
        const ords = res.data?.orders || [];
        setOrders(ords);

        // If prefill order provided, auto fill fields
        if (prefillOrder) {
          const match = ords.find((o) => (o.orderNumber || o._id) === prefillOrder);
          if (match) {
            setCustomerName(match.shippingAddress?.fullName || match.customerName || '');
            setCustomerEmail(match.shippingAddress?.email || match.customerEmail || '');
            setCustomerPhone(match.shippingAddress?.phone || match.customerPhone || '');
            setOrderId(match.orderNumber || match._id);
            setOrderAmount(String(match.totalAmount || match.total || ''));
            setOrderStatus(match.status || 'Confirmed');
            if (match.items?.[0]) {
              setProductName(match.items[0].name);
            }
            if (match.shippingAddress?.address) {
              setDeliveryAddress(`${match.shippingAddress.address}, ${match.shippingAddress.city || ''}`);
            }
          }
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [prefillOrder]);

  // Load notification audit history from backend
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await getNotificationHistory({ limit: 50 });
      if (res.data?.success && res.data?.data?.notifications) {
        const records = res.data.data.notifications.map((n) => ({
          id: n.notificationId || n._id,
          sentAt: n.sentAt || n.createdAt,
          customerName: n.metadata?.customerName || n.recipient,
          customerEmail: n.type === 'EMAIL' ? n.recipient : '',
          customerPhone: n.type === 'SMS' ? n.recipient : '',
          channel: n.type,
          templateName: n.metadata?.templateName || (n.subject ? n.subject : 'Custom Dispatch'),
          orderId: n.metadata?.orderId || 'N/A',
          status: n.status === 'SENT' ? 'Delivered' : n.status,
        }));
        setApiHistory(records);
      }
    } catch {
      // Fallback silently to local store
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [activeTab]);

  // Synchronize active template when selectedTemplateId changes
  useEffect(() => {
    const activeTpl = templates.find((t) => t.id === selectedTemplateId) || templates[0];
    if (activeTpl) {
      setSubject(activeTpl.subject || '');
      setContent(channel === 'EMAIL' ? activeTpl.emailBody : activeTpl.smsText);
    }
  }, [selectedTemplateId, channel, templates]);

  // Handle order selection dropdown
  const handleSelectOrder = (selectedId) => {
    if (!selectedId) return;
    const match = orders.find((o) => (o.orderNumber || o._id) === selectedId);
    if (match) {
      setOrderId(match.orderNumber || match._id);
      setCustomerName(match.shippingAddress?.fullName || match.customerName || 'Valued Patron');
      setCustomerEmail(match.shippingAddress?.email || match.customerEmail || 'patron@example.com');
      setCustomerPhone(match.shippingAddress?.phone || match.customerPhone || '+91 98765 00000');
      setOrderAmount(String(match.totalAmount || match.total || 999));
      setOrderStatus(match.status || 'Confirmed');
      if (match.items?.[0]) {
        setProductName(match.items[0].name);
      }
      if (match.shippingAddress?.address) {
        setDeliveryAddress(
          `${match.shippingAddress.address}, ${match.shippingAddress.city || ''}`
        );
      }
      setTrackingUrl(`https://weavestudio.in/track?order=${match.orderNumber || match._id}`);
    }
  };

  // Variable replacement engine
  const resolveVariables = (text) => {
    if (!text) return '';
    return text
      .replace(/{{customer_name}}/g, customerName || 'Valued Patron')
      .replace(/{{order_id}}/g, orderId || 'WS-ATELIER-101')
      .replace(/{{product_name}}/g, productName || 'Handcrafted Crochet Piece')
      .replace(/{{order_amount}}/g, orderAmount || '799')
      .replace(/{{order_status}}/g, orderStatus || 'Crafting in Progress')
      .replace(/{{tracking_url}}/g, trackingUrl || 'https://weavestudio.in/track')
      .replace(/{{delivery_address}}/g, deliveryAddress || 'Patron Shipping Address');
  };

  const previewSubject = useMemo(() => resolveVariables(subject), [subject, customerName, orderId, productName, orderAmount, orderStatus, trackingUrl, deliveryAddress]);
  const previewBody = useMemo(() => resolveVariables(content), [content, customerName, orderId, productName, orderAmount, orderStatus, trackingUrl, deliveryAddress]);

  // Insert variable token into message body
  const insertToken = (token) => {
    setContent((prev) => prev + ` {{${token}}}`);
    toast.success(`Inserted {{${token}}}`);
  };

  // Dispatch Notification via Backend API
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error('Please specify customer name');
      return;
    }
    if (channel === 'EMAIL' && !customerEmail.trim()) {
      toast.error('Please specify customer email');
      return;
    }
    if (channel === 'SMS' && !customerPhone.trim()) {
      toast.error('Please specify customer phone number');
      return;
    }
    if (channel === 'EMAIL' && !previewSubject.trim()) {
      toast.error('Please specify an email subject');
      return;
    }
    if (!previewBody.trim()) {
      toast.error('Please specify message body content');
      return;
    }

    setIsSending(true);
    const currentTpl = templates.find((t) => t.id === selectedTemplateId);

    try {
      const payload = {
        type: channel.toLowerCase(),
        to: [channel === 'EMAIL' ? customerEmail.trim() : customerPhone.trim()],
        subject: previewSubject.trim(),
        message: previewBody.trim(),
        metadata: {
          customerName: customerName.trim(),
          orderId: orderId || 'N/A',
          productName: productName || 'Handcrafted Crochet Piece',
          templateName: currentTpl?.name || 'Custom Dispatch',
          channel,
        },
      };

      const res = await sendNotification(payload);
      const notifId = res.data?.data?.notificationId || `notif_${Date.now()}`;

      // Update local Zustand store
      addNotification({
        id: notifId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || 'contact@weavestudio.in',
        customerPhone: customerPhone.trim() || '+91 99999 99999',
        orderId: orderId || 'N/A',
        productName: productName || 'Handmade Creation',
        channel,
        templateName: currentTpl?.name || 'Custom Dispatch',
        sentAt: new Date().toISOString(),
        status: 'Delivered',
      });

      toast.success(
        `${channel === 'EMAIL' ? 'Artisan Email Letter' : 'SMS Message'} dispatched successfully to ${customerName}!`
      );

      // Refresh history from backend
      loadHistory();
    } catch (err) {
      console.error('Notification dispatch failed:', err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to dispatch notification';
      toast.error(errMsg);
    } finally {
      setIsSending(false);
    }
  };

  // Combined History (API Audit log + Local Store records)
  const combinedHistory = useMemo(() => {
    const map = new Map();
    // Add API records first
    for (const item of apiHistory) {
      if (item.id) map.set(item.id, item);
    }
    // Add local records if not present
    for (const item of notifications) {
      if (item.id && !map.has(item.id)) {
        map.set(item.id, item);
      }
    }
    return Array.from(map.values()).sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  }, [apiHistory, notifications]);

  // Filtered History
  const filteredHistory = useMemo(() => {
    return combinedHistory.filter((n) => {
      if (historyChannel !== 'ALL' && n.channel !== historyChannel) return false;
      if (historySearch) {
        const q = historySearch.toLowerCase();
        return (
          n.customerName?.toLowerCase().includes(q) ||
          n.customerEmail?.toLowerCase().includes(q) ||
          n.customerPhone?.toLowerCase().includes(q) ||
          n.orderId?.toLowerCase().includes(q) ||
          n.templateName?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [combinedHistory, historyChannel, historySearch]);

  // Template Save
  const handleSaveTemplate = (e) => {
    e.preventDefault();
    if (!tplForm.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, tplForm);
      toast.success('Template updated');
    } else {
      addTemplate(tplForm);
      toast.success('New template saved');
    }
    setShowTemplateModal(false);
    setEditingTemplate(null);
  };

  const openNewTemplate = () => {
    setEditingTemplate(null);
    setTplForm({
      name: '',
      category: 'Updates',
      subject: 'WeaveStudio — ',
      smsText: 'Hi {{customer_name}}, update on order #{{order_id}} from WeaveStudio: ',
      emailBody: `Dear {{customer_name}},\n\nWe have an update regarding your handcrafted order #{{order_id}}.\n\nWarmly,\nWeaveStudio Atelier`,
    });
    setShowTemplateModal(true);
  };

  const openEditTemplate = (tpl) => {
    setEditingTemplate(tpl);
    setTplForm({
      name: tpl.name,
      category: tpl.category || 'General',
      subject: tpl.subject || '',
      smsText: tpl.smsText || '',
      emailBody: tpl.emailBody || '',
    });
    setShowTemplateModal(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Patron Communication</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Deliver warm artisan order milestones, dispatched carrier links, and handwritten-style patron updates via Email & SMS.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-brand-100 p-1 rounded-2xl border border-brand-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'compose'
                ? 'bg-charcoal-900 text-white shadow-soft'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-charcoal-900 text-white shadow-soft'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>History ({combinedHistory.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'templates'
                ? 'bg-charcoal-900 text-white shadow-soft'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Templates ({templates.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: COMPOSE NOTIFICATION */}
      {/* ======================================================== */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: 7 cols */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-brand-200 shadow-soft space-y-5">
            {/* Channel Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-2">
                1. Delivery Channel
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setChannel('EMAIL')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                    channel === 'EMAIL'
                      ? 'border-charcoal-900 bg-charcoal-900 text-white shadow-soft'
                      : 'border-brand-200 bg-brand-50/70 text-charcoal-700 hover:bg-brand-100'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Branded Email Letter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('SMS')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                    channel === 'SMS'
                      ? 'border-charcoal-900 bg-charcoal-900 text-white shadow-soft'
                      : 'border-brand-200 bg-brand-50/70 text-charcoal-700 hover:bg-brand-100'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Instant SMS Text</span>
                </button>
              </div>
            </div>

            {/* Template Chooser */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                  2. Atelier Milestone Template
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('templates')}
                  className="text-[11px] text-terracotta-600 hover:underline"
                >
                  Manage Templates
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-2.5 rounded-2xl border text-left text-xs transition-all ${
                      selectedTemplateId === tpl.id
                        ? 'border-terracotta-500 bg-terracotta-50/80 text-charcoal-900 font-semibold'
                        : 'border-brand-200 bg-brand-50/50 text-charcoal-600 hover:bg-brand-100'
                    }`}
                  >
                    <span className="block truncate text-[11px] font-bold">
                      {tpl.name}
                    </span>
                    <span className="block text-[9px] text-charcoal-400 mt-0.5">
                      {tpl.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Details & Quick Order Autofill */}
            <div className="pt-2 border-t border-brand-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                  3. Patron & Order Context
                </label>
                {orders.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[10px] text-charcoal-400">Autofill from Order:</span>
                    <select
                      onChange={(e) => handleSelectOrder(e.target.value)}
                      className="text-[11px] bg-brand-100 border border-brand-200 rounded-xl px-2 py-1 text-charcoal-800"
                    >
                      <option value="">Select recent order...</option>
                      {orders.slice(0, 15).map((o) => (
                        <option key={o._id} value={o.orderNumber || o._id}>
                          #{o.orderNumber || o._id.slice(-6)} — {o.shippingAddress?.fullName || 'Patron'} (₹{o.totalAmount || o.total})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-charcoal-600 mb-1">
                    Patron Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full text-xs px-3 py-2 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-charcoal-600 mb-1">
                    Order Reference ID
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. ORD-9821"
                    className="w-full text-xs px-3 py-2 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900"
                  />
                </div>

                {channel === 'EMAIL' ? (
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-charcoal-600 mb-1">
                      Recipient Email Address *
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. patron@example.com"
                      className="w-full text-xs px-3 py-2 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900"
                    />
                  </div>
                ) : (
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-charcoal-600 mb-1">
                      Mobile Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full text-xs px-3 py-2 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Variable Pills / Quick Insert */}
            <div className="pt-2 border-t border-brand-100">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-400 block mb-1.5">
                Dynamic Variable Tags (Click to Insert)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: 'customer_name', label: 'Patron Name' },
                  { tag: 'order_id', label: 'Order ID' },
                  { tag: 'product_name', label: 'Creation Name' },
                  { tag: 'order_amount', label: 'Amount (₹)' },
                  { tag: 'order_status', label: 'Order Status' },
                  { tag: 'tracking_url', label: 'Tracking URL' },
                  { tag: 'delivery_address', label: 'Address' },
                ].map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => insertToken(v.tag)}
                    className="text-[10px] bg-brand-100 hover:bg-terracotta-100 hover:text-terracotta-800 text-charcoal-700 px-2 py-0.5 rounded-lg border border-brand-200 font-mono transition-colors"
                  >
                    +{v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject (for email) & Message Body */}
            <div className="space-y-3">
              {channel === 'EMAIL' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                    Email Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900 font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                  {channel === 'EMAIL' ? 'Letter Body (Markdown / Plain Text)' : 'SMS Message Body'}
                </label>
                <textarea
                  rows={channel === 'EMAIL' ? 8 : 4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900 resize-none font-mono text-[11px] leading-relaxed"
                />
              </div>
            </div>

            {/* Dispatch Button */}
            <button
              onClick={handleSendNotification}
              disabled={isSending}
              className="w-full bg-charcoal-900 hover:bg-terracotta-600 disabled:opacity-50 text-white py-3 rounded-2xl text-xs font-semibold shadow-soft transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>
                    Sending {channel === 'EMAIL' ? 'Artisan Email Letter...' : 'SMS Notification...'}
                  </span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  <span>
                    Dispatch {channel === 'EMAIL' ? 'Artisan Email Letter' : 'SMS Notification'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Right Live Preview: 5 cols */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                <Eye className="w-4 h-4 text-terracotta-600" />
                <span>Real-Time Patron Preview</span>
              </div>
              <span className="text-[10px] text-charcoal-400 bg-white px-2.5 py-0.5 rounded-full border border-brand-200">
                Dynamic Variables Resolved
              </span>
            </div>

            {channel === 'EMAIL' ? (
              /* LUXURY EMAIL LETTER PREVIEW */
              <div className="bg-white rounded-3xl border border-brand-200 shadow-soft overflow-hidden">
                {/* Email Client Header bar */}
                <div className="bg-brand-100/70 px-4 py-3 border-b border-brand-200 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
                  </div>
                  <span className="text-[10px] text-charcoal-400 font-mono ml-2 truncate">
                    Subject: {previewSubject}
                  </span>
                </div>

                {/* Email Body Canvas */}
                <div className="p-6 bg-[#FAF8F5] text-charcoal-800 space-y-4">
                  {/* Atelier Branded Header */}
                  <div className="text-center pb-4 border-b border-brand-200/80">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-terracotta-600 text-white font-serif font-bold text-base shadow-sm mb-1">
                      W
                    </div>
                    <h4 className="font-serif text-sm font-bold tracking-tight text-charcoal-900">
                      WeaveStudio Atelier
                    </h4>
                    <p className="text-[9px] uppercase tracking-widest text-brand-600">
                      Slow Handmade Living
                    </p>
                  </div>

                  {/* Mail Message Content */}
                  <div className="space-y-3 text-xs leading-relaxed font-sans text-charcoal-700 whitespace-pre-line bg-white p-5 rounded-2xl border border-brand-200/70 shadow-sm">
                    {previewBody}
                  </div>

                  {/* Artisan Seal Footer */}
                  <div className="text-center pt-3 border-t border-brand-200/60 text-[10px] text-charcoal-400 space-y-1">
                    <p>Woven with care by the WeaveStudio Collective</p>
                    <p>Have questions? Reply directly to this email or chat on WhatsApp</p>
                  </div>
                </div>
              </div>
            ) : (
              /* SMARTPHONE SMS SCREEN PREVIEW */
              <div className="max-w-xs mx-auto bg-charcoal-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-charcoal-800">
                {/* Speaker pill notch */}
                <div className="w-24 h-4 bg-charcoal-800 rounded-full mx-auto mb-3" />

                {/* Phone screen inner */}
                <div className="bg-[#FAF8F5] rounded-[2rem] p-4 min-h-[380px] flex flex-col justify-between border border-brand-200">
                  {/* Message sender header */}
                  <div className="text-center pb-2 border-b border-brand-200">
                    <div className="w-8 h-8 rounded-full bg-terracotta-100 text-terracotta-700 flex items-center justify-center font-bold text-xs mx-auto mb-0.5">
                      WS
                    </div>
                    <span className="text-[11px] font-bold text-charcoal-900 block">
                      WeaveStudio
                    </span>
                    <span className="text-[9px] text-charcoal-400">SMS Verification</span>
                  </div>

                  {/* SMS Bubble */}
                  <div className="my-auto">
                    <span className="text-[9px] text-charcoal-400 text-center block mb-1">
                      Today 2:45 PM
                    </span>
                    <div className="bg-white p-3.5 rounded-2xl rounded-bl-sm border border-brand-200/80 shadow-sm text-xs text-charcoal-800 leading-relaxed font-sans">
                      {previewBody}
                    </div>
                  </div>

                  {/* Phone keyboard placeholder */}
                  <div className="text-center pt-2 border-t border-brand-200 text-[10px] text-charcoal-400">
                    Text message • Delivered
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: NOTIFICATION HISTORY */}
      {/* ======================================================== */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-brand-200 shadow-soft overflow-hidden space-y-4 p-5">
          {/* Search & Channel Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="text"
                placeholder="Search history by patron name, email, order reference..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={historyChannel}
                onChange={(e) => setHistoryChannel(e.target.value)}
                className="text-xs bg-brand-50/70 border border-brand-200 rounded-2xl px-3 py-2 text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              >
                <option value="ALL">All Channels</option>
                <option value="EMAIL">Email Letters Only</option>
                <option value="SMS">SMS Texts Only</option>
              </select>
            </div>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-50/80 border-b border-brand-200 text-[11px] font-semibold uppercase tracking-wider text-charcoal-600">
                  <th className="py-3 px-4 pl-6">ID & Date</th>
                  <th className="py-3 px-4">Patron Recipient</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Template / Purpose</th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4 pr-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100 text-xs">
                {filteredHistory.map((notif) => (
                  <tr key={notif.id} className="hover:bg-brand-50/40 transition-colors">
                    <td className="py-3 px-4 pl-6">
                      <span className="font-mono font-semibold text-charcoal-800 block text-[11px]">
                        {notif.id}
                      </span>
                      <span className="text-[10px] text-charcoal-400">
                        {new Date(notif.sentAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-charcoal-900 block">
                        {notif.customerName}
                      </span>
                      <span className="text-[10px] text-charcoal-400">
                        {notif.channel === 'EMAIL' ? notif.customerEmail : notif.customerPhone}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {notif.channel === 'EMAIL' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Mail className="w-3 h-3" />
                          Email
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <Smartphone className="w-3 h-3" />
                          SMS
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-medium text-charcoal-700">
                      {notif.templateName}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-terracotta-700 font-semibold">
                      #{notif.orderId}
                    </td>

                    <td className="py-3 px-4 pr-6 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sage-800 bg-sage-50 px-2.5 py-0.5 rounded-full border border-sage-200">
                        <CheckCircle2 className="w-3 h-3 text-sage-600" />
                        Delivered
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-charcoal-400 text-xs">
                      No notifications logged matching query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MESSAGE TEMPLATES */}
      {/* ======================================================== */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-charcoal-500">
              Customize automated milestone copy sent across order lifecycles.
            </span>
            <button
              onClick={openNewTemplate}
              className="flex items-center gap-1.5 bg-charcoal-900 hover:bg-terracotta-600 text-white px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all shadow-soft"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Template</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white rounded-3xl p-5 border border-brand-200 shadow-soft flex flex-col justify-between space-y-4 hover:shadow-card transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-charcoal-700 text-[10px] font-semibold">
                      {tpl.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditTemplate(tpl)}
                        className="p-1.5 rounded-xl text-charcoal-400 hover:text-charcoal-900 hover:bg-brand-100 transition-colors"
                        title="Edit template"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete template "${tpl.name}"?`)) {
                            deleteTemplate(tpl.id);
                            toast.success('Template removed');
                          }
                        }}
                        className="p-1.5 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-sm text-charcoal-900">
                    {tpl.name}
                  </h3>

                  {tpl.subject && (
                    <p className="text-[11px] font-medium text-terracotta-700 mt-1 truncate">
                      Subject: {tpl.subject}
                    </p>
                  )}

                  <div className="mt-3 p-3 bg-brand-50/70 rounded-2xl border border-brand-100 text-[11px] text-charcoal-600 font-mono whitespace-pre-line line-clamp-4">
                    {tpl.emailBody || tpl.smsText}
                  </div>
                </div>

                <div className="pt-3 border-t border-brand-100 flex items-center justify-between">
                  <span className="text-[10px] text-charcoal-400">
                    ID: {tpl.id}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedTemplateId(tpl.id);
                      setActiveTab('compose');
                    }}
                    className="text-xs font-semibold text-terracotta-600 hover:underline flex items-center gap-1"
                  >
                    <span>Use in Composer</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TEMPLATE EDIT / CREATE MODAL */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-brand-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-lg font-bold text-charcoal-900">
              {editingTemplate ? 'Edit Milestone Template' : 'Create New Template'}
            </h3>

            <form onSubmit={handleSaveTemplate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={tplForm.name}
                  onChange={(e) => setTplForm({ ...tplForm, name: e.target.value })}
                  placeholder="e.g. Needlework Delay Notice, Festive Packaging"
                  className="w-full text-xs px-3 py-2 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={tplForm.category}
                  onChange={(e) => setTplForm({ ...tplForm, category: e.target.value })}
                  placeholder="e.g. Shipping, Crafting, Festive"
                  className="w-full text-xs px-3 py-2 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={tplForm.subject}
                  onChange={(e) => setTplForm({ ...tplForm, subject: e.target.value })}
                  placeholder="WeaveStudio — Handcrafted Update #{{order_id}}"
                  className="w-full text-xs px-3 py-2 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                  Email Body (Markdown / Plain Text)
                </label>
                <textarea
                  rows={4}
                  value={tplForm.emailBody}
                  onChange={(e) => setTplForm({ ...tplForm, emailBody: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900 font-mono text-[11px] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                  SMS Message Body
                </label>
                <textarea
                  rows={2}
                  value={tplForm.smsText}
                  onChange={(e) => setTplForm({ ...tplForm, smsText: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-charcoal-900 font-mono text-[11px] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-brand-100">
                <button
                  type="submit"
                  className="flex-1 bg-charcoal-900 hover:bg-terracotta-600 text-white py-2.5 rounded-2xl text-xs font-semibold shadow-soft transition-colors"
                >
                  Save Template
                </button>
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2.5 border border-brand-300 rounded-2xl text-xs font-medium text-charcoal-700 hover:bg-brand-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NotificationCenterPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-charcoal-400">
          Loading Notification Center...
        </div>
      }
    >
      <NotificationCenterInner />
    </Suspense>
  );
}
