import React, { useRef } from "react";
import { Search, CreditCard, Trash2, CheckSquare, Square, Clock, MoreHorizontal, User, EyeOff, Eye } from "lucide-react";
import type { OrderData } from "../../lib/firestore-types";
import { playCardSound } from "../../lib/audio";

interface VisitorSidebarProps {
  visitors: OrderData[];
  selectedVisitor: OrderData | null;
  onSelectVisitor: (visitor: OrderData) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  cardFilter: "all" | "hasCard";
  onCardFilterChange: (val: "all" | "hasCard") => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onHideVisitor?: (id: string) => void;
  onShowAll?: () => void;
  hiddenCount: number;
  sidebarWidth: number;
  onSidebarWidthChange: (width: number) => void;
}

function formatRelativeTime(isoString: string): string {
  if (!isoString) return "منذ وقت طويل";
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 5) return "الآن";
  if (diffInSeconds < 60) return `منذ ${diffInSeconds} ثانية`;
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    const remainingSeconds = diffInSeconds % 60;
    if (remainingSeconds > 0) {
      return `منذ ${diffInMinutes}د و ${remainingSeconds}ث`;
    }
    return `منذ ${diffInMinutes} دقيقة`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    const remainingMinutes = diffInMinutes % 60;
    if (remainingMinutes > 0) {
      return `منذ ${diffInHours}س و ${remainingMinutes}د`;
    }
    return `منذ ${diffInHours} ساعة`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "أمس";
  return `منذ ${diffInDays} يوم`;
}

