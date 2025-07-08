import React,{ useState, useEffect, useMemo } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import {
  FileText,
  Search,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import {
  DocumentStatus,
  useAdminStore,
} from "../../store/adminStore";

export function DocumentManagement() {
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | "All">(
    "All"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const { documents, updateDocument, fetchDocumentsWithSignedUrls, loading } =
    useAdminStore();

  useEffect(() => {
    const fetchAndGroupDocuments = async () => {
      try {
        await fetchDocumentsWithSignedUrls();
      } catch (error) {
        console.error("Error fetching and grouping documents:", error);
      }
    };

    fetchAndGroupDocuments();
  }, [fetchDocumentsWithSignedUrls]);

  const handleAccept = async (documentId: string, userId: string) => {
    try {
      await updateDocument(documentId, { status: "approved" }, userId, {
        docs_status: "accepted",
      });
    } catch (error) {
      console.error("Error accepting document:", error);
    }
  };

  const handleReject = async (documentId: string, userId: string) => {
    try {
      await updateDocument(documentId, { status: "rejected" }, userId, {
        docs_status: "rejected",
      });
    } catch (error) {
      console.error("Error rejecting document:", error);
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesStatus =
        selectedStatus === "All" || doc.status === selectedStatus;
      const matchesSearch =
        doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.identification_type
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        doc.legal_document_type
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [documents, selectedStatus, searchTerm]);

  return (
    <div className="space-y-6 p-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Document Review
          </h1>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
            Review and verify user submitted documents
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:focus:border-primary-DEFAULT dark:focus:ring-primary-DEFAULT"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as DocumentStatus | "All")
            }
            className="block w-full sm:w-40 rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:focus:border-primary-DEFAULT dark:focus:ring-primary-DEFAULT"
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => (
          <div
            key={document.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            {/* Document Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {document.identification_type
                      .replace(/_/g, " ")
                      .toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {document.id}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    document.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : document.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {document.status.charAt(0).toUpperCase() +
                    document.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Document Images */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* ID Document */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    ID Document
                  </p>
                  <div className="relative group">
                    <Zoom>
                      <img
                        src={document.id_file_path}
                        alt="ID Document"
                        className="w-full h-32 object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                      />
                    </Zoom>
                  </div>
                </div>

                {/* Legal Document */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Legal Document
                  </p>
                  <div className="relative group">
                    <Zoom>
                      <img
                        src={document.legal_file_path}
                        alt="Legal Document"
                        className="w-full h-32 object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                      />
                    </Zoom>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Details */}
            <div className="px-4 py-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-200">Submitted</p>
                  <p className="font-medium dark:text-gray-300">
                    {format(new Date(document.created_at), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-200">
                    Document Type
                  </p>
                  <p className="font-medium dark:text-gray-300">
                    {document.legal_document_type.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {document.status === "pending" && (
              <div className="px-4 py-3 border-t border-gray-200">
                <div className="flex justify-between gap-4">
                  <button
                    onClick={() => handleAccept(document.id, document.user_id)}
                    className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(document.id, document.user_id)}
                    className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4">
            <Loader2 className="h-8 w-8 text-primary-DEFAULT animate-spin" />
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No documents found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No documents match your current filters.
          </p>
        </div>
      )}
    </div>
  );
}
