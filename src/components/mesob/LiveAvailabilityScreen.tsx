import React, { useState } from 'react';
import { useMesob } from '../../context/MesobContext';
import {
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { AvailabilityStatus } from '../../types/mesob';

export const LiveAvailabilityScreen: React.FC = () => {
  const {
    config,
    dishAvailability,
    setDishAvailability,
    getDishAvailability,
    navigateTo,
    getLocalizedDishName,
  } = useMesob();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredDishes = config.dishes.filter((dish) => {
    const matchesCategory =
      selectedCategory === 'all' || dish.categoryIds.includes(selectedCategory);
    const matchesSearch =
      dish.name.toLowerCase().includes(search.toLowerCase()) ||
      (dish.amharicName && dish.amharicName.includes(search));
    return matchesCategory && matchesSearch;
  });

  const soldOutCount = Object.values(dishAvailability).filter(
    (d) => d.status === 'sold_out' || d.status === 'temporary_unavailable'
  ).length;

  const handleResetAllToAvailable = () => {
    if (confirm('Reset all dishes to Available?')) {
      config.dishes.forEach((d) => {
        setDishAvailability(d.id, 'available');
      });
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-28 pt-3 px-4 max-w-lg mx-auto select-none font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 mb-3 border-b border-stone-800">
        <button
          onClick={() => navigateTo('/mesob/home')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-800 bg-stone-900 text-stone-300 hover:text-white text-xs font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Menu</span>
        </button>

        <div className="text-center">
          <h1 className="font-display text-lg text-gold-300 font-bold uppercase tracking-wider">
            Live Availability
          </h1>
          <span className="text-[10px] text-stone-400 font-mono">
            1-Tap Dish Stock Manager
          </span>
        </div>

        <button
          onClick={handleResetAllToAvailable}
          className="p-2 rounded-xl border border-stone-800 bg-stone-900 text-stone-400 hover:text-gold-300 transition-colors cursor-pointer"
          title="Reset all to Available"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-between mb-4 shadow-sm">
        <div>
          <span className="text-xs text-stone-400 block">Total Menu Items</span>
          <span className="text-lg font-bold font-mono text-stone-100">
            {config.dishes.length} Dishes
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-stone-400 block">Currently Sold Out</span>
          <span
            className={`text-lg font-bold font-mono ${
              soldOutCount > 0 ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {soldOutCount} Item{soldOutCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dish by English or Amharic name..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 placeholder-stone-500 text-xs focus:outline-none focus:border-gold-500"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl shrink-0 font-medium cursor-pointer transition-colors ${
            selectedCategory === 'all'
              ? 'bg-gold-500 text-obsidian-950 font-bold'
              : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-white'
          }`}
        >
          All Categories
        </button>
        {config.categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl shrink-0 font-medium cursor-pointer transition-colors ${
              selectedCategory === cat.id
                ? 'bg-gold-500 text-obsidian-950 font-bold'
                : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Dishes List with 1-Tap Availability Controls */}
      <div className="space-y-3">
        {filteredDishes.map((dish) => {
          const currentStatus = getDishAvailability(dish.id);
          const activeOverride = dishAvailability[dish.id];

          return (
            <div
              key={dish.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                currentStatus !== 'available'
                  ? 'border-red-500/50 bg-red-950/20'
                  : 'border-stone-800 bg-stone-900/60'
              }`}
            >
              {/* Dish info header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-3">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-12 h-12 rounded-xl object-cover border border-stone-800 shrink-0"
                  />
                  <div>
                    <h3 className="font-display font-semibold text-sm text-stone-100">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-gold-400 font-serif">
                      {dish.amharicName} • {dish.price} ETB
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block border ${
                      currentStatus === 'available'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : currentStatus === 'sold_out'
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {activeOverride?.label || 'Available'}
                  </span>
                </div>
              </div>

              {/* 1-Tap Control Buttons */}
              <div className="grid grid-cols-5 gap-1.5 pt-1 text-[11px] font-medium">
                {/* Available */}
                <button
                  onClick={() => setDishAvailability(dish.id, 'available')}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                    currentStatus === 'available'
                      ? 'bg-emerald-500 text-obsidian-950 font-bold border-emerald-400 shadow-sm'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-emerald-300'
                  }`}
                >
                  Available
                </button>

                {/* Sold Out Indefinitely */}
                <button
                  onClick={() => setDishAvailability(dish.id, 'sold_out')}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                    currentStatus === 'sold_out'
                      ? 'bg-red-500 text-white font-bold border-red-400 shadow-sm'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-red-300'
                  }`}
                >
                  Sold Out
                </button>

                {/* 30 Mins */}
                <button
                  onClick={() => setDishAvailability(dish.id, 'temporary_unavailable', 30)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                    activeOverride?.temporaryUntil &&
                    !activeOverride?.label?.includes('Today') &&
                    activeOverride?.label?.includes('30m')
                      ? 'bg-amber-500 text-obsidian-950 font-bold border-amber-400'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-amber-300'
                  }`}
                >
                  30 min
                </button>

                {/* 1 Hour */}
                <button
                  onClick={() => setDishAvailability(dish.id, 'temporary_unavailable', 60)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                    activeOverride?.temporaryUntil &&
                    !activeOverride?.label?.includes('Today') &&
                    activeOverride?.label?.includes('60m')
                      ? 'bg-amber-500 text-obsidian-950 font-bold border-amber-400'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-amber-300'
                  }`}
                >
                  1 hour
                </button>

                {/* Rest of Today */}
                <button
                  onClick={() => setDishAvailability(dish.id, 'temporary_unavailable', 'today')}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                    activeOverride?.temporaryUntil === 'today'
                      ? 'bg-amber-500 text-obsidian-950 font-bold border-amber-400'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-amber-300'
                  }`}
                >
                  Today
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
