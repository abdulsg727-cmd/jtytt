import { useState } from 'react';
import { Ticket } from '../lib/types';
import { Language, translations } from '../translations';
import { Bus, MapPin, Calendar, Clock, Ticket as TicketIcon, Trash2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { updateTicketStatusInFirestore } from '../lib/firebase';

interface MyTicketsProps {
  tickets: Ticket[];
  setTickets: (tickets: Ticket[]) => void;
  lang: Language;
}

export default function MyTickets({ tickets, setTickets, lang }: MyTicketsProps) {
  const t = translations[lang];
  const [successMsg, setSuccessMsg] = useState('');

  const handleRefund = async (pnr: string) => {
    // Simulated refund cancellation with Firestore update
    const updated = tickets.map((t) => {
      if (t.pnr === pnr) {
        return { ...t, status: 'cancelled' as const };
      }
      return t;
    });
    setTickets(updated);
    localStorage.setItem('jett_tickets_list', JSON.stringify(updated));
    
    try {
      await updateTicketStatusInFirestore(pnr, 'cancelled');
    } catch (e) {
      console.warn('Failed to update Firestore ticket status:', e);
    }

    setSuccessMsg(t.ticketRefundSuccess);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center">
        <span className="text-xs uppercase tracking-widest font-extrabold text-amber-500 bg-amber-500/10 px-4 py-1.5 rounded-full inline-block border border-amber-500/20">
          Digital Boarding Drawer
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">{t.myTickets}</h2>
        <p className="text-slate-500 font-semibold text-sm sm:text-base mt-2">
          Access your digital boarding passes, check bus boarding numbers, or manage active bookings.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl p-4 text-xs font-bold flex items-center gap-2 max-w-xl mx-auto">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
          <TicketIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h4 className="text-base font-black text-slate-800">{t.noTickets}</h4>
            <p className="text-xs text-slate-400 font-semibold mt-1">Book some bus travel tickets or bridge transits to display active passes here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {tickets.map((ticket) => {
            const isCancelled = ticket.status === 'cancelled';
            return (
              <div
                key={ticket.pnr}
                className={`bg-white border rounded-[2rem] shadow-xl overflow-hidden flex flex-col md:flex-row transition-all relative ${
                  isCancelled ? 'border-red-100 bg-red-50/10 opacity-75' : 'border-slate-100'
                }`}
              >
                
                {/* Boarding Pass Left (Bus Route Info) - 7 cols on desktop */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-500 flex items-center justify-center">
                        <Bus className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        {ticket.trip.busType} Express Boarding Pass
                      </span>
                    </div>

                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                      isCancelled
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>
                      {isCancelled ? t.ticketCancelled : t.ticketConfirmed}
                    </span>
                  </div>

                  {/* Root display with Arrow */}
                  <div className="flex items-center justify-between gap-4 mb-6 max-w-sm">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase block">{t.origin}</span>
                      <strong className="text-lg font-black text-slate-800">{ticket.trip.origin}</strong>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 mt-4 shrink-0" />
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase block">{t.destination}</span>
                      <strong className="text-lg font-black text-slate-800">{ticket.trip.destination}</strong>
                    </div>
                  </div>

                  {/* Trip Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-6 text-xs font-semibold">
                    <div>
                      <span className="text-slate-400 block uppercase text-[9px]">{t.departureDate}</span>
                      <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        {ticket.departureDate}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase text-[9px]">Timing</span>
                      <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        {ticket.trip.departureTime}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase text-[9px]">Seat Assigned</span>
                      <strong className="text-slate-800 mt-0.5 block">
                        {ticket.selectedSeats.join(', ')}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase text-[9px]">Price Paid</span>
                      <strong className="text-slate-800 block mt-0.5">
                        {ticket.totalPrice} JOD
                      </strong>
                    </div>
                  </div>

                  {/* Passenger Names details */}
                  <div className="mt-6 border-t border-slate-100 pt-4 text-xs">
                    <span className="text-slate-400 font-bold block mb-1">PASSENGERS REGISTERED</span>
                    <p className="text-slate-800 font-extrabold leading-relaxed">
                      {ticket.passengerNames.join(' | ')}
                    </p>
                  </div>

                  {/* Cancel Request Button */}
                  {!isCancelled && (
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <AlertCircle className="w-4 h-4 text-slate-300 shrink-0" />
                        <span>Eligible for full refund up to 12h prior.</span>
                      </div>
                      <button
                        onClick={() => handleRefund(ticket.pnr)}
                        className="text-red-500 hover:text-red-600 font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4 shrink-0" />
                        <span>{t.ticketRefund}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Boarding Pass Right (Visual Ticket Barcode/Strap) - 3 cols on desktop */}
                <div className="border-t-2 md:border-t-0 md:border-l-2 border-dashed border-slate-150 bg-slate-50/50 p-6 sm:p-8 flex flex-col justify-between items-center text-center w-full md:w-64 shrink-0 select-none">
                  
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">{t.pnrLabel}</span>
                    <strong className="text-2xl font-black text-slate-800 tracking-wider block mt-0.5">{ticket.pnr}</strong>
                  </div>

                  {/* Elegant Vector QR Graphic */}
                  <div className="w-32 h-32 bg-white border border-slate-200 rounded-2xl p-2.5 flex flex-col gap-1 items-center justify-center my-4 shadow-sm relative group overflow-hidden">
                    {/* Simulated outer border squares */}
                    <div className="grid grid-cols-4 gap-1 w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-300">
                      {Array.from({ length: 16 }).map((_, i) => {
                        const isCorner = i === 0 || i === 3 || i === 12 || i === 15;
                        const isRandomDark = (i * 7 + 3) % 2 === 0;
                        return (
                          <div
                            key={i}
                            className={`rounded ${
                              isCorner
                                ? 'bg-slate-900 border-2 border-amber-500'
                                : isRandomDark
                                ? 'bg-slate-800'
                                : 'bg-slate-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                    {/* Tiny Center watermark logo */}
                    <div className="absolute inset-0 m-auto w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 text-[10px] font-black shadow border border-white">
                      JETT
                    </div>
                  </div>

                  <div>
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase block tracking-widest">SCAN TO BOARD</span>
                    <span className="text-[10px] font-bold text-slate-500 block mt-0.5">Terminal gate digital checker</span>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
