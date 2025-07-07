import { Timestamp } from 'firebase/firestore';

// User Document Structure (matching your existing structure)
export interface UserDocument {
  userId: string;
  userName: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: 'admin' | 'user';
  sponsorId: string;
  uplineId: string;
  status: 'active' | 'pending' | 'suspended' | 'banned';
  currentLevel: number;
  totalEarnings: number;
  pendingEarnings: number;
  downlines: string[];
  createdAt: Date | Timestamp;
  activationDate: Date | Timestamp;
}

// PIN Document Structure (matching your existing structure)
export interface PinDocument {
  pin: string; // "PIN123456"
  status: 'unused' | 'used' | 'expired';
  assignedTo: string | null;
  createdAt: Date | Timestamp;
  usedAt?: Date | Timestamp;
  usedBy?: string;
}

// Package Document Structure (matching your existing structure)
export interface PackageDocument {
  id: string; // "starter"
  features: string; // Single string with comma-separated features
  currency: string; // "NGN"
  price: number; // 36000
  isActive: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Matrix Document Structure (matching your existing structure)
export interface MatrixDocument {
  userId: string; // "admin002"
  parentId: string; // ""
  leftChild: string; // ""
  rightChild: string; // ""
  level: number; // 0
  position: number; // 0
  isComplete: boolean; // false
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Transaction Document Structure (matching your existing structure)
export interface TransactionDocument {
  userId: string; // "admin002"
  type: 'credit' | 'debit';
  amount: number; // 0
  description: string; // "Initial balance"
  category: 'system' | 'commission' | 'withdrawal' | 'bonus' | 'fee' | 'refund';
  reference: string; // "INIT001"
  status: 'pending' | 'completed' | 'failed';
  balanceBefore: number; // 0
  balanceAfter: number; // 0
  createdAt: Date | Timestamp;
}

// Settings Document Structure (matching your existing structure)
export interface SettingsDocument {
  commissionRates: {
    level1: number; // 0.3
    level2: number; // 0.15
    level3: number; // 0.1
    level4: number; // 0.5
    level5: number; // 0.3
    level6: number; // 0.2
  };
  matrixSize: number; // 2
  maxLevels: number; // 6
  minWithdrawal: number; // 5000
  pinPrice: number; // 1000
  withdrawalFee: number; // 100
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Commission Document Structure (matching your existing structure)
export interface CommissionDocument {
  userId: string;
  sourceUserId: string;
  amount: number;
  level: number;
  status: 'pending' | 'approved' | 'rejected';
  note: string;
  createdAt: Date | Timestamp;
  approvedAt?: Date | Timestamp;
}

// Payment Document Structure (matching your existing structure)
export interface PaymentDocument {
  userId: string;
  amount: number;
  method: string | null;
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  note: string;
  createdAt: Date | Timestamp;
}

// Withdrawal Document Structure (matching your existing structure)
export interface WithdrawalDocument {
  userId: string; // "admin002"
  amount: string; // "5000" - stored as string in your collection
  method: 'bank_transfer' | 'mobile_money' | 'crypto';
  reference: string; // "WITH001"
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  fee: number; // 100
  netAmount: number; // 4900
  requestedAt: Date | Timestamp;
  processedAt?: Date | Timestamp;
  processedBy?: string;
  note?: string;
}

// Notification Document Structure (matching your existing structure)
export interface NotificationDocument {
  userId: string; // "admin002"
  title: string; // "Welcome to Bright Orion"
  message: string; // "Your account has been successfully created"
  type: 'commission' | 'payment' | 'withdrawal' | 'system' | 'referral' | 'bonus';
  isRead: boolean; // false
  createdAt: Date | Timestamp;
}

// Referral Document Structure (matching your existing structure)
export interface ReferralDocument {
  sponsorId: string; // "admin002"
  referredUserId: string; // "GO12345678"
  referredUserName: string; // "John Doe"
  referredUserEmail: string; // "john@example.com"
  level: number; // 1
  status: 'active' | 'inactive';
  totalCommissionEarned: number; // 10800
  joinedAt: Date | Timestamp;
  activatedAt?: Date | Timestamp;
}

// Bonus Document Structure (matching your existing structure)
export interface BonusDocument {
  userId: string; // "admin002"
  bonusType: 'welcome' | 'achievement' | 'monthly' | 'quarterly' | 'special';
  amount: number; // 1000
  description: string; // "Welcome bonus for new users"
  criteria: string; // "Account activation"
  status: 'pending' | 'approved' | 'paid';
  createdAt: Date | Timestamp;
  approvedAt?: Date | Timestamp;
  paidAt?: Date | Timestamp;
}

// Activity Log Document Structure (for system audit trail)
export interface ActivityLogDocument {
  userId: string;
  action: 'login' | 'logout' | 'registration' | 'payment' | 'withdrawal' | 'commission' | 'profile_update' | 'pin_use';
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: {
    amount?: number;
    reference?: string;
    oldValue?: any;
    newValue?: any;
  };
  createdAt: Date | Timestamp;
}

// Support Ticket Document Structure (for customer support)
export interface SupportTicketDocument {
  userId: string;
  subject: string;
  message: string;
  category: 'technical' | 'payment' | 'account' | 'commission' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  resolvedAt?: Date | Timestamp;
  responses: Array<{
    from: string;
    message: string;
    timestamp: Date | Timestamp;
    isAdmin: boolean;
  }>;
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PAYMENTS: 'payments',
  COMMISSIONS: 'commissions',
  PINS: 'pins',
  PACKAGES: 'packages',
  MATRIX: 'matrix',
  TRANSACTIONS: 'transactions',
  SETTINGS: 'settings',
  WITHDRAWALS: 'withdrawals',
  NOTIFICATIONS: 'notifications',
  REFERRALS: 'referrals',
  BONUSES: 'bonuses',
  ACTIVITY_LOGS: 'activity_logs',
  SUPPORT_TICKETS: 'support_tickets'
} as const;

// Helper type for collection names
export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

