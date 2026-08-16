import { useState, useEffect } from "react";
import {
  Users,
  Wifi,
  BellRing,
  Shield,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import {
  subscribeToOrders,
} from "../../lib/firebase-services";
import { ModeToggle } from "./mode-toggle";

interface DashboardHeaderProps {
  onExit?: () => void;
}

export function DashboardHeader({ onExit }: DashboardHeaderProps) {
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    unread: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToOrders((orders) => {
      const now = Date.now();
      const thirtySecondsAgo = now - 30 * 1000;

      const onlineCount = orders.filter((o) => {
        if (o.rawSession?.isOnline) return true;
        const lastActivityTime = new Date(o.timestamp).getTime();
        return lastActivityTime >= thirtySecondsAgo;
      }).length;

      const unreadCount = orders.filter((o) => o.isUnread).length;

      setStats({
        total: orders.length,
        online: onlineCount,
        unread: unreadCount,
      });
    });

    return () => unsubscribe();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <header className="min-h-16 border-b border-gray-200 dark:border-gray-800 px-4 py-3 md:py-0 md:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 bg-white dark:bg-gray-900 shrink-0 z-10 transition-colors">
      <div className="flex items-center gap-3 md:gap-4">
        {onExit && (
          <button
            onClick={onExit}
            title="الرجوع إلى موقع الحجز الرئيسي"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-amber-500 hover:text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer border border-gray-200 dark:border-gray-700"
          >
            <ArrowRight className="w-4 h-4" />
            <span>موقع الحجز</span>
          </button>
        )}
        <div className="w-9 h-9 md:w-10 md:h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
          <Shield className="w-5 h-5 md:w-6 md:h-6 text-slate-950 font-black" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-black tracking-tight text-gray-900 dark:text-white leading-none">
              لوحة مراقبة الحجوزات والمدفوعات
            </h1>
            <span className="px-2 py-0.5 text-[9px] md:text-[10px] font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-800/50 shrink-0">
              متابعة فورية Live
            </span>
          </div>
          {/* Subtitle removed */}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        <div className="grid grid-cols-3 sm:flex items-center gap-1 sm:gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-1 border border-gray-200 dark:border-gray-700/50 w-full sm:w-auto text-center sm:text-right transition-colors">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-2 py-1">
            <Users className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 shrink-0" />
            <div>
              <span className="block text-[8px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 leading-none">
                الإجمالي
              </span>
              <span className="block text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-none mt-1 sm:mt-0.5">
                {stats.total}
              </span>
            </div>
          </div>

          <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-700"></div>

          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-2 py-1">
            <div className="relative shrink-0">
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              {stats.online > 0 && (
                <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              )}
            </div>
            <div>
              <span className="block text-[8px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 leading-none">
                متصل الآن
              </span>
              <span className="block text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-none mt-1 sm:mt-0.5">
                {stats.online}
              </span>
            </div>
          </div>

          <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-700"></div>

          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-2 py-1">
            <div className="relative shrink-0">
              <BellRing
                className={`w-3.5 h-3.5 ${stats.unread > 0 ? "text-amber-500 animate-pulse" : "text-gray-400 dark:text-gray-500"}`}
              />
              {stats.unread > 0 && (
                <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              )}
            </div>
            <div>
              <span className="block text-[8px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 leading-none">
                نشط حديثاً
              </span>
              <span className="block text-xs sm:text-sm font-bold text-amber-600 dark:text-[#66bfe3] leading-none mt-1 sm:mt-0.5">
                {stats.unread}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleRefresh}
            title="تحديث البيانات"
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200/60 dark:border-gray-700/60 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
          </button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
