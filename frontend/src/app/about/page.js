'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Heart,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-100 text-charcoal-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
            <span>The Artisan Atelier</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-charcoal-900 leading-tight">
            WeaveStudio was born from a desire for{' '}
            <span className="italic font-normal text-terracotta-600">patience</span> in a rushed world.
          </h1>

          <p className="text-base sm:text-lg text-charcoal-600 leading-relaxed font-normal">
            We believe that items in your home and accessories in your hair should possess a heartbeat.
            Each of our pieces is individually crocheted by hand using traditional needles, fine natural yarns, and honest human devotion.
          </p>
        </div>
      </section>

      {/* Visual Feature Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative aspect-[4/3] sm:aspect-[16/10] rounded-3xl overflow-hidden shadow-elevated border-4 border-white bg-brand-100">
            <Image
              src="/artisan-craft.jpg"
              alt="Artisan yarn and handmade crochet craft"
              fill
              unoptimized
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 800px"
            />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase tracking-widest font-bold text-terracotta-600">
              Our Founding Ethos
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 leading-tight">
              Why We Never Use Machines
            </h2>
            <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
              Industrial machinery can churn out thousands of synthetic flowers every hour. But machine goods lack subtlety—they lack the tension adjustments, the delicate curving of each petal, and the warmth of real hands.
            </p>
            <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
              When you unbox a WeaveStudio crochet rose or sunflower clip, you are receiving 3 to 5 hours of unbroken concentration from an artisan who takes immense pride in her craft.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-brand-200/80">
                <span className="font-serif text-2xl font-bold text-charcoal-900 block">100%</span>
                <span className="text-xs text-charcoal-500">Hand-crocheted & assembled</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-brand-200/80">
                <span className="font-serif text-2xl font-bold text-charcoal-900 block">0 Days</span>
                <span className="text-xs text-charcoal-500">To wilt — blooms last for years</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Craft */}
      <section className="bg-[#FAF4ED] border-y border-brand-200/80 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
              Our Commitments
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-1">
              The Four WeaveStudio Pillars
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-brand-200/80 shadow-soft space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal-900">Slow Craft</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                We never rush or cut corners. Every petal, loop, and bead is secured with triple-knot precision.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-brand-200/80 shadow-soft space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sage-50 text-sage-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal-900">Pure Yarns</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Carefully selected combed cotton and soft milk yarn with fade-proof vegetable and reactive dyes.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-brand-200/80 shadow-soft space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal-900">Fair Artisanship</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Direct income and flexible home-work livelihoods for women craftswomen across regional India.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-brand-200/80 shadow-soft space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blush-50 text-terracotta-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal-900">Everlasting Life</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Zero plastic waste or wilting flowers. Cherished heirlooms that can be kept for celebrations to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
            Ready to find your piece?
          </h2>
          <p className="text-sm text-charcoal-600">
            Browse our handmade drops or request a tailored palette for your special occasion.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/products"
              className="px-8 py-3.5 rounded-full bg-charcoal-900 hover:bg-terracotta-600 text-white text-xs sm:text-sm font-semibold transition-colors shadow-soft"
            >
              Shop All Creations
            </Link>
            <a
              href="https://wa.me/919999999999?text=Hi%20WeaveStudio!%20I'd%20like%20to%20discuss%20a%20custom%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-full bg-white border border-brand-300 text-charcoal-800 text-xs sm:text-sm font-semibold hover:bg-brand-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-sage-600" />
              <span>Ask the Artisan</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
