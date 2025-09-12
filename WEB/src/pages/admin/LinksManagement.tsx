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
  Link as LinkIcon,
  Plus,
  X,
  Filter,
} from "lucide-react";
import { useAdminStore, LinkItem } from "../../store/adminStore";

Modal.setAppElement("#root");

export function LinksManagement() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState<Partial<LinkItem>>({
    link_title: "",
    link_description: "",
    link: "",
    category: "",
    is_active: true,
  });

  const {
    links,
    fetchLinks,
    createLink,
    updateLink,
    deleteLink,
    loading,
    error,
  } = useAdminStore();

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Get unique categories for filtering
  const categories = useMemo(() => {
    const uniqueCategories = new Set(links.map((link) => link.category));
    return ["All", ...Array.from(uniqueCategories)];
  }, [links]);

  // Filter links by category
  const filteredLinks = useMemo(() => {
    if (activeCategory === "All") return links;
    return links.filter((link) => link.category === activeCategory);
  }, [links, activeCategory]);

  // Table columns
  const columnHelper = createColumnHelper<LinkItem>();
  const columns = [
    columnHelper.accessor("link_title", {
      header: "Title",
      cell: (info) => info.getValue() || "Untitled Link",
    }),
    columnHelper.accessor("link_description", {
      header: "Description",
      cell: (info) => info.getValue() || "No description",
    }),
    columnHelper.accessor("link", {
      header: "URL",
      cell: (info) => (
        <a
          href={info.getValue()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center"
        >
          <LinkIcon className="w-4 h-4 mr-1" />
          {info.getValue().length > 40
            ? `${info.getValue().substring(0, 40)}...`
            : info.getValue()}
        </a>
      ),
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("is_active", {
      header: "Active",
      cell: (info) => (
        <button
          onClick={() => handleToggleActive(info.row.original)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
            info.getValue() ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              info.getValue() ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      cell: (info) => format(new Date(info.getValue()), "MMM dd, yyyy"),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedLink(row.original);
              setIsDeleteConfirmOpen(true);
            }}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: filteredLinks,
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

  const handleToggleActive = async (link: LinkItem) => {
    await updateLink(link.id, { is_active: !link.is_active });
  };

  const handleEdit = (link: LinkItem) => {
    setSelectedLink(link);
    setFormData({
      link_title: link.link_title,
      link_description: link.link_description,
      link: link.link,
      category: link.category,
      is_active: link.is_active,
    });
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedLink(null);
    setFormData({
      link_title: "",
      link_description: "",
      link: "",
      category: "",
      is_active: true,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (selectedLink) {
      await deleteLink(selectedLink.id);
      setIsDeleteConfirmOpen(false);
      setSelectedLink(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedLink) {
      await updateLink(selectedLink.id, formData as Partial<LinkItem>);
    } else {
      await createLink(
        formData as Omit<LinkItem, "id" | "created_at" | "updated_at">
      );
    }

    setIsFormOpen(false);
    setSelectedLink(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="space-y-6">
      {loading && <p className="text-primary">Loading links...</p>}
      {error && (
        <p className="text-red-700 dark:text-red-200">Error: {error}</p>
      )}

      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Links Management
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage and organize all external links
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Link
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 text-sm rounded-full ${
                activeCategory === category
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Filter className="w-4 h-4 mr-1" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <input
                type="text"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search links..."
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {filteredLinks.length > 0 ? (
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
      ) : (
        <div className="text-center py-12">
          <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No links found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by adding a new link.
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddNew}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredLinks.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
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

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onRequestClose={() => setIsFormOpen(false)}
        contentLabel="Link Form"
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedLink ? "Edit Link" : "Add New Link"}
            </h2>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label
                  htmlFor="link_title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="link_title"
                  name="link_title"
                  value={formData.link_title || ""}
                  onChange={handleFormChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="link_description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="link_description"
                  name="link_description"
                  value={formData.link_description || ""}
                  onChange={handleFormChange}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                />
              </div>

              <div>
                <label
                  htmlFor="link"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  URL
                </label>
                <input
                  type="url"
                  id="link"
                  name="link"
                  value={formData.link || ""}
                  onChange={handleFormChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Category
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category || ""}
                    onChange={handleFormChange}
                    list="categories"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    required
                  />
                  <datalist id="categories">
                    {categories
                      .filter((c) => c !== "All")
                      .map((category) => (
                        <option key={category} value={category} />
                      ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <div className="flex items-center">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active || false}
                        onChange={handleFormChange}
                        className="h-4 w-4 text-primary-DEFAULT focus:ring-primary-DEFAULT border-gray-300 rounded"
                      />
                      <label
                        htmlFor="is_active"
                        className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                      >
                        Active
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
              >
                {selectedLink ? "Update Link" : "Add Link"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onRequestClose={() => setIsDeleteConfirmOpen(false)}
        contentLabel="Delete Confirmation"
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-center">
            <Trash2 className="mx-auto h-12 w-12 text-red-600" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              Delete Link
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this link? This action cannot be
              undone.
            </p>
          </div>

          <div className="mt-5 flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
