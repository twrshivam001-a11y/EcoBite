import React, { useMemo, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { MEALS } from '../data/catalog';
import { MealCard } from '../components/MealCard';
import { useAppData } from '../context/AppDataContext';

type MenuFilter = 'all' | 'veg' | 'protein';

export const MenuPage: React.FC = () => {
  const { activeSlot, setActiveSlot, cartCount, cartSubtotal, setIsCartOpen } = useAppData();
  const [filter, setFilter] = useState<MenuFilter>('all');

  const filteredMeals = useMemo(() => {
    if (filter === 'veg') return MEALS.filter((m) => m.isVeg);
    if (filter === 'protein') return MEALS.filter((m) => m.isHighProtein);
    return MEALS;
  }, [filter]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
            Today&apos;s Home-Style Menu
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Student-friendly portions cooked fresh by verified Lucknow home kitchens (₹80–₹120).
          </p>
        </div>

        {/* Slot & Dietary Filter Segmented Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex p-1 bg-stone-200/70 rounded-xl">
            <button
              onClick={() => setActiveSlot('lunch')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeSlot === 'lunch'
                  ? 'bg-white text-[#166534] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Lunch · 12:30 PM
            </button>
            <button
              onClick={() => setActiveSlot('dinner')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeSlot === 'dinner'
                  ? 'bg-white text-[#166534] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Dinner · 7:30 PM
            </button>
          </div>

          <div className="inline-flex p-1 bg-stone-200/70 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Meals
            </button>
            <button
              onClick={() => setFilter('veg')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'veg'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Pure Veg
            </button>
            <button
              onClick={() => setFilter('protein')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'protein'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              High-Protein
            </button>
          </div>
        </div>
      </div>

      {/* Meal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMeals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>

      {/* Inline Checkout Summary Card when tray has items */}
      {cartCount > 0 && (
        <div className="bg-[#166534] text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-emerald-200">
              Ready for {activeSlot === 'lunch' ? 'Lunch (12:30 PM)' : 'Dinner (7:30 PM)'} delivery
            </p>
            <p className="font-display text-lg font-semibold tabular-nums mt-0.5">
              {cartCount} {cartCount === 1 ? 'meal' : 'meals'} in tray · ₹{cartSubtotal}
            </p>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ShoppingBag className="w-4 h-4" />
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};
