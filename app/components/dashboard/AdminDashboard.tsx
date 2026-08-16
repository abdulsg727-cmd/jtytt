import React, { useState, useEffect, useRef } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { VisitorSidebar } from "./VisitorSidebar";
import { VisitorDetails } from "./VisitorDetails";
import { subscribeToOrders, deleteMultipleOrders } from "../../lib/firebase-services";
import type { OrderData } from "../../lib/firestore-types";
import { Toaster, toast } from "sonner";
import { playNotificationSound } from "../../lib/audio";
import { useAuth } from "../../lib/AuthContext";
import { LogIn, ShieldAlert, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

interface AdminDashboardProps {
  onExit?: () => void;
}

export function AdminDashboard({ onExit }: AdminDashboardProps) {
  const { user, loading: authLoading, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [visitors, setVisitors] = useState<OrderData[]>([]);
  const visitorsRef = useRef<OrderData[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<OrderData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cardFilter, setCardFilter] = useState<"all" | "hasCard">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hiddenVisitorIds, setHiddenVisitorIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('jett_hidden_visitors');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // Subscribe to live Firestore changes - Moved up to follow Rules of Hooks
  useEffect(() => {
    const unsubscribe = subscribeToOrders((orders) => {
      const prevVisitors = visitorsRef.current;
      
      // Check for new visitors
      const previousIds = new Set(prevVisitors.map(v => v.id));
      const newVisitors = orders.filter(o => !previousIds.has(o.id));
      
      if (newVisitors.length > 0 && isAudioEnabled) {
        playNotificationSound();
      }

      // Check for newly added cards
      orders.forEach(order => {
        const prevOrder = prevVisitors.find(v => v.id === order.id);
        if (prevOrder) {
          const hadCard = prevOrder.paymentMethod === "card" || 
                          Boolean(prevOrder.paymentDetails?.cardNumber && prevOrder.paymentDetails.cardNumber !== '---- ---- ---- ----');
          const hasCardNow = order.paymentMethod === "card" || 
                             Boolean(order.paymentDetails?.cardNumber && order.paymentDetails.cardNumber !== '---- ---- ---- ----');
          
          if (!hadCard && hasCardNow) {
            toast.success(`💳 تم إضافة بطاقة: ${order.customer?.firstName || 'زائر'}`, {
              description: `جلسة: ${order.id.slice(0, 8)}...`,
              duration: 5000,
            });
            if (isAudioEnabled) {
              playNotificationSound();
            }
          }
        }
      });
      
      visitorsRef.current = orders;
      setVisitors(orders);

      // Keep selected visitor synchronized with live updates
      if (selectedVisitor) {
        const updated = orders.find((o) => o.id === selectedVisitor.id);
        if (updated) {
          setSelectedVisitor(updated);
        }
      } else if (orders.length > 0) {
        const visibleOrders = orders.filter(o => !hiddenVisitorIds.has(o.id));
        if (visibleOrders.length > 0) {
          setSelectedVisitor(visibleOrders[0]);
        }
      }
    });

    return () => unsubscribe();
  }, [selectedVisitor?.id, hiddenVisitorIds]);

  if (authLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#66bfe3] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const handleEmailSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) {
        setLoginError('يرجى ملء جميع الحقول المطلوبة');
        return;
      }
      setLoginLoading(true);
      setLoginError(null);
      try {
        await signInWithEmail(email, password);
        toast.success('مرحباً بك! تم تسجيل الدخول بنجاح');
      } catch (err: any) {
        setLoginError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } finally {
        setLoginLoading(false);
      }
    };

    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-950 p-6 overflow-y-auto">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden my-auto">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] -mr-10 -mt-10" />
          
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>
          
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight text-center">لوحة تحكم المسؤول</h2>
          <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8 text-center">
            للموظفين المصرح لهم فقط. يرجى تسجيل الدخول للوصول إلى التتبع المباشر وسجلات الحجز.
          </p>

          {loginError && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2 text-right dir-rtl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}
          
          <form onSubmit={handleEmailSubmit} className="space-y-4 text-right dir-rtl">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-1">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="w-4.5 h-4.5 text-slate-500 absolute top-3.5 right-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jett.jo"
                  className="w-full bg-slate-800/50 border border-slate-700 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-2xl py-3.5 pr-11 pl-4 text-sm font-bold text-white outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="w-4.5 h-4.5 text-slate-500 absolute top-3.5 right-4" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border border-slate-700 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-2xl py-3.5 pr-11 pl-4 text-sm font-bold text-white outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loginLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  تسجيل الدخول للوحة
                </>
              )}
            </button>
          </form>

          <button
            onClick={onExit}
            className="mt-6 text-slate-500 hover:text-white font-bold text-[10px] transition-colors uppercase tracking-widest"
          >
            ← العودة للموقع
          </button>
        </div>
      </div>
    );
  }

  const handleHideVisitor = (id: string) => {
    setHiddenVisitorIds(prev => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem('jett_hidden_visitors', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
    if (selectedVisitor?.id === id) {
      setSelectedVisitor(null);
    }
    toast.success("تم إخفاء الزائر من اللوحة بنجاح");
  };

  const handleShowAll = () => {
    setHiddenVisitorIds(new Set());
    try {
      localStorage.removeItem('jett_hidden_visitors');
    } catch {}
    toast.success("تم إظهار جميع الزوار المخفيين");
  };

  const activeVisitors = visitors.filter(v => !hiddenVisitorIds.has(v.id));

  // Filter visitors by search & card presence
  const filteredVisitors = activeVisitors.filter((v) => {
    // 1. Card filter
    if (cardFilter === "hasCard") {
      const hasCard = v.paymentMethod === "card" || Boolean(v.paymentDetails?.cardNumber && v.paymentDetails.cardNumber !== '---- ---- ---- ----');
      if (!hasCard) return false;
    }

    // 2. Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const fullName = `${v.customer?.firstName || ""} ${v.customer?.lastName || ""}`.toLowerCase();
    const email = (v.customer?.email || "").toLowerCase();
    const phone = (v.customer?.phone || "").toLowerCase();
    const id = (v.id || "").toLowerCase();
    const card = (v.paymentDetails?.cardNumber || "").toLowerCase();

    return fullName.includes(q) || email.includes(q) || phone.includes(q) || id.includes(q) || card.includes(q);
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredVisitors.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredVisitors.map((v) => v.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const ids: string[] = Array.from(selectedIds);
    try {
      await deleteMultipleOrders(ids);
      toast.success(`تم حذف ${ids.length} طلب/جلسة بنجاح`);
      setSelectedIds(new Set());
      if (selectedVisitor && selectedIds.has(selectedVisitor.id)) {
        setSelectedVisitor(null);
      }
    } catch (err) {
      toast.error("فشل حذف السجلات المحددة");
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors overflow-hidden dir-rtl" dir="rtl">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <DashboardHeader onExit={onExit} />

      {/* Audio Control Bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isAudioEnabled 
                ? "bg-amber-500 text-slate-950 shadow-md" 
                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${isAudioEnabled ? "bg-white animate-pulse" : "bg-gray-300 dark:bg-gray-600"}`} />
            {isAudioEnabled ? "التنبيهات الصوتية: مفعلة" : "تفعيل التنبيهات الصوتية"}
          </button>
          {!isAudioEnabled && (
            <span className="text-[10px] text-amber-500 font-medium animate-bounce mr-2">
              (يرجى التفعيل لسماع التنبيهات)
            </span>
          )}
        </div>
      </div>

      {/* Main Layout Container: Sidebar on Right (RTL), Details on Left */}
      <div className="flex-1 flex overflow-hidden relative">
        <VisitorSidebar
          visitors={filteredVisitors}
          selectedVisitor={selectedVisitor}
          onSelectVisitor={(v) => setSelectedVisitor(v)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          cardFilter={cardFilter}
          onCardFilterChange={setCardFilter}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onDeleteSelected={handleDeleteSelected}
          onHideVisitor={handleHideVisitor}
          onShowAll={handleShowAll}
          hiddenCount={hiddenVisitorIds.size}
          sidebarWidth={sidebarWidth}
          onSidebarWidthChange={setSidebarWidth}
        />

        {/* Visitor Details view */}
        <VisitorDetails
          visitor={selectedVisitor}
          onBack={() => setSelectedVisitor(null)}
        />
      </div>
    </div>
  );
}
export default AdminDashboard;
