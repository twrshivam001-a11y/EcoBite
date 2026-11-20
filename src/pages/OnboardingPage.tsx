import React, { useState } from 'react';
import { MapPin, GraduationCap, Phone, User, Tag, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { LUCKNOW_AREAS } from '../data/catalog';
import { LucknowArea } from '../types';

export const OnboardingPage: React.FC = () => {
  const { user, saveOnboardingProfile, logout } = useAuth();
  const { showToast } = useAppData();

  const [fullName, setFullName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [area, setArea] = useState<LucknowArea>('Gomti Nagar');
  const [addressLine, setAddressLine] = useState('');
  const [referredBy, setReferredBy] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit WhatsApp / mobile number.');
      return;
    }
    if (organization.trim().length < 2) {
      setError('Please enter your college or workplace name.');
      return;
    }
    if (addressLine.trim().length < 4) {
      setError('Please enter your hostel, PG, or flat details.');
      return;
    }

    setSaving(true);
    try {
      await saveOnboardingProfile({
        fullName,
        phone,
        organization,
        area,
        addressLine,
        referredBy: referredBy.trim() || undefined,
      });
      showToast('Profile saved! Welcome to EcoBite Lucknow.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to save profile.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-lg font-bold text-[#166534]">EcoBite</span>
          <button
            onClick={logout}
            className="text-xs text-stone-500 hover:text-stone-900 underline cursor-pointer"
          >
            Sign out
          </button>
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold text-stone-900">
          Set up your Lucknow delivery profile
        </h1>
        <p className="mt-1.5 text-sm text-stone-600">
          We pre-fill this for every Lunch & Dinner order so checkout takes one tap.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Ananya Verma"
                className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] pl-10 pr-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#166534]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Phone / WhatsApp Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98390 12345"
                className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] pl-10 pr-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#166534]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              College / Workplace Name
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g., Lucknow University, IET, BBD, HCL"
                className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] pl-10 pr-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#166534]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Hostel / PG Area in Lucknow
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={area}
                onChange={(e) => setArea(e.target.value as LucknowArea)}
                className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] pl-10 pr-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#166534]"
              >
                {LUCKNOW_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}, Lucknow
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Hostel / PG / Street Address
            </label>
            <textarea
              rows={2}
              required
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="e.g., Shivalik Girls PG, Room 12, Sector B"
              className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#166534]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Hostel Mate Referral Code (Optional)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value.toUpperCase())}
                placeholder="e.g., ECO-SHIVAM25"
                maxLength={32}
                className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] pl-10 pr-3.5 py-2.5 text-sm font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#166534]"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full min-h-[48px] rounded-xl bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>{saving ? 'Saving Profile...' : 'Save & Explore Today’s Menu'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
