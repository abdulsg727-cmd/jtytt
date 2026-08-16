import React, { useState } from 'react';
import { Language, translations } from '../translations';
import { 
  HelpCircle, 
  Headphones, 
  Facebook, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Check, 
  Loader2 
} from 'lucide-react';

interface FooterProps {
  lang: Language;
}

export default function Footer({ lang }: FooterProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const t = (key: string): string => {
    const dict = translations[lang] as Record<string, string>;
    return dict[key] || key;
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !agreed) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setFirstName('');
      setLastName('');
      setEmail('');
      setAgreed(false);
      setTimeout(() => setSuccess(false), 4000);
    }, 1200);
  };

  const isAr = lang === 'ar';

  return (
    <footer className="bg-[#122b4f] text-slate-200 pt-16 pb-8 border-t border-[#0e213d] font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Main Grid: Left is Links and Help, Right is Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-white/10">
          
          {/* Left Area: Navigation Links & Support (7 Cols) */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* 3 Rows of links mimicking the exact mobile list shown */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold">
                <a href="#home" className="hover:text-sky-300 transition-colors">{isAr ? 'الرئيسية' : 'Home'}</a>
                <span className="text-white/20 hidden xs:inline">|</span>
                <a href="#branches" className="hover:text-sky-300 transition-colors">{isAr ? 'الفروع' : 'Branches'}</a>
                <span className="text-white/20 hidden xs:inline">|</span>
                <a href="#tickets" className="hover:text-sky-300 transition-colors">{isAr ? 'تذاكري' : 'My Tickets'}</a>
                <span className="text-white/20 hidden xs:inline">|</span>
                <a href="#tracking" className="hover:text-sky-300 transition-colors">{isAr ? 'تتبع الحافلة' : 'Live Tracking'}</a>
                <span className="text-white/20 hidden xs:inline">|</span>
                <a href="#services" className="hover:text-sky-300 transition-colors">{isAr ? 'الخدمات' : 'Our Services'}</a>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold">
                <a href="#sitemap" className="hover:text-sky-300 transition-colors">{isAr ? 'خارطة الموقع' : 'Sitemap'}</a>
                <span className="text-white/20 hidden xs:inline">|</span>
                <a href="#contact" className="hover:text-sky-300 transition-colors">{isAr ? 'اتصل بنا' : 'Contact Us'}</a>
                <span className="text-white/20 hidden xs:inline">|</span>
                <a href="#lost" className="hover:text-sky-300 transition-colors">{isAr ? 'المفقودات والعثور عليها' : 'Lost & Found'}</a>
                <span className="text-white/20 hidden xs:inline">|</span>
                <a href="#survey" className="hover:text-sky-300 transition-colors">{isAr ? 'استطلاع' : 'Survey'}</a>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold">
                <a href="#notes" className="hover:text-sky-300 transition-colors">{isAr ? 'ملاحظات' : 'Feedback Notes'}</a>
                <span className="text-white/20 hidden xs:inline">|</span>
                <a href="#stocks" className="hover:text-sky-300 transition-colors">{isAr ? 'بورصة عمان -جت' : 'Amman Exchange - JETT'}</a>
              </div>
            </div>

            {/* Support Hotline Blocks with Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a 
                href="#faq"
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-xl border border-white/10"
              >
                <div className="w-10 h-10 rounded-full bg-sky-500/15 flex items-center justify-center text-sky-400 shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">{isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{isAr ? 'اعثر على إجابات سريعة' : 'Find instant answers'}</p>
                </div>
              </a>

              <a 
                href="#support"
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-xl border border-white/10"
              >
                <div className="w-10 h-10 rounded-full bg-sky-500/15 flex items-center justify-center text-sky-400 shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">{isAr ? 'المساعدة والدعم' : 'Help & Live Support'}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{isAr ? 'مساعدة على مدار الساعة' : '24/7 dedicated helpline'}</p>
                </div>
              </a>
            </div>

            {/* Social media icons layout */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                {isAr ? 'زورونا:' : 'Visit us:'}
              </span>
              <div className="flex gap-2">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-sky-600 flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-pink-600 flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-600 flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-sky-700 flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          {/* Right Area: Newsletter Signup Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white/5 border border-white/10 p-6 sm:p-8 rounded-2xl space-y-6">
            <div>
              <h3 className="font-extrabold text-base text-white leading-snug">
                {isAr 
                  ? 'اشترك في نشرتنا الإخبارية وكن أول من يعرف عن العروض الخاصة.' 
                  : 'Subscribe to our newsletter and be the first to know about special offers.'}
              </h3>
            </div>

            {success ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                <Check className="w-4.5 h-4.5 shrink-0" />
                <span>
                  {isAr 
                    ? 'نشكرك على اشتراكك بنجاح في نشرتنا!' 
                    : 'Thank you! You have successfully subscribed to our newsletter.'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={isAr ? 'الاسم الأول' : 'First Name'}
                      className="w-full bg-white/10 border border-white/15 focus:border-sky-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none placeholder-slate-400 transition-colors font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={isAr ? 'اسم العائلة' : 'Last Name'}
                      className="w-full bg-white/10 border border-white/15 focus:border-sky-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none placeholder-slate-400 transition-colors font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isAr ? 'البريد الإلكتروني' : 'Email Address'}
                    className="w-full bg-white/10 border border-white/15 focus:border-sky-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none placeholder-slate-400 transition-colors font-semibold"
                  />
                </div>

                <label className="flex items-start gap-2.5 text-xs text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-white/15 bg-white/10 text-sky-500 focus:ring-0 cursor-pointer"
                  />
                  <span>
                    {isAr 
                      ? 'أفهم وأوافق على الشروط والأحكام و سياسة الخصوصية' 
                      : 'I understand and agree to the terms, conditions and privacy policy'}
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting || !agreed}
                  className="w-full bg-[#46bbec] hover:bg-[#3caade] disabled:opacity-50 text-slate-950 font-black text-xs py-3 rounded-xl transition-all shadow-md shadow-[#46bbec]/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin text-slate-950" />}
                  <span>{isAr ? 'اشتراك' : 'Subscribe'}</span>
                </button>
              </form>
            )}

          </div>

        </div>

        {/* Lower row: Copyright, Payment Methods, and Cookie info */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-400">
          <p className="mb-2 sm:mb-0">
            {isAr ? '© جيت للنقل 2026' : '© JETT Transportation 2026'}
          </p>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{isAr ? 'طرق الدفع المعتمدة:' : 'Accepted Cards:'}</span>
            {/* Visa */}
            <div className="bg-white rounded px-1.5 py-0.5 h-6 flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 100 35" className="h-3.5 w-auto">
                <path d="M37.5 3.5l-6.2 27.5h6.8l6.2-27.5h-6.8zm27.8 17.8c-.8-2.6-4.5-9.1-4.5-9.1s-1.8-8.7-1.8-8.7h-6.5l-4.5 27.5h6.4l1.3-3.8h8l.7 3.8h5.7l-4.8-19.7zm-6.2-7.8l3.6 10.3h-6.2l2.6-10.3zm-39.7-10h-6.8c-1.6 0-3 1-3.6 2.4L18 26.8 15 6.7c-.3-1.9-1.8-3.2-3.7-3.2H.5L0 5.8c1.8.4 3.9 1 5.2 1.7 2 1 2.5 1.9 3 3.9l4.5 20.1h7.3l11-28zm62.9 9.8c-1.3-.4-3.4-1.1-5.5-1.1-6.1 0-10.3 3.2-10.4 7.8 0 3.4 3.1 5.3 5.4 6.4 2.4 1.2 3.2 1.9 3.2 3 0 1.6-1.9 2.4-3.7 2.4-2.5 0-3.9-.4-5.9-1.3l-.8-.4-1 5.9c1.5.7 4.3 1.3 7.2 1.3 6.5 0 10.8-3.2 10.8-8.2 0-2.7-1.6-4.7-5.1-6.4-2.1-1.1-3.5-1.8-3.5-3 0-1 1.2-2.1 3.5-2.1 2 0 3.4.4 4.5.9l.7.3.9-5.5z" fill="#00579F"/>
                <path d="M12.7 28.5c-.5-2.2-2.8-12-2.8-12-1.2-4.5-4-5.9-8.4-7.2L0 9.8c4.2.9 8.5 2.1 11.8 4 1.8 1 2.2 2 2.7 3.9l3.5 14.8h5.5l-6.1-4h-4.7z" fill="#FAA61A"/>
              </svg>
            </div>
            {/* MasterCard */}
            <div className="bg-white rounded px-1.5 py-0.5 h-6 flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 100 65" className="h-4 w-auto">
                <circle cx="34" cy="32.5" r="24" fill="#EB001B"/>
                <circle cx="66" cy="32.5" r="24" fill="#F79E1B"/>
                <path d="M50 14.8c6 4.7 9.8 11.8 9.8 19.7s-3.8 15-9.8 19.7c-6-4.7-9.8-11.8-9.8-19.7s3.8-15 9.8-19.7z" fill="#FF5F00"/>
                <text x="50" y="37" fontFamily="Arial, Helvetica, sans-serif" fontSize="11" fontStyle="italic" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" letterSpacing="-0.5">MasterCard</text>
              </svg>
            </div>
            {/* American Express */}
            <div className="bg-[#007AC1] rounded px-1.5 py-0.5 h-6 flex items-center justify-center shadow-sm">
              <span className="text-[7px] font-black text-white tracking-tighter">AMEX</span>
            </div>
          </div>

          <div className="flex gap-4">
            <a href="#cookies" className="hover:text-white transition-colors">
              {isAr ? 'إعدادات الكوكيز' : 'Cookie Settings'}
            </a>
            <span>•</span>
            <a href="#terms" className="hover:text-white transition-colors">
              {isAr ? 'الشروط والأحكام' : 'Terms & Conditions'}
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
