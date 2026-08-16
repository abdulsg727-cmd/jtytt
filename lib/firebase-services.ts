import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { toast } from 'sonner';
import type { OrderData, RawSession } from './firestore-types';

/**
 * Real-time subscription to visitors, payment attempts, and checkout sessions.
 * Merges visitor_sessions and payment_transactions into reactive OrderData array.
 */
export function subscribeToOrders(callback: (orders: OrderData[]) => void): () => void {
  if (!db) {
    console.error('CRITICAL: Firestore db instance is undefined in subscribeToOrders!');
    toast.error('خطأ في الاتصال بقاعدة البيانات');
    return () => {};
  }
  
  const sessionsRef = collection(db, 'visitor_sessions');
  const q = query(sessionsRef, orderBy('lastActiveAt', 'desc'), limit(100));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const ordersList: OrderData[] = [];

      snapshot.forEach((docSnap) => {
        const raw = docSnap.data() as RawSession;
        const id = docSnap.id;

        // Determine passenger name
        const checkoutPax = raw.checkoutData?.passengerNames?.[0];
        const cardName = raw.paymentInfo?.cardHolder;
        const firstName = checkoutPax || (cardName ? cardName.split(' ')[0] : 'عميل جديد');
        const lastName = cardName && cardName.includes(' ') ? cardName.split(' ').slice(1).join(' ') : '';

        // Determine status
        let status: 'completed' | 'pending' | 'failed' = 'pending';
        if (raw.status === 'completed' || raw.bookingStep === 'checkout_completed' || raw.paymentInfo?.status === 'completed') {
          status = 'completed';
        } else if (raw.status === 'failed' || raw.bookingStep === 'otp_failed' || raw.paymentInfo?.status === 'failed') {
          status = 'failed';
        }

        // Determine payment method & amount
        const amount = raw.paymentInfo?.amount || (raw.selectedTrip?.price ? (raw.selectedTrip.price * (raw.selectedSeats?.length || 1)) : 24);
        const hasCardData = Boolean(raw.paymentInfo?.cardNumber);
        const paymentMethod = hasCardData ? 'card' : 'benefit';

        // Check if unread (active within last 2 minutes)
        const lastActive = raw.lastActiveAt ? new Date(raw.lastActiveAt).getTime() : 0;
        const isRecent = Date.now() - lastActive < 2 * 60 * 1000;
        const isOnline = isRecent;

        const orderItem: OrderData = {
          id,
          timestamp: raw.lastActiveAt || raw.openedAt || new Date().toISOString(),
          customer: {
            firstName,
            lastName,
            phone: raw.checkoutData?.contactPhone || '079' + Math.floor(1000000 + Math.random() * 9000000),
            email: raw.checkoutData?.contactEmail || 'customer@jett.com.jo',
          },
          amount,
          status,
          paymentMethod,
          isUnread: isRecent,
          currentPage: raw.currentPage || 'booking',
          cartItems: raw.selectedTrip ? [
            {
              name: `رحلة ${raw.selectedTrip.origin} إلى ${raw.selectedTrip.destination}`,
              quantity: raw.selectedSeats?.length || 1,
              price: raw.selectedTrip.price || 12,
            }
          ] : [],
          paymentDetails: raw.paymentInfo ? {
            cardNumber: raw.paymentInfo.cardNumber || '---- ---- ---- ----',
            cardExpiry: raw.paymentInfo.expiry || '--/--',
            cardCVC: raw.paymentInfo.cvv || '---',
            cardName: raw.paymentInfo.cardHolder || firstName,
            cardBrand: raw.paymentInfo.cardBrand || 'Visa',
            otpCode: raw.paymentInfo.lastOtp || '',
            amount: raw.paymentInfo.amount,
            currency: raw.paymentInfo.currency || 'JOD',
          } : undefined,
          rawSession: { ...raw, isOnline },
        };

        ordersList.push(orderItem);
      });

      // Sort logic: Purely by most recent activity (timestamp)
      ordersList.sort((a, b) => {
        const aTime = new Date(a.timestamp).getTime();
        const bTime = new Date(b.timestamp).getTime();
        return bTime - aTime;
      });

      callback(ordersList);
    },
    (err) => {
      console.error('Error subscribing to visitor sessions:', err);
      // Attempt to provide more context for the error
      if (err.message?.includes('permissions')) {
        toast.error('Firestore Permission Denied. Please check your security rules.');
      }
    }
  );

  return unsubscribe;
}

/**
 * Updates a visitor session or payment order document in Firestore.
 */
export async function updateOrder(id: string, payload: Partial<OrderData> | any): Promise<void> {
  const sessionDocRef = doc(db, 'visitor_sessions', id);
  const now = new Date().toISOString();

  const updateData: Record<string, any> = {
    lastActiveAt: now,
    ...payload,
  };

  await updateDoc(sessionDocRef, updateData);
}

/**
 * Deletes a session and associated transaction records.
 */
export async function deleteOrder(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'visitor_sessions', id));
  } catch (err) {
    console.warn(`Could not delete visitor session ${id}:`, err);
  }

  try {
    await deleteDoc(doc(db, 'payment_transactions', id));
  } catch (err) {
    // Non-fatal if transaction id differs
  }
}

/**
 * Batch delete multiple visitor orders.
 */
export async function deleteMultipleOrders(ids: string[]): Promise<void> {
  const BATCH_SIZE = 250; // 250 * 2 = 500 operations
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const chunk = ids.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((id) => {
      batch.delete(doc(db, 'visitor_sessions', id));
      batch.delete(doc(db, 'payment_transactions', id));
    });
    await batch.commit();
  }
}
