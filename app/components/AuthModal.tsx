import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Language } from '../translations';
import { X, Mail, Lock, User as UserIcon, LogIn, UserPlus, AlertCircle, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  lang: Language;
}

export default function AuthModal({ lang }: AuthModalProps) {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, signInWithEmail, signUpWithEmail, user, signOut } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const isAr = lang === 'ar';

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      toast.success(isAr ? 'تم تسجيل الدخول بنجاح عبر Google' : 'Signed in with Google successfully');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError(isAr ? 'تم إغلاق نافذة الدخول قبل إتمام العملية.' : 'Login popup was closed before completing.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError(isAr ? 'تم إلغاء الطلب.' : 'Request cancelled.');
      } else {
        setError(err.message || (isAr ? 'فشل تسجيل الدخول عبر Google' : 'Google sign in failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(isAr ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }
    if (tab === 'signup' && password.length < 6) {
      setError(isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (tab === 'login') {
        await signInWithEmail(email, password);
        toast.success(isAr ? 'مرحباً بك! تم تسجيل الدخول بنجاح' : 'Welcome back! Signed in successfully');
      } else {
        await signUpWithEmail(email, password, name);
        toast.success(isAr ? 'تم إنشاء الحساب وتسجيل الدخول بنجاح' : 'Account created and signed in successfully');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(isAr ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password');
      } else if (err.code === 'auth/email-already-in-use') {
        setError(isAr ? 'هذا البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول' : 'Email is already registered. Please sign in.');
      } else if (err.code === 'auth/weak-password') {
        setError(isAr ? 'كلمة المرور ضعيفة جداً' : 'Password is too weak');
      } else {
        setError(err.message || (isAr ? 'حدث خطأ أثناء المصادقة' : 'Authentication error occurred'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
              JETT
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                {user ? (isAr ? 'حساب المسافر' : 'Traveler Profile') : (isAr ? 'تسجيل الدخول إلى جيت' : 'Sign in to JETT')}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {isAr ? 'إدارة التذاكر، الحجوزات السريعة ومتابعة الرحلات' : 'Manage tickets, fast booking, and trip tracking'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If user is already logged in, show user summary */}
        {user ? (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="w-14 h-14 rounded-full object-cover border-2 border-amber-500" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center border-2 border-slate-900">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-black text-slate-900 truncate">
                  {user.displayName || (isAr ? 'مسافر مسجل' : 'Registered Traveler')}
                </h4>
                <p className="text-xs text-slate-500 font-mono truncate">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-emerald-600">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حساب موثق وآمن عبر Firebase' : 'Verified Firebase Account'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  closeAuthModal();
                }}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>{isAr ? 'متابعة التصفح والحجز' : 'Continue Browsing & Booking'}</span>
                <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={async () => {
                  await signOut();
                  toast.info(isAr ? 'تم تسجيل الخروج بنجاح' : 'Signed out successfully');
                  closeAuthModal();
                }}
                className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                {isAr ? 'تسجيل الخروج' : 'Sign Out'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Google Fast Authentication Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all cursor-pointer group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>{isAr ? 'الدخول بنقرة واحدة عبر Google' : 'One-Click Sign in with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider relative">
                {isAr ? 'أو عبر البريد الإلكتروني' : 'or with email'}
              </span>
            </div>

            {/* Tab switch between Login and Signup */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => { setTab('login'); setError(null); }}
                className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  tab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isAr ? 'تسجيل الدخول' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => { setTab('signup'); setError(null); }}
                className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  tab === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isAr ? 'إنشاء حساب جديد' : 'New Account'}
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              {tab === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {isAr ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <UserIcon className={`w-4 h-4 text-slate-400 absolute top-3 ${isAr ? 'right-3' : 'left-3'}`} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isAr ? 'محمد أحمد' : 'Ahmad Ali'}
                      className={`w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
                        isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-slate-400 absolute top-3 ${isAr ? 'right-3' : 'left-3'}`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="traveler@example.com"
                    className={`w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
                      isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 text-slate-400 absolute top-3 ${isAr ? 'right-3' : 'left-3'}`} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
                      isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : tab === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{isAr ? 'إنشاء حساب جديد' : 'Create Account'}</span>
                  </>
                )}
              </button>
            </form>

            <p className="text-[10px] text-center text-slate-400 font-medium pt-2">
              {isAr
                ? 'بتسجيل الدخول، فإنك توافق على شروط الخدمة وسياسة الخصوصية الخاصة بالشركة الأردنية للنقل (جيت).'
                : 'By signing in, you agree to JETT terms of service and privacy policy.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
