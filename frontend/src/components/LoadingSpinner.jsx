'use client';

import { Sparkles } from 'lucide-react';

export default function LoadingSpinner({ label = 'Fetching handmade treasures...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative w-14 h-14">
        {/* Outer pulsating ring */}
        <div className="absolute inset-0 rounded-full border-2 border-brand-200 border-t-terracotta-500 animate-spin" />
        {/* Inner center motif */}
        <div className="absolute inset-2 rounded-full bg-brand-100 flex items-center justify-center text-terracotta-500">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-xs font-medium text-brand-700 tracking-wide">
        {label}
      </p>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-3xl border border-brand-200/70 p-3 sm:p-3.5 space-y-3 animate-pulse"
        >
          <div className="aspect-[4/5] bg-brand-100 rounded-2xl animate-shimmer" />
          <div className="space-y-2 py-1 px-1">
            <div className="h-3 bg-brand-100 rounded w-1/3" />
            <div className="h-4 bg-brand-200 rounded w-3/4" />
            <div className="h-4 bg-brand-100 rounded w-1/2 pt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
