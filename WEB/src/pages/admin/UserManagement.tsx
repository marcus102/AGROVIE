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
  UserCheck,
  UserX,
  Edit2,
  Eye,
  MoreVertical,
  UserPlus,
  UserMinus,
  X,
} from "lucide-react";
import {
  Profile,
  UserSuperRole,
  Role,
  AccountStatus,
  useAdminStore,
} from "../../store/adminStore";

const columnHelper = createColumnHelper<Profile>();

export function UserManagement() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<UserSuperRole | "">("");
  const [professionalRoleFilter, setProfessionalRoleFilter] = useState<
    Role | ""
  >("");
  const [statusFilter, setStatusFilter] = useState<AccountStatus | "">("");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});

  const { users, updateUser, fetchUsers, deleteUser } = useAdminStore();

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        await fetchUsers();
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, [fetchUsers]);

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
      columnHelper.accessor("full_name", {
        header: "Full Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("created_at", {
        header: "Creation Date",
        cell: (info) => {
          const dateValue = info.getValue();
          return dateValue
            ? format(new Date(dateValue), "MMM dd, yyyy")
            : "N/A";
        },
      }),
      columnHelper.accessor("super_role", {
        header: "Role",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("role", {
        header: "Professional Role",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("account_status", {
        header: "Account Status",
        cell: (info) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              info.getValue() === "healthy"
                ? "bg-green-100 text-green-800"
                : info.getValue() === "warning"
                  ? "bg-orange-100 text-orange-800"
                  : info.getValue() === "suspended"
                    ? "bg-red-100 text-red-800"
                    : info.getValue() === "deleted"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
            }`}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("active", {
        header: "Active",
        cell: (info) => {
          const isActive = info.getValue();
          return (
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isActive ? "Yes" : "No"}
            </span>
          );
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
                  <button
                    onClick={() => {
                      handleMakeAdmin(row.original.id);
                      setDropdownOpen(null);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Make Admin
                  </button>
                  <button
                    onClick={() => {
                      handleSuspend(row.original.id);
                      setDropdownOpen(null);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Suspend
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

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = !roleFilter || user.super_role === roleFilter;
      const matchesProfessionalRole =
        !professionalRoleFilter || user.role === professionalRoleFilter;
      const matchesStatus =
        !statusFilter || user.account_status === statusFilter;
      const matchesGlobalFilter =
        !globalFilter ||
        Object.values(user)
          .join(" ")
          .toLowerCase()
          .includes(globalFilter.toLowerCase());

      return (
        matchesRole &&
        matchesProfessionalRole &&
        matchesStatus &&
        matchesGlobalFilter
      );
    });
  }, [users, roleFilter, professionalRoleFilter, statusFilter, globalFilter]);

  const table = useReactTable({
    data: filteredUsers,
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
    setSelectedUsers(selectedIds);
  }, [rowSelection]);

  const handleBulkAction = (
    action: "activate" | "deactivate" | "delete" | "more"
  ) => {
    selectedUsers.forEach((userId) => {
      switch (action) {
        case "activate":
          updateUser(userId, { account_status: "healthy" });
          break;
        case "deactivate":
          updateUser(userId, { account_status: "suspended" });
          break;
        case "delete":
          console.log("Delete user:", userId);
          break;
        case "more":
          console.log("More actions for user:", userId);
          break;
      }
    });
    table.resetRowSelection();
    setSelectedUsers([]);
  };

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        await fetchUsers();
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, [fetchUsers]);

  const handleView = (user: Profile) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleEdit = (user: Profile) => {
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      super_role: user.super_role,
      account_status: user.account_status,
      active: user.active,
    });
    setIsEditOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      console.log("Update user:", selectedUser.id, formData);
      await updateUser(selectedUser.id, formData);
      setIsEditOpen(false);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleMakeAdmin = (userId: string) => {
    if (window.confirm("Are you sure you want to make this user an admin?")) {
      updateUser(userId, { super_role: "admin" });
    }
  };

  const handleSuspend = (userId: string) => {
    if (window.confirm("Are you sure you want to suspend this user?")) {
      updateUser(userId, { account_status: "suspended" });
    }
  };

  const handleDelete = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(userId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
            Manage user accounts, roles, and permissions
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search users..."
            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserSuperRole)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="organization">Organization</option>
          <option value="government">Government</option>
          <option value="moderator">Moderator</option>
          <option value="technology">Technology</option>
          <option value="law">Law</option>
          <option value="finance">Finance</option>
        </select>

        <select
          value={professionalRoleFilter}
          onChange={(e) => setProfessionalRoleFilter(e.target.value as Role)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
        >
          <option value="">All Professional Roles</option>
          <option value="worker">Worker</option>
          <option value="technician">Technician</option>
          <option value="entrepreneur">Entrepreneur</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AccountStatus)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
        >
          <option value="">All Statuses</option>
          <option value="healthy">Healthy</option>
          <option value="warning">Warning</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex space-x-4 py-4">
          <button
            onClick={() => handleBulkAction("activate")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Activate Selected
          </button>
          <button
            onClick={() => handleBulkAction("deactivate")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700"
          >
            <UserX className="h-4 w-4 mr-2" />
            Deactivate Selected
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

      {/* Table */}
      {users && Array.isArray(users) && (
        <div>
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
      {users && Array.isArray(users) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
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

      {/* View User Overlay */}
      {isViewOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Details</h2>
              <button
                onClick={() => setIsViewOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6 text-primary" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-medium">Full Name:</span>{" "}
                  {selectedUser.full_name}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {selectedUser.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {selectedUser.phone || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Role:</span>{" "}
                  {selectedUser.super_role}
                </p>
              </div>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-medium">Professional Role:</span>{" "}
                  {selectedUser.role}
                </p>
                <p>
                  <span className="font-medium">Account Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      selectedUser.account_status === "healthy"
                        ? "bg-green-100 text-green-800"
                        : selectedUser.account_status === "warning"
                          ? "bg-orange-100 text-orange-800"
                          : selectedUser.account_status === "suspended"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {selectedUser.account_status}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Active:</span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      selectedUser.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedUser.active ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Created At:</span>{" "}
                  {format(new Date(selectedUser.created_at), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Overlay */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit User</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6 text-primary" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name || ""}
                    onChange={handleFormChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleFormChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    name="super_role"
                    value={formData.super_role || ""}
                    onChange={handleFormChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="organization">Organization</option>
                    <option value="government">Government</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Professional Role
                  </label>
                  <select
                    name="role"
                    value={formData.role || ""}
                    onChange={handleFormChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                  >
                    <option value="worker">Worker</option>
                    <option value="technician">Technician</option>
                    <option value="entrepreneur">Entrepreneur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Status
                  </label>
                  <select
                    name="account_status"
                    value={formData.account_status || ""}
                    onChange={handleFormChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                  >
                    <option value="healthy">Healthy</option>
                    <option value="warning">Warning</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Active
                  </label>
                  <select
                    name="active"
                    value={formData.active ? "true" : "false"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        active: e.target.value === "true",
                      }))
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
