import React, { useState } from 'react';
import { Language, translations } from '../translations';
import { Users, Calendar, Mail, Phone, Info, Check, ShieldCheck, Loader2, Compass } from 'lucide-react';
import { saveCharterRequest } from '../lib/firebase';

interface CharterQuoteProps {
  lang: Language;
}

export default function CharterQuote({ lang }: CharterQuoteProps) {
  const t = translations[lang];

  const [coachType, setCoachType] = useState('large');
  const [duration, setDuration] = useState(1);
  const [date, setDate] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveCharterRequest({
        coachType,
        duration,
        date,
        itinerary,
        name,
        email,
        phone,
      });
    } catch (err) {
      console.warn('Could not save charter request to Firestore:', err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-7 sm:space-y-12 animate-in fade-in duration-300 overflow-x-hidden">
      
      {/* Header */}
      <div className="text-center space-y-2 sm:space-y-3 px-1">
        <span className="text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-extrabold text-amber-500 bg-amber-500/10 px-3 sm:px-4 py-1.5 rounded-full inline-block border border-amber-500/20 max-w-full">
          Executive Chauffeur & Fleet Rental
        </span>
        <h2 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight break-words">{t.charterTitle}</h2>
        <p className="text-slate-500 max-w-2xl mx-auto font-semibold text-xs sm:text-base leading-relaxed px-1">
          {t.charterSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start min-w-0">
        
        {/* Info Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-sm min-w-0">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" /> JETT Fleet Quality
            </h3>

            <div className="space-y-4 text-xs font-semibold text-slate-500 leading-relaxed">
              <div className="p-3.5 sm:p-4 bg-white border border-slate-100 rounded-2xl break-words">
                <h4 className="font-extrabold text-slate-800 text-sm mb-1">Professional Drivers</h4>
                <p>All JETT charter captains undergo strict annual safety testing, first-aid training, and bilingual tour communication briefings.</p>
              </div>

              <div className="p-3.5 sm:p-4 bg-white border border-slate-100 rounded-2xl break-words">
                <h4 className="font-extrabold text-slate-800 text-sm mb-1">State-of-the-Art Mercedes-Benz Coaches</h4>
                <p>Equipped with dual compressors for sub-zero cooling, active climate particulate air filters, toilet amenities, and on-board USB outlets.</p>
              </div>

              <div className="p-3.5 sm:p-4 bg-white border border-slate-100 rounded-2xl break-words">
                <h4 className="font-extrabold text-slate-800 text-sm mb-1">Fully Insured Fleet</h4>
                <p>Full comprehensive liability coverage for all passengers, luggage transit guarantees, and 24/7 technical roadside dispatch backup.</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 p-4 sm:p-5 rounded-2xl flex gap-3 text-amber-950 min-w-0">
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
            <div className="text-xs font-medium leading-relaxed">
              <strong>Need emergency group transport?</strong><br />
              If you require a coach dispatch in less than 24 hours, call our hotlines directly at <strong>+962 6 566 6111</strong> (Amman Headquarters) for immediate deployment.
            </div>
          </div>
        </div>

        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7 min-w-0">
          {isSubmitted ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-12 shadow-xl text-center space-y-5 sm:space-y-6 min-w-0">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8 font-extrabold" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">{t.quoteSuccess}</h3>
                <p className="text-slate-500 font-semibold text-sm mt-1">{t.quoteSuccessDesc}</p>
              </div>

              <button
                onClick={() => setIsSubmitted(false)}
                className="bg-slate-900 hover:bg-slate-800 text-[#66bfe3] font-extrabold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md shadow-slate-900/10 cursor-pointer"
              >
                Request Another Rental Quote
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-8 shadow-xl min-w-0">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                
                {/* Coach Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-500 uppercase">{t.coachType}</label>
                  <select
                    value={coachType}
                    onChange={(e) => setCoachType(e.target.value)}
                    className="w-full border border-slate-200 outline-none rounded-xl px-3.5 py-3 text-xs font-bold text-slate-800 bg-slate-50"
                  >
                    <option value="mini">{t.coachesMini}</option>
                    <option value="medium">{t.coachesMedium}</option>
                    <option value="large">{t.coachesLarge}</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-500 uppercase">{t.departureDate}</label>
                    <div className="flex items-center border border-slate-200 rounded-xl px-3 sm:px-3.5 py-3 bg-slate-50 min-w-0 overflow-hidden">
                      <Calendar className="w-4.5 h-4.5 text-slate-400 mr-2 shrink-0 animate-pulse" />
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent w-full min-w-0 outline-none text-xs font-bold text-slate-800 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Duration days */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-500 uppercase">{t.durationDays}</label>
                    <div className="flex items-center border border-slate-200 rounded-xl px-3 sm:px-3.5 py-3 bg-slate-50 justify-between gap-3 min-w-0">
                      <span className="text-xs font-bold text-slate-800">{duration} Days</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setDuration(Math.max(1, duration - 1))}
                          className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setDuration(duration + 1)}
                          className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trip Itinerary details */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-500 uppercase">{t.charterDetails}</label>
                  <textarea
                    required
                    value={itinerary}
                    onChange={(e) => setItinerary(e.target.value)}
                    placeholder="Describe your tour start point, daily itinerary destinations (e.g. Amman to Dead Sea to Petra), and general times."
                    rows={4}
                    className="w-full min-w-0 border border-slate-200 outline-none rounded-xl px-3 sm:px-3.5 py-3 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white transition-all leading-relaxed resize-y"
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-4">Your Contact Information</h4>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-500 uppercase">Contact Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name / Company Name"
                        className="w-full min-w-0 border border-slate-200 outline-none rounded-xl px-3 sm:px-3.5 py-3 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-500 uppercase">{t.email}</label>
                        <div className="flex items-center border border-slate-200 rounded-xl px-3 sm:px-3.5 py-3 bg-slate-50 min-w-0 overflow-hidden">
                          <Mail className="w-4.5 h-4.5 text-slate-400 mr-2 shrink-0" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            className="bg-transparent w-full min-w-0 outline-none text-xs font-bold text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-500 uppercase">{t.phone}</label>
                        <div className="flex items-center border border-slate-200 rounded-xl px-3 sm:px-3.5 py-3 bg-slate-50 min-w-0 overflow-hidden">
                          <Phone className="w-4.5 h-4.5 text-slate-400 mr-2 shrink-0" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+962 7 XXXXXXXX"
                            className="bg-transparent w-full min-w-0 outline-none text-xs font-bold text-slate-800 text-left dir-ltr"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-[#66bfe3] font-extrabold text-xs sm:text-sm px-3 py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 transition-all cursor-pointer disabled:opacity-75 text-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-[#66bfe3]" />
                      <span>Submitting fleet request...</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-5 h-5" />
                      <span>{t.charterSubmit}</span>
                    </>
                  )}
                </button>

              </form>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}