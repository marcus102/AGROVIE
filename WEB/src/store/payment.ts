import { create } from 'zustand';
import {
  Payment,
  PaymentStatus,
  PaymentCreatePayload,
  PaymentUpdatePayload,
  PaymentFilters,
  PaymentSummary,
  PaymentSummaryResponse,
  PaymentsResponse,
  PaymentResponse,
} from '../types/payment';
import { createClient} from "@supabase/supabase-js";

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

//payment_status_type

// Zustand store for payment state management
interface PaymentStore {
  payments: Payment[];
  currentPayment: Payment | null;
  paymentLoading: boolean;
  paymentError: string | null;

  // Actions
  setPayments: (payments: Payment[]) => void;
  setCurrentPayment: (payment: Payment | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (paymentId: string, updates: Partial<Payment>) => void;
  removePayment: (paymentId: string) => void;
  clearPayments: () => void;
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payments: [],
  currentPayment: null,
  paymentLoading: false,
  paymentError: null,

  setPayments: (payments) => set({ payments, paymentError: null }),
  setCurrentPayment: (payment) => set({ currentPayment: payment }),
  setLoading: (loading) => set({ paymentLoading: loading }),
  setError: (error) => set({ paymentError: error }),

  addPayment: (payment) => {
    const { payments } = get();
    set({ payments: [payment, ...payments] });
  },

  updatePayment: (paymentId, updates) => {
    const { payments } = get();
    const updatedPayments = payments.map((payment) =>
      payment.id === paymentId ? { ...payment, ...updates } : payment
    );
    set({ payments: updatedPayments });

    // Update current payment if it matches
    const { currentPayment } = get();
    if (currentPayment?.id === paymentId) {
      set({ currentPayment: { ...currentPayment, ...updates } });
    }
  },

  removePayment: (paymentId) => {
    const { payments } = get();
    const filteredPayments = payments.filter(
      (payment) => payment.id !== paymentId
    );
    set({ payments: filteredPayments });

    // Clear current payment if it matches
    const { currentPayment } = get();
    if (currentPayment?.id === paymentId) {
      set({ currentPayment: null });
    }
  },

  clearPayments: () => set({ payments: [], currentPayment: null, paymentError: null }),
}));

/**
 * Create a new payment record
 */
