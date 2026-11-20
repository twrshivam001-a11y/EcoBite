import React from 'react';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Truck,
  XCircle,
  Star,
  RotateCcw,
  ReceiptText,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { MEALS } from '../data/catalog';
import { Order, OrderStatus } from '../types';

function getStatusMeta(status: OrderStatus): {
  label: string;
  textClass: string;
  Icon: React.FC<{ className?: string }>;
} {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmed', textClass: 'text-[#166534]', Icon: Clock };
    case 'preparing':
      return { label: 'Cooking in Home Kitchen', textClass: 'text-amber-700', Icon: ChefHat };
    case 'out_for_delivery':
      return { label: 'Out for Delivery', textClass: 'text-[#EA580C]', Icon: Truck };
    case 'delivered':
      return { label: 'Delivered', textClass: 'text-[#166534]', Icon: CheckCircle2 };
    case 'cancelled':
      return { label: 'Cancelled', textClass: 'text-stone-500', Icon: XCircle };
  }
}

export const OrdersPage: React.FC = () => {
  const {
    orders,
    feedbackList,
    dataLoading,
    cancelOrder,
    setFeedbackTargetOrder,
    setIsGeneralFeedbackOpen,
    addToCart,
    setIsCartOpen,
    setActiveTab,
  } = useAppData();

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      const meal = MEALS.find((m) => m.id === item.mealId);
      if (meal) {
        for (let i = 0; i < item.quantity; i += 1) {
          addToCart(meal);
        }
      }
    });
    setIsCartOpen(true);
  };

  if (dataLoading) {
    return (
      <div className="py-16 text-center text-sm text-stone-500">
        Loading your EcoBite orders...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
            Your Meal Orders
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Track live kitchen status, reorder favorites, and rate your meals.
          </p>
        </div>
        <button
          onClick={() => setIsGeneralFeedbackOpen(true)}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Star className="w-4 h-4 text-amber-500" />
          Share Pilot Feedback
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-3">
            <ReceiptText className="w-6 h-6" />
          </div>
          <h2 className="font-display text-lg font-semibold text-stone-900">No orders placed yet</h2>
          <p className="mt-1 text-sm text-stone-500 max-w-sm mx-auto">
            Start with our ₹100 Classic Home Thali trial meal for Lunch or Dinner today.
          </p>
          <button
            onClick={() => setActiveTab('menu')}
            className="mt-5 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Explore Today&apos;s Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const { label, textClass, Icon } = getStatusMeta(order.status);
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <article
                key={order.id}
                className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="font-mono font-semibold text-stone-800">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{order.slot} slot</span>
                    <span aria-hidden="true">·</span>
                    <span>{dateStr}</span>
                  </div>

                  <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${textClass}`}>
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <p key={item.mealId} className="text-sm font-semibold text-stone-900">
                        <span className="font-mono tabular-nums">{item.quantity}×</span> {item.name}
                      </p>
                    ))}
                    <p className="text-xs text-stone-500">
                      {order.area} · {order.address} ·{' '}
                      {order.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <p className="font-mono text-lg font-bold text-stone-900 tabular-nums">
                      ₹{order.totalAmount}
                    </p>
                    {order.isTrialOrder && (
                      <p className="text-[11px] font-medium text-[#166534]">Trial Meal Order</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  {order.status !== 'cancelled' && !order.hasFeedback && (
                    <button
                      onClick={() => setFeedbackTargetOrder(order)}
                      className="min-h-[40px] px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      Rate Your Meal
                    </button>
                  )}

                  {order.hasFeedback && (
                    <span className="text-xs font-medium text-[#166534] inline-flex items-center gap-1 px-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Rated · Thank you!
                    </span>
                  )}

                  <button
                    onClick={() => handleReorder(order)}
                    className="min-h-[40px] px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reorder
                  </button>

                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium text-red-700 hover:bg-red-50 cursor-pointer ml-auto"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Recent Submitted Reviews */}
      {feedbackList.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-stone-900">Your Submitted Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbackList.map((fb) => (
              <div key={fb.id} className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-stone-900 truncate">{fb.mealName}</p>
                  <span className="font-mono text-xs font-semibold text-amber-700 tabular-nums shrink-0">
                    Taste {fb.tasteRating}/5 · Hygiene {fb.hygieneRating}/5
                  </span>
                </div>
                {fb.comment && <p className="text-xs text-stone-600 leading-relaxed">{fb.comment}</p>}
                <p className="text-[11px] text-stone-500">
                  Order again: {fb.wouldOrderAgain ? 'Yes' : 'Needs improvement'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
