'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Star,
  ShoppingBag,
  ShieldCheck,
  Clock,
  Sparkles,
  Share2,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Truck,
  RotateCcw,
  Gift,
  Plus,
  Minus,
} from 'lucide-react';
import { getProductById, getProducts } from '@/lib/api';
import useCartStore from '@/store/cartStore';
import useWishlistStore from '@/store/wishlistStore';
import { getImageUrl } from '@/lib/image';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';

const DEFAULT_REVIEWS = [
  {
    name: 'Deepika M.',
    rating: 5,
    date: '2 days ago',
    comment:
      'Absolutely in love with the craftsmanship. The yarn quality is super soft and the stitching is immaculate. Arrived wrapped like a luxury gift!',
    verified: true,
  },
  {
    name: 'Sneha Verma',
    rating: 5,
    date: '1 week ago',
    comment:
      'I got this for my sister’s bridal hamper. She couldn’t stop admiring the detailing. Way more special than any mass-market accessory.',
    verified: true,
  },
  {
    name: 'Rohan N.',
    rating: 4,
    date: '2 weeks ago',
    comment:
      'Ordered as a gift. The colors match the photos exactly. Good packaging and fast shipping to Bangalore.',
    verified: true,
  },
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('craft'); // 'craft', 'materials', 'care', 'shipping'

  // Review modal state
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    setLoading(true);
    getProductById(id)
      .then((res) => {
        setProduct(res.data);
        // Fetch recommendations from same or general category
        if (res.data?.category) {
          getProducts({ category: res.data.category, limit: 4 })
            .then((r) => {
              setRelatedProducts(
                (r.data.products || []).filter((p) => p._id !== res.data._id)
              );
            })
            .catch(() => {});
        }
      })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner label="Fetching handcrafted creation details..." />;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-3xl font-bold text-charcoal-900">Creation not found</h2>
        <p className="text-sm text-charcoal-500 mt-2">
          This piece may have retired or the link is expired.
        </p>
        <Link
          href="/products"
          className="inline-block mt-6 px-6 py-3 rounded-full bg-charcoal-900 text-white text-xs font-semibold hover:bg-terracotta-600 transition-colors"
        >
          Return to Boutique Catalog
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product._id);
  const images =
    product.images?.length > 0
      ? product.images.map(getImageUrl)
      : ['/placeholder.svg'];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast.success(`Added ${quantity} ${quantity === 1 ? 'piece' : 'pieces'} to your bag`);
    openDrawer();
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    router.push('/checkout');
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this handmade ${product.name} on WeaveStudio`,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  const handleWishlistToggle = () => {
    const added = toggleWishlist(product);
    toast.success(added ? 'Saved to Wishlist' : 'Removed from Wishlist');
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    setReviews([
      {
        name: newReview.name,
        rating: Number(newReview.rating),
        date: 'Just now',
        comment: newReview.comment,
        verified: true,
      },
      ...reviews,
    ]);
    setReviewModalOpen(false);
    setNewReview({ name: '', rating: 5, comment: '' });
    toast.success('Thank you for sharing your artisan review!');
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20WeaveStudio!%20I'm%20interested%20in%20customizing%20${encodeURIComponent(
    product.name
  )}%20(₹${product.price})`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-charcoal-400 mb-8 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-charcoal-800">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-charcoal-800">
          Shop
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${encodeURIComponent(product.category)}`}
          className="hover:text-charcoal-800"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-charcoal-900 font-semibold truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-white border border-brand-200/80 shadow-soft">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 650px"
            />
            {/* Top Tag */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-semibold text-terracotta-600 shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Handcrafted Needlework
              </span>
            </div>
            {/* Wishlist floating toggle */}
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-4 right-4 p-3 rounded-full shadow-sm backdrop-blur-md transition-all ${
                isFavorited
                  ? 'bg-white text-terracotta-600 scale-105'
                  : 'bg-white/90 text-charcoal-500 hover:text-terracotta-600 hover:bg-white'
              }`}
              aria-label="Wishlist toggle"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-terracotta-600' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImage === i
                      ? 'border-terracotta-500 shadow-soft'
                      : 'border-transparent opacity-70 hover:opacity-100 bg-white'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}

          {/* Artisan Guarantee Grid */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="p-3.5 rounded-2xl bg-white border border-brand-200/70 text-center">
              <Clock className="w-4 h-4 text-terracotta-600 mx-auto mb-1" />
              <span className="block text-[11px] font-bold text-charcoal-900">~3.5 Hours</span>
              <span className="text-[10px] text-charcoal-400">Crafting Time</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-brand-200/70 text-center">
              <ShieldCheck className="w-4 h-4 text-sage-600 mx-auto mb-1" />
              <span className="block text-[11px] font-bold text-charcoal-900">100% Handspun</span>
              <span className="text-[10px] text-charcoal-400">Pure Yarn Grade</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-brand-200/70 text-center">
              <Gift className="w-4 h-4 text-blush-500 mx-auto mb-1" />
              <span className="block text-[11px] font-bold text-charcoal-900">Gift Boxed</span>
              <span className="text-[10px] text-charcoal-400">Artisan Packaging</span>
            </div>
          </div>
        </div>

        {/* Right: Product Buy Info (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest font-bold text-terracotta-600">
                {product.category}
              </span>
              <button
                onClick={handleShare}
                className="p-2 rounded-full text-charcoal-400 hover:text-charcoal-800 hover:bg-brand-100 transition-colors"
                title="Share piece"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & reviews badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-amber-500 text-sm">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
                <span className="ml-1.5 font-bold text-charcoal-800 text-xs">4.9</span>
              </div>
              <span className="text-charcoal-300">•</span>
              <a href="#reviews" className="text-xs text-charcoal-500 hover:underline">
                {reviews.length} artisan reviews
              </a>
              <span className="text-charcoal-300">•</span>
              <span className="text-xs text-sage-700 font-medium">Bestseller</span>
            </div>

            {/* Price Tag */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
                ₹{product.price.toLocaleString()}
              </span>
              {product.price > 300 && (
                <span className="text-sm text-charcoal-400 line-through">
                  ₹{Math.round(product.price * 1.25).toLocaleString()}
                </span>
              )}
              <span className="text-xs text-sage-700 font-semibold bg-sage-50 px-2 py-0.5 rounded-full">
                Free shipping over ₹999
              </span>
            </div>

            {/* Stock pill */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-sage-500 animate-pulse" />
              <span className="text-sage-800 font-semibold">
                {product.stock > 0
                  ? `In Stock & Ready to Ship (${product.stock} items available)`
                  : 'Handcrafted to order • Ships in 3–4 days'}
              </span>
            </div>

            {/* Description */}
            <div className="pt-2 text-charcoal-600 text-sm leading-relaxed">
              <p>{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="pt-4 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-brand-300 rounded-2xl bg-white px-3 py-1.5 shadow-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-1 text-charcoal-500 hover:text-charcoal-900 disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-charcoal-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 text-charcoal-500 hover:text-charcoal-900"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-charcoal-400">
                  Total: <strong className="text-charcoal-900">₹{(product.price * quantity).toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 py-4 px-6 rounded-2xl bg-charcoal-900 hover:bg-terracotta-600 text-white font-semibold text-sm transition-all duration-200 shadow-soft flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 py-4 px-6 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-sm transition-colors shadow-soft disabled:opacity-50"
                >
                  Instant Checkout
                </button>
              </div>

              {/* WhatsApp customization consultation */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-sage-50 hover:bg-sage-100 text-sage-800 border border-sage-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-sage-600" />
                <span>Need custom colors or wedding quantities? Chat with our Artisan</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-brand-200/70 space-y-2 text-xs text-charcoal-600">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-terracotta-500 shrink-0" />
                <span>Safe pan-India delivery with damage-proof gift packaging</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-sage-500 shrink-0" />
                <span>Handmade quality inspected before every parcel leaves our studio</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artisan Details Tabbed Section */}
      <section className="mt-16 pt-12 border-t border-brand-200/80">
        <div className="flex border-b border-brand-200 gap-6 sm:gap-10 overflow-x-auto text-sm font-semibold">
          {[
            { id: 'craft', label: 'Artisan Craft Process' },
            { id: 'materials', label: 'Yarn & Materials' },
            { id: 'care', label: 'Care & Longevity' },
            { id: 'shipping', label: 'Packaging & Delivery' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 whitespace-nowrap transition-colors relative ${
                activeTab === tab.id
                  ? 'text-terracotta-600 border-b-2 border-terracotta-600'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-8 max-w-3xl text-sm text-charcoal-700 leading-relaxed space-y-4">
          {activeTab === 'craft' && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">
                The Touch of Living Hands
              </h3>
              <p>
                Each {product.name} is shaped using hand-held ergonomic crochet hooks by skilled women artisans. From casting the first loop to weaving in the loose ends, every stitch requires intense concentration and rhythmic muscle memory.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-white rounded-2xl border border-brand-200/80">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-800">
                    Individual Character
                  </h4>
                  <p className="text-xs text-charcoal-500 mt-1">
                    Minor subtle variations in petal flare or leaf curves are natural testaments to genuine handmade creation.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-brand-200/80">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-800">
                    Artisan Empowerment
                  </h4>
                  <p className="text-xs text-charcoal-500 mt-1">
                    Your patronage provides fair livelihood support and celebrates generational Indian needlecraft skills.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-3">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">Selected Yarns & Findings</h3>
              <p>
                We use premium blended milk cotton and wool yarns known for silky sheen, breathability, and rich colourfast dyes. Metal findings (hair alligator clips, brooch pins) are nickel-free and electroplated in warm gold/rose-gold tones to prevent rusting.
              </p>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-3">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">How to Cherish Your Piece</h3>
              <p>
                To keep your crochet piece looking vibrant for years:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>Avoid prolonged soaking in water or rough machine washing.</li>
                <li>For light dust, blow gently or brush with a soft dry brush.</li>
                <li>If spot cleaning is required, dab with lukewarm water and a drop of gentle shampoo; reshape and air dry flat in shaded breeze.</li>
                <li>Do not iron directly or use chlorine bleach.</li>
              </ul>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">Boutique Packaging</h3>
              <p>
                Every WeaveStudio creation is cushioned in eco-friendly kraft paper or our signature craft box with dried flower sprigs and a handwritten artisan card. Orders over ₹999 ship free across all pin codes in India.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="reviews" className="mt-12 pt-12 border-t border-brand-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
              Customer Reviews ({reviews.length})
            </h2>
            <p className="text-xs text-charcoal-500 mt-1">
              Read authentic feedback from collectors and gift recipients
            </p>
          </div>
          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-white border border-brand-300 text-charcoal-800 text-xs font-semibold hover:bg-brand-100 transition-colors self-start sm:self-auto"
          >
            + Write an Artisan Review
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((rev, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-brand-200/80 p-6 shadow-soft space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center text-amber-500 gap-0.5 text-xs">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] text-charcoal-400">{rev.date}</span>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed italic">
                “{rev.comment}”
              </p>
              <div className="pt-3 border-t border-brand-100 flex items-center justify-between text-xs">
                <span className="font-bold text-charcoal-900">{rev.name}</span>
                {rev.verified && (
                  <span className="text-[10px] text-sage-700 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Related Creations (You May Also Love) */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-brand-200/80">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
                You May Also Love
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 mt-1">
                Complete Your Collection
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-terracotta-600 hover:underline flex items-center gap-1"
            >
              <span>Explore all</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Write a Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm">
          <div className="bg-[#FAF8F5] border border-brand-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-elevated">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-1">
              Share Your Review
            </h3>
            <p className="text-xs text-charcoal-500 mb-5">
              Tell other handmade lovers how you like your {product.name}
            </p>

            <form onSubmit={handleAddReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  placeholder="e.g. Radhika S."
                  className="w-full p-2.5 rounded-xl border border-brand-200 bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Rating</label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-200 bg-white"
                >
                  <option value="5">★★★★★ — 5 Stars (Exceptional Craft)</option>
                  <option value="4">★★★★☆ — 4 Stars (Very Good)</option>
                  <option value="3">★★★☆☆ — 3 Stars (Average)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Review</label>
                <textarea
                  required
                  rows={4}
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="How does the stitching and packaging feel? Where do you use it?"
                  className="w-full p-2.5 rounded-xl border border-brand-200 bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-100 text-charcoal-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-charcoal-900 text-white font-semibold hover:bg-terracotta-600 transition-colors"
                >
                  Post Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