export async function createPaymentRecord(
  paymentData: PaymentCreatePayload
): Promise<PaymentResponse> {
  const { setLoading, setError, addPayment } = usePaymentStore.getState();

  try {
    setLoading(true);
    setError(null);

    // Validate required fields
    if (
      !paymentData.user_id ||
      !paymentData.amount ||
      !paymentData.payment_method
    ) {
      throw new Error(
        'Missing required fields: user_id, amount, and payment_method are required'
      );
    }

    if (paymentData.amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    // Generate payment reference if not provided
    const payment_reference =
      paymentData.payment_reference ||
      `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newPayment = {
      ...paymentData,
      payment_reference,
      status: paymentData.status || ('pending' as PaymentStatus),
    };

    const { data, error } = await supabase
      .from('payments')
      .insert(newPayment)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Add to store
    addPayment(data);

    return { data };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create payment';
    setError(errorMessage);
    return { data: null, error: errorMessage };
  } finally {
    setLoading(false);
  }
}

/**
 * Get multiple payment records with optional filtering
 */
export async function getPaymentRecords(
  filters?: PaymentFilters,
  limit = 50,
  offset = 0
): Promise<PaymentsResponse> {
  const { setLoading, setError, setPayments } = usePaymentStore.getState();

  try {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters) {
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.mission_id) {
        query = query.eq('mission_id', filters.mission_id);
      }
      if (filters.payment_method) {
        query = query.eq('payment_method', filters.payment_method);
      }
      if (filters.payment_type) {
        query = query.eq('payment_type', filters.payment_type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.amount_min !== undefined) {
        query = query.gte('amount', filters.amount_min);
      }
      if (filters.amount_max !== undefined) {
        query = query.lte('amount', filters.amount_max);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Update store
    setPayments(data || []);

    return { data: data || [], count: count || 0 };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch payments';
    setError(errorMessage);
    return { data: [], error: errorMessage };
  } finally {
    setLoading(false);
  }
}

/**
 * Get a single payment record by ID
 */
export async function getPaymentRecord(
  paymentId: string
): Promise<PaymentResponse> {
  const { setLoading, setError, setCurrentPayment } =
    usePaymentStore.getState();

  try {
    setLoading(true);
    setError(null);

    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Update store
    setCurrentPayment(data);

    return { data };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch payment';
    setError(errorMessage);
    return { data: null, error: errorMessage };
  } finally {
    setLoading(false);
  }
}

/**
 * Update a payment record
 */
export async function updatePaymentRecord(
  paymentId: string,
  updateData: PaymentUpdatePayload
): Promise<PaymentResponse> {
  const { setLoading, setError, updatePayment } = usePaymentStore.getState();

  try {
    setLoading(true);
    setError(null);

    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    // Validate amount if being updated
    if (updateData.amount !== undefined && updateData.amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    const updatedData = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('payments')
      .update(updatedData)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Update store
    updatePayment(paymentId, data);

    return { data };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update payment';
    setError(errorMessage);
    return { data: null, error: errorMessage };
  } finally {
    setLoading(false);
  }
}

/**
 * Delete a payment record (soft delete recommended)
 */
export async function deletePaymentRecord(
  paymentId: string,
  hardDelete = false
): Promise<{ success: boolean; error?: string }> {
  const { setLoading, setError, updatePayment, removePayment } =
    usePaymentStore.getState();

  try {
    setLoading(true);
    setError(null);

    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    if (hardDelete) {
      // Hard delete - completely remove from database
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) {
        throw new Error(error.message);
      }

      // Remove from store
      removePayment(paymentId);
    } else {
      // Soft delete - update status to cancelled
      const softDeleteData = {
        status: 'cancelled' as PaymentStatus,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('payments')
        .update(softDeleteData)
        .eq('id', paymentId);

      if (error) {
        throw new Error(error.message);
      }

      // Update store
      updatePayment(paymentId, softDeleteData);
    }

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete payment';
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
}

/**
 * Get payment records for a specific user
 */
export async function getUserPayments(
  userId: string,
  limit = 50,
  offset = 0
): Promise<PaymentsResponse> {
  return getPaymentRecords({ user_id: userId }, limit, offset);
}

/**
 * Get payment records for a specific mission
 */
export async function getMissionPayments(
  missionId: string,
  limit = 50,
  offset = 0
): Promise<PaymentsResponse> {
  return getPaymentRecords({ mission_id: missionId }, limit, offset);
}

/**
 * Get payment summary/statistics
 */
export async function getPaymentSummary(
  filters?: PaymentFilters
): Promise<PaymentSummaryResponse> {
  const { setLoading, setError } = usePaymentStore.getState();

  try {
    setLoading(true);
    setError(null);

    // Build the query with filters
    let query = supabase.from('payments').select('amount, status');

    if (filters) {
      if (filters.user_id) query = query.eq('user_id', filters.user_id);
      if (filters.mission_id)
        query = query.eq('mission_id', filters.mission_id);
      if (filters.payment_method)
        query = query.eq('payment_method', filters.payment_method);
      if (filters.payment_type)
        query = query.eq('payment_type', filters.payment_type);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.amount_min !== undefined)
        query = query.gte('amount', filters.amount_min);
      if (filters.amount_max !== undefined)
        query = query.lte('amount', filters.amount_max);
      if (filters.date_from) query = query.gte('created_at', filters.date_from);
      if (filters.date_to) query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Calculate summary statistics
    const payments = data || [];
    const total_amount = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const completed_amount = payments
      .filter((payment) => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
    const pending_amount = payments
      .filter(
        (payment) =>
          payment.status === 'pending' || payment.status === 'processing'
      )
      .reduce((sum, payment) => sum + payment.amount, 0);
    const failed_amount = payments
      .filter(
        (payment) =>
          payment.status === 'failed' || payment.status === 'cancelled'
      )
      .reduce((sum, payment) => sum + payment.amount, 0);
    const transaction_count = payments.length;
    const completed_count = payments.filter(
      (payment) => payment.status === 'completed'
    ).length;
    const success_rate =
      transaction_count > 0 ? (completed_count / transaction_count) * 100 : 0;

    const summary: PaymentSummary = {
      total_amount,
      completed_amount,
      pending_amount,
      failed_amount,
      transaction_count,
      success_rate,
    };

    return { data: summary };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to fetch payment summary';
    setError(errorMessage);
    return { data: null, error: errorMessage };
  } finally {
    setLoading(false);
  }
}

/**
 * Process payment (initiate payment processing)
 */
export async function processPayment(
  paymentId: string
): Promise<PaymentResponse> {
  try {
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    // Update payment status to processing
    const result = await updatePaymentRecord(paymentId, {
      status: 'processing',
    });

    if (result.error) {
      throw new Error(result.error);
    }

    // Here you would integrate with payment gateway
    // Example: await paymentGateway.processPayment(paymentId);

    console.log('Processing payment:', paymentId);

    return result;
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : 'Failed to process payment',
    };
  }
}

/**
 * Verify payment with OTP
 */
export async function verifyPaymentOTP(
  paymentId: string,
  otpCode: number
): Promise<PaymentResponse> {
  try {
    if (!paymentId || !otpCode) {
      throw new Error('Payment ID and OTP code are required');
    }

    // Get current payment to verify OTP
    const currentPayment = await getPaymentRecord(paymentId);

    if (!currentPayment.data) {
      throw new Error('Payment not found');
    }

    if (currentPayment.data.otp_code !== otpCode) {
      
      throw new Error('Invalid OTP code');
    }

    // Update payment status to completed
    return await updatePaymentRecord(paymentId, {
      status: 'completed',
    });
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : 'Failed to verify payment OTP',
    };
  }
}

/**
 * Refund a payment
 */
export async function refundPayment(
  paymentId: string,
  refundAmount?: number,
  reason?: string
): Promise<PaymentResponse> {
  try {
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    const originalPayment = await getPaymentRecord(paymentId);

    if (!originalPayment.data) {
      throw new Error('Original payment not found');
    }

    if (originalPayment.data.status !== 'completed') {
      throw new Error('Can only refund completed payments');
    }

    const refundAmountFinal = refundAmount || originalPayment.data.amount;

    if (refundAmountFinal > originalPayment.data.amount) {
      throw new Error('Refund amount cannot exceed original payment amount');
    }

    // Create refund payment record
    const refundPayment = await createPaymentRecord({
      user_id: originalPayment.data.user_id,
      user_phone: originalPayment.data.user_phone,
      payment_method: originalPayment.data.payment_method,
      payment_reference: `REFUND_${originalPayment.data.payment_reference}`,
      payment_type: 'refund',
      amount: refundAmountFinal,
      description: reason || `Refund for payment ${paymentId}`,
      mission_id: originalPayment.data.mission_id,
      metadata: {
        original_payment_id: paymentId,
        refund_reason: reason,
      },
    });

    // Update original payment status
    if (refundPayment.data) {
      await updatePaymentRecord(paymentId, {
        status: 'refunded',
        metadata: {
          ...(originalPayment.data.metadata as object),
          refund_payment_id: refundPayment.data.id,
          refund_amount: refundAmountFinal,
        },
      });
    }

    return refundPayment;
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : 'Failed to process refund',
    };
  }
}

/**
 * Batch operations for multiple payments
 */
export async function batchUpdatePayments(
  paymentIds: string[],
  updateData: PaymentUpdatePayload
): Promise<{ success: boolean; updated: number; error?: string }> {
  const { setLoading, setError } = usePaymentStore.getState();

  try {
    setLoading(true);
    setError(null);

    if (!paymentIds.length) {
      throw new Error('Payment IDs are required');
    }

    const updatedData = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('payments')
      .update(updatedData)
      .in('id', paymentIds)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    // Update store for each payment
    const { updatePayment } = usePaymentStore.getState();
    data?.forEach((payment) => {
      updatePayment(payment.id, payment);
    });

    return { success: true, updated: data?.length || 0 };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to batch update payments';
    setError(errorMessage);
    return { success: false, updated: 0, error: errorMessage };
  } finally {
    setLoading(false);
  }
}

/**
 * Get payments with real-time subscription
 */
export function subscribeToPayments(
  filters?: PaymentFilters,
  callback?: (payments: Payment[]) => void
) {
  const { setPayments, addPayment, updatePayment, removePayment } =
    usePaymentStore.getState();

  let channel = supabase.channel('payments-channel').on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'payments',
    },
    (payload) => {
      switch (payload.eventType) {
        case 'INSERT':
          addPayment(payload.new as Payment);
          break;
        case 'UPDATE':
          updatePayment(payload.new.id, payload.new as Payment);
          break;
        case 'DELETE':
          removePayment(payload.old.id);
          break;
      }

      if (callback) {
        const { payments } = usePaymentStore.getState();
        callback(payments);
      }
    }
  );

  // Apply filters if provided
  if (filters) {
    if (filters.user_id) {
      (channel as any).filter('user_id', 'eq', filters.user_id);
    }
    if (filters.mission_id) {
      (channel as any).filter('mission_id', 'eq', filters.mission_id);
    }
    if (filters.status) {
      (channel as any).filter('status', 'eq', filters.status);
    }
  }

  channel.subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
