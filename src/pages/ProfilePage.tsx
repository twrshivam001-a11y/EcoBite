import React, { useState } from 'react';
import {
  Copy,
  Check,
  MessageCircle,
  Edit3,
  LogOut,
  BarChart3,
  User,
  MapPin,
  GraduationCap,
  Phone,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { LUCKNOW_AREAS } from '../data/catalog';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { LucknowArea } from '../types';

export const ProfilePage: React.FC = () => {
  const {
    profile,
    isDemoMode,
    isAdminUser,
    disableDemoMode,
    enableDemoMode,
    updateUserProfile,
    logout,
  } = useAuth();
  const {
    subscriptions,
    orders,
    founderViewEnabled,
    setFounderViewEnabled,
    pilotMetrics,
    allPilotFeedback,
    showToast,
  } = useAppData();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [organization, setOrganization] = useState(profile?.organization || '');
  const [area, setArea] = useState<LucknowArea>(profile?.area || 'Gomti Nagar');
  const [addressLine, setAddressLine] = useState(profile?.addressLine || '');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!profile) return null;

  const activeSub = subscriptions.find((s) => s.status === 'active');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({ fullName, phone, organization, area, addressLine });
      setEditing(false);
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(profile.referralCode);
      setCopied(true);
      showToast(`Copied ${profile.referralCode}!`, 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Copy failed. Long-press to copy code.', 'info');
    }
  };

  const handleShareReferralWhatsApp = () => {
    const text = `Hey! Tired of hostel mess food? Try EcoBite's ₹100 home-style thali in Lucknow (freshly cooked by local home cooks, zero plastic). Use my code ${profile.referralCode} to get ₹25 off your next home-style meal!`;
    window.location.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
            Student Profile & Rewards
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Manage your Lucknow delivery address, active plan, and hostel referrals.
          </p>
        </div>

        <button
          onClick={logout}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          {isDemoMode ? 'Exit Demo Mode' : 'Sign Out'}
        </button>
      </div>

      {/* Main Grid: Profile Info + Referral Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card */}
        <section className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#166534] flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-stone-900">
                  {profile.fullName}
                </h2>
                <p className="text-xs text-stone-500">{profile.email}</p>
              </div>
            </div>

            {!editing && (
              <button
                onClick={() => {
                  setFullName(profile.fullName);
                  setPhone(profile.phone);
                  setOrganization(profile.organization);
                  setArea(profile.area);
                  setAddressLine(profile.addressLine);
                  setEditing(true);
                }}
                className="min-h-[40px] px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>

          {!editing ? (
            <div className="space-y-3 pt-3 border-t border-stone-100 text-sm">
              <div className="flex items-center gap-2.5 text-stone-700">
                <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="font-mono tabular-nums">{profile.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-700">
                <GraduationCap className="w-4 h-4 text-stone-400 shrink-0" />
                <span>{profile.organization}</span>
              </div>
              <div className="flex items-start gap-2.5 text-stone-700">
                <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="font-medium text-stone-900">{profile.area}, Lucknow</strong> —{' '}
                  {profile.addressLine}
                </span>
              </div>

              <div className="pt-3 border-t border-stone-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-stone-500 block">Total Orders</span>
                  <span className="font-mono text-base font-bold text-stone-900 tabular-nums">
                    {orders.length}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Active Meal Plan</span>
                  <span className="font-semibold text-[#166534] text-sm">
                    {activeSub
                      ? `${activeSub.planName} (${activeSub.remainingMeals} left)`
                      : 'Pay-per-meal'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-3 pt-3 border-t border-stone-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    WhatsApp / Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    College / Workplace
                  </label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Lucknow Area
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value as LucknowArea)}
                    className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] px-3 py-2 text-sm"
                  >
                    {LUCKNOW_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Hostel / PG Address
                </label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#166534] text-white text-xs font-semibold cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="min-h-[40px] px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Refer a Hostel Mate */}
        <section className="lg:col-span-5 bg-[#166534] text-white rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-200">Refer a Hostel Mate</p>
            <h2 className="mt-1.5 font-display text-xl font-bold leading-snug">
              Get ₹25 off your next home-style meal
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Share your code with friends in your hostel or PG. Both of you get ₹25 off on your
              next ₹100+ EcoBite order.
            </p>

            <div className="mt-5 bg-emerald-950/60 border border-emerald-700/60 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <span className="font-mono text-base font-bold tracking-wider">
                {profile.referralCode}
              </span>
              <button
                onClick={handleCopyReferral}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200 hover:text-white cursor-pointer min-h-[36px] px-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <button
            onClick={handleShareReferralWhatsApp}
            className="mt-5 w-full min-h-[44px] rounded-xl bg-white text-[#166534] hover:bg-emerald-50 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            Share on WhatsApp
          </button>
        </section>
      </div>

      {/* App Settings & Founder View Toggle */}
      <section className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-stone-900">
                Founder View — Pilot Analytics
              </h3>
              <p className="text-xs text-stone-500">
                Inspect live pilot metrics, repeat purchase rate, and customer validation scores.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={founderViewEnabled}
            onClick={() => setFounderViewEnabled(!founderViewEnabled)}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              founderViewEnabled
                ? 'bg-[#166534] text-white'
                : 'border border-stone-300 bg-white text-stone-800 hover:bg-stone-50'
            }`}
          >
            {founderViewEnabled ? 'Founder View: ON' : 'Enable Founder View'}
          </button>
        </div>

        <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
          <PWAInstallButton variant="compact" />

          <button
            onClick={isDemoMode ? disableDemoMode : enableDemoMode}
            className="text-xs font-medium text-stone-600 hover:text-stone-900 underline cursor-pointer"
          >
            {isDemoMode ? 'Switch to Live Firebase Account' : 'Switch to Demo Mode Preview'}
          </button>
        </div>
      </section>

      {/* Founder Pilot Analytics Dashboard */}
      {founderViewEnabled && (
        <section className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#166534]">
                <Shield className="w-3.5 h-3.5" />
                <span>
                  {isDemoMode
                    ? 'Lucknow Pilot Cohort (Demo Data)'
                    : isAdminUser
                      ? 'Live Firestore Pilot Metrics (Admin)'
                      : 'Personal Order Metrics (Sign in as founder for cross-user cohort)'}
                </span>
              </div>
              <h2 className="mt-1 font-display text-xl font-bold text-stone-900">
                EcoBite Pilot Validation Scorecard
              </h2>
            </div>
          </div>

          {/* 5 Primary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-[#FAFAF7] border border-stone-200/80 rounded-xl p-4">
              <span className="text-xs text-stone-500 block">Total Orders</span>
              <span className="mt-1 font-mono text-2xl font-bold text-stone-900 tabular-nums block">
                {pilotMetrics.totalOrders}
              </span>
            </div>
            <div className="bg-[#FAFAF7] border border-stone-200/80 rounded-xl p-4">
              <span className="text-xs text-stone-500 block">Trial Customers</span>
              <span className="mt-1 font-mono text-2xl font-bold text-stone-900 tabular-nums block">
                {pilotMetrics.trialCustomers}
              </span>
            </div>
            <div className="bg-[#FAFAF7] border border-stone-200/80 rounded-xl p-4">
              <span className="text-xs text-stone-500 block">Repeat Purchase Rate</span>
              <span className="mt-1 font-mono text-2xl font-bold text-[#166534] tabular-nums block">
                {pilotMetrics.repeatPurchaseRate}%
              </span>
            </div>
            <div className="bg-[#FAFAF7] border border-stone-200/80 rounded-xl p-4">
              <span className="text-xs text-stone-500 block">Avg Meal Price</span>
              <span className="mt-1 font-mono text-2xl font-bold text-stone-900 tabular-nums block">
                ₹{pilotMetrics.avgMealPrice}
              </span>
            </div>
            <div className="bg-[#FAFAF7] border border-stone-200/80 rounded-xl p-4 col-span-2 sm:col-span-1">
              <span className="text-xs text-stone-500 block">Hygiene / Taste Avg</span>
              <span className="mt-1 font-mono text-2xl font-bold text-[#EA580C] tabular-nums block">
                {pilotMetrics.avgHygieneRating || '—'} / {pilotMetrics.avgTasteRating || '—'}
              </span>
            </div>
          </div>

          {/* 5-Dimension Validation Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-stone-100">
            <div className="space-y-3">
              <h3 className="font-display text-sm font-semibold text-stone-900">
                Customer Validation Dimensions (out of 5.0)
              </h3>
              {[
                { label: 'Taste & Home-Style Feel', val: pilotMetrics.avgTasteRating },
                { label: 'Hygiene & Eco Packaging', val: pilotMetrics.avgHygieneRating },
                { label: 'Portion Size', val: pilotMetrics.avgPortionRating },
                { label: 'Student Price Value', val: pilotMetrics.avgPriceRating },
                { label: 'On-Time Delivery', val: pilotMetrics.avgDeliveryRating },
              ].map((row) => (
                <div key={row.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-700">{row.label}</span>
                    <span className="font-mono font-semibold text-stone-900 tabular-nums">
                      {row.val ? row.val.toFixed(1) : '0.0'} / 5.0
                    </span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#166534]"
                      style={{ width: `${(row.val / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-stone-600 pt-1">
                Would order again:{' '}
                <strong className="font-mono text-[#166534] tabular-nums">
                  {pilotMetrics.wouldOrderAgainPct}%
                </strong>{' '}
                across {allPilotFeedback.length} responses
              </p>
            </div>

            {/* Latest Pilot Quotes */}
            <div className="space-y-3">
              <h3 className="font-display text-sm font-semibold text-stone-900">
                Recent Pilot Feedback
              </h3>
              {allPilotFeedback.length === 0 ? (
                <p className="text-xs text-stone-500">No feedback submitted yet.</p>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {allPilotFeedback.slice(0, 4).map((fb) => (
                    <div
                      key={fb.id}
                      className="bg-[#FAFAF7] border border-stone-200/80 rounded-xl p-3 text-xs space-y-1"
                    >
                      <div className="flex justify-between font-semibold text-stone-800">
                        <span>{fb.userName}</span>
                        <span className="font-mono text-amber-700 tabular-nums">
                          ★ {fb.tasteRating}/5
                        </span>
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        {fb.comment || `Rated ${fb.mealName} positively.`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
