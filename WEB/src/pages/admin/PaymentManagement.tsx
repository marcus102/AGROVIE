import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { Payment, PaymentStatus, useAdminStore } from '../../store/adminStore';

const columnHelper = createColumnHelper<Payment>();

const statusIcons = {
  'Completed': CheckCircle,
  'Pending': Clock,
  'Failed': XCircle,
  'Refunded': AlertTriangle,
};

const statusColors = {
  'Completed': 'bg-green-100 text-green-800',
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Failed': 'bg-red-100 text-red-800',
  'Refunded': 'bg-gray-100 text-gray-800',
};

export function PaymentManagement() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');

  const { payments = []  } = useAdminStore();

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = 
        payment.id.toLowerCase().includes(globalFilter.toLowerCase()) ||
        payment.description.toLowerCase().includes(globalFilter.toLowerCase()) ||
        payment.customer.name.toLowerCase().includes(globalFilter.toLowerCase());

      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

      const now = new Date();
      const paymentDate = new Date(payment.date);
      let matchesDate = true;

      if (dateFilter === 'today') {
        matchesDate = paymentDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        matchesDate = paymentDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        matchesDate = paymentDate >= monthAgo;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [payments, globalFilter, statusFilter, dateFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Payment ID',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('customer', {
        header: 'Customer',
        cell: (info) => (
          <div>
            <div className="font-medium text-gray-900">{info.getValue().name}</div>
            <div className="text-gray-500">{info.getValue().email}</div>
          </div>
        ),
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: (info) => (
          <div className="font-medium text-gray-900">
            ${info.getValue().toFixed(2)}
          </div>
        ),
      }),
      columnHelper.accessor('date', {
        header: 'Date',
        cell: (info) => format(new Date(info.getValue()), 'MMM dd, yyyy HH:mm'),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          const Icon = statusIcons[status];
          return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
              <Icon className="w-4 h-4 mr-1" />
              {status}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedPayment(row.original)}
              className="text-gray-400 hover:text-gray-500"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDownload(row.original)}
              className="text-gray-400 hover:text-gray-500"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredPayments,
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
  });

  const handleDownload = (payment: Payment) => {
    // Implement receipt download logic
    console.log('Download receipt for payment:', payment.id);
  };

  const stats = useMemo(() => {
    const total = payments.length;
    const completed = payments.filter(p => p.status === 'Completed').length;
    const pending = payments.filter(p => p.status === 'Pending').length;
    const failed = payments.filter(p => p.status === 'Failed').length;
    const refunded = payments.filter(p => p.status === 'Refunded').length;
    
    const totalAmount = payments
      .filter(p => p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0);

    return { total, completed, pending, failed, refunded, totalAmount };
  }, [payments]);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Management</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
            View and manage all payment transactions
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="bg-white dark:dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-primary" />
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">Total Revenue</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            ${stats.totalAmount.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">Completed</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{stats.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-yellow-500" />
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">Pending</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center">
            <XCircle className="h-6 w-6 text-red-500" />
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">Failed</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{stats.failed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-gray-500" />
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">Refunded</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{stats.refunded}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search payments..."
            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-white"
          />
        </div>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider"
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
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-white"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
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
                  <dt className="text-sm font-medium text-gray-500">Payment ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedPayment.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedPayment.status]}`}>
                      {selectedPayment.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedPayment.customer.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Customer Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedPayment.customer.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Amount</dt>
                  <dd className="mt-1 text-sm text-gray-900">${selectedPayment.amount.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(selectedPayment.date), 'PPpp')}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedPayment.description}</dd>
                </div>
              </dl>
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => handleDownload(selectedPayment)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-DEFAULT hover:bg-primary-dark"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}