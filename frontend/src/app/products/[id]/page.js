'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById } from '@/lib/api';
import useCartStore from '@/store/cartStore';
import { getImageUrl } from '@/lib/image';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    getProductById(id)
      .then((res) => setProduct(res.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-medium">Product not found</h2>
        <Link href="/" className="text-sm text-gray-500 underline mt-2 inline-block">
          Back to shop
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0
    ? product.images.map(getImageUrl)
    : ['/placeholder.svg'];

  const handleAddToCart = () => {
    addItem(product);
    toast.success('Added to cart');
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi! I'm interested in ${product.name} (₹${product.price})`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-black mb-6 inline-block">
        ← Back to shop
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="bg-gray-50 rounded-lg overflow-hidden aspect-[3/4] relative">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-20 rounded-md overflow-hidden relative border-2 ${
                    selectedImage === i ? 'border-black' : 'border-transparent'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">{product.category}</span>
          <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
          <p className="text-2xl font-semibold mt-4">₹{product.price.toLocaleString()}</p>

          <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>

          <p className="text-sm mt-4">
            {product.stock > 0 ? (
              <span className="text-green-600">In stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-500">Out of stock</span>
            )}
          </p>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-green-500 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
