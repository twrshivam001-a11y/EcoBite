import React, { useState } from 'react';
import { Check, Pause, Play, Utensils, CalendarCheck } from 'lucide-react';
import { MEAL_PLANS } from '../data/catalog';
import { useAppData } from '../context/AppDataContext';
import { MealPlan, PlanSlotPreference } from '../types';

export const PlansPage: React.FC = () => {
  const {
    subscriptions,
    subscribeToPlan,
    toggleSubscriptionPause,
    redeemMealFromPlan,
    showToast,
  } = useAppData();

  const [preferredSlot, setPreferredSlot] = useState<PlanSlotPreference>('dinner');
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [busySubId, setBusySubId] = useState<string | null>(null);

  const activeSub = subscriptions.find((s) => s.status !== 'completed') || subscriptions[0];

  const handleSubscribe = async (plan: MealPlan) => {
    setBusyPlanId(plan.id);
    try {
      await subscribeToPlan(plan, preferredSlot);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Subscription failed.', 'error');
    } finally {
      setBusyPlanId(null);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
          Flexible Student Meal Plans
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Lock in ₹90–₹95 per meal with zero mess monotony. Skip or pause anytime before cut-off.
        </p>
      </div>

      {/* Active Subscription Tracker */}
      {activeSub && (
        <section className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#166534]">
                <CalendarCheck className="w-4 h-4" />
                <span>
                  {activeSub.status === 'active'
                    ? 'Active Plan'
                    : activeSub.status === 'paused'
                      ? 'Paused Plan'
                      : 'Completed Plan'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{activeSub.preferredSlot} slot</span>
              </div>
              <h2 className="mt-1 font-display text-xl font-bold text-stone-900">
                {activeSub.planName}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Delivering to {activeSub.area}, Lucknow
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="font-mono text-2xl font-bold text-[#166534] tabular-nums">
                {activeSub.remainingMeals} / {activeSub.totalMeals}
              </p>
              <p className="text-xs text-stone-500">meals remaining</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-2.5 w-full bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#166534] transition-all duration-300"
              style={{
                width: `${Math.round((activeSub.remainingMeals / activeSub.totalMeals) * 100)}%`,
              }}
            />
          </div>

          {activeSub.status !== 'completed' && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={async () => {
                  setBusySubId(activeSub.id);
                  try {
                    await redeemMealFromPlan(activeSub);
                  } finally {
                    setBusySubId(null);
                  }
                }}
                disabled={busySubId === activeSub.id || activeSub.status !== 'active' || activeSub.remainingMeals <= 0}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Utensils className="w-4 h-4" />
                Redeem 1 Meal for Next Slot
              </button>

              <button
                onClick={async () => {
                  setBusySubId(activeSub.id);
                  try {
                    await toggleSubscriptionPause(activeSub);
                  } finally {
                    setBusySubId(null);
                  }
                }}
                disabled={busySubId === activeSub.id}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                {activeSub.status === 'active' ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause Plan
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Resume Plan
                  </>
                )}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Preferred Slot Selector for New Subscriptions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-stone-200/80 rounded-2xl p-4">
        <div>
          <p className="text-sm font-semibold text-stone-900">Preferred Daily Delivery Slot</p>
          <p className="text-xs text-stone-500">
            Choose when you usually need your home-style meal delivered
          </p>
        </div>
        <div className="inline-flex p-1 bg-stone-200/70 rounded-xl shrink-0">
          {(['lunch', 'dinner', 'both'] as PlanSlotPreference[]).map((slot) => (
            <button
              key={slot}
              onClick={() => setPreferredSlot(slot)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                preferredSlot === slot
                  ? 'bg-white text-[#166534] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {slot === 'both' ? 'Lunch & Dinner' : slot}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {MEAL_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl p-6 flex flex-col justify-between border ${
              plan.recommended ? 'border-[#166534] ring-1 ring-[#166534]/15' : 'border-stone-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[#166534]">
                  {plan.recommended ? 'Most Popular · Matches ₹100 Target' : `${plan.mealsCount} Meals`}
                </span>
                <span className="font-mono text-stone-500 tabular-nums">Save ₹{plan.savings}</span>
              </div>

              <h3 className="mt-2 font-display text-xl font-bold text-stone-900">{plan.name}</h3>
              <p className="mt-1.5 text-sm text-stone-600">{plan.tagline}</p>

              <div className="mt-5 pb-5 border-b border-stone-100 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold text-stone-900 tabular-nums">
                  ₹{plan.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-stone-500 font-mono tabular-nums">
                  (₹{plan.perMealPrice}/meal)
                </span>
              </div>

              <ul className="mt-5 space-y-2.5">
                {plan.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                    <Check className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={busyPlanId === plan.id}
              className={`mt-6 w-full min-h-[48px] rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                plan.recommended
                  ? 'bg-[#EA580C] hover:bg-[#C2410C] text-white'
                  : 'bg-[#166534] hover:bg-[#14532D] text-white'
              } disabled:opacity-60`}
            >
              {busyPlanId === plan.id ? 'Activating Plan...' : `Activate ${plan.mealsCount}-Meal Plan`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