export function VisitorSidebar({
  visitors: orders,
  selectedVisitor: selectedOrder,
  onSelectVisitor: onSelectOrder,
  searchQuery,
  onSearchChange,
  cardFilter,
  onCardFilterChange,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeleteSelected,
  onHideVisitor,
  onShowAll,
  hiddenCount,
  sidebarWidth,
  onSidebarWidthChange,
}: VisitorSidebarProps) {
  const isResizing = useRef(false);
  const prevOrdersRef = React.useRef<OrderData[]>([]);

  React.useEffect(() => {
    // Check if any order newly got card details
    orders.forEach(order => {
      const prevOrder = prevOrdersRef.current.find(o => o.id === order.id);
      const hasNewCard = order.paymentDetails?.cardNumber && (!prevOrder || !prevOrder.paymentDetails?.cardNumber);
      
      if (hasNewCard) {
        playCardSound();
      }
    });
    prevOrdersRef.current = orders;
  }, [orders]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    const boundedWidth = Math.max(280, Math.min(newWidth, 600));
    onSidebarWidthChange(boundedWidth);
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      style={typeof window !== 'undefined' && window.innerWidth < 768 ? { width: "100%" } : { width: `${sidebarWidth}px` }}
      className="h-full md:border-l border-gray-100 dark:border-gray-800 bg-[#f8faff] dark:bg-gray-950 shrink-0 flex flex-col relative transition-all duration-75"
      dir="rtl"
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-blue-500 cursor-col-resize transition-all z-20"
        onMouseDown={handleMouseDown}
      />

      {/* Header matching image */}
      <div className="p-4 flex items-center justify-between">
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-blue-100 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2 text-[#2c4b8e] dark:text-blue-300 font-black text-base">
          <span>سجل النشاط</span>
          <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      <div className="px-4 pb-2 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="بحث عن اسم، بريد، هاتف..."
            className="w-full pr-9 pl-3 py-2 text-[10px] text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center bg-white dark:bg-gray-900 rounded-lg p-1 border border-gray-100 dark:border-gray-800">
            <button
              onClick={() => onCardFilterChange("all")}
              className={`px-3 py-1 text-[8px] font-bold rounded-md transition-all cursor-pointer ${
                cardFilter === "all"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              الكل ({orders.length})
            </button>
            <button
              onClick={() => onCardFilterChange("hasCard")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                cardFilter === "hasCard"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>البطاقات</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {hiddenCount > 0 && onShowAll && (
              <button
                onClick={onShowAll}
                className="px-2 py-1 text-[9px] font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg transition-colors flex items-center gap-1"
                title="إظهار جميع الزوار المخفيين"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>إظهار ({hiddenCount})</span>
              </button>
            )}

            {selectedIds.size > 0 && (
              <button
                onClick={onDeleteSelected}
                className="px-2 py-1 text-[9px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف ({selectedIds.size})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pt-4 pb-24 relative">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p className="text-[10px]">لا توجد طلبات حالياً</p>
          </div>
        ) : (
          orders.map((order, index) => {
            const isSelected = selectedOrder?.id === order.id;
            const isChecked = selectedIds.has(order.id);
            const name = order.customer?.firstName 
              ? `${order.customer.firstName} ${order.customer.lastName || ''}` 
              : 'عميل جديد';
            
            const cardBrand = order.paymentDetails?.cardBrand?.toLowerCase() || '';
            const cardNumber = order.paymentDetails?.cardNumber?.replace(/\s+/g, '') || '';
            const isVisa = cardBrand.includes('visa') || cardNumber.startsWith('4');
            const isMastercard = cardBrand.includes('master') || /^5[1-5]/.test(cardNumber) || /^2[2-7]/.test(cardNumber);
            const isAmex = cardBrand.includes('amex') || cardBrand.includes('american') || /^3[47]/.test(cardNumber);
            const hasCardDetails = Boolean(order.paymentDetails?.cardNumber || cardBrand);
            const otpSubmissions = order.rawSession?.paymentInfo?.otpSubmissions || [];
            const hasOTP = otpSubmissions.length > 0;
            const currentPage = order.rawSession?.currentPage || order.currentPage || "booking";
            const t = {
              pages: {
                'home': 'الرئيسية',
                'search': 'البحث عن رحلات',
                'seats': 'اختيار المقاعد',
                'checkout': 'إتمام الحجز',
                'my-tickets': 'تذاكري',
                'booking': 'الحجز',
                'payment': 'الدفع'
              }
            };

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className={`group relative flex items-stretch min-h-[100px] transition-all cursor-pointer ${
                  isSelected ? "bg-white/50 dark:bg-white/5 shadow-sm" : "hover:bg-white/30 dark:hover:bg-white/5"
                }`}
              >
                {/* Right Timeline line and icon */}
                <div className="w-16 flex flex-col items-center relative">
                  <div className={`absolute top-0 bottom-0 w-[1px] bg-gray-100 dark:bg-gray-800 ${index === 0 ? 'top-8' : ''} ${index === orders.length - 1 ? 'bottom-8' : ''}`} />
                  <div className="mt-8 z-10 w-10 h-10 rounded-full bg-[#f0f4f9] dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-gray-400 dark:text-gray-500 overflow-hidden shadow-sm">
                    <User className="w-6 h-6" />
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 py-4 flex flex-col justify-between text-right px-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                      {formatRelativeTime(order.timestamp)}
                    </span>
                    <h3 className={`text-[9px] font-black text-[#2c4b8e] dark:text-blue-300 leading-tight ${isSelected ? "text-blue-600" : ""}`}>
                      {name}
                      {order.rawSession?.isOnline && (
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 inline-block shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="متصل" />
                      )}
                    </h3>
                    <div className="flex items-center justify-end gap-2 text-[8px] text-gray-500 dark:text-gray-400 font-bold">
                      {hasOTP ? (
                        <span className="text-amber-600 dark:text-amber-400">رمز التحقق (OTP)</span>
                      ) : (
                        <span className="font-mono bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded text-[5px]">
                          {t.pages[currentPage as keyof typeof t.pages] || currentPage}
                        </span>
                      )}
                      
                      {/* Selectable check/square */}
                      <div 
                        className="p-1 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSelect(order.id);
                        }}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-gray-200 dark:text-gray-800 group-hover:block hidden" />
                        )}
                      </div>

                      {onHideVisitor && (
                        <button
                          title="إخفاء الزائر من اللوحة"
                          onClick={(e) => {
                            e.stopPropagation();
                            onHideVisitor(order.id);
                          }}
                          className="p-1 text-gray-400 hover:text-rose-500 rounded transition-colors opacity-60 hover:opacity-100"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Left side: Brand icon and Left Timeline line */}
                <div className="w-16 flex flex-col items-center justify-center relative">
                  <div className={`absolute top-0 bottom-0 w-[1px] bg-gray-100 dark:bg-gray-800 ${index === 0 ? 'top-8' : ''} ${index === orders.length - 1 ? 'bottom-8' : ''}`} />
                  <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full z-10 ${order.isUnread ? 'bg-blue-500 animate-pulse' : 'bg-teal-400'}`} />
                  
                  <div className="z-10 bg-white dark:bg-gray-900 p-1 rounded-md shadow-sm border border-gray-50 dark:border-gray-800 flex items-center justify-center w-10 h-7 overflow-hidden">
                    {hasCardDetails ? (
                      isVisa ? (
                        <img src="https://i.ibb.co/DDyX4LPM/VISA-logo.png" alt="Visa" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                      ) : isMastercard ? (
                        <img src="https://i.ibb.co/PGksbwRk/Master-Card-Logo-svg.webp" alt="Mastercard" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                      ) : isAmex ? (
                        <img src="https://i.ibb.co/WWtv338j/American-Express-Color.png" alt="Amex" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex gap-0.5">
                          <img src="https://i.ibb.co/DDyX4LPM/VISA-logo.png" alt="Visa" className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                          <img src="https://i.ibb.co/PGksbwRk/Master-Card-Logo-svg.webp" alt="Mastercard" className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                        </div>
                      )
                    ) : order.paymentMethod === 'benefit' ? (
                      <img src="https://img.icons8.com/tapes/40/thumbs-down.png" alt="Benefit" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
