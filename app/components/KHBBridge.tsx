import React, { useState } from 'react';
import { Language, translations } from '../translations';
import { ShieldCheck, Calendar, Users, HelpCircle, HeartHandshake, Check, Loader2 } from 'lucide-react';

interface KHBBridgeProps {
  lang: Language;
  onBookKHB: (ticketData: {
    serviceType: string;
    date: string;
    passportNo: string;
    totalCost: number;
    passengersCount: number;
    pnr: string;
  }) => void;
}

export default function KHBBridge({ lang, onBookKHB }: KHBBridgeProps) {
  const t = translations[lang];

  const [date, setDate] = useState('');
  const [passengersCount, setPassengersCount] = useState(1);
  const [passportNo, setPassportNo] = useState('');
  const [nationality, setNationality] = useState('');
  const [vipTier, setVipTier] = useState<'standard' | 'silver' | 'gold'>('standard');
  const [isBooking, setIsBooking] = useState(false);

  const standardCost = 12;
  const silverCost = 40;
  const goldCost = 85;
  const activeCost = vipTier === 'standard' ? standardCost : (vipTier === 'silver' ? silverCost : goldCost);
  const totalCost = activeCost * passengersCount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    setIsBooking(true);
    setTimeout(() => {
      setIsBooking(false);
      const randomPNR = 'KH' + Math.floor(200000 + Math.random() * 800000).toString();
      onBookKHB({
        serviceType: vipTier === 'standard' ? 'Standard Transit' : (vipTier === 'silver' ? 'KHB VIP Silver Transit' : 'KHB VIP Gold Executive'),
        date,
        passportNo,
        totalCost,
        passengersCount,
        pnr: randomPNR,
      });
    }, 1800);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-7 sm:space-y-12 overflow-x-hidden">
      
      {/* Header Banner */}
      <div className="text-center space-y-2 sm:space-y-3 px-1">
        <span className="text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-extrabold text-amber-500 bg-amber-500/10 px-3 sm:px-4 py-1.5 rounded-full inline-block border border-amber-500/20 max-w-full">
          Official JETT Border VIP Services
        </span>
        <h2 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight break-words">{t.khbTitle}</h2>
        <p className="text-slate-500 max-w-2xl mx-auto font-semibold text-xs sm:text-base leading-relaxed px-1">
          {t.khbSubtitle}
        </p>
      </div>

      {/* Grid: Info points vs Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start min-w-0">
        
        {/* Info Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-slate-950 text-white rounded-2xl p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-xl border border-slate-900 relative overflow-hidden min-w-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none" />
            
            <h3 className="text-lg font-black text-[#66bfe3] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 shrink-0" /> {t.khbServiceConveniences}
            </h3>

            <div className="space-y-5 text-sm font-medium">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-500 flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-100">{t.khbLoungeTitle}</h4>
                  <p className="text-slate-400 text-xs mt-0.5">{t.khbLoungeDesc}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-500 flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-100">{t.khbFastTrackTitle}</h4>
                  <p className="text-slate-400 text-xs mt-0.5">{t.khbFastTrackDesc}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-500 flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-100">{t.khbCoachTitle}</h4>
                  <p className="text-slate-400 text-xs mt-0.5">{t.khbCoachDesc}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 sm:p-6 rounded-2xl flex items-start gap-3 sm:gap-4 min-w-0">
            <HeartHandshake className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-wider">{t.khbNoticeTitle}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">
                {t.khbNoticeDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Booking Form Column (7 cols) */}
        <div className="lg:col-span-7 min-w-0">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-8 shadow-xl min-w-0">
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-5 sm:mb-6 pb-4 border-b border-slate-100">
                {t.khbBookForm}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                
                {/* VIP Tier Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-500 uppercase">{t.khbServiceLevel}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 min-w-0">
                    <button
                      type="button"
                      onClick={() => setVipTier('standard')}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left rtl:text-right transition-all flex flex-col justify-between min-w-0 ${
                        vipTier === 'standard'
                          ? 'border-amber-500 bg-amber-500/5 text-amber-950'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <span className="font-extrabold text-sm block">{t.khbStandard}</span>
                      <span className="text-[10px] opacity-70 block mt-1">{t.khbStandardDesc}</span>
                      <span className="font-black text-sm text-amber-600 mt-2">12 {t.khbJodPerPax}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVipTier('silver')}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left rtl:text-right transition-all flex flex-col justify-between min-w-0 ${
                        vipTier === 'silver'
                          ? 'border-amber-500 bg-amber-500/5 text-amber-950'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <span className="font-extrabold text-sm block">{t.khbSilver}</span>
                      <span className="text-[10px] opacity-70 block mt-1">{t.khbSilverDesc}</span>
                      <span className="font-black text-sm text-amber-600 mt-2">40 {t.khbJodPerPax}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVipTier('gold')}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left rtl:text-right transition-all flex flex-col justify-between min-w-0 ${
                        vipTier === 'gold'
                          ? 'border-amber-500 bg-amber-500/5 text-amber-950'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <span className="font-extrabold text-sm block">{t.khbGold}</span>
                      <span className="text-[10px] opacity-70 block mt-1">{t.khbGoldDesc}</span>
                      <span className="font-black text-sm text-amber-600 mt-2">85 {t.khbJodPerPax}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                  {/* Departure Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-500 uppercase">{t.departureDate}</label>
                    <div className="flex items-center border border-slate-200 rounded-xl px-3 sm:px-3.5 py-3 bg-slate-50 min-w-0 overflow-hidden">
                      <Calendar className="w-4.5 h-4.5 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent w-full min-w-0 outline-none text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Passengers Count */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-500 uppercase">{t.paxLabel}</label>
                    <div className="flex items-center border border-slate-200 rounded-xl px-3 sm:px-3.5 py-3 bg-slate-50 justify-between gap-2 min-w-0">
                      <div className="flex items-center">
                        <Users className="w-4.5 h-4.5 text-slate-400 mr-2 shrink-0" />
                        <span className="text-xs font-bold text-slate-800">{passengersCount} {t.passenger}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPassengersCount(Math.max(1, passengersCount - 1))}
                          className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setPassengersCount(passengersCount + 1)}
                          className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                  {/* Passport ID */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-500 uppercase">{t.passportNo}</label>
                    <input
                      type="text"
                      required
                      value={passportNo}
                      onChange={(e) => setPassportNo(e.target.value)}
                      placeholder="e.g. Z123456"
                      className="w-full min-w-0 border border-slate-200 outline-none rounded-xl px-3 sm:px-3.5 py-3 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white transition-all uppercase"
                    />
                  </div>

                  {/* Nationality */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-500 uppercase">{t.nationality}</label>
                    <input
                      type="text"
                      required
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g. Jordan"
                      className="w-full min-w-0 border border-slate-200 outline-none rounded-xl px-3 sm:px-3.5 py-3 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Total Cost Presentation */}
                <div className="bg-slate-50 border border-slate-100 p-4 sm:p-5 rounded-2xl flex flex-col xs:flex-row sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 min-w-0">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t.khbTotal}</span>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">
                      {totalCost} <span className="text-sm font-extrabold text-amber-500">JOD</span>
                    </p>
                  </div>
                  <div className="text-left rtl:text-right sm:text-right sm:rtl:text-left text-[10px] font-semibold text-slate-400 leading-tight break-words">
                    {passengersCount} {t.passenger} × {activeCost} {t.khbJodPerPax}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isBooking}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-[#66bfe3] font-extrabold text-xs sm:text-sm px-3 py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 transition-all cursor-pointer disabled:opacity-75 text-center"
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-[#66bfe3]" />
                      <span>{t.khbLockingDetails}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>{t.requestVipBtn}</span>
                    </>
                  )}
                </button>

              </form>
            </div>
        </div>

      </div>

    </div>
  );
}