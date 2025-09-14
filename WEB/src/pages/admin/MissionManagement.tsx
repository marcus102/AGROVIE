import { useState, useMemo, useEffect } from "react";
import Modal from "react-modal";
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
  Edit2,
  Trash2,
  BarChart2,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  AlertTriangle,
  LucideIcon,
  Eye,
  Check,
  Grid3x3,
} from "lucide-react";
import { Mission, MissionStatus, useAdminStore } from "../../store/adminStore";

const columnHelper = createColumnHelper<Mission>();

const statusIcons: Record<MissionStatus | "all", LucideIcon> = {
  all: Grid3x3,
  in_review: Clock,
  online: Globe,
  accepted: CheckCircle,
  rejected: XCircle,
  completed: Check,
  removed: AlertTriangle,
};

const statusColors = {
  "In Review": "bg-yellow-100 text-yellow-800",
  Online: "bg-green-100 text-green-800",
  Accepted: "bg-blue-100 text-blue-800",
  Rejected: "bg-red-100 text-red-800",
  Completed: "bg-purple-100 text-purple-800",
  Removed: "bg-gray-100 text-gray-800",
};

// Add this to the top of your file
Modal.setAppElement("#root"); // Ensure accessibility

export function MissionManagement() {
  const [activeTab, setActiveTab] = useState<MissionStatus | "all">("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      "mission_title",
      "creator",
      "location",
      "start_date",
      "status",
      "actions",
    ])
  );

  const { missions, fetchMissions, updateMission, loading, error } =
    useAdminStore();

  // Fetch missions on component mount
  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const filteredMissions = useMemo(() => {
    if (activeTab === "all") return missions;
    return missions.filter((mission) => mission.status === activeTab);
  }, [missions, activeTab]);

  const stats = useMemo(() => {
    const total = missions.length;
    return {
      total,
      inReview: missions.filter((m) => m.status === "in_review").length,
      online: missions.filter((m) => m.status === "online").length,
      accepted: missions.filter((m) => m.status === "accepted").length,
      rejected: missions.filter((m) => m.status === "rejected").length,
      completed: missions.filter((m) => m.status === "completed").length,
      removed: missions.filter((m) => m.status === "removed").length,
    };
  }, [missions]);

  // All possible columns based on the CSV structure
  const allColumns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => (
          <span className="font-mono text-xs">
            {info.getValue()?.slice(0, 8)}...
          </span>
        ),
      }),
      columnHelper.accessor("user_id", {
        header: "User ID",
        cell: (info) => (
          <span className="font-mono text-xs">
            {info.getValue()?.slice(0, 8)}...
          </span>
        ),
      }),
      columnHelper.accessor("mission_title", {
        header: "Title",
        cell: (info) => (
          <div className="max-w-xs truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("mission_description", {
        header: "Description",
        cell: (info) => (
          <div className="max-w-sm truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("creator", {
        header: "Creator",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("location", {
        header: "Location",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("start_date", {
        header: "Start Date",
        cell: (info) => {
          const date = info.getValue();
          return date ? format(new Date(date), "MMM dd, yyyy") : "N/A";
        },
      }),
      columnHelper.accessor("end_date", {
        header: "End Date",
        cell: (info) => {
          const date = info.getValue();
          return date ? format(new Date(date), "MMM dd, yyyy") : "N/A";
        },
      }),
      columnHelper.accessor("surface_area", {
        header: "Surface Area",
        cell: (info) => {
          const area = info.getValue();
          const unit = info.row.original.surface_unit;
          return area ? `${area} ${unit || ""}` : "N/A";
        },
      }),
      columnHelper.accessor("surface_unit", {
        header: "Surface Unit",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("needed_actor", {
        header: "Needed Actor",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("needed_actor_amount", {
        header: "Actor Amount",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("required_experience_level", {
        header: "Experience Level",
        cell: (info) => (
          <span className="capitalize">{info.getValue() || "N/A"}</span>
        ),
      }),
      columnHelper.accessor("actor_specialization", {
        header: "Specialization",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("equipment", {
        header: "Equipment",
        cell: (info) => {
          const hasEquipment = info.getValue();
          return (
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                hasEquipment
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {hasEquipment ? "Yes" : "No"}
            </span>
          );
        },
      }),
      columnHelper.accessor("original_price", {
        header: "Original Price",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("adjustment_price", {
        header: "Adjustment",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("final_price", {
        header: "Final Price",
        cell: (info) => {
          const price = info.getValue();
          return price ? `$${price}` : "N/A";
        },
      }),
      columnHelper.accessor("proposed_advantages", {
        header: "Advantages",
        cell: (info) => (
          <div className="max-w-xs truncate" title={info.getValue().join(" ")}>
            {info.getValue().length > 0 ? info.getValue().join(" ") : "N/A"}
          </div>
        ),
      }),
      columnHelper.accessor("payment_id", {
        header: "Payment ID",
        cell: (info) => {
          const paymentId = info.getValue();
          return paymentId ? (
            <span className="font-mono text-xs">
              {String(paymentId).slice(0, 8)}...
            </span>
          ) : (
            "N/A"
          );
        },
      }),
      columnHelper.accessor("mission_images", {
        header: "Images",
        cell: (info) => {
          const images = info.getValue();
          return images ? (
            <span className="text-blue-600">📷</span>
          ) : (
            <span className="text-gray-400">-</span>
          );
        },
      }),
      columnHelper.accessor("created_at", {
        header: "Created",
        cell: (info) => {
          const date = info.getValue();
          return date ? format(new Date(date), "MMM dd, yyyy") : "N/A";
        },
      }),
      columnHelper.accessor("updated_at", {
        header: "Updated",
        cell: (info) => {
          const date = info.getValue();
          return date ? format(new Date(date), "MMM dd, yyyy") : "N/A";
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const Icon = statusIcons[status as MissionStatus];
          const displayStatus = status
            ?.replace("_", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
          return (
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                statusColors[displayStatus as keyof typeof statusColors] ||
                "bg-gray-100 text-gray-800"
              }`}
            >
              {Icon && <Icon className="w-4 h-4 mr-1" />}
              {displayStatus}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex space-x-1">
            <button
              onClick={() => handleView(row.original)}
              className="text-blue-600 hover:text-blue-800 p-1"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(row.original)}
              className="text-green-600 hover:text-green-800 p-1"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleApprove(row.original)}
              className="text-blue-600 hover:text-blue-800 p-1"
              title="Approve"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleReject(row.original)}
              className="text-red-600 hover:text-red-800 p-1"
              title="Reject"
            >
              <XCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              className="text-gray-600 hover:text-gray-800 p-1"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  // Filter columns based on visibility settings
  const displayColumns = useMemo(() => {
    return allColumns.filter((column) => {
      const columnId = column.id || (column as any).accessorKey;
      return visibleColumns.has(columnId);
    });
  }, [allColumns, visibleColumns]);

  const table = useReactTable({
    data: filteredMissions,
    columns: displayColumns,
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
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const handleEdit = (mission: Mission) => {
    console.log("Edit mission:", mission);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this mission?")) {
      console.log("Delete mission:", id);
    }
  };

  const handleView = (mission: Mission) => {
    setSelectedMission(mission);
    setIsModalOpen(true);
  };

  const handleApprove = (mission: Mission) => {
    if (window.confirm("Are you sure you want to approve this mission?")) {
      updateMission(mission.id, { status: "accepted" });
    }
  };

  const handleReject = (mission: Mission) => {
    if (window.confirm("Are you sure you want to reject this mission?")) {
      updateMission(mission.id, { status: "rejected" });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMission(null);
  };

  const handleColumnToggle = (columnId: string) => {
    const newVisibleColumns = new Set(visibleColumns);
    if (newVisibleColumns.has(columnId)) {
      newVisibleColumns.delete(columnId);
    } else {
      newVisibleColumns.add(columnId);
    }
    setVisibleColumns(newVisibleColumns);
  };

  const availableColumns = [
    { id: "id", label: "ID" },
    { id: "user_id", label: "User ID" },
    { id: "mission_title", label: "Title" },
    { id: "mission_description", label: "Description" },
    { id: "creator", label: "Creator" },
    { id: "location", label: "Location" },
    { id: "start_date", label: "Start Date" },
    { id: "end_date", label: "End Date" },
    { id: "surface_area", label: "Surface Area" },
    { id: "surface_unit", label: "Surface Unit" },
    { id: "needed_actor", label: "Needed Actor" },
    { id: "needed_actor_amount", label: "Actor Amount" },
    { id: "required_experience_level", label: "Experience Level" },
    { id: "actor_specialization", label: "Specialization" },
    { id: "equipment", label: "Equipment" },
    { id: "original_price", label: "Original Price" },
    { id: "adjustment_price", label: "Adjustment" },
    { id: "final_price", label: "Final Price" },
    { id: "proposed_advantages", label: "Advantages" },
    { id: "payment_id", label: "Payment ID" },
    { id: "mission_images", label: "Images" },
    { id: "created_at", label: "Created" },
    { id: "updated_at", label: "Updated" },
    { id: "status", label: "Status" },
    { id: "actions", label: "Actions" },
  ];

  return (
    <div className="space-y-6">
      {loading && <p className="text-blue-600">Loading missions...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mission Management
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage and monitor all missions across different statuses
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            {showStats ? "Hide Statistics" : "Show Statistics"}
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {Object.entries(stats).map(([key, value]) => (
            <div
              key={key}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border"
            >
              <dt className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                {key.charAt(0).toUpperCase() +
                  key.slice(1).replace(/([A-Z])/g, " $1")}
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {value}
              </dd>
            </div>
          ))}
        </div>
      )}

      {/* Status Tabs with View All */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav
          className="-mb-px flex space-x-8 overflow-x-auto"
          aria-label="Tabs"
        >
          {Object.entries(statusIcons).map(([status, Icon]) => {
            const isAll = status === "all";
            const count = isAll
              ? stats.total
              : stats[status as keyof typeof stats] || 0;

            return (
              <button
                key={status}
                onClick={() => setActiveTab(status as MissionStatus | "all")}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${
                    activeTab === status
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-700 dark:text-gray-200 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <Icon
                  className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${
                      activeTab === status
                        ? "text-blue-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    }
                  `}
                />
                {isAll ? "All" : status.replace("_", " ")}
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs">
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search missions..."
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Column Selector */}
        <div className="relative">
          <details className="relative">
            <summary className="cursor-pointer bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Columns ({visibleColumns.size})
            </summary>
            <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              <div className="p-2">
                {availableColumns.map((column) => (
                  <label
                    key={column.id}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns.has(column.id)}
                      onChange={() => handleColumnToggle(column.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {column.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
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
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={displayColumns.length}
                  className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {globalFilter
                    ? "No missions found matching your search."
                    : "No missions available."}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-4 text-sm text-gray-700 dark:text-gray-200"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
          >
            {[10, 20, 30, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            entries
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            First
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-gray-700 dark:text-gray-300 px-4">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()} ({filteredMissions.length} total)
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last
          </button>
        </div>
      </div>

      {/* Enhanced Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Mission Details"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {selectedMission && (
            <>
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedMission.mission_title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mission ID: {selectedMission.id}
                </p>
              </div>

              <div className="px-6 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Basic Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Description:
                        </span>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                          {selectedMission.mission_description || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Creator:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {selectedMission.creator || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Location:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {selectedMission.location || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Status:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">
                          {selectedMission.status?.replace("_", " ") || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline & Pricing */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Timeline & Pricing
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Start Date:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {selectedMission.start_date
                            ? format(
                                new Date(selectedMission.start_date),
                                "MMM dd, yyyy"
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          End Date:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {selectedMission.end_date
                            ? format(
                                new Date(selectedMission.end_date),
                                "MMM dd, yyyy"
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Original Price:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {selectedMission.original_price
                            ? String(selectedMission.original_price)
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Adjustment:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {selectedMission.adjustment_price !== undefined
                            ? String(selectedMission.adjustment_price)
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Final Price:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400 font-semibold">
                          {selectedMission.final_price
                            ? `${selectedMission.final_price}`
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Payment ID:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
                          {selectedMission.payment_id || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Requirements
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Surface Area:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {selectedMission.surface_area
                            ? `${selectedMission.surface_area} ${selectedMission.surface_unit || ""}`
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Needed Actor:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {selectedMission.needed_actor
                            ? `${selectedMission.needed_actor} (x${selectedMission.needed_actor_amount || 1})`
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Experience Level:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">
                          {selectedMission.required_experience_level || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Specialization:
                        </span>

                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {selectedMission.actor_specialization !== undefined
                            ? String(selectedMission.actor_specialization)
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Equipment Provided:
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            selectedMission.equipment
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedMission.equipment ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Additional Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          User ID:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
                          {selectedMission.user_id || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Created:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {selectedMission.created_at
                            ? format(
                                new Date(selectedMission.created_at),
                                "MMM dd, yyyy HH:mm"
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Last Updated:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {selectedMission.updated_at
                            ? format(
                                new Date(selectedMission.updated_at),
                                "MMM dd, yyyy HH:mm"
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Has Images:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {selectedMission.mission_images ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proposed Advantages */}
                {selectedMission.proposed_advantages && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Proposed Advantages
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedMission.proposed_advantages}
                      </p>
                    </div>
                  </div>
                )}

                {/* Applicants Section */}
                {selectedMission.applicants &&
                selectedMission.applicants.length > 0 ? (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Applicants ({selectedMission.applicants.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Experience
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {selectedMission.applicants.map(
                            (applicant, index) => (
                              <tr key={index}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                  {applicant}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">
                      No applicants for this mission yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3">
                {selectedMission.status === "in_review" && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedMission);
                        handleCloseModal();
                      }}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Approve Mission
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedMission);
                        handleCloseModal();
                      }}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Reject Mission
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleEdit(selectedMission)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Edit Mission
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
