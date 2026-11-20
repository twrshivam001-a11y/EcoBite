import React, { useState } from 'react';
import { Plus, Minus, ShieldCheck, Utensils } from 'lucide-react';
import { MealItem } from '../types';
import { useAppData } from '../context/AppDataContext';
import { VegBadge } from './VegBadge';

export const MealCard: React.FC<{ meal: MealItem }> = ({ meal }) => {
  const { cart, addToCart, updateQuantity } = useAppData();
  const [imgError, setImgError] = useState(false);

  const inCart = cart.find((c) => c.meal.id === meal.id);
  const qty = inCart?.quantity || 0;

  return (
    <article className="group bg-white border border-stone-200/90 rounded-2xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5">
      {/* 4:3 Food Photography with CSS fallback */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        {!imgError ? (
          <img
            src={meal.image}
            alt={meal.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-stone-100 flex flex-col items-center justify-center p-6 text-center">
            <Utensils className="w-8 h-8 text-[#166534] mb-2 opacity-75" />
            <span className="text-sm font-medium text-stone-700">{meal.name}</span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Clean unboxed kicker + FSSAI veg/egg icon */}
        <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
          <div className="flex items-center gap-2 min-w-0">
            <VegBadge isVeg={meal.isVeg} />
            <span className="truncate font-medium text-emerald-800">{meal.kicker}</span>
          </div>
          <span className="tabular-nums shrink-0">{meal.calories}</span>
        </div>

        <h3 className="mt-2 font-display text-lg font-semibold text-stone-900 leading-snug">
          {meal.name}
        </h3>

        <p className="mt-1.5 text-sm text-stone-600 leading-relaxed line-clamp-2">
          {meal.description}
        </p>

        {/* Ingredients clean unboxed inline text */}
        <p className="mt-2.5 text-xs text-stone-500 leading-relaxed">
          <span className="font-medium text-stone-700">Includes:</span>{' '}
          {meal.ingredients.join(' · ')}
        </p>

        {/* Home Cook & Hygiene verification line */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-xs text-stone-600">
          <ShieldCheck className="w-4 h-4 text-[#166534] shrink-0" />
          <span className="truncate">
            Cook: <strong className="font-medium text-stone-800">{meal.cookName}</strong> · {meal.kitchenArea}
          </span>
        </div>

        {/* Price & Action row */}
        <div className="mt-auto pt-4 flex items-center justify-between gap-3">
          <div>
            <span className="font-mono text-xl font-semibold text-stone-900 tabular-nums">
              ₹{meal.price}
            </span>
            <span className="block text-[11px] text-stone-500">{meal.portionNote}</span>
          </div>

          {qty === 0 ? (
            <button
              onClick={() => addToCart(meal)}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 active:scale-[0.98]"
            >
              Add Meal
            </button>
          ) : (
            <div className="inline-flex items-center rounded-xl border border-[#166534] bg-emerald-50/70 overflow-hidden min-h-[44px]">
              <button
                onClick={() => updateQuantity(meal.id, qty - 1)}
                aria-label={`Remove one ${meal.name}`}
                className="min-w-[40px] min-h-[44px] flex items-center justify-center text-[#166534] hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-mono text-sm font-semibold text-[#166534] tabular-nums">
                {qty}
              </span>
              <button
                onClick={() => updateQuantity(meal.id, qty + 1)}
                aria-label={`Add one more ${meal.name}`}
                className="min-w-[40px] min-h-[44px] flex items-center justify-center text-[#166534] hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
