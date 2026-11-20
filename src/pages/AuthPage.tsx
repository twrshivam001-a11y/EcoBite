import React, { useState } from 'react';
import { Leaf, Mail, Lock, User, ArrowRight, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { HERO_THALI_IMAGE } from '../data/catalog';

type AuthMode = 'login' | 'signup' | 'forgot';

export const AuthPage: React.FC = () => {
  const {
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    sendPasswordReset,
    enableDemoMode,
    needsEmailVerification,
    resendVerificationEmail,
    refreshVerification,
    logout,
    user,
    emailProviderDisabled,
  } = useAuth();
  const { showToast } = useAppData();

  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (needsEmailVerification && user) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#166534] flex items-center justify-center mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Verify your email</h1>
          <p className="mt-2 text-sm text-stone-600 leading-relaxed">
            We sent a verification link to <strong className="text-stone-900">{user.email}</strong>.
            Click the link in your inbox so we can secure your student profile and orders.
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={async () => {
                setBusy(true);
                try {
                  const ok = await refreshVerification();
                  if (!ok) {
                    showToast('Email not verified yet — check your inbox or spam folder.', 'info');
                  } else {
                    showToast('Email verified! Welcome to EcoBite.', 'success');
                  }
                } finally {
                  setBusy(false);
                }
              }}
              disabled={busy}
              className="w-full min-h-[46px] rounded-xl bg-[#166534] hover:bg-[#14532D] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              I&apos;ve verified my email — Continue
            </button>

            <button
              onClick={async () => {
                setBusy(true);
                try {
                  await resendVerificationEmail();
                  showToast('Verification link resent!', 'success');
                } catch {
                  showToast('Please wait a moment before requesting another email.', 'error');
                } finally {
                  setBusy(false);
                }
              }}
              disabled={busy}
              className="w-full min-h-[44px] rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Resend Verification Email
            </button>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <button
                onClick={logout}
                className="text-stone-500 hover:text-stone-900 underline cursor-pointer"
              >
                Use another account
              </button>
              <button
                onClick={enableDemoMode}
                className="font-semibold text-[#166534] hover:underline cursor-pointer"
              >
                Preview in Demo Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setBusy(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        showToast('Signed in to EcoBite!', 'success');
      } else if (mode === 'signup') {
        if (fullName.trim().length < 2) {
          throw new Error('Please enter your full name.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await signupWithEmail(email, password, fullName);
        showToast('Account created! Please verify your email.', 'success');
      } else {
        await sendPasswordReset(email);
        setInfoMsg('Password reset email sent. Check your inbox to choose a new password.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      setErrorMsg(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMsg('');
    setBusy(true);
    try {
      await loginWithGoogle();
      showToast('Signed in with Google!', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed.';
      setErrorMsg(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col lg:flex-row">
      {/* Left Brand Showcase Column */}
      <div className="lg:w-1/2 bg-[#166534] text-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-emerald-200 text-sm font-medium">
            <Leaf className="w-4 h-4" />
            <span>EcoBite · Lucknow</span>
          </div>
          <h1 className="mt-6 font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-balance">
            Fresh, Hygienic, Affordable Home-Style Meals
          </h1>
          <p className="mt-4 text-emerald-100/90 text-base max-w-lg leading-relaxed">
            Prepared daily by verified local home cooks across Gomti Nagar, Aliganj, Hazratganj,
            and Jankipuram. Zero plastic packaging, ₹80–₹120 per meal.
          </p>
        </div>

        <div className="mt-8 hidden sm:block">
          <div className="rounded-2xl overflow-hidden border border-emerald-700/60 aspect-[16/9] max-w-lg bg-emerald-900/40">
            <img
              src={HERO_THALI_IMAGE}
              alt="EcoBite home-style thali in biodegradable bagasse tray"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-3 text-xs text-emerald-200/80">
            100% sugarcane bagasse & kraft packaging · Direct delivery to student hostels & PGs
          </p>
        </div>
      </div>

      {/* Right Auth Form Column */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-900">
                {mode === 'login'
                  ? 'Welcome back'
                  : mode === 'signup'
                    ? 'Create student account'
                    : 'Reset password'}
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                {mode === 'login'
                  ? 'Sign in to order lunch or dinner.'
                  : mode === 'signup'
                    ? 'Join students & young professionals in Lucknow.'
                    : 'Enter your email to receive a reset link.'}
              </p>
            </div>
          </div>

          {/* Primary Google Sign-In */}
          {mode !== 'forgot' && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy}
                className="w-full min-h-[46px] rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="my-5 flex items-center gap-3 text-xs text-stone-400">
                <div className="h-px flex-1 bg-stone-200" />
                <span>or use email</span>
                <div className="h-px flex-1 bg-stone-200" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Shivam Tiwari"
                    className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] pl-10 pr-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu.in"
                  className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] pl-10 pr-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#166534]"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg('');
                        setInfoMsg('');
                      }}
                      className="text-xs font-medium text-[#166534] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-stone-200 bg-[#FAFAF7] pl-10 pr-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 leading-relaxed">
                {errorMsg}
              </div>
            )}

            {emailProviderDisabled && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 leading-relaxed">
                <strong>Firebase Console Setup Tip:</strong> Open Firebase Console → Authentication →
                Sign-in method → Enable <strong>Email/Password</strong>, or click{' '}
                <strong>Continue with Google</strong> above right now.
              </div>
            )}

            {infoMsg && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 leading-relaxed">
                {infoMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full min-h-[46px] rounded-xl bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>
                {busy
                  ? 'Please wait...'
                  : mode === 'login'
                    ? 'Sign In'
                    : mode === 'signup'
                      ? 'Create Account'
                      : 'Send Reset Link'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-stone-600">
            {mode === 'login' ? (
              <>
                New to EcoBite?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                    setInfoMsg('');
                  }}
                  className="font-semibold text-[#166534] hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                    setInfoMsg('');
                  }}
                  className="font-semibold text-[#166534] hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </div>

          {/* Instant Demo Mode Preview */}
          <div className="mt-6 pt-5 border-t border-stone-100">
            <button
              type="button"
              onClick={enableDemoMode}
              className="w-full min-h-[44px] rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 text-[#166534] text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Preview App Immediately in Demo Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
