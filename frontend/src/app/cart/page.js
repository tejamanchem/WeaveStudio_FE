'use client';

import Image from 'next/image';
import Link from 'next/link';
import useCartStore from '@/store/cartStore';
import { getImageUrl } from '@/lib/image';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getTotal = useCartStore((s) => s.getTotal);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-gray-500 mt-2">Add some items to get started.</p>
        <Link
          href="/"
          className="inline-block mt-6 bg-black text-white px-6 py-3 rounded-lg text-sm hover:bg-gray-800"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-4 bg-white border border-gray-100 rounded-lg p-4"
          >
            <div className="w-20 h-24 bg-gray-50 rounded-md overflow-hidden relative flex-shrink-0">
              <Image
                src={getImageUrl(item.images?.[0])}
                alt={item.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>

            <div className="flex-1 min-w-0">
              <Link href={`/products/${item._id}`} className="font-medium text-sm hover:underline truncate block">
                {item.name}
              </Link>
              <p className="text-sm text-gray-500 mt-0.5">₹{item.price.toLocaleString()}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="w-8 h-8 border rounded-md text-sm hover:bg-gray-50 disabled:opacity-30"
              >
                −
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                className="w-8 h-8 border rounded-md text-sm hover:bg-gray-50"
              >
                +
              </button>
            </div>

            <p className="font-semibold text-sm w-20 text-right">
              ₹{(item.price * item.quantity).toLocaleString()}
            </p>

            <button
              onClick={() => removeItem(item._id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Remove item"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">₹{getTotal().toLocaleString()}</p>
        </div>
        <Link
          href="/checkout"
          className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
