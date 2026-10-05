'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Heart,
  Clock,
  ShieldCheck,
  Gift,
  Star,
  SlidersHorizontal,
  ChevronRight,
  CheckCircle2,
  MessageCircle,
  Flower2,
  Feather,
  Palette,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import TactileProductCollection from '@/components/TactileProductCollection';
import LoadingSpinner, { ProductGridSkeleton } from '@/components/LoadingSpinner';
import QuickViewModal from '@/components/QuickViewModal';
import { getProducts, getCategories } from '@/lib/api';

const FEATURED_CATEGORIES = [
  {
    name: 'Flowers',
    title: 'Crochet Roses & Flowers',
    description: 'Everlasting blooms that never fade or wilt',
    image: '/categories/crochet-flowers.jpg',
    count: 'From ₹199',
  },
  {
    name: 'Hair Accessories',
    title: 'Hair Clips & Pins',
    description: 'Intricately stitched floral clips on gold-tone alligator grips',
    image: '/categories/hair-clips.jpg',
    count: 'From ₹349',
  },
  {
    name: 'Garlands',
    title: 'Everlasting Pooja Garlands',
    description: 'Sacred red, white & yellow garlands for temple & home',
    image: '/categories/pooja-garlands.jpg',
    count: 'From ₹799',
  },
  {
    name: 'Keychains',
    title: 'Handmade Keychains',
    description: 'Adorable floral, alphabet & amigurumi charm keyrings',
    image: '/categories/keychains.jpg',
    count: 'From ₹149',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The pink crochet rose is breathtaking in person! You can truly see the artisan needlework and care in every petal. It sits beautifully on my study desk.',
    author: 'Ananya S.',
    location: 'Bengaluru',
    rating: 5,
    item: 'Pink Crochet Rose',
  },
  {
    quote:
      'Ordered the traditional pooja garland for our housewarming. Our guests could not believe it was completely hand-crocheted! It looks magnificent on our deity.',
    author: 'Priya R.',
    location: 'Hyderabad',
    rating: 5,
    item: 'Crochet Flower Garland',
  },
  {
    quote:
      'The sunflower clip is so sturdy and doesn’t tug my daughter’s hair at all. The colors are cheerful and vibrant. Packing was like a luxury gift box.',
    author: 'Meera K.',
    location: 'Mumbai',
    rating: 5,
    item: 'Sunflower Hair Clip',
  },
];

