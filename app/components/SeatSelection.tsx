import { useState } from 'react';
import { BusTrip, PassengerCount } from '../lib/types';
import { Language, translations } from '../translations';
import { Check, Armchair, ChevronRight, AlertCircle } from 'lucide-react';
import { logVisitorTripSelection } from '../lib/firebase';

interface SeatSelectionProps {
  trip: BusTrip;
  passengers: PassengerCount;
  selectedSeats: number[];
  setSelectedSeats: (seats: number[]) => void;
  lang: Language;
  onContinue: () => void;
}

export default function SeatSelection({
  trip,
  passengers,
  selectedSeats,
  setSelectedSeats,
  lang,
  onContinue,
}: SeatSelectionProps) {
  const t = translations[lang];
  const totalRequired = passengers.adults + passengers.children;

  // Deterministic, minimal occupied seats so 32+ seats are ALWAYS open and available
  const getOccupiedSeats = (tripId: string): number[] => {
    const map: Record<string, number[]> = {
      'TRIP-101': [7, 18, 29],
      'TRIP-102': [4, 15, 31],
      'TRIP-103': [8, 22],
      'TRIP-104': [6, 17, 30],
      'TRIP-105': [3, 20],
    };
    if (map[tripId]) return map[tripId];
    
    // Default fallback: only 3 scattered occupied seats
    const charCode = tripId ? tripId.charCodeAt(0) + tripId.charCodeAt(tripId.length - 1) : 0;
    const presets = [
      [5, 16, 27],
      [7, 18, 29],
      [4, 15, 28],
      [8, 21, 32],
      [6, 19, 30],
    ];
    return presets[charCode % presets.length];
  };

  const occupiedSeats = getOccupiedSeats(trip.id);
  const availableCount = 36 - occupiedSeats.length;

  const handleSeatClick = (seatNum: number) => {
    if (occupiedSeats.includes(seatNum)) return;

    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNum));
    } else {
      if (selectedSeats.length >= totalRequired) {
        // Replace the oldest selected seat to keep within required count
        setSelectedSeats([...selectedSeats.slice(1), seatNum]);
      } else {
        setSelectedSeats([...selectedSeats, seatNum]);
      }
    }
  };

  // Generate seats in a grid: rows 1 to 9, columns 1 to 4. Column 2 and 3 has aisle between them.
  const rows = Array.from({ length: 9 }, (_, i) => i + 1);

  const renderSeatButton = (seatNumber: number) => {
    const isSelected = selectedSeats.includes(seatNumber);
    const isOccupied = occupiedSeats.includes(seatNumber);

    return (
      <button
        key={seatNumber}
        type="button"
        disabled={isOccupied}
        onClick={() => handleSeatClick(seatNumber)}
        aria-label={`Seat ${seatNumber} ${isOccupied ? 'Occupied' : isSelected ? 'Selected' : 'Available'}`}
        className={`group relative w-full min-w-0 h-10 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-150 ${
          isOccupied
            ? 'bg-slate-100/90 border border-slate-200 text-slate-300 cursor-not-allowed select-none'
            : isSelected
            ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-105 border-2 border-amber-600 ring-2 ring-amber-300/70 z-10 cursor-pointer'
            : 'bg-white border-2 border-slate-300 hover:border-amber-500 hover:bg-amber-50/50 text-slate-800 shadow-sm hover:shadow hover:scale-105 cursor-pointer'
        }`}
      >
        <div className="flex flex-col items-center justify-center">
          <Armchair
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isOccupied
                ? 'text-slate-300'
                : isSelected
                ? 'text-slate-950 fill-slate-950/20'
                : 'text-slate-600 group-hover:text-amber-600'
            }`}
          />
          <span
            className={`text-[10px] font-black leading-none mt-0.5 ${
              isOccupied
                ? 'text-slate-400 line-through opacity-70'
                : isSelected
                ? 'text-slate-950'
                : 'text-slate-800 group-hover:text-amber-700'
            }`}
          >
            {seatNumber}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-3 sm:p-10 shadow-xl w-full max-w-4xl mx-auto min-w-0 overflow-hidden">
      
      <div className="flex flex-col md:flex-row gap-4 sm:gap-8 justify-between items-start border-b border-slate-100 pb-5 sm:pb-8 mb-5 sm:mb-8 min-w-0">
        <div>
          <span className="text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-extrabold text-amber-600 block mb-1 break-words">
            {trip.busType} Coach Service • {availableCount} Seats Available
          </span>
          <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight break-words">
            {t.busSeating}
          </h3>
          <p className="text-slate-500 font-semibold text-xs sm:text-sm mt-1 break-words">
            {t.origin}: <strong className="text-slate-800">{trip.origin}</strong> → {t.destination}: <strong className="text-slate-800">{trip.destination}</strong>
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 sm:p-4 w-full md:w-auto text-center md:text-left rtl:md:text-right min-w-0">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Seats Required</p>
          <p className="text-base font-black text-slate-900">
            {selectedSeats.length} / {totalRequired} <span className="text-sm font-semibold text-slate-500">{t.selectedSeats}</span>
          </p>
          {selectedSeats.length < totalRequired ? (
            <span className="text-amber-600 font-bold text-xs flex items-center justify-center md:justify-start gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> Please select {totalRequired - selectedSeats.length} more seat(s)
            </span>
          ) : (
            <span className="text-emerald-600 font-bold text-xs flex items-center justify-center md:justify-start gap-1 mt-1">
              <Check className="w-4 h-4" /> All seats selected successfully!
            </span>
          )}
        </div>
      </div>

      {/* Seat Guide Legend */}
      <div className="grid grid-cols-1 xs:grid-cols-3 sm:flex sm:flex-wrap items-start sm:items-center justify-center gap-2.5 sm:gap-8 mb-6 sm:mb-10 bg-slate-50 border border-slate-100 p-3 sm:p-4 rounded-2xl">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white border-2 border-slate-300 flex items-center justify-center text-slate-700 shadow-sm">
            <Armchair className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-700 break-words">
            {t.availableSeat} ({availableCount})
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#66bfe3] text-slate-950 flex items-center justify-center shadow-md shadow-[#66bfe3]/20 border border-[#66bfe3]">
            <Armchair className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-700 break-words">
            {t.selectedSeat} ({selectedSeats.length})
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center">
            <Armchair className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 break-words">
            {t.occupiedSeat} ({occupiedSeats.length})
          </span>
        </div>
      </div>

      {/* Visual Bus Frame */}
      <div className="w-full max-w-[320px] sm:max-w-md mx-auto border-[3px] sm:border-4 border-slate-300 rounded-[2rem] sm:rounded-[2.5rem] bg-slate-50/80 p-3 sm:p-7 relative shadow-inner mb-6 sm:mb-8 overflow-hidden">
        
        {/* Steering Wheel and Driver at the front */}
        <div className="flex justify-between items-center gap-2 pb-4 sm:pb-6 border-b-2 border-dashed border-slate-200 mb-5 sm:mb-8 px-1 sm:px-2 text-[10px] sm:text-xs font-bold text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full border-2 border-slate-300 bg-slate-200 flex items-center justify-center text-sm">⚙️</span>
            <span>{t.driverSeat}</span>
          </div>
          <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide">
            {t.door}
          </div>
        </div>

        {/* Seating Grid (Two seats, gap for aisle, two seats) */}
        <div className="space-y-2.5 sm:space-y-3.5">
          {rows.map((rowNum) => {
            const s1 = (rowNum - 1) * 4 + 1;
            const s2 = (rowNum - 1) * 4 + 2;
            const s3 = (rowNum - 1) * 4 + 3;
            const s4 = (rowNum - 1) * 4 + 4;

            return (
              <div key={rowNum} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_18px_minmax(0,1fr)_minmax(0,1fr)] sm:grid-cols-5 items-center gap-1.5 sm:gap-2 min-w-0">
                {/* Left Window Seat */}
                {renderSeatButton(s1)}

                {/* Left Aisle Seat */}
                {renderSeatButton(s2)}

                {/* Central Aisle */}
                <div className="text-center text-[10px] font-black text-slate-300 pointer-events-none select-none tracking-widest">
                  {rowNum === 5 ? 'A' : rowNum === 6 ? 'I' : rowNum === 7 ? 'S' : rowNum === 8 ? 'L' : rowNum === 9 ? 'E' : '•'}
                </div>

                {/* Right Aisle Seat */}
                {renderSeatButton(s3)}

                {/* Right Window Seat */}
                {renderSeatButton(s4)}
              </div>
            );
          })}
        </div>

        {/* Back Engine / Tail Indicator */}
        <div className="text-center text-[10px] sm:text-xs font-black text-slate-400 border-t-2 border-dashed border-slate-200 mt-5 sm:mt-8 pt-3 sm:pt-4">
          {t.busBack}
        </div>
      </div>

      {/* Pricing and Action */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6 min-w-0">
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Total Ticket Cost</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {selectedSeats.length * trip.price} <span className="text-lg font-extrabold text-[#66bfe3]">JOD</span>
          </p>
          <p className="text-xs font-semibold text-slate-400">{selectedSeats.length} seats × {trip.price} JOD</p>
        </div>

        <button
          onClick={() => {
            logVisitorTripSelection(trip, selectedSeats);
            onContinue();
          }}
          disabled={selectedSeats.length < totalRequired}
          className={`w-full sm:w-auto px-5 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
            selectedSeats.length === totalRequired
              ? 'bg-slate-900 hover:bg-slate-800 text-[#66bfe3] cursor-pointer hover:scale-[1.02] shadow-slate-900/10'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>{t.continueCheckout}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}