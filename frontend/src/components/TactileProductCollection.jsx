'use client';

import { useState, useEffect } from 'react';
import { Reorder } from 'framer-motion';
import {
  Shuffle,
  Compass,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/LoadingSpinner';

const ROTATIONS = [-3.2, 2.4, -2.0, 3.5, -1.8, 2.8, -3.8, 1.8, -2.5, 3.0, -1.5, 2.2];

export default function TactileProductCollection({
  backendProducts = [],
  loading = false,
  onQuickView,
}) {
  // Purely use products from BE
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [straightened, setStraightened] = useState(false);
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  const [sortBy, setSortBy] = useState('curated');

  // Synchronize strictly with backend products whenever they update
  useEffect(() => {
    if (backendProducts && backendProducts.length > 0) {
      setItems(
        backendProducts.map((p, idx) => ({
          ...p,
          rotation: ROTATIONS[idx % ROTATIONS.length],
        }))
      );
    } else {
      setItems([]);
    }
  }, [backendProducts]);

  // Derive unique categories dynamically from the real Backend products
  const categories = ['All', ...Array.from(new Set(items.map((p) => p.category).filter(Boolean)))];

  // Filter items by category
  const filteredItems = items.filter((item) => {
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  });

  // Sort items
  const displayedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    return 0; // Natural backend/dragged order
  });

  // Scatter / Shuffle natural tilts
  const handleShuffleRotations = () => {
    setStraightened(false);
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        rotation: Math.random() * 7 - 3.5, // Between -3.5° and +3.5°
      }))
    );
  };

  // Toggle straighten cards to 0°
  const handleToggleStraighten = () => {
    setStraightened((prev) => !prev);
  };

  // Reset order to initial backend response
  const handleResetOrder = () => {
    if (backendProducts && backendProducts.length > 0) {
      setItems(
        backendProducts.map((p, idx) => ({
          ...p,
          rotation: ROTATIONS[idx % ROTATIONS.length],
        }))
      );
    }
    setStraightened(false);
    setActiveCategory('All');
  };

  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background Tabletop Environment */}
      <div className="absolute inset-0 bg-[#FAF8F5]/80 pointer-events-none -z-10 rounded-3xl" />
      <div className="absolute top-12 left-1/3 w-80 h-80 bg-terracotta-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-sage-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-brand-200/90 text-charcoal-800 text-[11px] font-semibold mb-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse" />
            <span className="tracking-wide">Atelier Tabletop • Interactive Collection</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 tracking-tight">
            Curated on the Artisan Desk
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-2 max-w-xl leading-relaxed">
            Click & hold any handcrafted piece to pick it up, drag it across the tabletop surface, and arrange the collection to your liking.
          </p>
        </div>

        {/* Tactile Control Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleShuffleRotations}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-brand-200 text-charcoal-700 hover:text-charcoal-900 hover:border-brand-300 text-xs font-semibold shadow-xs hover:shadow-soft transition-all active:scale-95"
            title="Scatter cards with casual physical tilts"
          >
            <Shuffle className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Casual Scatter</span>
          </button>

          <button
            onClick={handleToggleStraighten}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-semibold shadow-xs transition-all active:scale-95 ${
              straightened
                ? 'bg-charcoal-900 text-white border-charcoal-900'
                : 'bg-white border-brand-200 text-charcoal-700 hover:text-charcoal-900'
            }`}
            title="Align cards to 0° angle"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{straightened ? 'Angled Layout' : 'Straighten Table'}</span>
          </button>

          <button
            onClick={handleResetOrder}
            className="p-2 rounded-2xl bg-white border border-brand-200 text-charcoal-500 hover:text-charcoal-900 shadow-xs hover:shadow-soft transition-all active:scale-95"
            title="Reset to default arrangement"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Craft Category Filters & Sorting Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-3 bg-white/90 backdrop-blur-sm rounded-3xl border border-brand-200/80 shadow-soft mb-8">
        {/* Dynamic Category Pills from Backend */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {categories.map((cat) => {
            const count =
              cat === 'All'
                ? items.length
                : items.filter((it) => it.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeCategory === cat
                    ? 'bg-charcoal-900 text-white shadow-xs'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-brand-100/70'
                }`}
              >
                <span>{cat === 'All' ? 'All Pieces' : cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeCategory === cat
                      ? 'bg-white/20 text-white'
                      : 'bg-brand-100 text-charcoal-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-charcoal-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-xs font-semibold text-charcoal-700 py-1 px-2 border-0 focus:ring-0 cursor-pointer"
          >
            <option value="curated">Curated Arrangement</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : displayedItems.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 bg-white rounded-3xl border border-brand-200/80 p-8 shadow-soft">
          <p className="font-serif text-lg font-bold text-charcoal-800">
            No creations found in this category
          </p>
          <button
            onClick={() => setActiveCategory('All')}
            className="mt-4 px-5 py-2 rounded-full bg-charcoal-900 text-white text-xs font-semibold hover:bg-terracotta-600 transition-colors"
          >
            Show All Creations
          </button>
        </div>
      ) : (
        /* Physical Tabletop Grid with Framer Motion Reordering */
        <div className="relative">
          <Reorder.Group
            axis="y"
            values={displayedItems}
            onReorder={(newOrder) => {
              setItems((prev) => {
                if (activeCategory === 'All') return newOrder;
                const rest = prev.filter((p) => p.category !== activeCategory);
                return [...newOrder, ...rest];
              });
            }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7 pt-2 pb-8"
          >
            {displayedItems.map((product, idx) => {
              const baseTilt = straightened
                ? 0
                : product.rotation ?? (idx % 2 === 0 ? -2.5 : 2.0);

              const staggerClass =
                idx % 4 === 1
                  ? 'sm:translate-y-2'
                  : idx % 4 === 3
                  ? 'sm:translate-y-3'
                  : '';

              return (
                <Reorder.Item
                  key={product._id}
                  value={product}
                  dragListener={true}
                  onDragStart={() => setIsDraggingAny(true)}
                  onDragEnd={() => setIsDraggingAny(false)}
                  className={`touch-manipulation focus:outline-none ${staggerClass}`}
                  whileDrag={{
                    scale: 1.05,
                    zIndex: 70,
                    boxShadow:
                      '0 25px 40px -10px rgba(26, 23, 19, 0.28), 0 12px 18px -6px rgba(26, 23, 19, 0.18)',
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 25,
                  }}
                >
                  <ProductCard
                    product={product}
                    badge={product.badge}
                    onQuickView={onQuickView}
                    rotation={baseTilt}
                    isMovable={true}
                    isDragging={isDraggingAny}
                  />
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>
      )}

      {/* Helpful Tabletop Interaction Caption */}
      <div className="mt-4 text-center">
        <p className="text-[11px] text-charcoal-400 tracking-wide font-sans">
          Tip: Click and hold any creation to lift it from the table and reposition anywhere in the collection.
        </p>
      </div>
    </section>
  );
}
