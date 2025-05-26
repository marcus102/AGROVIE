export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'bank_transfer' | 'mobile_money';

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  createdAt: string;
  completedAt?: string;
  description: string;
  reference: string;
  fees: {
    platform: number;
    payment: number;
    total: number;
  };
  metadata?: Record<string, any>;
}

export interface PaymentSummary {
  totalEarnings: number;
  pendingPayments: number;
  availableBalance: number;
  currency: string;
  lastPayout?: {
    amount: number;
    date: string;
    status: PaymentStatus;
  };
  monthlyStats: {
    month: string;
    earnings: number;
    fees: number;
    payouts: number;
  }[];
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethod;
  isDefault: boolean;
  lastUsed?: string;
  details: {
    bank?: {
      name: string;
      accountNumber: string;
      accountType: string;
    };
    card?: {
      brand: string;
      last4: string;
      expiryMonth: number;
      expiryYear: number;
    };
    mobile?: {
      provider: string;
      number: string;
      country: string;
    };
  };
}