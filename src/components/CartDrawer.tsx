import React, { useEffect, useState } from 'react';
import { X, Plus, Minus, Trash2, MessageCircle, CheckCircle2, MapPin } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { LUCKNOW_AREAS } from '../data/catalog';
import { LucknowArea, PaymentMethod } from '../types';
import { VegBadge } from './VegBadge';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    activeSlot,
    setActiveSlot,
    placeOrder,
    setActiveTab,
    showToast,
  } = useAppData();
  const { profile } = useAuth();

  const [area, setArea] = useState<LucknowArea>(profile?.area || 'Gomti Nagar');
  const [address, setAddress] = useState<string>(profile?.addressLine || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [applyReferralDiscount, setApplyReferralDiscount] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (profile) {
      setArea(profile.area);
      setAddress(profile.addressLine);
    }
  }, [profile]);

  if (!isCartOpen) return null;

  const discount = applyReferralDiscount && cartSubtotal >= 100 ? 25 : 0;
  const finalTotal = Math.max(0, cartSubtotal - discount);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (cart.length === 0) {
      setFormError('Add at least one meal to your tray first.');
      return;
    }
    if (address.trim().length < 4) {
      setFormError('Please enter your Hostel, PG, or room delivery address.');
      return;
    }

    setSubmitting(true);
    try {
      await placeOrder({
        slot: activeSlot,
        area,
        address,
        paymentMethod,
        notes,
        applyTrialDiscount: applyReferralDiscount,
      });
      setNotes('');
      setActiveTab('orders');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to confirm order.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppQuickOrder = () => {
    if (cart.length === 0) return;
    const itemLines = cart
      .map((c) => `• ${c.quantity}x ${c.meal.name} (₹${c.meal.price * c.quantity})`)
      .join('\n');

    const slotLabel = activeSlot === 'lunch' ? 'Lunch (12:30–1:30 PM)' : 'Dinner (7:30–8:30 PM)';
    const msg = [
      `Namaste EcoBite! I'd like to place a meal order:`,
      ``,
      itemLines,
      ``,
      `Slot: ${slotLabel}`,
      `Name: ${profile?.fullName || 'Student'}`,
      `Phone: ${profile?.phone || 'N/A'}`,
      `Area: ${area}`,
      `Address: ${address || 'Lucknow Hostel/PG'}`,
      `Payment: ${paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}`,
      `Total Payable: ₹${finalTotal}`,
    ].join('\n');

    const url = `https://wa.me/919839000000?text=${encodeURIComponent(msg)}`;
    window.location.href = url;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div
        className="w-full md:max-w-md bg-[#FAFAF7] h-full md:h-full mt-auto md:mt-0 rounded-t-3xl md:rounded-none flex flex-col shadow-2xl border-l border-stone-200 max-h-[92vh] md:max-h-screen"
        role="dialog"
        aria-label="Meal Tray and Checkout"
      >
        {/* Mobile Sheet Drag Handle */}
        <div className="md:hidden w-10 h-1.5 bg-stone-300 rounded-full mx-auto mt-3 shrink-0" />

        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="font-display text-lg font-semibold text-stone-900">Your Meal Tray</h2>
            <p className="text-xs text-stone-500">Freshly packed in zero-plastic bagasse</p>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close tray"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {cart.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-display text-base font-semibold text-stone-800">
                Your meal tray is empty
              </p>
              <p className="mt-1 text-sm text-stone-500">
                Pick a home-style thali or high-protein meal from today&apos;s menu.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setActiveTab('menu');
                }}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#166534] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#14532D] transition-colors cursor-pointer min-h-[44px]"
              >
                Browse Today&apos;s Menu
              </button>
            </div>
          ) : (
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-5">
              {/* Items List */}
              <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
                {cart.map(({ meal, quantity }) => (
                  <div key={meal.id} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <VegBadge isVeg={meal.isVeg} />
                        <p className="text-sm font-semibold text-stone-900 truncate">{meal.name}</p>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 tabular-nums">
                        ₹{meal.price} × {quantity} = ₹{meal.price * quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="inline-flex items-center rounded-lg border border-stone-200 bg-stone-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(meal.id, quantity - 1)}
                          aria-label="Decrease quantity"
                          className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-stone-200/60 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs font-semibold tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(meal.id, quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-stone-200/60 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(meal.id)}
                        aria-label="Remove item"
                        className="p-2 text-stone-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Slot Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Delivery Slot
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-stone-200/60 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveSlot('lunch')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-h-[44px] ${
                      activeSlot === 'lunch'
                        ? 'bg-white text-[#166534] shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Lunch · 12:30 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSlot('dinner')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-h-[44px] ${
                      activeSlot === 'dinner'
                        ? 'bg-white text-[#166534] shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Dinner · 7:30 PM
                  </button>
                </div>
              </div>

              {/* Hostel / PG Address */}
              <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                  <MapPin className="w-3.5 h-3.5 text-[#166534]" />
                  <span>Lucknow Delivery Address</span>
                </div>

                <div>
                  <label className="block text-xs text-stone-500 mb-1">Hostel / PG Area</label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value as LucknowArea)}
                    className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  >
                    {LUCKNOW_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}, Lucknow
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-stone-500 mb-1">
                    Hostel Name, Room No. or Landmark
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g., Shastri Hostel Room 104, near main gate"
                    required
                    className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-500 mb-1">
                    Kitchen Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Less spicy, call at hostel gate"
                    maxLength={200}
                    className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer min-h-[44px] ${
                      paymentMethod === 'upi'
                        ? 'border-[#166534] bg-emerald-50 text-[#166534]'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    UPI / QR on Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer min-h-[44px] ${
                      paymentMethod === 'cod'
                        ? 'border-[#166534] bg-emerald-50 text-[#166534]'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    Cash on Delivery
                  </button>
                </div>
              </div>

              {/* Referral ₹25 Credit Toggle */}
              {cartSubtotal >= 100 && (
                <label className="flex items-center justify-between gap-3 bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 cursor-pointer">
                  <div className="text-xs">
                    <p className="font-semibold text-emerald-950">Apply ₹25 Student Referral Credit</p>
                    <p className="text-emerald-800">Valid on orders ₹100 or above</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={applyReferralDiscount}
                    onChange={(e) => setApplyReferralDiscount(e.target.checked)}
                    className="w-4 h-4 accent-[#166534]"
                  />
                </label>
              )}

              {/* Bill Breakdown */}
              <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Meal Subtotal</span>
                  <span className="font-mono tabular-nums">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Hostel Delivery & Eco Packaging</span>
                  <span className="font-medium text-[#166534]">Free</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#166534]">
                    <span>Referral Discount</span>
                    <span className="font-mono tabular-nums">-₹{discount}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-100 flex justify-between font-semibold text-stone-900 text-base">
                  <span>Total Payable</span>
                  <span className="font-mono tabular-nums">₹{finalTotal}</span>
                </div>
              </div>

              {formError && (
                <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                  {formError}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Fixed Bottom Checkout Actions */}
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t border-stone-200 space-y-2.5 shrink-0 pb-safe">
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="w-full min-h-[48px] rounded-xl bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="tabular-nums">
                {submitting ? 'Confirming Order...' : `Confirm Order · ₹${finalTotal}`}
              </span>
            </button>
            <button
              type="button"
              onClick={handleWhatsAppQuickOrder}
              className="w-full min-h-[44px] rounded-xl border border-[#166534] text-[#166534] hover:bg-emerald-50 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              Quick Order via WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
