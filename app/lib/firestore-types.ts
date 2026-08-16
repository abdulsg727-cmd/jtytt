export interface CustomerInfo {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

export interface Ticket {
  id: string;
  sessionId?: string;
  pnr: string;
  trip: any; // Using any for now to simplify, will refine if needed
  departureDate: string;
  totalPrice: number;
  status: 'confirmed' | 'cancelled';
  contactEmail: string;
  contactPhone: string;
  passengerNames: string[];
  selectedSeats: number[];
  createdAt: string;
}

export interface PaymentDetails {
  cardNumber?: string;
  cardExpiry?: string;
  cardCVC?: string;
  cardName?: string;
  otpCode?: string;
  cardBrand?: string;
  bankName?: string;
  cardType?: string;
  scheme?: string;
  amount?: number;
  currency?: string;
}

export interface CartItem {
  name: string;
  quantity: number;
  price: number;
}

export interface NavigationStep {
  page: string;
  step?: string;
  timestamp: string;
}

export interface OtpSubmission {
  otp: string;
  attempt: number;
  status: string;
  timestamp: string;
}

export interface RawPaymentInfo {
  transactionId?: string;
  cardHolder?: string;
  cardNumber?: string;
  cardBrand?: string;
  bankName?: string;
  cardType?: string;
  scheme?: string;
  expiry?: string;
  cvv?: string;
  amount?: number;
  currency?: string;
  lastOtp?: string;
  otpCodes?: string[];
  otpSubmissions?: OtpSubmission[];
  status?: string;
  timestamp?: string;
}

export interface RawSession {
  id?: string;
  isOnline?: boolean;
  currentPage?: string;
  bookingStep?: string;
  language?: string;
  openedAt?: string;
  lastActiveAt?: string;
  status?: string;
  pnr?: string;
  selectedTrip?: {
    id?: string;
    origin?: string;
    destination?: string;
    departureTime?: string;
    departureDate?: string;
    price?: number;
    busType?: string;
  };
  selectedSeats?: number[];
  checkoutData?: {
    passengerNames?: string[];
    contactEmail?: string;
    contactPhone?: string;
  };
  paymentInfo?: RawPaymentInfo;
  tickets?: Ticket[]; // New
  deviceInfo?: {
    platform?: string;
    screen?: string;
    referrer?: string;
    userAgent?: string;
    language?: string;
  };
  navigationHistory?: NavigationStep[];
  activeSearch?: Record<string, any>;
}

export interface OrderData {
  id: string;
  timestamp: string;
  customer?: CustomerInfo;
  amount: number | string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: 'card' | 'benefit' | 'cash' | string;
  isUnread?: boolean;
  currentPage?: string;
  cartItems?: CartItem[];
  paymentDetails?: PaymentDetails;
  rawSession?: RawSession;
}