const FAQS = [
  {
    q: 'How do I care for my handmade crochet flowers and clips?',
    a: 'Our crochet pieces are crafted from premium cotton & wool yarns. Keep them away from heavy moisture. For dust, simply dab gently with a soft dry cloth. If needed, spot clean with mild detergent and lay flat to dry in shade.',
  },
  {
    q: 'Can I request custom colors or bridal garland sets?',
    a: 'Absolutely! We love crafting custom orders for weddings, celebrations, and thoughtful gifts. Click "Ask the Artisan" on WhatsApp with your color palette and we will handcraft it for you.',
  },
  {
    q: 'How long does handcrafting and delivery take?',
    a: 'Ready-to-ship pieces dispatch within 24–48 hours. Custom creations take 3–5 crafting days. Standard courier delivery across India takes 3–5 business days.',
  },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Load categories
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  // Load products
  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 50 };
    if (selectedCategory) params.category = selectedCategory;

    getProducts(params)
      .then((res) => {
        let prods = res.data.products || [];

        // Apply sorting
        if (sortBy === 'price-asc') {
          prods = [...prods].sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-desc') {
          prods = [...prods].sort((a, b) => b.price - a.price);
        } else if (sortBy === 'name') {
          prods = [...prods].sort((a, b) => a.name.localeCompare(b.name));
        }

        setProducts(prods);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, selectedCategory, sortBy]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1. ARTISTIC BOUTIQUE HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-100/50 via-[#FAF8F5] to-[#FAF8F5] pt-8 sm:pt-12 pb-10 sm:pb-12">
        {/* Soft atmospheric background shapes */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-terracotta-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-36 right-10 w-[300px] h-[300px] bg-sage-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Boutique Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-brand-200/90 shadow-soft">
                <Sparkles className="w-4 h-4 text-terracotta-500" />
                <span className="text-xs font-semibold text-charcoal-800 tracking-wide">
                  The Handcrafted Atelier • 2026 Collection
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-charcoal-900 leading-[1.1]">
                Woven with Care.{' '}
                <span className="italic font-normal text-terracotta-600 block sm:inline">
                  Made Uniquely
                </span>{' '}
                for You.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-xl text-charcoal-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Slowly crocheted flowers that never fade, heirloom pooja garlands, and botanical hair accessories.
                Each piece brings timeless human warmth into your hands.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/products"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-charcoal-900 hover:bg-terracotta-600 text-white font-semibold text-sm transition-all duration-300 shadow-soft hover:shadow-boutique flex items-center justify-center gap-2 group"
                >
                  <span>Explore Handmade Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="https://wa.me/919999999999?text=Hi%20WeaveStudio!%20I'd%20like%20to%20customize%20a%20handmade%20crochet%20item."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-brand-50 text-charcoal-800 border border-brand-300 font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-sage-600" />
                  <span>Custom Artisan Orders</span>
                </a>
              </div>

              {/* Micro Trust Stats */}
              <div className="pt-6 border-t border-brand-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-10 text-xs text-charcoal-600">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-sage-500" />
                  <span>100% Hand-Crocheted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-terracotta-500" />
                  <span>Eco Yarn Materials</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Heirloom Longevity</span>
                </div>
              </div>
            </div>

            {/* Right Artistic Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Showcase Card */}
                <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden shadow-elevated border-4 border-white bg-brand-100 group">
                  <Image
                    src="/artisan-craft.jpg"
                    alt="Handcrafted WeaveStudio Artisan Yarns & Needlework"
                    fill
                    priority
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 700px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold tracking-wider uppercase">
                      The Atelier Craft
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold mt-2">
                      Handcrafted Yarn & Needlework
                    </h3>
                    <p className="text-xs text-brand-100 mt-1">
                      Pure vibrant yarns spun and stitched into cherished heirloom pieces.
                    </p>
                  </div>
                </div>

                {/* Floating Artisan Badge */}
                <div className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-brand-200 shadow-boutique animate-float hidden sm:flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-terracotta-100 flex items-center justify-center text-terracotta-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-400 block">
                      Crafting Time
                    </span>
                    <span className="text-xs font-semibold text-charcoal-900">
                      3.5 Hours of Stitching
                    </span>
                  </div>
                </div>

                {/* Floating Rating Badge */}
                <div className="absolute -bottom-4 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-brand-200 shadow-boutique hidden sm:flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <Star className="w-5 h-5 fill-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs font-bold text-charcoal-900">
                      <span>4.9 / 5.0</span>
                      <span className="text-amber-500">★★★★★</span>
                    </div>
                    <span className="text-[10px] text-charcoal-500 font-medium">
                      Loved by 1,500+ homes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 sm:mt-12 pt-8 border-t border-brand-200/80">
            {/* 4 Interactive Boutique Highlight Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-5">
              <div className="group bg-white/85 hover:bg-white backdrop-blur-sm p-4 rounded-3xl border border-brand-200/80 hover:border-terracotta-300 shadow-soft hover:shadow-boutique transition-all duration-300 flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Flower2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-charcoal-900 group-hover:text-terracotta-600 transition-colors">
                    Everlasting Blooms
                  </h4>
                  <p className="text-[11px] text-charcoal-500 mt-0.5 leading-relaxed">
                    100% colourfast cotton & wool that never wilts or fades.
                  </p>
                </div>
              </div>

              <div className="group bg-white/85 hover:bg-white backdrop-blur-sm p-4 rounded-3xl border border-brand-200/80 hover:border-sage-300 shadow-soft hover:shadow-boutique transition-all duration-300 flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sage-50 text-sage-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Feather className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-charcoal-900 group-hover:text-sage-700 transition-colors">
                    Zero Mass Machinery
                  </h4>
                  <p className="text-[11px] text-charcoal-500 mt-0.5 leading-relaxed">
                    250+ hand-counted stitches per rose by skilled women makers.
                  </p>
                </div>
              </div>

              <div className="group bg-white/85 hover:bg-white backdrop-blur-sm p-4 rounded-3xl border border-brand-200/80 hover:border-amber-300 shadow-soft hover:shadow-boutique transition-all duration-300 flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-charcoal-900 group-hover:text-amber-700 transition-colors">
                    Wax-Sealed Gifting
                  </h4>
                  <p className="text-[11px] text-charcoal-500 mt-0.5 leading-relaxed">
                    Kraft box, botanical straw nest & personalized calligraphy note.
                  </p>
                </div>
              </div>

              <div className="group bg-white/85 hover:bg-white backdrop-blur-sm p-4 rounded-3xl border border-brand-200/80 hover:border-terracotta-300 shadow-soft hover:shadow-boutique transition-all duration-300 flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blush-50 text-terracotta-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-charcoal-900 group-hover:text-terracotta-600 transition-colors">
                    Tailored Palettes
                  </h4>
                  <p className="text-[11px] text-charcoal-500 mt-0.5 leading-relaxed">
                    Custom wedding colorways & bridal sets via WhatsApp chat.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Studio Ticker Bar */}
            <div className="bg-[#FAF3EB] rounded-2xl p-3 sm:px-4 border border-brand-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sage-600"></span>
                </span>
                <span className="font-bold text-charcoal-900 tracking-wide uppercase text-[10px]">
                  Atelier Live Status:
                </span>
                <span className="text-charcoal-700">
                  42 handcrafted creations currently on needles • Ships within 48h
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-charcoal-600">
                <span className="hidden md:inline text-charcoal-400">•</span>
                <span className="flex items-center gap-1 font-semibold text-terracotta-600">
                  <Sparkles className="w-3.5 h-3.5" /> Next Limited Drop: Friday 6 PM
                </span>
                <span className="text-charcoal-400">•</span>
                <Link
                  href="/products"
                  className="font-semibold text-charcoal-800 hover:text-terracotta-600 underline underline-offset-2"
                >
                  Browse All Drops →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CURATED ARTISAN CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
              The Artisan Catalog
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-1">
              Curated by Craft
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 group"
          >
            <span>Explore all categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group relative rounded-3xl overflow-hidden bg-white border border-brand-200/80 p-3 shadow-soft hover:shadow-boutique transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-[3/2] rounded-2xl overflow-hidden bg-brand-100">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-charcoal-900 shadow-sm">
                  {cat.count}
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-serif text-lg font-bold text-charcoal-900 group-hover:text-terracotta-600 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-charcoal-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-terracotta-600">
                  <span>Shop creations</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. TASTE SKILL INSPIRED MOVABLE TACTILE PRODUCT COLLECTION */}
      <TactileProductCollection
        backendProducts={products}
        loading={loading}
        onQuickView={(p) => setQuickViewProduct(p)}
      />

      {/* 4. MADE BY HAND — THE ARTISAN STORYTELLING DIFFERENTIATOR */}
      <section className="bg-[#FAF4ED] border-y border-brand-200/80 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Story Imagery Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-boutique border-4 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800"
                  alt="Artisan hands crocheting delicate rose flower"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 450px"
                />
              </div>

              {/* Artisan Note Callout */}
              <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-white p-5 rounded-3xl border border-brand-200 shadow-elevated max-w-xs">
                <p className="font-handwriting text-2xl text-terracotta-600 leading-tight">
                  “A machine makes thousands in an hour. We make one in half a day, with all our soul.”
                </p>
                <span className="block text-[11px] font-bold text-charcoal-400 uppercase tracking-widest mt-2">
                  — The WeaveStudio Collective
                </span>
              </div>
            </div>

            {/* Story Text */}
            <div className="lg:col-span-7 space-y-6 lg:pl-8">
              <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
                The Slow Craft Philosophy
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal-900 leading-tight">
                Made by Hand,{' '}
                <span className="italic font-normal text-terracotta-600">
                  Stitched with Soul
                </span>
              </h2>
              <p className="text-base text-charcoal-600 leading-relaxed font-normal">
                In an era of mass-produced plastic knick-knacks and throwaway goods, WeaveStudio was born out of deep reverence for patience and human artistry.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-charcoal-900 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-sage-600" />
                    <span>No Moulds, No Factories</span>
                  </div>
                  <p className="text-xs text-charcoal-500 leading-relaxed">
                    Every stitch is counted by hand with wooden and steel crochet hooks by skilled women artisans.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-charcoal-900 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-sage-600" />
                    <span>Heirloom Natural Yarns</span>
                  </div>
                  <p className="text-xs text-charcoal-500 leading-relaxed">
                    We select skin-friendly, high-grade cotton and wool yarns that resist fading and hold their shape for years.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-charcoal-900 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-sage-600" />
                    <span>Everlasting Beauty</span>
                  </div>
                  <p className="text-xs text-charcoal-500 leading-relaxed">
                    Unlike real flowers that wilt in 48 hours, our handmade crochet blooms remain forever fresh and vibrant.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-charcoal-900 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-sage-600" />
                    <span>Ethical Artisan Support</span>
                  </div>
                  <p className="text-xs text-charcoal-500 leading-relaxed">
                    Every purchase directly empowers independent women makers with fair wages and creative independence.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 underline underline-offset-4"
                >
                  <span>Read our full artisan story and workshop journey</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GIFT MODE & BRIDAL ORDERS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-4xl overflow-hidden bg-[#2D241E] text-white p-8 sm:p-14 shadow-elevated">
          {/* Subtle floral texture/glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-semibold backdrop-blur-md">
              <Gift className="w-3.5 h-3.5 text-terracotta-300" />
              <span>Gifting & Custom Collections</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
              Looking for a Thoughtful, Unforgettable Gift?
            </h2>

            <p className="text-sm sm:text-base text-brand-200/90 leading-relaxed">
              We package every gift order in our signature handmade gift boxes, nestled in dried botanical straw with a wax-sealed handwritten note. Perfect for birthdays, weddings, pooja favors, and cherished milestones.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link
                href="/products"
                className="px-7 py-3.5 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs sm:text-sm font-semibold transition-colors text-center shadow-soft"
              >
                Shop Gift Collection
              </Link>
              <a
                href="https://wa.me/919999999999?text=Hi%20WeaveStudio,%20I'd%20like%20to%20discuss%20bulk%20gifting%20or%20a%20bridal%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/20 transition-colors text-center"
              >
                Discuss Custom Wedding & Bulk Favors
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED REVIEWS & ARTISAN LOVE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
            Real Customer Words
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-1">
            Loved Across India
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-2">
            Read what our patrons say after unboxing their handmade WeaveStudio treasures.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-brand-200/80 p-6 sm:p-7 shadow-soft flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center text-amber-500 gap-1 text-sm">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed italic">
                  “{t.quote}”
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-brand-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-charcoal-900">{t.author}</h4>
                  <p className="text-[10px] text-charcoal-400">{t.location} • Verified Buyer</p>
                </div>
                <span className="text-[10px] font-semibold text-terracotta-600 bg-terracotta-50 px-2 py-0.5 rounded-full">
                  {t.item}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. ARTISAN FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
            Common Questions
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 mt-1">
            Care, Customization & Shipping
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-brand-200/80 p-5 sm:p-6 shadow-sm"
            >
              <h3 className="font-serif text-base sm:text-lg font-bold text-charcoal-900">
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 mt-2 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
