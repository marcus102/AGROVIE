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
} from "lucide-react";
import { Mission, MissionStatus, useAdminStore } from "../../store/adminStore";

const columnHelper = createColumnHelper<Mission>();

const statusIcons: Record<MissionStatus, LucideIcon> = {
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
  Rejected: "bg-red-100 text-red-800",
  Completed: "bg-blue-100 text-blue-800",
  Removed: "bg-gray-100 text-gray-800",
};

// Add this to the top of your file
Modal.setAppElement("#root"); // Ensure accessibility

export function MissionManagement() {
  const [activeTab, setActiveTab] = useState<MissionStatus>("in_review");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null); // State for selected mission
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  const { missions, fetchMissions, updateMission, loading, error } =
    useAdminStore();

  // Fetch missions on component mount
  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const filteredMissions = useMemo(
    () => missions.filter((mission) => mission.status === activeTab),
    [missions, activeTab]
  );

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

  const columns = useMemo(
    () => [
      columnHelper.accessor("mission_title", {
        header: "Title",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("mission_description", {
        header: "Description",
        cell: (info) => info.getValue(),
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
        cell: (info) => format(info.getValue(), "MMM dd, yyyy"),
      }),
      columnHelper.accessor("end_date", {
        header: "End Date",
        cell: (info) => format(info.getValue(), "MMM dd, yyyy"),
      }),
      columnHelper.accessor("surface_area", {
        header: "Surface Area",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("surface_unit", {
        header: "Surface Unit",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("needed_actor", {
        header: "Needed Actor",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("needed_actor_amount", {
        header: "Needed Actor Amount",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("required_experience_level", {
        header: "Experience Level",
        cell: (info) => info.getValue(),
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
      columnHelper.accessor("final_price", {
        header: "Final Price",
        cell: (info) => info.getValue(),
      }),

      columnHelper.accessor("created_at", {
        header: "Creation Date",
        cell: (info) => format(info.getValue(), "MMM dd, yyyy"),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const Icon = statusIcons[status];
          return (
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) as keyof typeof statusColors]}`}
            >
              <Icon className="w-4 h-4 mr-1" />
              {status}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => handleView(row.original)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(row.original)}
              className="text-green-600 hover:text-green-800"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleApprove(row.original)}
              className="text-primary-DEFAULT hover:text-primary-dark"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedMission(row.original);
                handleReject(row.original);
              }}
              className="text-red-600 hover:text-red-800"
            >
              <XCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              className="text-gray-600 hover:text-gray-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredMissions,
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

  const handleEdit = (mission: Mission) => {
    console.log("Edit mission:", mission);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this mission?")) {
      console.log("Delete mission:", id);
      // Add logic to delete the mission here
    }
  };

  // const handleStatusChange = (mission: Mission, newStatus: MissionStatus) => {
  //   updateMission(mission.id, { status: newStatus });
  //   if (error) {
  //     console.error(`Error updating mission with ID ${mission.id}:`, error);
  //   }
  // };

  const handleView = (mission: Mission) => {
    setSelectedMission(mission);
    setIsModalOpen(true);
  };

  const handleApprove = (mission: Mission) => {
    if (window.confirm("Are you sure you want to publish this mission?")) {
      updateMission(mission.id, { status: "accepted" });
    }
  };

  const handleReject = (mission: Mission) => {
    if (window.confirm("Are you sure you want to reject this mission?")) {
      updateMission(mission.id, { status: "rejected" });
      if (error) {
        console.error(`Error updating mission with ID ${mission.id}:`, error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMission(null);
  };

  return (
    <div className="space-y-6">
      {loading && <p className="text-primary">Loading missions...</p>}
      {error && <p className="text-red-700 dark:dark:text-red-200">Error: {error}</p>}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mission Management
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage and monitor all missions across different statuses
          </p>
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
        >
          <BarChart2 className="w-4 h-4 mr-2" />
          {showStats ? "Hide Statistics" : "Show Statistics"}
        </button>
      </div>

      {/* Statistics Dashboard */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <dt className="text-sm font-medium text-gray-700 dark:dark:text-gray-200 truncate">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {value}
              </dd>
            </div>
          ))}
        </div>
      )}

      {/* Status Tabs */}
      <div className="border-b border-primary">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {Object.entries(statusIcons).map(([status, Icon]) => (
            <button
              key={status}
              onClick={() => setActiveTab(status as MissionStatus)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === status
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-700 dark:text-gray-200 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <Icon
                className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${
                    activeTab === status
                      ? "text-primary"
                      : "text-gray-400 group-hover:text-gray-500"
                  }
                `}
              />
              {status}
            </button>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search missions..."
            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:focus:border-primary-DEFAULT dark:focus:ring-primary-DEFAULT"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
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
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-200"
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
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:focus:border-primary-DEFAULT dark:focus:ring-primary-DEFAULT"
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
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Mission Details"
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {selectedMission && (
            <>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                {selectedMission.mission_title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2 text-gray-700 dark:text-gray-200">
                  <p className="mb-2">
                    <strong>Description:</strong>{" "}
                    {selectedMission.mission_description}
                  </p>
                  <p className="mb-2">
                    <strong>Creator:</strong> {selectedMission.creator}
                  </p>
                  <p className="mb-2">
                    <strong>Location:</strong> {selectedMission.location}
                  </p>
                  <p className="mb-2">
                    <strong>Start Date:</strong>{" "}
                    {format(selectedMission.start_date, "MMM dd, yyyy")}
                  </p>
                  <p className="mb-2">
                    <strong>End Date:</strong>{" "}
                    {format(selectedMission.end_date, "MMM dd, yyyy")}
                  </p>
                  <p className="mb-2">
                    <strong>Status:</strong> {selectedMission.status}
                  </p>
                </div>
                <div className="space-y-2 text-gray-700 dark:text-gray-200">
                  <p className="mb-2">
                    <strong>Surface Area:</strong>{" "}
                    {selectedMission.surface_area}{" "}
                    {selectedMission.surface_unit}
                  </p>
                  <p className="mb-2">
                    <strong>Needed Actor:</strong>{" "}
                    {selectedMission.needed_actor} (x
                    {selectedMission.needed_actor_amount})
                  </p>
                  <p className="mb-2">
                    <strong>Experience Level:</strong>{" "}
                    {selectedMission.required_experience_level}
                  </p>
                  <p className="mb-2">
                    <strong>Equipment Provided:</strong>{" "}
                    {selectedMission.equipment ? "Yes" : "No"}
                  </p>
                  <p className="mb-2">
                    <strong>Final Price:</strong> {selectedMission.final_price}
                  </p>
                  <p className="mb-2">
                    <strong>Created At:</strong>{" "}
                    {format(selectedMission.created_at, "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              {/* Applicants Table */}
              {selectedMission.applicants &&
              selectedMission.applicants.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Applicants</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            Experience
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                        {selectedMission.applicants.map((applicant, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">
                              {applicant.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">
                              {applicant.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">
                              {applicant.experience}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  applicant.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : applicant.status === "accepted"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {applicant.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="mt-6 text-center text-gray-500 dark:text-gray-200">
                  No applicants for this mission yet.
                </div>
              )}

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => handleApprove(selectedMission)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedMission)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
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
