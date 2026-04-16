'use client';

import Image from 'next/image';
import Link from 'next/link';
import useCartStore from '@/store/cartStore';
import { getImageUrl } from '@/lib/image';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success('Added to cart');
  };

  const imageUrl = getImageUrl(product.images?.[0]);

  return (
    <Link href={`/products/${product._id}`} className="group block">
      <div className="bg-gray-50 rounded-lg overflow-hidden aspect-[3/4] relative">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
        <p className="text-xs text-gray-500">{product.category}</p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">₹{product.price.toLocaleString()}</p>
          <button
            onClick={handleAddToCart}
            className="text-xs bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
