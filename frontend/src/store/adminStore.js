'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_TEMPLATES = [
  {
    id: 'tpl_order_confirmed',
    name: 'Order Confirmation',
    subject: 'WeaveStudio — Your Handcrafted Order #{{order_id}} is Confirmed ✨',
    smsText: 'Hi {{customer_name}}, thank you for choosing WeaveStudio! Your order #{{order_id}} for {{product_name}} is confirmed and our artisans are preparing your materials.',
    emailBody: `Hi {{customer_name}},

Thank you for supporting slow craft and choosing WeaveStudio!

Your order #{{order_id}} containing {{product_name}} (Total: ₹{{order_amount}}) has been received and confirmed. Our women artisans will begin needleworking your piece with love and dedication.

Every stitch is counted by hand, so please allow ~2 to 3 days for careful preparation. We will notify you as soon as your parcel is packed and dispatched.

With gratitude,
The WeaveStudio Atelier`,
    category: 'Confirmation',
  },
  {
    id: 'tpl_crafting_started',
    name: 'Crafting in Progress',
    subject: 'WeaveStudio — Our Artisans are Crafting Your Order #{{order_id}} 🪡',
    smsText: 'Hi {{customer_name}}, your piece {{product_name}} (Order #{{order_id}}) is currently on our crochet needles! Each stitch is crafted with care.',
    emailBody: `Dear {{customer_name}},

Exciting update! Your order #{{order_id}} is currently in our hands.

Our artisan is actively crafting your {{product_name}}. We use 100% fine cotton and soft wool yarns to shape every petal and loop to perfection. 

Thank you for choosing human artistry over factory mass production.

Warm regards,
WeaveStudio Artisan Collective`,
    category: 'Crafting',
  },
  {
    id: 'tpl_order_shipped',
    name: 'Order Shipped / Tracking',
    subject: 'WeaveStudio — Your Parcel is on the Way! #{{order_id}} 🚚',
    smsText: 'Hi {{customer_name}}, your WeaveStudio parcel #{{order_id}} has been shipped! Track delivery here: {{tracking_url}}',
    emailBody: `Hello {{customer_name}},

Great news! Your handcrafted order #{{order_id}} has been carefully inspected, cushioned in our signature kraft box, and handed over to our courier partner.

Your shipment is heading to:
{{delivery_address}}

You can monitor its journey live here:
{{tracking_url}}

We hope this handcrafted treasure brings lasting warmth to your home.

Warmly,
The WeaveStudio Team`,
    category: 'Shipping',
  },
  {
    id: 'tpl_order_delivered',
    name: 'Order Delivered',
    subject: 'WeaveStudio — Your Handmade Creation has Arrived 🌸',
    smsText: 'Hi {{customer_name}}, your WeaveStudio order #{{order_id}} has been delivered. We hope you cherish your {{product_name}}!',
    emailBody: `Dear {{customer_name}},

Your order #{{order_id}} has been successfully delivered!

We hope you love unwrapping your {{product_name}}. Each piece is uniquely shaped by living hands, making it one of a kind.

If you ever need tips on preserving your crochet pieces or wish to request custom colors, reply directly to this email or chat with our artisans on WhatsApp.

With heartfelt thanks,
WeaveStudio Atelier`,
    category: 'Delivered',
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-1001',
    customerName: 'Ananya S.',
    customerEmail: 'ananya@example.com',
    customerPhone: '+91 98765 43210',
    orderId: 'ORD-9821',
    productName: 'Pink Crochet Rose',
    channel: 'EMAIL',
    templateName: 'Order Shipped / Tracking',
    sentAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'DELIVERED',
  },
  {
    id: 'NOTIF-1002',
    customerName: 'Priya R.',
    customerEmail: 'priya@example.com',
    customerPhone: '+91 98222 11334',
    orderId: 'ORD-9820',
    productName: 'Crochet Flower Garland',
    channel: 'SMS',
    templateName: 'Crafting in Progress',
    sentAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    status: 'DELIVERED',
  },
];

const useAdminStore = create(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (val) => set({ sidebarCollapsed: val }),

      // Templates
      templates: DEFAULT_TEMPLATES,
      addTemplate: (tpl) =>
        set((s) => ({
          templates: [{ ...tpl, id: `tpl_${Date.now()}` }, ...s.templates],
        })),
      updateTemplate: (id, updated) =>
        set((s) => ({
          templates: s.templates.map((t) => (t.id === id ? { ...t, ...updated } : t)),
        })),
      deleteTemplate: (id) =>
        set((s) => ({
          templates: s.templates.filter((t) => t.id !== id),
        })),

      // Notification History
      notifications: INITIAL_NOTIFICATIONS,
      addNotification: (notif) =>
        set((s) => ({
          notifications: [
            {
              ...notif,
              id: `NOTIF-${Math.floor(1000 + Math.random() * 9000)}`,
              sentAt: new Date().toISOString(),
              status: 'SENT',
            },
            ...s.notifications,
          ],
        })),

      // Manual / extra customers
      customCustomers: [
        {
          id: 'CUST-01',
          name: 'Radhika Sharma',
          email: 'radhika@example.com',
          phone: '+91 98765 12345',
          address: 'Flat 402, Lotus Towers, Banjara Hills, Hyderabad - 500034',
          city: 'Hyderabad',
          pincode: '500034',
          status: 'Active',
          createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          notes: 'Loves rose gold hair clips and pooja garlands',
        },
        {
          id: 'CUST-02',
          name: 'Meera Kapoor',
          email: 'meera.k@example.com',
          phone: '+91 99887 66554',
          address: 'Villa 12, Palm Meadows, Whitefield, Bengaluru - 560066',
          city: 'Bengaluru',
          pincode: '560066',
          status: 'Active',
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          notes: 'Frequent buyer for wedding gift hampers',
        },
      ],
      addCustomer: (cust) =>
        set((s) => ({
          customCustomers: [
            {
              ...cust,
              id: `CUST-${Math.floor(10 + Math.random() * 90)}`,
              createdAt: new Date().toISOString(),
              status: cust.status || 'Active',
            },
            ...s.customCustomers,
          ],
        })),
      updateCustomer: (id, updated) =>
        set((s) => ({
          customCustomers: s.customCustomers.map((c) =>
            c.id === id ? { ...c, ...updated } : c
          ),
        })),
      deleteCustomer: (id) =>
        set((s) => ({
          customCustomers: s.customCustomers.filter((c) => c.id !== id),
        })),

      // Store settings
      settings: {
        storeName: 'WeaveStudio Atelier',
        tagline: 'Handmade. Woven with care. Made uniquely for you.',
        adminEmail: 'admin@weavestudio.com',
        whatsappPhone: '+91 99999 99999',
        supportEmail: 'contact@weavestudio.com',
        freeShippingThreshold: 999,
        standardDeliveryFee: 50,
        craftingLeadTimeDays: 3,
        autoSendConfirmation: true,
        autoSendTracking: true,
      },
      updateSettings: (newSettings) =>
        set((s) => ({ settings: { ...s.settings, ...newSettings } })),
    }),
    {
      name: 'weavestudio-admin-store-v2',
    }
  )
);

export default useAdminStore;
