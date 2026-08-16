import { CreditCard as CardIcon, Building2, Globe2 } from "lucide-react";

export type BinInfo = {
  scheme?: string;
  type?: string;
  brand?: string;
  prepaid?: boolean;
  bank?: {
    name?: string;
    url?: string;
    phone?: string;
    city?: string;
  };
  country?: {
    name?: string;
    alpha2?: string;
    emoji?: string;
    currency?: string;
  };
};

type CardMockProps = {
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  binInfo?: BinInfo | null;
  loading?: boolean;
};

export async function lookupBin(cardNumber: string): Promise<BinInfo | null> {
  const digits = cardNumber.replace(/\D/g, "");
  const bin = digits.slice(0, 8);

  if (bin.length < 6) return null;

  try {
    const response = await fetch(`/api/bin/${bin}`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("BIN lookup failed:", error);
    return null;
  }
}

export function CardMock({
  cardNumber,
  cardName,
  cardExpiry,
  binInfo,
  loading = false,
}: CardMockProps) {
  const digits = (cardNumber || "").replace(/\D/g, "");

  const scheme =
    binInfo?.scheme ||
    (digits.startsWith("4") ? "visa" : undefined) ||
    (/^5[1-5]/.test(digits) ? "mastercard" : undefined);

  // Never expose the full PAN in the UI if you want to mask, 
  // but user previously asked "dont hide card info on dash".
  // However, for the mock card visual, it usually looks better with spacing.
  const displayCardNumber = digits 
    ? digits.match(/.{1,4}/g)?.join(' ') 
    : "•••• •••• •••• ••••";

  const logo =
    scheme?.toLowerCase() === "visa"
      ? "https://i.ibb.co/DDyX4LPM/VISA-logo.png"
      : scheme?.toLowerCase() === "mastercard"
        ? "https://i.ibb.co/PGksbwRk/Master-Card-Logo-svg.webp"
        : scheme?.toLowerCase().includes("american")
          ? "https://i.ibb.co/WWtv338j/American-Express-Color.png"
          : null;

  return (
    <div
      dir="ltr"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800 via-slate-950 to-slate-900 p-6 text-white shadow-2xl"
    >
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
              Issuer
            </div>

            <div className="mt-1 max-w-[220px] truncate text-sm font-semibold">
              {loading
                ? "Looking up BIN..."
                : binInfo?.bank?.name || "Unknown Bank"}
            </div>
          </div>

          {logo ? (
            <img
              src={logo}
              alt={scheme || "Card"}
              className="h-9 w-14 object-contain"
            />
          ) : (
            <CardIcon className="h-8 w-8 text-white/60" />
          )}
        </div>

        {/* Chip */}
        <div className="mt-7 h-10 w-12 rounded-lg bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 shadow-inner" />

        {/* Card number */}
        <div className="mt-6">
          <div className="font-mono text-lg font-semibold tracking-[0.12em] sm:text-xl">
            {displayCardNumber}
          </div>
        </div>

        {/* Holder + expiry */}
        <div className="mt-6 flex items-end justify-between">
          <div className="min-w-0">
            <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">
              Card Holder
            </div>

            <div className="mt-1 max-w-[200px] truncate text-xs font-semibold uppercase tracking-wider">
              {cardName || "CARD HOLDER"}
            </div>
          </div>

          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">
              Expires
            </div>

            <div className="mt-1 font-mono text-sm font-semibold">
              {cardExpiry || "--/--"}
            </div>
          </div>
        </div>

        {/* BIN metadata */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-white/40">
              Scheme
            </div>
            <div className="mt-1 text-xs font-semibold uppercase">
              {binInfo?.scheme || scheme || "Unknown"}
            </div>
          </div>

          <div>
            <div className="text-[9px] uppercase tracking-wider text-white/40">
              Type
            </div>
            <div className="mt-1 text-xs font-semibold capitalize">
              {binInfo?.type || "Unknown"}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-white/40">
              <Building2 className="h-3 w-3" />
              Bank
            </div>

            <div className="mt-1 truncate text-xs font-semibold">
              {binInfo?.bank?.name || "Unknown"}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-white/40">
              <Globe2 className="h-3 w-3" />
              Country
            </div>

            <div className="mt-1 truncate text-xs font-semibold">
              {binInfo?.country?.emoji}{" "}
              {binInfo?.country?.name || "Unknown"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
