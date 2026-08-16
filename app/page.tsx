'use client';

import React, { useState, useEffect } from 'react';
import {
  BusTrip,
  fetchTicketsFromFirestore,
  initVisitorSession,
  updateVisitorPage,
  logVisitorSearch,
  Calendar,
  Users,
  Search,
  Bus,
  MapPinned,
  Armchair,
  Gift,
  Zap,
  Leaf
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const [lang, setLang] = useState<Language>('ar');
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Pre-fill query state
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    origin: 'Amman',
    destination: 'Aqaba',
    departureDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    tripType: 'one-way',
    serviceType: 'regular',
    passengers: { adults: 1, children: 0, infants: 0 },
  });

  const [showPaxDropdown, setShowPaxDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filteredTrips, setFilteredTrips] = useState<BusTrip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<BusTrip | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [bookingStep, setBookingStep] = useState<'search' | 'seats' | 'checkout'>('search');

  const t = translations[lang];

  // Load bookings from Firestore & localStorage, test connection
  useEffect(() => {
    testConnection();

    async function loadData() {
      // First load from localStorage for instant display
      const saved = localStorage.getItem('jett_tickets_list');
      let localList: Ticket[] = [];
      if (saved) {
        try {
          localList = JSON.parse(saved);
          setTickets(localList);
        } catch (e) {
          console.error('Error parsing local tickets', e);
        }
      }

      // Load session state
      const savedSearch = localStorage.getItem('jett_search_query');
      if (savedSearch) setSearchQuery(JSON.parse(savedSearch));

      const savedStep = localStorage.getItem('jett_booking_step');
      if (savedStep) setBookingStep(JSON.parse(savedStep));

      const savedLang = localStorage.getItem('jett_lang');
      if (savedLang) setLang(JSON.parse(savedLang));

      // Then fetch from Firestore and merge
      try {
        const remoteTickets = await fetchTicketsFromFirestore();
        if (remoteTickets && remoteTickets.length > 0) {
          const mergedMap = new Map<string, Ticket>();
          // Remote first
          remoteTickets.forEach((t) => mergedMap.set(t.id, t));
          // Local fallback
          localList.forEach((t) => {
            if (!mergedMap.has(t.id)) mergedMap.set(t.id, t);
          });
          const combined = Array.from(mergedMap.values());
          setTickets(combined);
          localStorage.setItem('jett_tickets_list', JSON.stringify(combined));
        }
      } catch (err) {
        console.warn('Could not sync Firestore tickets:', err);
      }
    }

    loadData();
  }, []);

  // Save session state on change
  useEffect(() => {
    localStorage.setItem('jett_search_query', JSON.stringify(searchQuery));
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('jett_booking_step', JSON.stringify(bookingStep));
  }, [bookingStep]);

  useEffect(() => {
    localStorage.setItem('jett_lang', JSON.stringify(lang));
  }, [lang]);

  // Update HTML direction when language changes
  useEffect(() => {
    document.documentElement.dir = t.dir;
    document.documentElement.lang = lang;
  }, [lang, t]);

  // Scroll to booking form when step changes
  useEffect(() => {
    if (bookingStep !== 'search') {
      const el = document.getElementById('booking-card-anchor');
      if (el) {
        // use setTimeout to ensure render has happened
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'end' }), 50);
      }
    }
  }, [bookingStep]);

  // Seed standard trips database
  const getSimulatedTrips = (from: string, to: string): BusTrip[] => {
    const baseTrips: BusTrip[] = [
      { id: 'TRIP-101', origin: from, destination: to, departureTime: '07:30', arrivalTime: '11:45', price: 9.5, busType: 'Regular', availableSeats: 18, totalSeats: 36 },
      { id: 'TRIP-102', origin: from, destination: to, departureTime: '09:45', arrivalTime: '13:50', price: 13.5, busType: 'VIP', availableSeats: 12, totalSeats: 36 },
      { id: 'TRIP-103', origin: from, destination: to, departureTime: '12:15', arrivalTime: '16:30', price: 9.5, busType: 'Regular', availableSeats: 29, totalSeats: 36 },
      { id: 'TRIP-104', origin: from, destination: to, departureTime: '15:30', arrivalTime: '19:35', price: 13.5, busType: 'VIP', availableSeats: 6, totalSeats: 36 },
      { id: 'TRIP-105', origin: from, destination: to, departureTime: '18:45', arrivalTime: '23:00', price: 9.5, busType: 'Regular', availableSeats: 31, totalSeats: 36 },
    ];
    return baseTrips;
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trips = getSimulatedTrips(searchQuery.origin, searchQuery.destination);
    setFilteredTrips(trips);
    setBookingStep('search');
    setHasSearched(true);
    router.push('/booking');
    logVisitorSearch(searchQuery);
  };

  const handleQuickSearch = (origin: string, dest: string) => {
    const updatedQuery = {
      ...searchQuery,
      origin,
      destination: dest,
    };
    setSearchQuery(updatedQuery);
    const trips = getSimulatedTrips(origin, dest);
    setFilteredTrips(trips);
    setBookingStep('search');
    setHasSearched(true);
    router.push('/booking');
    logVisitorSearch(updatedQuery);
  };


  const totalRequiredPax = searchQuery.passengers.adults + searchQuery.passengers.children;

  const popularRoutesList = [
    { from: 'Amman', to: 'Aqaba', label: lang === 'en' ? 'Aqaba' : 'العقبة', url: 'https://media.base44.com/images/public/6a7d61d7b5b6dc163f4c466d/46bb53153_jett_com_jo_aqaba_82ed7792.png' },
    { from: 'Amman', to: 'Jerash', label: lang === 'en' ? 'Jerash' : 'جرش', url: 'https://media.base44.com/images/public/6a7d61d7b5b6dc163f4c466d/ca3888aea_jett_com_jo_jerash_9304a89b.png' },
    { from: 'Amman', to: 'Petra', label: lang === 'en' ? 'Petra' : 'البتراء', url: 'https://media.base44.com/images/public/6a7d61d7b5b6dc163f4c466d/0a738645d_jett_com_jo_petra_11bb6d9c.png' },
    { from: 'Amman', to: 'Ajloun', label: lang === 'en' ? 'Ajloun' : 'عجلون', url: 'https://media.base44.com/images/public/6a7d61d7b5b6dc163f4c466d/dda972abc_generated_69d1e359.png' },
    { from: 'Amman', to: 'Karak', label: lang === 'en' ? 'Karak' : 'الكرك', url: 'https://media.base44.com/images/public/6a7d61d7b5b6dc163f4c466d/76fdd7c98_jett_com_jo_karak_a982ba62.png' },
    { from: 'Amman', to: 'Wadi Rum', label: lang === 'en' ? 'Wadi Rum' : 'وادي رم', url: 'https://media.base44.com/images/public/6a7d61d7b5b6dc163f4c466d/fa4940c43_jett_com_jo_wadi_rum_f45f08aa.png' },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans selection:bg-[#66bfe3]/20 selection:text-[#66bfe3] overflow-x-hidden w-full">
      <VisitorTracker language={lang} />
      
      <Navbar
        currentView="home"
        setView={(view) => {
          const routes: Record<string, string> = { home: '/', booking: '/booking', shipment: '/shipment', khb: '/khb', charter: '/charter', 'my-tickets': '/my-tickets', dashboard: '/dashboard' };
          router.push(routes[view] || '/');
        }}
        lang={lang}
        setLang={setLang}
        bookingCount={tickets.filter((t) => t.status === 'confirmed').length}
      />

      {/* Main viewport area */}
      <main className="flex-grow">
        
        {/* VIEW 1: HOME LANDING */}
        {(
          <div className="space-y-0 font-sans text-slate-800">
            
            {/* 1. Full-bleed Hero Block with JETT Jordan Flag Banner */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] min-h-[300px] sm:min-h-[420px] overflow-hidden bg-[#102a43]">
              <img
                src="https://media.base44.com/images/public/6a7d61d7b5b6dc163f4c466d/a02605391_jett_com_jo_pdfSu2xXYODV2pRYIylTw2Ny2j44A5cDMXj8TDQ2_ee953d72.png"
                alt="JETT buses with Jordan Flag"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent" />
              
              {/* Dynamic Tagline overlay on hero */}
              <div className="absolute bottom-24 sm:bottom-12 left-4 sm:left-12 right-4 sm:right-12 z-10 flex flex-col justify-end text-white text-left rtl:text-right">
                <span className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-[#46bbec] drop-shadow-sm mb-1 sm:mb-2">
                  {lang === 'ar' ? 'جسر العبور الآمن والمريح منذ ١٩٦٤' : 'YOUR LUXURIOUS COCH TRANSIT SINCE 1964'}
                </span>
                <h1 className="text-lg sm:text-3xl lg:text-4xl font-black leading-tight drop-shadow-md">
                  {lang === 'ar' ? 'سافر عبر الأردن بأرقى مستويات الأمان' : 'Travel Jordan with Absolute Comfort'}
                </h1>
              </div>
            </div>

            {/* 2. Three main stacked transport options block ("النقل") exactly as shown in reference */}
            <div className="max-w-4xl mx-auto px-3 sm:px-4 -mt-12 sm:-mt-10 relative z-20">
              <div className="bg-[#003c5b] border border-slate-700 rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-5">
                <h3 className="text-[10px] font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-3 bg-[#46bbec] rounded-full" />
                  {lang === 'ar' ? 'النقل والخدمات' : 'TRANSIT OPTIONS'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <button
                    onClick={() => router.push('/khb')}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 hover:border-[#46bbec] bg-white/10 hover:bg-white/20 transition-all font-bold text-xs text-white"
                  >
                    <span>{lang === 'ar' ? 'جسر الملك حسين' : 'King Hussein Bridge'}</span>
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">→</span>
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('booking-card-anchor');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-[#46bbec]/40 bg-white/10 hover:bg-white/20 transition-all font-bold text-xs text-white"
                  >
                    <span>{lang === 'ar' ? 'النقل السياحي' : 'Tourist Transportation'}</span>
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white/50">↓</span>
                  </button>
                  <button
                    onClick={() => router.push('/shipment')}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 hover:border-[#46bbec] bg-white/10 hover:bg-white/20 transition-all font-bold text-xs text-white"
                  >
                    <span>{lang === 'ar' ? 'جت إكسبريس' : 'JETT Express Shipment'}</span>
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white/50">→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Primary Booking Form Card with "Rahhal" Assistant */}
            <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 sm:py-10" id="booking-card-anchor">
              <div className="bg-[#003c5b] border border-slate-700 rounded-xl sm:rounded-2xl shadow-xl p-3.5 sm:p-6 md:p-8 relative">
                
                {/* Form Header */}
                <h2 className="text-lg sm:text-xl font-black text-white mb-6 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-[#66bfe3]" />
                  {lang === 'ar' ? 'تحديد مسار الرحلة' : 'Select Trip Route'}
                </h2>

                {/* Form Top Toggles */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
                  {/* Trip Category Selector: Domestic vs International */}
                  <div className="grid grid-cols-2 w-full sm:w-auto bg-slate-900/50 p-1 rounded-xl border border-slate-700 self-start">
                    <button
                      onClick={() => setSearchQuery((prev) => ({ ...prev, origin: 'Amman', destination: 'Aqaba' }))}
                      className="min-w-0 px-2.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-black transition-all bg-[#003c5b] text-white shadow-sm border border-slate-700 whitespace-nowrap"
                    >
                      {lang === 'ar' ? 'رحلة داخلية' : 'Domestic Trip'}
                    </button>
                    <button
                      onClick={() => setSearchQuery((prev) => ({ ...prev, origin: 'Amman Terminals', destination: 'King Hussein Bridge' }))}
                      className="min-w-0 px-2.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-slate-300 hover:text-white whitespace-nowrap"
                    >
                      {lang === 'ar' ? 'رحلة دولية' : 'International Trip'}
                    </button>
                  </div>

                  {/* Trip Type Selector Toggle Switch: One Way vs Round Trip */}
                  <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto">
                    <span className={`text-xs font-bold ${searchQuery.tripType === 'round-trip' ? 'text-white' : 'text-slate-400'}`}>
                      {lang === 'ar' ? 'ذهاب وعودة' : 'Round Trip'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery((p) => ({ ...p, tripType: p.tripType === 'one-way' ? 'round-trip' : 'one-way' }))}
                      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-slate-700"
                      role="switch"
                      aria-checked={searchQuery.tripType === 'round-trip'}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          searchQuery.tripType === 'round-trip' ? (lang === 'ar' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={`text-xs font-bold ${searchQuery.tripType === 'one-way' ? 'text-white' : 'text-slate-400'}`}>
                      {lang === 'ar' ? 'ذهاب فقط' : 'One Way'}
                    </span>
                  </div>
                </div>

                {/* Form Fields Fields Grid */}
                <form onSubmit={handleSearchSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Origin Field */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider block">
                        {lang === 'ar' ? 'اختر نقطة الانطلاق' : 'Select starting point'}
                      </label>
                      <div className="flex items-center border border-slate-700 focus-within:border-[#46bbec] rounded-xl px-3 py-2 bg-slate-900/50 focus-within:bg-slate-900 transition-all">
                        <MapPin className="w-4 h-4 text-sky-500 shrink-0 mx-1" />
                        <select
                          value={searchQuery.origin}
                          onChange={(e) => setSearchQuery((p) => ({ ...p, origin: e.target.value }))}
                          className="bg-transparent w-full min-w-0 outline-none text-xs font-extrabold text-white"
                        >
                          <option value="Amman">{lang === 'ar' ? 'عمان (العبدلّي)' : 'Amman (Abdali)'}</option>
                          <option value="Aqaba">{lang === 'ar' ? 'العقبة' : 'Aqaba'}</option>
                          <option value="Irbid">{lang === 'ar' ? 'إربد' : 'Irbid'}</option>
                          <option value="Petra">{lang === 'ar' ? 'البتراء' : 'Petra'}</option>
                          <option value="Jerash">{lang === 'ar' ? 'جرش' : 'Jerash'}</option>
                          <option value="Wadi Rum">{lang === 'ar' ? 'وادي رم' : 'Wadi Rum'}</option>
                          <option value="Amman Terminals">{lang === 'ar' ? 'مكاتب جسر الملك حسين' : 'King Hussein Bridge Terminals'}</option>
                        </select>
                      </div>
                    </div>

                    {/* Destination Field */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider block">
                        {lang === 'ar' ? 'اختر وجهتك' : 'Select your destination'}
                      </label>
                      <div className="flex items-center border border-slate-700 focus-within:border-[#46bbec] rounded-xl px-3 py-2 bg-slate-900/50 focus-within:bg-slate-900 transition-all">
                        <MapPin className="w-4 h-4 text-[#46bbec] shrink-0 mx-1" />
                        <select
                          value={searchQuery.destination}
                          onChange={(e) => setSearchQuery((p) => ({ ...p, destination: e.target.value }))}
                          className="bg-transparent w-full min-w-0 outline-none text-xs font-extrabold text-white"
                        >
                          <option value="Aqaba">{lang === 'ar' ? 'العقبة' : 'Aqaba'}</option>
                          <option value="Amman">{lang === 'ar' ? 'عمان (العبدلّي)' : 'Amman (Abdali)'}</option>
                          <option value="Petra">{lang === 'ar' ? 'البتراء' : 'Petra'}</option>
                          <option value="Wadi Rum">{lang === 'ar' ? 'وادي رم' : 'Wadi Rum'}</option>
                          <option value="Jerash">{lang === 'ar' ? 'جرش' : 'Jerash'}</option>
                          <option value="Irbid">{lang === 'ar' ? 'إربد' : 'Irbid'}</option>
                          <option value="King Hussein Bridge">{lang === 'ar' ? 'جسر الملك حسين (VIP)' : 'King Hussein Bridge (VIP)'}</option>
                        </select>
                      </div>
                    </div>

                  </div>

                  {/* Date and Passengers Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Departure Date */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider block">
                        {lang === 'ar' ? 'تاريخ الذهاب' : 'Departure Date'}
                      </label>
                      <div className="flex items-center border border-slate-700 focus-within:border-[#46bbec] rounded-xl px-3 py-2 bg-slate-900/50 focus-within:bg-slate-900 transition-all">
                        <Calendar className="w-4 h-4 text-sky-500 shrink-0 mx-1" />
                        <input
                          type="date"
                          value={searchQuery.departureDate}
                          onChange={(e) => setSearchQuery((p) => ({ ...p, departureDate: e.target.value }))}
                          className="bg-transparent w-full min-w-0 outline-none text-xs font-extrabold text-white cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Return Date */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider block">
                        {lang === 'ar' ? 'تاريخ العودة' : 'Return Date'}
                      </label>
                      <div className={`flex items-center border border-slate-700 rounded-xl px-3 py-2 bg-slate-900/50 transition-all ${
                        searchQuery.tripType === 'one-way' ? 'opacity-40 cursor-not-allowed' : 'focus-within:border-[#46bbec] focus-within:bg-slate-900'
                      }`}>
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0 mx-1" />
                        <input
                          type="date"
                          disabled={searchQuery.tripType === 'one-way'}
                          value={searchQuery.returnDate || ''}
                          onChange={(e) => setSearchQuery((p) => ({ ...p, returnDate: e.target.value }))}
                          className="bg-transparent w-full min-w-0 outline-none text-xs font-extrabold text-white cursor-pointer disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Passengers */}
                    <div className="space-y-1 relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        {lang === 'ar' ? 'المسافرين' : 'Passengers'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPaxDropdown(!showPaxDropdown)}
                        className="w-full flex items-center justify-between border border-slate-200 hover:border-[#46bbec] rounded-xl px-3 py-2.5 bg-slate-50/50 text-left rtl:text-right text-xs font-extrabold text-slate-800"
                      >
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-sky-500 shrink-0" />
                          <span>{totalRequiredPax} {lang === 'ar' ? 'مسافر' : 'PAX'}</span>
                        </span>
                        <span className="text-[10px]">▼</span>
                      </button>

                      {showPaxDropdown && (
                        <div className="absolute z-30 top-full mt-2 right-0 left-0 sm:right-auto sm:w-64 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 space-y-3">
                          {/* Adults */}
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <div>
                              <p className="font-extrabold text-slate-800">{t.paxAdult}</p>
                              <p className="text-[10px] text-slate-400">{t.paxAdultSub}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-full">
                              <button
                                type="button"
                                onClick={() => setSearchQuery((p) => ({ ...p, passengers: { ...p.passengers, adults: Math.max(1, p.passengers.adults - 1) } }))}
                                className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-700"
                              >
                                -
                              </button>
                              <span className="text-xs font-extrabold w-4 text-center">{searchQuery.passengers.adults}</span>
                              <button
                                type="button"
                                onClick={() => setSearchQuery((p) => ({ ...p, passengers: { ...p.passengers, adults: p.passengers.adults + 1 } }))}
                                className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-700"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Children */}
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <div>
                              <p className="font-extrabold text-slate-800">{t.paxChild}</p>
                              <p className="text-[10px] text-slate-400">{t.paxChildSub}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-full">
                              <button
                                type="button"
                                onClick={() => setSearchQuery((p) => ({ ...p, passengers: { ...p.passengers, children: Math.max(0, p.passengers.children - 1) } }))}
                                className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-700"
                              >
                                -
                              </button>
                              <span className="text-xs font-extrabold w-4 text-center">{searchQuery.passengers.children}</span>
                              <button
                                type="button"
                                onClick={() => setSearchQuery((p) => ({ ...p, passengers: { ...p.passengers, children: p.passengers.children + 1 } }))}
                                className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-700"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-2 text-right rtl:text-left">
                            <button
                              type="button"
                              onClick={() => setShowPaxDropdown(false)}
                              className="bg-[#122b4f] text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg hover:bg-slate-850"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Search Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-[#46bbec] hover:bg-[#3caade] text-slate-950 font-black text-sm py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#46bbec]/10 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <Search className="w-4.5 h-4.5 text-slate-950" />
                      <span>{lang === 'ar' ? 'بحث عن الحافلات المتاحة' : 'Search Available Buses'}</span>
                    </button>
                  </div>

                </form>



              </div>
            </div>

            {/* 4. Five Key Brand Core Highlights Grid as seen in reference */}
            <div className="bg-white border-y border-slate-100 py-10 sm:py-16 px-3 sm:px-4">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                  <span className="text-xs uppercase tracking-widest font-black text-sky-600">{lang === 'ar' ? 'لماذا جيت للنقل؟' : 'Why Travel JETT?'}</span>
                  <h2 className="text-lg sm:text-xl font-black text-[#122b4f] mt-1">
                    {lang === 'ar' ? 'الريادة والتميز في النقل السياحي والبري' : 'Pioneering Transit Safety and Excellence'}
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-7 sm:gap-8">
                  {[
                    { 
                      icon: MapPinned, 
                      title: lang === 'ar' ? 'أكبر شبكة حافلات' : 'Largest Bus Network', 
                      sub: lang === 'ar' ? 'استكشف الأردن معنا' : 'Explore Jordan with us' 
                    },
                    { 
                      icon: Leaf, 
                      title: lang === 'ar' ? 'صديق للبيئة' : 'Eco-Friendly', 
                      sub: lang === 'ar' ? 'الخيار الأكثر حفاظاً على البيئة' : 'The greenest option' 
                    },
                    { 
                      icon: Zap, 
                      title: lang === 'ar' ? 'حجز سريع' : 'Fast Booking', 
                      sub: lang === 'ar' ? 'حجز التذاكر بسهولة' : 'Book tickets with ease' 
                    },
                    { 
                      icon: Armchair, 
                      title: lang === 'ar' ? 'اختيار المقعد' : 'Seat Selection', 
                      sub: lang === 'ar' ? 'مقعدك المفضل في كل مرة' : 'Your favorite seat every time' 
                    },
                    { 
                      icon: Gift, 
                      title: lang === 'ar' ? 'برنامج المكافآت' : 'Rewards Program', 
                      sub: lang === 'ar' ? 'اكسب مكافآت في كل رحلة' : 'Earn rewards on every trip' 
                    },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="flex flex-col items-center text-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-sky-50 border border-slate-100 text-sky-500 flex items-center justify-center shadow-sm">
                          <Icon className="w-6 h-6 text-sky-500" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-xs tracking-wide uppercase">{item.title}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 5. Most Popular Destinations Section with Shaded Curved Blue Backdrop */}
            <div className="bg-[#f2f8ff] py-12 sm:py-20 px-3 sm:px-4">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8 sm:mb-12">
                  <span className="text-xs uppercase tracking-widest font-black text-sky-600">
                    {lang === 'ar' ? 'الوجهات الأكثر شهرة' : 'Most Popular Destinations'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#122b4f] mt-1">
                    {lang === 'ar' ? 'رحلات يومية مباشرة إلى معالم الأردن التاريخية والشواطئ' : 'Direct Daily Tourist Gateways'}
                  </h2>
                  <p className="text-slate-500 font-semibold text-xs sm:text-sm max-w-2xl mx-auto mt-2 leading-relaxed">
                    {lang === 'ar' 
                      ? 'مع أكثر من ١٨٠ محطة في جميع أنحاء المملكة ضمن أكبر شبكة حافلات في الأردن، هناك العديد من الأماكن لاكتشافها واستكشافها.'
                      : 'With more than 180 stations across the Kingdom as part of the largest bus network in Jordan, there are many places to discover.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6">
                  {popularRoutesList.map((route, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleQuickSearch(route.from, route.to)}
                      className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer bg-slate-100 border border-slate-200"
                    >
                      <img
                        src={route.url}
                        alt={route.to}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
                      <div className="absolute inset-0 p-2.5 sm:p-4 flex flex-col justify-end text-center">
                        <span className="text-sm font-black text-white tracking-wide uppercase block drop-shadow-sm">
                          {route.label}
                        </span>
                        <span className="text-[9px] font-bold text-[#46bbec] uppercase mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {lang === 'ar' ? 'احجز المقعد الآن' : 'BOOK INSTANTLY'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. Mercedes Luxury Sprinter & Tourism Charter Box as shown in reference */}
            <div className="relative min-h-[420px] sm:min-h-[45vh] flex items-center bg-slate-950 text-white overflow-hidden py-12 sm:py-24">
              <div className="absolute inset-0 opacity-40">
                <img
                  src="https://media.base44.com/images/public/6a7d61d7b5b6dc163f4c466d/dda972abc_generated_69d1e359.png"
                  alt="Premium interiors"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <span className="text-xs uppercase tracking-widest font-black text-sky-400 bg-sky-400/10 px-4 py-1.5 rounded-full inline-block border border-sky-400/20">
                    {lang === 'ar' ? 'أسطول جت الممتاز' : 'Premium Coach Hire'}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    {lang === 'ar' ? 'أسطول حافلات مرسيدس وسبرينتر الفاخرة لتنقلات المجموعات' : 'VIP Executive Coach Charter & Vans'}
                  </h2>
                  <p className="text-slate-300 font-medium leading-relaxed text-sm">
                    {lang === 'ar' 
                      ? 'هل تخطط لرحلة عائلية أو جولة لوفد رسمي؟ تتيح لك جت استئجار حافلات سياحية حديثة ومكيفة بالكامل ومزودة بسائقين مهنيين لرحلتك الخاصة في جميع أنحاء المملكة.'
                      : "Rent one of JETT's fully-crewed luxury tour coaches or Mercedes Sprinter VIP vans for corporate events, schools, or private group travel nationwide."}
                  </p>
                  <button
                    onClick={() => router.push('/charter')}
                    className="w-full sm:w-auto bg-[#46bbec] text-slate-950 hover:bg-[#3caade] hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-xs px-5 sm:px-8 py-3.5 rounded-xl shadow-lg cursor-pointer"
                  >
                    {lang === 'ar' ? 'طلب عرض سعر للرحلات الخاصة' : 'Request Private Quote'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer lang={lang} />
      <AuthModal lang={lang} />
    </div>
  );
}