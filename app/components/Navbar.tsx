import React, { useState, useEffect } from 'react';
import { ViewType } from '../types';
import { Language, translations } from '../translations';
import { Menu, X, User, Sun, Languages, Clock, Globe, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

interface NavbarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  bookingCount: number;
}

export default function Navbar({ currentView, setView, lang, setLang, bookingCount }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('09:20');
  const { user, openAuthModal, signOut } = useAuth();
  const t = (key: string): string => {
    const dict = translations[lang] as Record<string, string>;
    return dict[key] || key;
  };

  // Keep live Jordan time updating
  useEffect(() => {
    const updateTime = () => {
      // Amman, Jordan is UTC+3. Let's format Jordan local time
      try {
        const jordanTime = new Date().toLocaleTimeString('en-US', {
          timeZone: 'Asia/Amman',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        setTimeStr(jordanTime);
      } catch (err) {
        // Fallback to normal time if timezone isn't supported
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        setTimeStr(`${hrs}:${mins}`);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNav = (view: ViewType, elementId?: string) => {
    setView(view);
    setOpen(false);
    if (elementId) {
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const navList = [
    { label: t("nav.home"), view: 'home' as ViewType },
    { label: t("nav.terminals"), view: 'home' as ViewType, action: () => handleNav('home', 'branches-section') },
    { label: t("nav.calendar"), view: 'booking' as ViewType },
    { label: t("nav.schedule"), view: 'booking' as ViewType },
    { label: t("nav.tickets"), view: 'booking' as ViewType },
    { label: t("nav.tracker"), view: 'shipment' as ViewType },
    { label: t("nav.about"), view: 'home' as ViewType, action: () => handleNav('home', 'about-section') },
    { label: t("nav.services"), view: 'khb' as ViewType },
    { label: t("nav.fleet"), view: 'charter' as ViewType },
    { label: t("nav.report"), view: 'charter' as ViewType, action: () => handleNav('charter', 'itinerary-block') },
    { label: t("nav.dashboard"), view: 'dashboard' as ViewType },
  ];

  return (
    <header className="sticky top-0 z-50 flex flex-col w-full shadow-lg" id="app-header">
      {/* Top utility row - Light Background */}
      <div className="bg-slate-50 text-slate-800 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between py-3">
          <div onClick={() => handleNav('home')} className="flex items-center gap-4 group cursor-pointer">
            <img
              src="https://media.base44.com/images/public/6a7d61d7b5b6dc163f4c466d/07c10fc9c_jett_com_jo_jett_header_a0d02b49.png"
              alt="JETT Logo"
              onError={(e) => {
                const imgEl = e.currentTarget as HTMLImageElement;
                imgEl.style.display = "none";
                const fallbackEl = imgEl.nextElementSibling as HTMLElement;
                if (fallbackEl) {
                  fallbackEl.style.display = "flex";
                }
              }}
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span style={{ display: "none" }} className="font-bold text-xl text-[#66bfe3] items-center gap-2">
              <span className="bg-slate-900 text-[#66bfe3] px-3 py-1 rounded-md tracking-wider">JETT</span>
            </span>
            <span className="hidden sm:inline-flex flex-col">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t("tagline.top")}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{t("tagline.bottom")}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            {/* User Auth Section */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('my-tickets')}
                  className="flex items-center gap-2 py-1 px-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 transition-all cursor-pointer group"
                  title={user.email || 'Traveler'}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-[#66bfe3]" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#66bfe3] text-slate-950 font-black text-[10px] flex items-center justify-center">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline font-bold max-w-[110px] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>

                <button
                  onClick={openAuthModal}
                  className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                  title={lang === 'ar' ? 'إدارة الحساب' : 'Account settings'}
                >
                  <User className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#66bfe3] hover:bg-[#66bfe3]/80 text-slate-950 font-black text-xs shadow-sm transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>
            )}

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              aria-label="Toggle language"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#66bfe3] transition-colors cursor-pointer"
            >
              <Languages className="w-4 h-4 text-[#66bfe3]" />
              <span className="font-bold">{lang === "en" ? "العربية" : "English"}</span>
            </button>

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setOpen(true)}
              aria-label="Open navigation menu"
              className="sm:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main nav row - Dark Background */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between py-2">
          <nav className="hidden sm:flex items-center gap-4 sm:gap-6 text-sm font-bold">
            {navList.map((item, idx) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={idx}
                  onClick={item.action || (() => handleNav(item.view))}
                  className={`relative py-1.5 transition-all cursor-pointer ${
                    isActive 
                      ? 'text-[#66bfe3] font-extrabold hover:text-[#66bfe3]/80' 
                      : 'text-slate-200 hover:text-[#66bfe3]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#66bfe3] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right utility panel */}
          <div className="hidden sm:flex items-center gap-4 sm:gap-6 text-xs font-bold text-slate-200 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700/50">
            <span className="flex items-center gap-2 shrink-0">
              <Sun className="w-4 h-4 text-[#66bfe3]" /> 
              27°C
            </span>
            <div className="w-px h-4 bg-slate-700" />
            <span className="flex items-center gap-1.5 shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#66bfe3]" />
              {timeStr}
            </span>
          </div>
        </div>
      </div>

      {/* Custom Resilient Slide-out Sheet (Drawer Overlay) */}
      {open && (
        <div className="fixed inset-0 z-[100] flex justify-end" id="mobile-drawer-overlay">
          {/* Backdrop */}
          <div 
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Drawer Panel */}
          <div 
            className={`relative w-80 max-w-[85vw] h-full bg-slate-900 text-white p-6 shadow-2xl flex flex-col justify-between border-l border-slate-800 transform transition-transform duration-300 ease-out ${
              lang === 'ar' ? 'mr-auto border-r border-l-0 border-slate-800' : 'ml-auto'
            }`}
          >
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950 text-sm">
                    J
                  </div>
                  <span className="font-extrabold text-[#66bfe3] tracking-tight text-lg">JETT Express</span>
                </div>
                <button 
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation links inside drawer */}
              <nav className="flex flex-col gap-4">
                {navList.map((item, idx) => {
                  const isActive = currentView === item.view;
                  return (
                    <button
                      key={idx}
                      onClick={item.action || (() => handleNav(item.view))}
                      className={`text-base font-bold text-left rtl:text-right py-2 px-3 rounded-lg transition-all flex items-center justify-between ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'hover:bg-slate-800 text-slate-200 hover:text-[#66bfe3]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Panel inside Drawer */}
            <div className="border-t border-slate-800 pt-6 mt-6">
              <button
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-[#66bfe3] transition-all font-bold mb-4"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-500" />
                  <span>{lang === 'en' ? 'العربية' : 'English'}</span>
                </div>
                <span className="text-xs text-slate-400">Toggle</span>
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> 27°C
                </span>
                <span>{timeStr}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
