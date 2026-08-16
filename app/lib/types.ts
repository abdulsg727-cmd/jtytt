export type ViewType = 'home' | 'booking' | 'shipment' | 'khb' | 'charter' | 'my-tickets' | 'dashboard';

export interface Station {
  id: string;
  cityEn: string;
  cityAr: string;
  nameEn: string;
  nameAr: string;
  addressEn: string;
  addressAr: string;
  phone: string;
  workingHours: string;
  isPopular: boolean;
}

export interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
}

export interface SearchQuery {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  tripType: 'one-way' | 'round-trip';
  serviceType: 'regular' | 'vip' | 'express';
  passengers: PassengerCount;
}

export interface BusTrip {
  id: string;
  tripNumber?: string;
  origin?: string;
  originId?: string;
  originNameEn?: string;
  originNameAr?: string;
  destination?: string;
  destinationId?: string;
  destinationNameEn?: string;
  destinationNameAr?: string;
  departureTime: string;
  arrivalTime: string;
  duration?: string;
  price?: number; // in JOD
  priceJOD?: number;
  busType: 'VIP' | 'Regular' | 'Executive' | 'VIP Royal' | 'Executive Class' | 'Regular Standard';
  availableSeats: number;
  totalSeats: number;
  amenities?: string[];
  seatRows?: any;
  seatLayout?: string;
  occupiedSeatNumbers?: number[];
}

export interface Ticket {
  id: string;
  trip: BusTrip;
  passengerNames: string[];
  selectedSeats: number[];
  departureDate: string;
  totalPrice: number;
  bookingTime: string;
  status: 'confirmed' | 'cancelled';
  pnr: string; // Passenger Name Record / Booking Ref
  contactEmail: string;
  contactPhone: string;
}

export interface Shipment {
  id?: string;
  trackingCode?: string;
  sender?: string;
  senderName?: string;
  recipient?: string;
  recipientName?: string;
  origin: string;
  destination: string;
  weight?: number;
  weightKg?: number;
  serviceType?: string;
  status?: 'received' | 'sorted' | 'transit' | 'ready' | 'delivered';
  currentStatus?: string;
  estimatedDelivery?: string;
  history?: any[];
  lastUpdated?: string;
  timeline?: { status: string; label: string; date: string; completed: boolean }[];
}

export type ParcelTracking = Shipment;


