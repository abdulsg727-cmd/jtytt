import React, { useState } from 'react';
import { Language, translations } from '../translations';
import { Search, Calculator, CircleCheck as CheckCircle2, Circle, ArrowRight, Package, Truck, Compass, Check } from 'lucide-react';
import { Shipment } from '../lib/types';

interface ShipmentTrackingProps {
  lang: Language;
}

export default function ShipmentTracking({ lang }: ShipmentTrackingProps) {
  const t = translations[lang];

  // Simulated Shipments database
  const sampleShipment: Shipment = {
    id: 'JT-78401-AMN',
    sender: 'Moneer Al-Khaled (Amman)',
    recipient: 'Yazan Qudah (Aqaba)',
    origin: 'Amman 7th Circle',
    destination: 'Aqaba JETT Port',
    weight: 4.5,
    status: 'ready',
    lastUpdated: 'Today at 14:32',
    timeline: [
      { status: 'received', label: lang === 'en' ? 'Package Received' : 'تم استلام الطرد', date: 'Yesterday at 09:10', completed: true },
      { status: 'sorted', label: lang === 'en' ? 'Sorted & Dispatched' : 'تم الفرز والتجهيز', date: 'Yesterday at 17:00', completed: true },
      { status: 'transit', label: lang === 'en' ? 'In Transit to Destination' : 'في الطريق إلى الوجهة', date: 'Today at 05:40', completed: true },
      { status: 'ready', label: lang === 'en' ? 'Ready for Pickup / Out for Delivery' : 'جاهز للاستلام / قيد التوصيل', date: 'Today at 11:15', completed: true },
      { status: 'delivered', label: lang === 'en' ? 'Delivered & Signed' : 'تم التسليم للمستلم', date: 'Pending', completed: false },
    ],
  };

  const [searchId, setSearchId] = useState('');
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Rate calculator inputs
  const [fromCity, setFromCity] = useState('Amman');
  const [toCity, setToCity] = useState('Aqaba');
  const [weight, setWeight] = useState(2);
  const [length, setLength] = useState(20);
  const [width, setWidth] = useState(15);
  const [height, setHeight] = useState(10);
  const [calculatedCost, setCalculatedCost] = useState<number | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setActiveShipment(null);

    const cleanId = searchId.trim().toUpperCase();
    if (cleanId === 'JT-78401-AMN' || cleanId === '78401') {
      setActiveShipment(sampleShipment);
    } else {
      setErrorMessage(t.invalidTracking);
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    // Pricing formula: base price + weight cost + volume cost
    const base = fromCity === toCity ? 1.5 : 2.5;
    const weightCost = weight * 0.4;
    const volumeCost = (length * width * height) / 4000;
    const total = parseFloat((base + weightCost + volumeCost).toFixed(2));
    setCalculatedCost(total);
  };

  const cities = ['Amman', 'Aqaba', 'Irbid', 'Salt', 'Karak', 'Jerash', 'Tafilah', 'Ma\'an', 'Zarqa'];

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-8">
      
      {/* Visual Header */}
      <div className="text-center">
        <span className="text-xs uppercase tracking-widest font-extrabold text-amber-500 bg-amber-500/10 px-4 py-1.5 rounded-full inline-block mb-3 border border-amber-500/20">
          JETT Express National Logistics
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">{t.trackTitle}</h2>
        <p className="text-slate-500 max-w-xl mx-auto font-semibold text-sm sm:text-base mt-2">
          {t.trackDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Module 1: Parcel Tracker */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Live Package Tracking</h3>
            </div>

            <form onSubmit={handleTrack} className="space-y-4">
              <p className="text-xs text-slate-500 font-semibold">{t.enterTracking}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="e.g. JT-78401-AMN"
                  className="flex-1 border border-slate-200 focus:border-amber-500 outline-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 bg-slate-50"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-[#66bfe3] font-extrabold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md shadow-slate-900/10 cursor-pointer shrink-0"
                >
                  {t.trackBtn}
                </button>
              </div>
            </form>

            {errorMessage && (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-xs font-bold mt-4">
                {errorMessage}
              </div>
            )}

            {activeShipment && (
              <div className="mt-8 space-y-6 border-t border-slate-100 pt-6 animate-in fade-in duration-300">
                <div className="bg-slate-50 border border-slate-100/50 p-4 rounded-2xl flex flex-wrap gap-x-8 gap-y-2 text-xs font-semibold">
                  <div>
                    <span className="text-slate-400 block">ID Reference</span>
                    <strong className="text-slate-800 font-extrabold">{activeShipment.id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Sender</span>
                    <strong className="text-slate-800 font-extrabold">{activeShipment.sender}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Recipient</span>
                    <strong className="text-slate-800 font-extrabold">{activeShipment.recipient}</strong>
                  </div>
                </div>

                {/* Timeline display */}
                <div className="relative pl-6 rtl:pr-6 rtl:pl-0 border-l border-slate-200 rtl:border-r rtl:border-l-0 space-y-6 mt-4">
                  {activeShipment.timeline?.map((step, idx) => {
                    const isCompleted = step.completed;
                    const isCurrent = activeShipment.status === step.status;
                    return (
                      <div key={idx} className="relative">
                        {/* Dot indicator */}
                        <div className={`absolute -left-9 rtl:-right-9 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isCompleted
                            ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-md shadow-amber-500/10'
                            : 'bg-white border-slate-200 text-slate-300'
                        }`}>
                          {isCompleted ? <Check className="w-3 h-3 font-extrabold" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
                        </div>

                        {/* Text */}
                        <div className="-mt-1">
                          <p className={`text-xs font-black ${isCurrent ? 'text-amber-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                            {step.label} {isCurrent && '(CURRENT)'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{step.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {!activeShipment && (
            <div className="border border-dashed border-slate-100 rounded-2xl p-6 mt-8 flex flex-col items-center justify-center text-center bg-slate-50/50">
              <Package className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">No active tracking searched</p>
              <button
                onClick={() => { setSearchId('JT-78401-AMN'); setActiveShipment(sampleShipment); }}
                className="text-[10px] text-amber-600 hover:text-amber-700 font-extrabold underline mt-1 cursor-pointer"
              >
                Click to autofill valid Demo ID: JT-78401-AMN
              </button>
            </div>
          )}
        </div>

        {/* Module 2: Shipping Rate Estimator */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
          <form onSubmit={handleCalculate} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">{t.calculatorTitle}</h3>
                <p className="text-xs font-semibold text-slate-400">{t.calcDesc}</p>
              </div>
            </div>

            {/* From & To Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase">{t.origin}</label>
                <select
                  value={fromCity}
                  onChange={(e) => { setFromCity(e.target.value); setCalculatedCost(null); }}
                  className="w-full border border-slate-200 outline-none rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 bg-slate-50"
                >
                  {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase">{t.destination}</label>
                <select
                  value={toCity}
                  onChange={(e) => { setToCity(e.target.value); setCalculatedCost(null); }}
                  className="w-full border border-slate-200 outline-none rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 bg-slate-50"
                >
                  {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </div>

            {/* Weight Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                <span className="uppercase">{t.calcWeight}</span>
                <span className="text-amber-600 font-extrabold text-sm">{weight} kg</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={50}
                step={0.5}
                value={weight}
                onChange={(e) => { setWeight(parseFloat(e.target.value)); setCalculatedCost(null); }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase">{t.calcLength}</label>
                <input
                  type="number"
                  value={length}
                  onChange={(e) => { setLength(Math.max(1, parseInt(e.target.value) || 0)); setCalculatedCost(null); }}
                  className="w-full border border-slate-200 outline-none rounded-xl px-3 py-2 text-xs font-bold text-slate-800 text-center bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase">{t.calcWidth}</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => { setWidth(Math.max(1, parseInt(e.target.value) || 0)); setCalculatedCost(null); }}
                  className="w-full border border-slate-200 outline-none rounded-xl px-3 py-2 text-xs font-bold text-slate-800 text-center bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase">{t.calcHeight}</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => { setHeight(Math.max(1, parseInt(e.target.value) || 0)); setCalculatedCost(null); }}
                  className="w-full border border-slate-200 outline-none rounded-xl px-3 py-2 text-xs font-bold text-slate-800 text-center bg-slate-50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-[#66bfe3] font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-slate-900/10 cursor-pointer"
            >
              {t.calcBtn}
            </button>
          </form>

          {calculatedCost !== null && (
            <div className="mt-6 bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center flex flex-col items-center justify-center animate-in zoom-in duration-200">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t.estimatedRate}</span>
              <p className="text-4xl font-black text-slate-900 mt-1">
                {calculatedCost} <span className="text-base font-extrabold text-amber-500">JOD</span>
              </p>
              <p className="text-[10px] font-semibold text-slate-400 mt-1.5 leading-relaxed">
                Includes general sales tax & transit insurance.<br />Express deliveries take 1 business day across Jordan.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
