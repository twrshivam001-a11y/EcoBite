import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, isFirebaseConfigured, OperationType } from '../firebase';
import { useAuth } from './AuthContext';
import {
  DEMO_PILOT_EXTRA_ORDERS,
  DEMO_SEED_FEEDBACK,
  DEMO_SEED_ORDERS,
  DEMO_SEED_SUBSCRIPTION,
} from '../data/catalog';
import {
  CartItem,
  Feedback,
  LucknowArea,
  MealItem,
  MealPlan,
  MealSlot,
  Order,
  PaymentMethod,
  PlanSlotPreference,
  Subscription,
  TabId,
  ToastMessage,
} from '../types';

interface PlaceOrderInput {
  slot: MealSlot;
  area: LucknowArea;
  address: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  applyTrialDiscount?: boolean;
}

interface SubmitFeedbackInput {
  orderId: string;
  mealName: string;
  tasteRating: number;
  hygieneRating: number;
  portionRating: number;
  priceRating: number;
  deliveryRating: number;
  wouldOrderAgain: boolean;
  comment: string;
}

export interface PilotMetrics {
  totalOrders: number;
  trialCustomers: number;
  repeatPurchaseRate: number;
  avgMealPrice: number;
  avgHygieneRating: number;
  avgTasteRating: number;
  avgPortionRating: number;
  avgPriceRating: number;
  avgDeliveryRating: number;
  wouldOrderAgainPct: number;
}

