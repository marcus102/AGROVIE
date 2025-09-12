import { create } from 'zustand';
import { PaymentTransaction, PaymentSummary, PaymentMethod } from '@/types/payment';

interface PaymentState {
  transactions: PaymentTransaction[];
  summary: PaymentSummary | null;
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  setTransactions: (transactions: PaymentTransaction[]) => void;
  setSummary: (summary: PaymentSummary) => void;
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  transactions: [],
  summary: null,
  paymentMethods: [],
  loading: false,
  error: null,
  setTransactions: (transactions) => set({ transactions }),
  setSummary: (summary) => set({ summary }),
  setPaymentMethods: (methods) => set({ paymentMethods: methods }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));