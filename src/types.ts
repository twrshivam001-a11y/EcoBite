export type LucknowArea =
  | 'Gomti Nagar'
  | 'Aliganj'
  | 'Hazratganj'
  | 'Jankipuram'
  | 'Indira Nagar'
  | 'Mahanagar'
  | 'Kapoorthala';

export type MealSlot = 'lunch' | 'dinner';
export type PlanSlotPreference = 'lunch' | 'dinner' | 'both';
export type PaymentMethod = 'upi' | 'cod';
export type OrderStatus =
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PlanId = 'weekly_trial' | 'half_month' | 'full_month';
export type SubscriptionStatus = 'active' | 'paused' | 'completed';
export type TabId = 'home' | 'menu' | 'plans' | 'orders' | 'profile';

export interface MealItem {
  id: string;
  name: string;
  kicker: string;
  price: number;
  isVeg: boolean;
  isHighProtein: boolean;
  isTrialEligible: boolean;
  description: string;
  ingredients: string[];
  portionNote: string;
  calories: string;
  cookName: string;
  kitchenArea: LucknowArea;
  hygieneNote: string;
  image: string;
}

export interface MealPlan {
  id: PlanId;
  name: string;
  mealsCount: number;
  price: number;
  perMealPrice: number;
  savings: number;
  tagline: string;
  highlights: string[];
  recommended?: boolean;
}

export interface CartItem {
  meal: MealItem;
  quantity: number;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  area: LucknowArea;
  addressLine: string;
  referralCode: string;
  referredBy?: string;
  onboardingComplete: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItemSummary {
  mealId: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  area: LucknowArea;
  address: string;
  slot: MealSlot;
  paymentMethod: PaymentMethod;
  items: OrderItemSummary[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  status: OrderStatus;
  isTrialOrder: boolean;
  hasFeedback: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  area: LucknowArea;
  planId: PlanId;
  planName: string;
  totalMeals: number;
  remainingMeals: number;
  price: number;
  preferredSlot: PlanSlotPreference;
  status: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  orderId: string;
  mealName: string;
  tasteRating: number;
  hygieneRating: number;
  portionRating: number;
  priceRating: number;
  deliveryRating: number;
  wouldOrderAgain: boolean;
  comment: string;
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
