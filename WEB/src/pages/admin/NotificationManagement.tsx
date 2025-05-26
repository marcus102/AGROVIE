import { useState, useMemo, useEffect } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Trash2,
  Edit2,
  Eye,
  MoreVertical,
  Plus,
  Bell,
  X,
  Mail,
  AlertCircle,
  CheckCircle,
  Megaphone,
} from "lucide-react";
import {
  Notification,
  NotificationType,
  NotificationStatus,
  useAdminStore,
} from "../../store/adminStore";

const columnHelper = createColumnHelper<Notification>();

export function NotificationManagement() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );
  const [typeFilter, setTypeFilter] = useState<NotificationType | "">("");
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | "">("");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Notification>>({
    type: "update",
    status: "draft",
  });

  const {
    notifications,
    fetchNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    publishNotification,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
  } = useAdminStore();

  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        await fetchNotifications();
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchAllNotifications();
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="rounded border-gray-300 text-primary-DEFAULT focus:ring-primary-DEFAULT"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300 text-primary-DEFAULT focus:ring-primary-DEFAULT"
          />
        ),
      }),
      columnHelper.accessor("title", {
        header: "Title",
        cell: (info) => (
          <div className="flex items-center">
            {info.row.original.read ? (
              <span className="mr-2 h-2 w-2 rounded-full bg-gray-300" />
            ) : (
              <span className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
            )}
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("context", {
        header: "Content",
        cell: (info) => (
          <div className="max-w-xs truncate">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => {
          const type = info.getValue();
          return (
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                type === "update"
                  ? "bg-blue-100 text-blue-800"
                  : type === "news"
                    ? "bg-green-100 text-green-800"
                    : type === "message"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {type === "update" && <CheckCircle className="h-3 w-3 mr-1" />}
              {type === "news" && <Megaphone className="h-3 w-3 mr-1" />}
              {type === "message" && <Mail className="h-3 w-3 mr-1" />}
              {type === "ads" && <AlertCircle className="h-3 w-3 mr-1" />}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              info.getValue() === "online"
                ? "bg-green-100 text-green-800"
                : info.getValue() === "draft"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("created_at", {
        header: "Date",
        cell: (info) => {
          const dateValue = info.getValue();
          return dateValue
            ? format(new Date(dateValue), "MMM dd, yyyy HH:mm")
            : "N/A";
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="relative">
            <button
              onClick={() =>
                setDropdownOpen(dropdownOpen === row.id ? null : row.id)
              }
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {dropdownOpen === row.id && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      handleView(row.original);
                      setDropdownOpen(null);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </button>
                  <button
                    onClick={() => {
                      handleEdit(row.original);
                      setDropdownOpen(null);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  {row.original.status === "draft" && (
                    <button
                      onClick={() => {
                        handlePublish(row.original);
                        setDropdownOpen(null);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Megaphone className="w-4 h-4 mr-2" />
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleMarkAsRead(row.original.id);
                      setDropdownOpen(null);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Read
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(row.original.id);
                      setDropdownOpen(null);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ),
      }),
    ],
    [dropdownOpen]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesType = !typeFilter || notification.type === typeFilter;
      const matchesStatus =
        !statusFilter || notification.status === statusFilter;
      const matchesGlobalFilter =
        !globalFilter ||
        Object.values(notification)
          .join(" ")
          .toLowerCase()
          .includes(globalFilter.toLowerCase());

      return matchesType && matchesStatus && matchesGlobalFilter;
    });
  }, [notifications, typeFilter, statusFilter, globalFilter]);

  const table = useReactTable({
    data: filteredNotifications,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
  });

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection).filter(
      (key) => rowSelection[key]
    );
    setSelectedNotifications(selectedIds);
  }, [rowSelection]);

  const handleBulkAction = (
    action: "publish" | "delete" | "markAsRead" | "markAllAsRead"
  ) => {
    selectedNotifications.forEach((notificationId) => {
      switch (action) {
        case "publish":
          publishNotification(notificationId);
          break;
        case "delete":
          deleteNotification(notificationId);
          break;
        case "markAsRead":
          markAsRead(notificationId);
          break;
      }
    });
    if (action === "markAllAsRead") {
      markAllAsRead();
    }
    table.resetRowSelection();
    setSelectedNotifications([]);
  };

  const handleView = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsViewOpen(true);
  };

  const handleEdit = (notification: Notification) => {
    setSelectedNotification(notification);
    setFormData({
      title: notification.title,
      context: notification.context,
      type: notification.type,
      status: notification.status,
      action_url: notification.action_url,
      image: notification.image,
    });
    setIsEditOpen(true);
  };

  const handleCreate = () => {
    setFormData({
      title: "",
      context: "",
      type: "update",
      status: "draft",
      action_url: "",
      image: "",
    });
    setIsCreateOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedNotification) {
        // Update existing notification
        await updateNotification(selectedNotification.id, formData);
        setIsEditOpen(false);
      } else {
        // Create new notification
        console.log("Saving notification:", formData);
        await createNotification(formData);
        setIsCreateOpen(false);
      }
      fetchNotifications(); // Refresh the notification list
    } catch (error) {
      console.error("Error saving notification:", error);
    }
  };

  const handlePublish = (notification: Notification) => {
    if (window.confirm("Are you sure you want to publish this notification?")) {
      publishNotification(notification.id);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleDelete = (notificationId: string) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      deleteNotification(notificationId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Notification Management
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage system notifications and announcements
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            New Notification
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search notifications..."
            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:focus:border-primary-DEFAULT dark:focus:ring-primary-DEFAULT"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as NotificationType)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:focus:border-primary-DEFAULT dark:focus:ring-primary-DEFAULT"
        >
          <option value="">All Types</option>
          <option value="update">Update</option>
          <option value="news">News</option>
          <option value="message">Message</option>
          <option value="ads">Advertisement</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as NotificationStatus)
          }
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:focus:border-primary-DEFAULT dark:focus:ring-primary-DEFAULT"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="online">Published</option>
          <option value="deleted">Deleted</option>
        </select>

        <button
          onClick={() => handleBulkAction("markAllAsRead")}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark All as Read
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="flex space-x-4 py-4">
          <button
            onClick={() => handleBulkAction("publish")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <Megaphone className="h-4 w-4 mr-2" />
            Publish Selected
          </button>
          <button
            onClick={() => handleBulkAction("markAsRead")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Read
          </button>
          <button
            onClick={() => handleBulkAction("delete")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-200 truncate">
                    Total Notifications
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {notifications.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-200 truncate">
                    Published
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {
                        notifications.filter((n) => n.status === "online")
                          .length
                      }
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-200 truncate">
                    Unread
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {getUnreadCount()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {notifications && Array.isArray(notifications) && (
        <div className="">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white" 
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`group inline-flex ${
                            header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : ""
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
            <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  // className={row.original.read ? "bg-gray-50" : "bg-white"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {notifications && Array.isArray(notifications) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:focus:border-primary-DEFAULT dark:focus:ring-primary-DEFAULT"
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
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
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
      )}

      {/* View Notification Overlay */}
      {isViewOpen && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notification Details</h2>
              <button
                onClick={() => setIsViewOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6 text-primary" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedNotification.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {format(
                    new Date(selectedNotification.created_at),
                    "MMM dd, yyyy HH:mm"
                  )}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedNotification.type === "update"
                      ? "bg-blue-100 text-blue-800"
                      : selectedNotification.type === "news"
                        ? "bg-green-100 text-green-800"
                        : selectedNotification.type === "message"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedNotification.type.charAt(0).toUpperCase() +
                    selectedNotification.type.slice(1)}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedNotification.status === "online"
                      ? "bg-green-100 text-green-800"
                      : selectedNotification.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedNotification.status}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedNotification.read
                      ? "bg-gray-100 text-gray-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selectedNotification.read ? "Read" : "Unread"}
                </span>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-white">Content</h4>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">
                  {selectedNotification.context}
                </p>
              </div>

              {selectedNotification.action_url && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Action URL
                  </h4>
                  <a
                    href={selectedNotification.action_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-blue-600 hover:underline"
                  >
                    {selectedNotification.action_url}
                  </a>
                </div>
              )}

              {selectedNotification.image && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">Image</h4>
                  <img
                    src={selectedNotification.image}
                    alt="Notification"
                    className="mt-2 max-w-full h-auto rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Notification Overlay */}
      {(isEditOpen || isCreateOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isEditOpen ? "Edit Notification" : "Create Notification"}
              </h2>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setIsCreateOpen(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6 text-primary" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleFormChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  name="context"
                  value={formData.context || ""}
                  onChange={handleFormChange}
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type || ""}
                    onChange={handleFormChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-white"
                    required
                  >
                    <option value="update">Update</option>
                    <option value="news">News</option>
                    <option value="message">Message</option>
                    <option value="ads">Advertisement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status || ""}
                    onChange={handleFormChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-white"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="online">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action URL (optional)
                </label>
                <input
                  type="url"
                  name="action_url"
                  value={formData.action_url || ""}
                  onChange={handleFormChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-white"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image || ""}
                  onChange={handleFormChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setIsCreateOpen(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                >
                  {isEditOpen ? "Save Changes" : "Create Notification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
