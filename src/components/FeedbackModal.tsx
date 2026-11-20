import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { MEALS } from '../data/catalog';

interface StarRowProps {
  label: string;
  hint: string;
  value: number;
  onChange: (val: number) => void;
}

const StarRow: React.FC<StarRowProps> = ({ label, hint, value, onChange }) => (
  <div className="flex items-center justify-between gap-3 py-2 border-b border-stone-100 last:border-0">
    <div className="min-w-0">
      <p className="text-sm font-medium text-stone-900">{label}</p>
      <p className="text-xs text-stone-500">{hint}</p>
    </div>
    <div className="flex items-center gap-1 shrink-0">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`Rate ${label} ${star} out of 5`}
          className="p-1.5 cursor-pointer transition-transform active:scale-90"
        >
          <Star
            className={`w-5 h-5 ${
              star <= value ? 'fill-amber-500 text-amber-500' : 'text-stone-300'
            }`}
          />
        </button>
      ))}
    </div>
  </div>
);

export const FeedbackModal: React.FC = () => {
  const {
    feedbackTargetOrder,
    setFeedbackTargetOrder,
    isGeneralFeedbackOpen,
    setIsGeneralFeedbackOpen,
    submitFeedback,
    showToast,
  } = useAppData();

  const isOpen = Boolean(feedbackTargetOrder || isGeneralFeedbackOpen);

  const [selectedMeal, setSelectedMeal] = useState(
    feedbackTargetOrder?.items[0]?.name || MEALS[0].name
  );
  const [tasteRating, setTasteRating] = useState(5);
  const [hygieneRating, setHygieneRating] = useState(5);
  const [portionRating, setPortionRating] = useState(4);
  const [priceRating, setPriceRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [wouldOrderAgain, setWouldOrderAgain] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const mealTitle = feedbackTargetOrder?.items[0]?.name || selectedMeal;

  const handleClose = () => {
    setFeedbackTargetOrder(null);
    setIsGeneralFeedbackOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitFeedback({
        orderId: feedbackTargetOrder ? feedbackTargetOrder.id : 'general_pilot',
        mealName: mealTitle,
        tasteRating,
        hygieneRating,
        portionRating,
        priceRating,
        deliveryRating,
        wouldOrderAgain,
        comment,
      });
      setComment('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save feedback', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-xs p-0 md:p-4">
      <div
        className="w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-2xl shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-label="Rate Your Meal"
      >
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-display text-lg font-semibold text-stone-900">
              Rate Your EcoBite Meal
            </h2>
            <p className="text-xs text-stone-500">
              Pilot validation feedback directly improves our Lucknow home kitchens
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close feedback form"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-500 hover:text-stone-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {feedbackTargetOrder ? (
            <div className="bg-[#FAFAF7] border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm">
              <span className="text-stone-500 text-xs block">Order #{feedbackTargetOrder.id.slice(-6).toUpperCase()}</span>
              <span className="font-semibold text-stone-900">{mealTitle}</span>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Which meal did you try?
              </label>
              <select
                value={selectedMeal}
                onChange={(e) => setSelectedMeal(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#166534]"
              >
                {MEALS.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} (₹{m.price})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-[#FAFAF7] border border-stone-200/80 rounded-2xl px-4 py-2">
            <StarRow
              label="Taste & Home-Style Feel"
              hint="Freshness, spices, rotis softness"
              value={tasteRating}
              onChange={setTasteRating}
            />
            <StarRow
              label="Hygiene & Eco Packaging"
              hint="Cleanliness, zero leakage"
              value={hygieneRating}
              onChange={setHygieneRating}
            />
            <StarRow
              label="Portion Size"
              hint="Was it filling for one meal?"
              value={portionRating}
              onChange={setPortionRating}
            />
            <StarRow
              label="Price Value"
              hint="Worth ₹80–₹120 for students?"
              value={priceRating}
              onChange={setPriceRating}
            />
            <StarRow
              label="Delivery Time"
              hint="On-time arrival at hostel/PG"
              value={deliveryRating}
              onChange={setDeliveryRating}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Would you order EcoBite again?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWouldOrderAgain(true)}
                className={`min-h-[44px] rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                  wouldOrderAgain
                    ? 'border-[#166534] bg-emerald-50 text-[#166534]'
                    : 'border-stone-200 bg-white text-stone-600'
                }`}
              >
                Yes, definitely
              </button>
              <button
                type="button"
                onClick={() => setWouldOrderAgain(false)}
                className={`min-h-[44px] rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                  !wouldOrderAgain
                    ? 'border-amber-700 bg-amber-50 text-amber-800'
                    : 'border-stone-200 bg-white text-stone-600'
                }`}
              >
                Needs improvement
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Anything we should improve? (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={800}
              placeholder="Tell our home cook what you loved or what could be better..."
              className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#166534]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[48px] rounded-xl bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Saving Feedback...' : 'Submit Meal Review'}
          </button>
        </form>
      </div>
    </div>
  );
};