interface AppDataContextValue {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  activeSlot: MealSlot;
  setActiveSlot: (slot: MealSlot) => void;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (meal: MealItem) => void;
  removeFromCart: (mealId: string) => void;
  updateQuantity: (mealId: string, qty: number) => void;
  clearCart: () => void;
  orders: Order[];
  subscriptions: Subscription[];
  feedbackList: Feedback[];
  allPilotOrders: Order[];
  allPilotFeedback: Feedback[];
  pilotMetrics: PilotMetrics;
  dataLoading: boolean;
  founderViewEnabled: boolean;
  setFounderViewEnabled: (enabled: boolean) => void;
  feedbackTargetOrder: Order | null;
  setFeedbackTargetOrder: (order: Order | null) => void;
  isGeneralFeedbackOpen: boolean;
  setIsGeneralFeedbackOpen: (open: boolean) => void;
  placeOrder: (input: PlaceOrderInput) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
  subscribeToPlan: (plan: MealPlan, preferredSlot: PlanSlotPreference) => Promise<void>;
  toggleSubscriptionPause: (sub: Subscription) => Promise<void>;
  redeemMealFromPlan: (sub: Subscription) => Promise<void>;
  submitFeedback: (input: SubmitFeedbackInput) => Promise<void>;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

const DEMO_ORDERS_KEY = 'ecobite_demo_orders_v1';
const DEMO_SUBS_KEY = 'ecobite_demo_subs_v1';
const DEMO_FEEDBACK_KEY = 'ecobite_demo_feedback_v1';

function makeSafeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`;
}

function serializeTs(val: unknown): string {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isDemoMode, isAdminUser } = useAuth();

  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [activeSlot, setActiveSlot] = useState<MealSlot>(() => {
    const hour = new Date().getHours();
    return hour >= 12 && hour < 20 ? 'dinner' : 'lunch';
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminFeedback, setAdminFeedback] = useState<Feedback[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [founderViewEnabled, setFounderViewEnabled] = useState(false);
  const [feedbackTargetOrder, setFeedbackTargetOrder] = useState<Order | null>(null);
  const [isGeneralFeedbackOpen, setIsGeneralFeedbackOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastMessage['type'] = 'success') => {
      const id = makeSafeId('toast');
      setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
      setTimeout(() => {
        dismissToast(id);
      }, 3600);
    },
    [dismissToast]
  );

  // Load Demo Mode or Firestore Data
  useEffect(() => {
    if (isDemoMode) {
      try {
        const savedOrders = localStorage.getItem(DEMO_ORDERS_KEY);
        const savedSubs = localStorage.getItem(DEMO_SUBS_KEY);
        const savedFb = localStorage.getItem(DEMO_FEEDBACK_KEY);

        setOrders(savedOrders ? JSON.parse(savedOrders) : DEMO_SEED_ORDERS);
        setSubscriptions(savedSubs ? JSON.parse(savedSubs) : [DEMO_SEED_SUBSCRIPTION]);
        setFeedbackList(
          savedFb
            ? JSON.parse(savedFb)
            : DEMO_SEED_FEEDBACK.filter((f) => f.userId === 'demo-student-aarav')
        );
      } catch {
        setOrders(DEMO_SEED_ORDERS);
        setSubscriptions([DEMO_SEED_SUBSCRIPTION]);
        setFeedbackList(DEMO_SEED_FEEDBACK.filter((f) => f.userId === 'demo-student-aarav'));
      }
      setDataLoading(false);
      return;
    }

    if (!isFirebaseConfigured || !db || !user || !user.emailVerified) {
      setOrders([]);
      setSubscriptions([]);
      setFeedbackList([]);
      setAdminOrders([]);
      setAdminFeedback([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsubOrders = onSnapshot(
      ordersQuery,
      (snap) => {
        const list: Order[] = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              userId: data.userId,
              userName: data.userName,
              userPhone: data.userPhone,
              area: data.area,
              address: data.address,
              slot: data.slot,
              paymentMethod: data.paymentMethod,
              items: data.items || [],
              subtotal: data.subtotal,
              discount: data.discount,
              totalAmount: data.totalAmount,
              status: data.status,
              isTrialOrder: Boolean(data.isTrialOrder),
              hasFeedback: Boolean(data.hasFeedback),
              notes: data.notes,
              createdAt: serializeTs(data.createdAt),
              updatedAt: serializeTs(data.updatedAt),
            };
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(list);
        setDataLoading(false);
      },
      (err) => {
        setDataLoading(false);
        handleFirestoreError(err, OperationType.LIST, 'orders');
      }
    );

    const subsQuery = query(collection(db, 'subscriptions'), where('userId', '==', user.uid));
    const unsubSubs = onSnapshot(
      subsQuery,
      (snap) => {
        const list: Subscription[] = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              userId: data.userId,
              userName: data.userName,
              userPhone: data.userPhone,
              area: data.area,
              planId: data.planId,
              planName: data.planName,
              totalMeals: data.totalMeals,
              remainingMeals: data.remainingMeals,
              price: data.price,
              preferredSlot: data.preferredSlot,
              status: data.status,
              createdAt: serializeTs(data.createdAt),
              updatedAt: serializeTs(data.updatedAt),
            };
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSubscriptions(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'subscriptions')
    );

    const fbQuery = query(collection(db, 'feedback'), where('userId', '==', user.uid));
    const unsubFb = onSnapshot(
      fbQuery,
      (snap) => {
        const list: Feedback[] = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              userId: data.userId,
              userName: data.userName,
              orderId: data.orderId,
              mealName: data.mealName,
              tasteRating: data.tasteRating,
              hygieneRating: data.hygieneRating,
              portionRating: data.portionRating,
              priceRating: data.priceRating,
              deliveryRating: data.deliveryRating,
              wouldOrderAgain: Boolean(data.wouldOrderAgain),
              comment: data.comment || '',
              createdAt: serializeTs(data.createdAt),
            };
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setFeedbackList(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'feedback')
    );

    return () => {
      unsubOrders();
      unsubSubs();
      unsubFb();
    };
  }, [isDemoMode, user]);

  // Admin Pilot Analytics Real-Time Listeners
  useEffect(() => {
    if (isDemoMode || !isFirebaseConfigured || !db || !user || !isAdminUser || !founderViewEnabled) {
      return;
    }

    const unsubAdminOrders = onSnapshot(
      collection(db, 'orders'),
      (snap) => {
        const list: Order[] = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              userId: data.userId,
              userName: data.userName,
              userPhone: data.userPhone,
              area: data.area,
              address: data.address,
              slot: data.slot,
              paymentMethod: data.paymentMethod,
              items: data.items || [],
              subtotal: data.subtotal,
              discount: data.discount,
              totalAmount: data.totalAmount,
              status: data.status,
              isTrialOrder: Boolean(data.isTrialOrder),
              hasFeedback: Boolean(data.hasFeedback),
              notes: data.notes,
              createdAt: serializeTs(data.createdAt),
              updatedAt: serializeTs(data.updatedAt),
            };
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAdminOrders(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'orders')
    );

    const unsubAdminFb = onSnapshot(
      collection(db, 'feedback'),
      (snap) => {
        const list: Feedback[] = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              userId: data.userId,
              userName: data.userName,
              orderId: data.orderId,
              mealName: data.mealName,
              tasteRating: data.tasteRating,
              hygieneRating: data.hygieneRating,
              portionRating: data.portionRating,
              priceRating: data.priceRating,
              deliveryRating: data.deliveryRating,
              wouldOrderAgain: Boolean(data.wouldOrderAgain),
              comment: data.comment || '',
              createdAt: serializeTs(data.createdAt),
            };
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAdminFeedback(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'feedback')
    );

    return () => {
      unsubAdminOrders();
      unsubAdminFb();
    };
  }, [isDemoMode, user, isAdminUser, founderViewEnabled]);

  const addToCart = useCallback(
    (meal: MealItem) => {
      setCart((prev) => {
        const existing = prev.find((c) => c.meal.id === meal.id);
        if (existing) {
          return prev.map((c) => (c.meal.id === meal.id ? { ...c, quantity: c.quantity + 1 } : c));
        }
        return [...prev, { meal, quantity: 1 }];
      });
      showToast(`Added ${meal.name} to tray`, 'success');
    },
    [showToast]
  );

  const removeFromCart = useCallback((mealId: string) => {
    setCart((prev) => prev.filter((c) => c.meal.id !== mealId));
  }, []);

  const updateQuantity = useCallback((mealId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.meal.id !== mealId));
      return;
    }
    setCart((prev) => prev.map((c) => (c.meal.id === mealId ? { ...c, quantity: qty } : c)));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.meal.price * item.quantity, 0),
    [cart]
  );

  const placeOrder = async (input: PlaceOrderInput): Promise<Order> => {
    if (!profile) throw new Error('Complete your profile before ordering.');
    if (cart.length === 0) throw new Error('Your meal tray is empty.');

    const orderId = makeSafeId('ord');
    const items = cart.slice(0, 10).map((c) => ({
      mealId: c.meal.id,
      name: c.meal.name,
      price: c.meal.price,
      quantity: c.quantity,
      isVeg: c.meal.isVeg,
    }));

    const isTrialOrder = orders.length === 0 && items.some((i) => i.mealId === 'classic-home-thali');
    const discount = input.applyTrialDiscount && cartSubtotal >= 100 ? 25 : 0;
    const totalAmount = Math.max(0, cartSubtotal - discount);
    const nowIso = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      userId: profile.uid,
      userName: profile.fullName,
      userPhone: profile.phone,
      area: input.area,
      address: input.address.trim().slice(0, 250),
      slot: input.slot,
      paymentMethod: input.paymentMethod,
      items,
      subtotal: cartSubtotal,
      discount,
      totalAmount,
      status: 'confirmed',
      isTrialOrder,
      hasFeedback: false,
      ...(input.notes?.trim() ? { notes: input.notes.trim().slice(0, 300) } : {}),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (isDemoMode) {
      const next = [newOrder, ...orders];
      setOrders(next);
      localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(next));
      clearCart();
      setIsCartOpen(false);
      showToast('Meal order confirmed! Home cook notified.', 'success');
      return newOrder;
    }

    if (!db || !user) throw new Error('Authentication required.');
    const path = `orders/${orderId}`;
    const firestorePayload: Record<string, unknown> = {
      userId: user.uid,
      userName: profile.fullName.slice(0, 100),
      userPhone: profile.phone.slice(0, 20),
      area: input.area,
      address: input.address.trim().slice(0, 250),
      slot: input.slot,
      paymentMethod: input.paymentMethod,
      items,
      subtotal: cartSubtotal,
      discount,
      totalAmount,
      status: 'confirmed',
      isTrialOrder,
      hasFeedback: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (input.notes?.trim()) {
      firestorePayload.notes = input.notes.trim().slice(0, 300);
    }

    try {
      await setDoc(doc(db, 'orders', orderId), firestorePayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }

    clearCart();
    setIsCartOpen(false);
    showToast('Meal order confirmed! Home cook notified.', 'success');
    return newOrder;
  };

  const cancelOrder = async (orderId: string) => {
    if (isDemoMode) {
      const next = orders.map((o) =>
        o.id === orderId ? { ...o, status: 'cancelled' as const, updatedAt: new Date().toISOString() } : o
      );
      setOrders(next);
      localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(next));
      showToast('Order cancelled.', 'info');
      return;
    }

    if (!db) return;
    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });
      showToast('Order cancelled.', 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const subscribeToPlan = async (plan: MealPlan, preferredSlot: PlanSlotPreference) => {
    if (!profile) throw new Error('Complete your profile first.');
    const subId = makeSafeId('sub');
    const nowIso = new Date().toISOString();

    const newSub: Subscription = {
      id: subId,
      userId: profile.uid,
      userName: profile.fullName,
      userPhone: profile.phone,
      area: profile.area,
      planId: plan.id,
      planName: plan.name,
      totalMeals: plan.mealsCount,
      remainingMeals: plan.mealsCount,
      price: plan.price,
      preferredSlot,
      status: 'active',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (isDemoMode) {
      const next = [newSub, ...subscriptions];
      setSubscriptions(next);
      localStorage.setItem(DEMO_SUBS_KEY, JSON.stringify(next));
      showToast(`Subscribed to ${plan.name}!`, 'success');
      return;
    }

    if (!db || !user) throw new Error('Authentication required.');
    const path = `subscriptions/${subId}`;
    try {
      await setDoc(doc(db, 'subscriptions', subId), {
        userId: user.uid,
        userName: profile.fullName.slice(0, 100),
        userPhone: profile.phone.slice(0, 20),
        area: profile.area,
        planId: plan.id,
        planName: plan.name,
        totalMeals: plan.mealsCount,
        remainingMeals: plan.mealsCount,
        price: plan.price,
        preferredSlot,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showToast(`Subscribed to ${plan.name}!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const toggleSubscriptionPause = async (sub: Subscription) => {
    const nextStatus = sub.status === 'active' ? 'paused' : 'active';
    if (isDemoMode) {
      const next = subscriptions.map((s) =>
        s.id === sub.id ? { ...s, status: nextStatus as Subscription['status'], updatedAt: new Date().toISOString() } : s
      );
      setSubscriptions(next);
      localStorage.setItem(DEMO_SUBS_KEY, JSON.stringify(next));
      showToast(nextStatus === 'paused' ? 'Meal plan paused.' : 'Meal plan resumed.', 'info');
      return;
    }

    if (!db) return;
    const path = `subscriptions/${sub.id}`;
    try {
      await updateDoc(doc(db, 'subscriptions', sub.id), {
        status: nextStatus,
        preferredSlot: sub.preferredSlot,
        updatedAt: serverTimestamp(),
      });
      showToast(nextStatus === 'paused' ? 'Meal plan paused.' : 'Meal plan resumed.', 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const redeemMealFromPlan = async (sub: Subscription) => {
    if (sub.remainingMeals <= 0 || sub.status !== 'active') return;
    const nextRemaining = sub.remainingMeals - 1;
    const nextStatus: Subscription['status'] = nextRemaining === 0 ? 'completed' : 'active';

    if (isDemoMode) {
      const next = subscriptions.map((s) =>
        s.id === sub.id
          ? { ...s, remainingMeals: nextRemaining, status: nextStatus, updatedAt: new Date().toISOString() }
          : s
      );
      setSubscriptions(next);
      localStorage.setItem(DEMO_SUBS_KEY, JSON.stringify(next));
      showToast(`1 meal booked from your plan. ${nextRemaining} left.`, 'success');
      return;
    }

    if (!db) return;
    const path = `subscriptions/${sub.id}`;
    try {
      await updateDoc(doc(db, 'subscriptions', sub.id), {
        remainingMeals: nextRemaining,
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      showToast(`1 meal booked from your plan. ${nextRemaining} left.`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const submitFeedback = async (input: SubmitFeedbackInput) => {
    if (!profile) throw new Error('Profile required.');
    const fbId = makeSafeId('fb');
    const cleanComment = input.comment.trim().slice(0, 1000);
    const nowIso = new Date().toISOString();

    const newFb: Feedback = {
      id: fbId,
      userId: profile.uid,
      userName: profile.fullName,
      orderId: input.orderId,
      mealName: input.mealName.slice(0, 120),
      tasteRating: input.tasteRating,
      hygieneRating: input.hygieneRating,
      portionRating: input.portionRating,
      priceRating: input.priceRating,
      deliveryRating: input.deliveryRating,
      wouldOrderAgain: input.wouldOrderAgain,
      comment: cleanComment,
      createdAt: nowIso,
    };

    if (isDemoMode) {
      const nextFb = [newFb, ...feedbackList];
      setFeedbackList(nextFb);
      localStorage.setItem(DEMO_FEEDBACK_KEY, JSON.stringify(nextFb));

      if (input.orderId !== 'general_pilot') {
        const nextOrders = orders.map((o) =>
          o.id === input.orderId ? { ...o, hasFeedback: true, updatedAt: nowIso } : o
        );
        setOrders(nextOrders);
        localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(nextOrders));
      }
      setFeedbackTargetOrder(null);
      setIsGeneralFeedbackOpen(false);
      showToast('Thank you! Your meal feedback helps our home cooks.', 'success');
      return;
    }

    if (!db || !user) throw new Error('Authentication required.');
    const fbPath = `feedback/${fbId}`;
    try {
      await setDoc(doc(db, 'feedback', fbId), {
        userId: user.uid,
        userName: profile.fullName.slice(0, 100),
        orderId: input.orderId,
        mealName: input.mealName.slice(0, 120),
        tasteRating: input.tasteRating,
        hygieneRating: input.hygieneRating,
        portionRating: input.portionRating,
        priceRating: input.priceRating,
        deliveryRating: input.deliveryRating,
        wouldOrderAgain: input.wouldOrderAgain,
        comment: cleanComment,
        createdAt: serverTimestamp(),
      });

      if (input.orderId !== 'general_pilot') {
        await updateDoc(doc(db, 'orders', input.orderId), {
          hasFeedback: true,
          updatedAt: serverTimestamp(),
        });
      }

      setFeedbackTargetOrder(null);
      setIsGeneralFeedbackOpen(false);
      showToast('Thank you! Your meal feedback helps our home cooks.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, fbPath);
    }
  };

  const allPilotOrders = useMemo(() => {
    if (isDemoMode) {
      return [...orders, ...DEMO_PILOT_EXTRA_ORDERS].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return isAdminUser && adminOrders.length > 0 ? adminOrders : orders;
  }, [isDemoMode, orders, isAdminUser, adminOrders]);

  const allPilotFeedback = useMemo(() => {
    if (isDemoMode) {
      const extra = DEMO_SEED_FEEDBACK.filter((f) => f.userId !== 'demo-student-aarav');
      return [...feedbackList, ...extra].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return isAdminUser && adminFeedback.length > 0 ? adminFeedback : feedbackList;
  }, [isDemoMode, feedbackList, isAdminUser, adminFeedback]);

  const pilotMetrics: PilotMetrics = useMemo(() => {
    const validOrders = allPilotOrders.filter((o) => o.status !== 'cancelled');
    const totalOrders = validOrders.length;

    const ordersByUser = new Map<string, number>();
    let totalMealUnits = 0;
    let totalRevenue = 0;

    validOrders.forEach((o) => {
      ordersByUser.set(o.userId, (ordersByUser.get(o.userId) || 0) + 1);
      const units = o.items.reduce((sum, i) => sum + i.quantity, 0);
      totalMealUnits += units;
      totalRevenue += o.totalAmount;
    });

    const uniqueUsers = ordersByUser.size;
    const repeatUsers = Array.from(ordersByUser.values()).filter((count) => count >= 2).length;
    const trialCustomers = new Set(
      validOrders.filter((o) => o.isTrialOrder).map((o) => o.userId)
    ).size;

    const repeatPurchaseRate = uniqueUsers > 0 ? Math.round((repeatUsers / uniqueUsers) * 100) : 0;
    const avgMealPrice = totalMealUnits > 0 ? Math.round(totalRevenue / totalMealUnits) : 100;

    const fbCount = allPilotFeedback.length;
    const avg = (picker: (f: Feedback) => number) =>
      fbCount > 0 ? Number((allPilotFeedback.reduce((s, f) => s + picker(f), 0) / fbCount).toFixed(1)) : 0;

    const wouldOrderAgainPct =
      fbCount > 0
        ? Math.round((allPilotFeedback.filter((f) => f.wouldOrderAgain).length / fbCount) * 100)
        : 0;

    return {
      totalOrders,
      trialCustomers,
      repeatPurchaseRate,
      avgMealPrice,
      avgHygieneRating: avg((f) => f.hygieneRating),
      avgTasteRating: avg((f) => f.tasteRating),
      avgPortionRating: avg((f) => f.portionRating),
      avgPriceRating: avg((f) => f.priceRating),
      avgDeliveryRating: avg((f) => f.deliveryRating),
      wouldOrderAgainPct,
    };
  }, [allPilotOrders, allPilotFeedback]);

  return (
    <AppDataContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeSlot,
        setActiveSlot,
        cart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        orders,
        subscriptions,
        feedbackList,
        allPilotOrders,
        allPilotFeedback,
        pilotMetrics,
        dataLoading,
        founderViewEnabled,
        setFounderViewEnabled,
        feedbackTargetOrder,
        setFeedbackTargetOrder,
        isGeneralFeedbackOpen,
        setIsGeneralFeedbackOpen,
        placeOrder,
        cancelOrder,
        subscribeToPlan,
        toggleSubscriptionPause,
        redeemMealFromPlan,
        submitFeedback,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}
