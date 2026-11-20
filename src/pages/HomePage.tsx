import React, { useEffect, useState } from 'react';
import {
  Clock,
  Leaf,
  ShieldCheck,
  Sparkles,
  ChefHat,
  ArrowRight,
  Star,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { HERO_THALI_IMAGE, MEALS } from '../data/catalog';
import { MealCard } from '../components/MealCard';

function getSlotCountdown(slot: 'lunch' | 'dinner'): {
  label: string;
  timeRemaining: string;
  deliveryWindow: string;
} {
  const now = new Date();
  const target = new Date(now);
  // Lunch cutoff: 11:00 AM | Dinner cutoff: 6:00 PM (18:00)
  const cutoffHour = slot === 'lunch' ? 11 : 18;
  target.setHours(cutoffHour, 0, 0, 0);

  let isTomorrow = false;
  if (now.getTime() >= target.getTime()) {
    target.setDate(target.getDate() + 1);
    isTomorrow = true;
  }

  const diffMs = Math.max(0, target.getTime() - now.getTime());
  const hrs = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    label: isTomorrow
      ? `Next ${slot === 'lunch' ? 'Lunch' : 'Dinner'} slot (Tomorrow)`
      : `Today's ${slot === 'lunch' ? 'Lunch' : 'Dinner'} cut-off in`,
    timeRemaining: `${pad(hrs)}h : ${pad(mins)}m : ${pad(secs)}s`,
    deliveryWindow: slot === 'lunch' ? '12:30 PM – 1:30 PM' : '7:30 PM – 8:30 PM',
  };
}

const TRUST_PILLARS = [
  {
    Icon: ChefHat,
    title: 'Prepared by Local Home Cooks',
    desc: 'Verified mothers and home chefs across Lucknow neighbourhoods.',
  },
  {
    Icon: Leaf,
    title: '100% Eco-Friendly Packaging',
    desc: 'Compostable sugarcane bagasse trays with zero plastic leakage.',
  },
  {
    Icon: Sparkles,
    title: 'Daily Fresh Ingredients',
    desc: 'Whole wheat atta, farm vegetables, and zero reused frying oil.',
  },
  {
    Icon: ShieldCheck,
    title: 'Hygienic Kitchens',
    desc: 'Weekly kitchen hygiene audits and FSSAI-registered home setups.',
  },
];

export const HomePage: React.FC = () => {
  const { profile } = useAuth();
  const {
    activeSlot,
    setActiveSlot,
    setActiveTab,
    addToCart,
    setIsCartOpen,
    orders,
    setFeedbackTargetOrder,
    setIsGeneralFeedbackOpen,
  } = useAppData();

  const [countdown, setCountdown] = useState(() => getSlotCountdown(activeSlot));
  const [heroImgErr, setHeroImgErr] = useState(false);

  useEffect(() => {
    setCountdown(getSlotCountdown(activeSlot));
    const timer = setInterval(() => {
      setCountdown(getSlotCountdown(activeSlot));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSlot]);

  const trialMeal = MEALS[0];
  const unratedOrder = orders.find((o) => o.status === 'delivered' && !o.hasFeedback);

  const handleOrderTrialNow = () => {
    addToCart(trialMeal);
    setIsCartOpen(true);
  };

  return (
    <div className="space-y-10 pb-8">
      {/* 1. Hero Split Showcase */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-[#166534] tracking-wide">
              Lucknow Student Kitchens · Delivering to {profile?.area || 'Gomti Nagar'}
            </p>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-stone-900 leading-[1.15] text-balance">
              Experience Home-Style Food at ₹100 – Order Your Trial Meal Today
            </h1>
            <p className="mt-3.5 text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl">
              Fresh, hygienic ghar-ka-khana cooked every morning by local Lucknow home chefs and
              delivered hot to your hostel or PG in biodegradable trays.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-stone-100 space-y-4">
            {/* Slot Toggle & Cut-off Timer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFAF7] border border-stone-200/80 rounded-xl p-3">
              <div className="inline-flex p-1 bg-stone-200/70 rounded-lg shrink-0">
                <button
                  onClick={() => setActiveSlot('lunch')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer min-h-[36px] ${
                    activeSlot === 'lunch'
                      ? 'bg-white text-[#166534] shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Lunch Slot
                </button>
                <button
                  onClick={() => setActiveSlot('dinner')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer min-h-[36px] ${
                    activeSlot === 'dinner'
                      ? 'bg-white text-[#166534] shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Dinner Slot
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-4 h-4 text-[#EA580C] shrink-0" />
                <div>
                  <span className="text-stone-500 block leading-tight">{countdown.label}</span>
                  <span className="font-mono font-semibold text-stone-900 tabular-nums">
                    {countdown.timeRemaining} · {countdown.deliveryWindow}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleOrderTrialNow}
                className="min-h-[48px] px-6 py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Order Trial Thali · ₹100</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('plans')}
                className="min-h-[48px] px-5 py-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                View Meal Plans
              </button>
            </div>
          </div>
        </div>

        {/* Hero 16:9 / Full-Height Photography */}
        <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-stone-200/90 bg-stone-100 min-h-[240px]">
          {!heroImgErr ? (
            <img
              src={HERO_THALI_IMAGE}
              alt="EcoBite Classic Home Thali packed in eco-friendly sugarcane bagasse tray"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgErr(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center p-8 text-center">
              <span className="font-display text-lg font-semibold text-[#166534]">
                EcoBite Classic Home Thali · ₹100
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 2. Why EcoBite Trust Strip */}
      <section aria-labelledby="why-ecobite-heading">
        <div className="flex items-baseline justify-between mb-4">
          <h2 id="why-ecobite-heading" className="font-display text-xl font-bold text-stone-900">
            Why Lucknow Students Switch to EcoBite
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRUST_PILLARS.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-2"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#166534] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-sm font-semibold text-stone-900">{title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Featured Today's Menu */}
      <section aria-labelledby="todays-menu-heading">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 id="todays-menu-heading" className="font-display text-xl sm:text-2xl font-bold text-stone-900">
              Today&apos;s {activeSlot === 'lunch' ? 'Lunch' : 'Dinner'} Menu
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Freshly prepared for {countdown.deliveryWindow} drop-off
            </p>
          </div>
          <button
            onClick={() => setActiveTab('menu')}
            className="text-sm font-semibold text-[#166534] hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>See all 4 meals</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MEALS.slice(0, 3).map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      </section>

      {/* 4. Pilot Feedback Prompt */}
      <section className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-stone-900">
              {unratedOrder
                ? `How was your ${unratedOrder.items[0]?.name || 'last meal'}?`
                : 'Tried an EcoBite meal during our Lucknow pilot?'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Share a 30-second rating on taste, hygiene, portion size, and student pricing.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (unratedOrder) {
              setFeedbackTargetOrder(unratedOrder);
            } else {
              setIsGeneralFeedbackOpen(true);
            }
          }}
          className="min-h-[44px] px-5 py-2.5 rounded-xl border border-[#166534] text-[#166534] hover:bg-emerald-50 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Rate Your Meal
        </button>
      </section>
    </div>
  );
};
