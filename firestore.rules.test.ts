/**
 * EcoBite Firestore Security Rules Verification Spec
 * Documents the Dirty Dozen attack payloads validated against firestore.rules.
 */

export interface SecurityTestCase {
  id: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  actor: string;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED' | 'ALLOW';
}

export const DIRTY_DOZEN_CASES: SecurityTestCase[] = [
  {
    id: 'DD-01',
    collection: 'users/student_1',
    operation: 'get',
    actor: 'unauthenticated',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-02',
    collection: 'users/student_1',
    operation: 'get',
    actor: 'student_2 (verified)',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-03',
    collection: 'orders/ord_1',
    operation: 'create',
    actor: 'student_1 (email_verified: false)',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-04',
    collection: 'orders/ord_2',
    operation: 'create',
    actor: 'student_2 (verified)',
    payload: { userId: 'student_1', status: 'confirmed' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-05',
    collection: 'users/student_1',
    operation: 'create',
    actor: 'student_1 (verified)',
    payload: { uid: 'student_1', isAdmin: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-06',
    collection: 'users/student_1',
    operation: 'update',
    actor: 'student_1 (verified)',
    payload: { addressLine: 'x'.repeat(300) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-07',
    collection: 'orders/ord_3',
    operation: 'create',
    actor: 'student_1 (verified)',
    payload: { userId: 'student_1', status: 'delivered' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-08',
    collection: 'orders/ord_1',
    operation: 'update',
    actor: 'student_1 (verified)',
    payload: { totalAmount: 1 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-09',
    collection: 'orders/ord_delivered',
    operation: 'update',
    actor: 'student_1 (verified)',
    payload: { status: 'confirmed' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-10',
    collection: 'subscriptions/sub_1',
    operation: 'update',
    actor: 'student_1 (verified)',
    payload: { remainingMeals: 999 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-11',
    collection: 'orders',
    operation: 'list',
    actor: 'student_2 (verified) without userId filter',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-12',
    collection: 'feedback/fb_1',
    operation: 'create',
    actor: 'student_1 (verified)',
    payload: { userId: 'student_1', tasteRating: 10 },
    expected: 'PERMISSION_DENIED',
  },
];
