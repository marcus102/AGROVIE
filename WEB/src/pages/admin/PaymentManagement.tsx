import React, { useState, useEffect, useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  Eye,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Edit,
  MoreHorizontal,
  Phone,
  CreditCard,
  Calendar,
  Filter,
  FileText,
  Trash2,
  RotateCcw,
} from 'lucide-react';

// Import your payment store and functions
import {
  usePaymentStore,
  getPaymentRecords,
  getPaymentSummary,
  updatePaymentRecord,
  deletePaymentRecord,
  refundPayment,
  verifyPaymentOTP,
  processPayment,
  subscribeToPayments,
  batchUpdatePayments,
} from '../../store/payment';
import { Payment, PaymentStatus, PaymentFilters } from '../../types/payment';

const columnHelper = createColumnHelper<Payment>();

const statusIcons = {
  'completed': CheckCircle,
  'pending': Clock,
  'processing': RefreshCw,
  'failed': XCircle,
  'cancelled': XCircle,
  'refunded': AlertTriangle,
};

const statusColors = {
  'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'processing': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  'refunded': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

const paymentMethods = {
  'mobile_money': 'Mobile Money',
  'bank_transfer': 'Bank Transfer',
  'credit_card': 'Credit Card',
  'cash': 'Cash',
};

const paymentTypes = {
  'payment': 'Payment',
  'refund': 'Refund',
  'fee': 'Fee',
  'commission': 'Commission',
};

export function PaymentManagement() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  // Get data from payment store
  const {
    payments,
    paymentLoading,
    paymentError,
    setLoading,
    setError,
  } = usePaymentStore();

  // Summary data
  const [summary, setSummary] = useState<any>(null);

  // Load payments and summary on component mount
  useEffect(() => {
    loadPayments();
    loadSummary();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToPayments(filters, () => {
      loadSummary();
    });
    
    return unsubscribe;
  }, [filters]);

  const loadPayments = async () => {
    const result = await getPaymentRecords(filters, 100, 0);
    if (result.error) {
      console.error('Error loading payments:', result.error);
    }
  };

  const loadSummary = async () => {
    const result = await getPaymentSummary(filters);
    if (result.data) {
      setSummary(result.data);
    }
  };

  // Apply date and amount filters
  useEffect(() => {
    const newFilters: PaymentFilters = { ...filters };
    
    if (dateRange.start) {
      newFilters.date_from = dateRange.start;
    }
    if (dateRange.end) {
      newFilters.date_to = dateRange.end;
    }
    if (amountRange.min) {
      newFilters.amount_min = parseFloat(amountRange.min);
    }
    if (amountRange.max) {
      newFilters.amount_max = parseFloat(amountRange.max);
    }
    
    setFilters(newFilters);
  }, [dateRange, amountRange]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={(e) => {
              table.getToggleAllRowsSelectedHandler()(e);
              const selected = e.target.checked 
                ? table.getRowModel().rows.map(row => row.original.id)
                : [];
              setSelectedPayments(selected);
            }}
            className="rounded border-gray-300 text-primary-600"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => {
              row.getToggleSelectedHandler()(e);
              const paymentId = row.original.id;
              setSelectedPayments(prev => 
                e.target.checked 
                  ? [...prev, paymentId]
                  : prev.filter(id => id !== paymentId)
              );
            }}
            className="rounded border-gray-300 text-primary-600"
          />
        ),
      }),
      columnHelper.accessor('payment_reference', {
        header: 'Reference',
        cell: (info) => (
          <div className="font-medium text-gray-900 dark:text-white">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('user_phone', {
        header: 'Customer',
        cell: (info) => (
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-gray-900 dark:text-white">
              +{info.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('payment_method', {
        header: 'Method',
        cell: (info) => (
          <div className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">
              {paymentMethods[info.getValue() as keyof typeof paymentMethods] || info.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('payment_type', {
        header: 'Type',
        cell: (info) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {paymentTypes[info.getValue() as keyof typeof paymentTypes] || info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: (info) => (
          <div className="font-medium text-gray-900 dark:text-white">
            XOF {info.getValue()?.toFixed(2)}
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          const Icon = statusIcons[status as keyof typeof statusIcons];
          return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}`}>
              <Icon className="w-4 h-4 mr-1" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      }),
      columnHelper.accessor('created_at', {
        header: 'Created',
        cell: (info) => (
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            {format(new Date(info.getValue()), 'MMM dd, yyyy HH:mm')}
          </div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedPayment(row.original)}
              className="text-gray-400 hover:text-primary-600 p-1"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedPayment(row.original);
                setShowEditModal(true);
              }}
              className="text-gray-400 hover:text-blue-600 p-1"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <div className="relative group">
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="py-1">
                  {row.original.status === 'pending' && (
                    <button
                      onClick={() => handleProcessPayment(row.original)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      Process Payment
                    </button>
                  )}
                  {row.original.status === 'completed' && (
                    <button
                      onClick={() => {
                        setSelectedPayment(row.original);
                        setShowRefundModal(true);
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      Refund
                    </button>
                  )}
                  {row.original.otp_code && (
                    <button
                      onClick={() => {
                        setSelectedPayment(row.original);
                        setShowOtpModal(true);
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      Verify OTP
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePayment(row.original.id)}
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: payments,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
  });

  // Payment action handlers
  const handleProcessPayment = async (payment: Payment) => {
    const result = await processPayment(payment.id);
    if (result.error) {
      alert('Error processing payment: ' + result.error);
    } else {
      alert('Payment processing initiated');
    }
  };

  const handleRefundPayment = async () => {
    if (!selectedPayment) return;
    
    const amount = refundAmount ? parseFloat(refundAmount) : undefined;
    const result = await refundPayment(selectedPayment.id, amount, refundReason);
    
    if (result.error) {
      alert('Error processing refund: ' + result.error);
    } else {
      alert('Refund processed successfully');
      setShowRefundModal(false);
      setRefundAmount('');
      setRefundReason('');
    }
  };

  const handleVerifyOTP = async () => {
    if (!selectedPayment || !otpCode) return;
    
    const result = await verifyPaymentOTP(selectedPayment.id, parseInt(otpCode));
    
    if (result.error) {
      alert('Error verifying OTP: ' + result.error);
    } else {
      alert('Payment verified successfully');
      setShowOtpModal(false);
      setOtpCode('');
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    
    const result = await deletePaymentRecord(paymentId, false); // Soft delete
    
    if (result.error) {
      alert('Error deleting payment: ' + result.error);
    } else {
      alert('Payment deleted successfully');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPayments.length === 0) return;
    
    let updateData: any = {};
    
    switch (action) {
      case 'cancel':
        updateData = { status: 'cancelled' as PaymentStatus };
        break;
      case 'process':
        updateData = { status: 'processing' as PaymentStatus };
        break;
      default:
        return;
    }
    
    const result = await batchUpdatePayments(selectedPayments, updateData);
    
    if (result.error) {
      alert('Error updating payments: ' + result.error);
    } else {
      alert(`Successfully updated ${result.updated} payments`);
      setSelectedPayments([]);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Management</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
            Manage and monitor all payment transactions
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button
            onClick={loadPayments}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-green-500" />
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">Total Amount</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              XOF {summary.total_amount?.toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">Completed</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              XOF {summary.completed_amount?.toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-yellow-500" />
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">Pending</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              XOF {summary.pending_amount?.toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center">
              <XCircle className="h-6 w-6 text-red-500" />
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">Failed</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              XOF {summary.failed_amount?.toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-purple-500" />
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">Success Rate</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {summary.success_rate?.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Payment Method
              </label>
              <select
                value={filters.payment_method || ''}
                onChange={(e) => setFilters({...filters, payment_method: e.target.value ? e.target.value as Payment['payment_method'] : undefined})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Methods</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Payment Type
              </label>
              <select
                value={filters.payment_type || ''}
                onChange={(e) => setFilters({...filters, payment_type: e.target.value ? e.target.value as Payment['payment_type'] : undefined})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
                <option value="fee">Fee</option>
                <option value="commission">Commission</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({...filters, status: e.target.value as PaymentStatus || undefined})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                User ID
              </label>
              <input
                type="text"
                value={filters.user_id || ''}
                onChange={(e) => setFilters({...filters, user_id: e.target.value || undefined})}
                placeholder="Enter user ID"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Date From
              </label>
              <input
                type="datetime-local"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Date To
              </label>
              <input
                type="datetime-local"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Min Amount
              </label>
              <input
                type="number"
                value={amountRange.min}
                onChange={(e) => setAmountRange({...amountRange, min: e.target.value})}
                placeholder="0.00"
                step="0.01"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Max Amount
              </label>
              <input
                type="number"
                value={amountRange.max}
                onChange={(e) => setAmountRange({...amountRange, max: e.target.value})}
                placeholder="1000.00"
                step="0.01"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => {
                setFilters({});
                setDateRange({ start: '', end: '' });
                setAmountRange({ min: '', max: '' });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
            >
              Clear Filters
            </button>
            <button
              onClick={loadPayments}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Search and Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search payments..."
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {selectedPayments.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {selectedPayments.length} selected
            </span>
            <div className="relative">
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
              >
                Bulk Actions
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
              {showBulkActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleBulkAction('process')}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      Mark as Processing
                    </button>
                    <button
                      onClick={() => handleBulkAction('cancel')}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      Cancel Payments
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {paymentLoading && (
        <div className="flex justify-center items-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading payments...</span>
        </div>
      )}

      {/* Error State */}
      {paymentError && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{paymentError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`group inline-flex ${
                            header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="ml-2 flex-none rounded">
                              {{
                                asc: <ChevronUp className="h-4 w-4" />,
                                desc: <ChevronDown className="h-4 w-4" />,
                              }[header.column.getIsSorted() as string] ?? null}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No payments found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      row.getIsSelected() ? 'bg-primary-50 dark:bg-primary-900' : ''
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 rounded-b-lg">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {[10, 25, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700 dark:text-gray-300">entries</span>
          </div>
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}
              </span>{' '}
              of <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronUp className="h-5 w-5 transform rotate-[-90deg]" />
              </button>
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                {table.getState().pagination.pageIndex + 1}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronDown className="h-5 w-5 transform rotate-[-90deg]" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && !showEditModal && !showRefundModal && !showOtpModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Payment Details</h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{selectedPayment.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Reference</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{selectedPayment.payment_reference}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{selectedPayment.user_id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">+{selectedPayment.user_phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">XOF {selectedPayment.amount?.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {paymentMethods[selectedPayment.payment_method as keyof typeof paymentMethods] || selectedPayment.payment_method}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {paymentTypes[selectedPayment.payment_type as keyof typeof paymentTypes] || selectedPayment.payment_type}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedPayment.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}`}>
                      {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                    </span>
                  </dd>
                </div>
                {selectedPayment.mission_id && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mission ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{selectedPayment.mission_id}</dd>
                  </div>
                )}
                {selectedPayment.otp_code && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">OTP Code</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{selectedPayment.otp_code}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {format(new Date(selectedPayment.created_at), 'PPpp')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated At</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {format(new Date(selectedPayment.updated_at), 'PPpp')}
                  </dd>
                </div>
                {selectedPayment.description && (
                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{selectedPayment.description}</dd>
                  </div>
                )}
                {selectedPayment.metadata && (
                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Metadata</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(selectedPayment.metadata, null, 2)}
                      </pre>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              {selectedPayment.status === 'pending' && (
                <button
                  onClick={() => handleProcessPayment(selectedPayment)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Process Payment
                </button>
              )}
              {selectedPayment.status === 'completed' && (
                <button
                  onClick={() => {
                    setShowRefundModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Refund
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEditModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Payment</h3>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const status = formData.get('status') as PaymentStatus;
              const description = formData.get('description') as string;
              
              const result = await updatePaymentRecord(selectedPayment.id, {
                status,
                description,
              });
              
              if (result.error) {
                alert('Error updating payment: ' + result.error);
              } else {
                setShowEditModal(false);
                setSelectedPayment(null);
              }
            }}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={selectedPayment.status}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={selectedPayment.description}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPayment(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Process Refund</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Refund Amount
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={`Max: ${selectedPayment.amount?.toFixed(2)}`}
                  max={selectedPayment.amount}
                  step="0.01"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Leave empty for full refund
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Reason
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  placeholder="Enter refund reason..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundAmount('');
                  setRefundReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRefundPayment}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Process Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Verify OTP</h3>
            </div>
            <div className="px-6 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  OTP Code
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter OTP code"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Expected OTP: {selectedPayment.otp_code}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpCode('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOTP}
                disabled={!otpCode}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                Verify OTP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}