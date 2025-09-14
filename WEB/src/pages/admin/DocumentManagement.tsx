import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  FileText,
  Search,
  X,
  Check,
  Loader2,
  MessageSquare,
  AlertCircle,
  ZoomIn,
} from "lucide-react";
import { format } from "date-fns";
import {
  DocumentStatus,
  Document,
  useAdminStore,
} from "../../store/adminStore";

// Custom Image Zoom Modal Component
const ImageZoomModal = React.memo(({
  src,
  alt,
  isOpen,
  onClose
}: {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-7xl max-h-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
          aria-label="Close zoom"
        >
          <X className="h-8 w-8" />
        </button>
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
});

ImageZoomModal.displayName = 'ImageZoomModal';

// Lazy Image Component with error handling and loading states
const LazyImage = React.memo(({
  src,
  alt,
  className,
  onLoad,
  onError,
  onClick
}: {
  src: string;
  alt: string;
  className: string;
  onLoad?: () => void;
  onError?: () => void;
  onClick?: () => void;
}) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !imageSrc) {
          setImageSrc(src);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, imageSrc]);

  const handleLoad = useCallback(() => {
    setImageStatus('loaded');
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setImageStatus('error');
    onError?.();
  }, [onError]);

  return (
    <div ref={imgRef} className={`${className} relative group cursor-pointer`} onClick={onClick}>
      {imageStatus === 'loading' && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
        </div>
      )}

      {imageStatus === 'error' && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center">
          <AlertCircle className="h-6 w-6 text-gray-400 mb-1" />
          <span className="text-xs text-gray-500">Failed to load</span>
        </div>
      )}

      {imageSrc && (
        <>
          <img
            src={imageSrc}
            alt={alt}
            className={`${className} ${imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'} transition-all duration-300 group-hover:scale-105`}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />
          {imageStatus === 'loaded' && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
              <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}
        </>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

const DocumentCard = React.memo(({
  document,
  onAccept,
  onRejectClick
}: {
  document: Document;
  onAccept: (documentId: string, userId: string, email: string) => void;
  onRejectClick: (document: Document) => void;
}) => {
  const [zoomedImage, setZoomedImage] = useState<{ src: string; alt: string } | null>(null);

  const handleImageLoad = useCallback(() => {
    // Optional: Add any additional logic when images load
  }, []);

  const getUserEmail = useCallback(() => {
    return typeof document.metadata === "object" &&
      document.metadata !== null &&
      "user_email" in document.metadata
      ? (document.metadata as { user_email?: string }).user_email ?? ""
      : "";
  }, [document.metadata]);

  const handleImageClick = useCallback((src: string, alt: string) => {
    setZoomedImage({ src, alt });
  }, []);

  const handleCloseZoom = useCallback(() => {
    setZoomedImage(null);
  }, []);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Document Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {document.identification_type
                  .replace(/_/g, " ")
                  .toUpperCase()}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {document.id}</p>
            </div>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${document.status === "approved"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : document.status === "rejected"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }`}
            >
              {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Document Images with Lazy Loading */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* ID Document */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ID Document
              </p>
              <div className="relative h-32">
                <LazyImage
                  src={document.id_file_path}
                  alt="ID Document"
                  className="w-full h-32 object-cover rounded-lg"
                  onLoad={handleImageLoad}
                  onClick={() => handleImageClick(document.id_file_path, "ID Document")}
                />
              </div>
            </div>

            {/* Legal Document */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Legal Document
              </p>
              <div className="relative h-32">
                <LazyImage
                  src={document.legal_file_path}
                  alt="Legal Document"
                  className="w-full h-32 object-cover rounded-lg"
                  onLoad={handleImageLoad}
                  onClick={() => handleImageClick(document.legal_file_path, "Legal Document")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Document Details */}
        <div className="px-4 py-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Submitted</p>
              <p className="font-medium dark:text-gray-300">
                {format(new Date(document.created_at), "MMM dd, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">
                Document Type
              </p>
              <p className="font-medium dark:text-gray-300">
                {document.legal_document_type.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Rejection Reason Display */}
        {document.status === "rejected" && document.rejection_reason && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Rejection Reason:
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {document.rejection_reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {document.status === "pending" && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between gap-4">
              <button
                onClick={() => onAccept(document.id, document.user_id, getUserEmail())}
                className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept
              </button>
              <button
                onClick={() => onRejectClick(document)}
                className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <ImageZoomModal
          src={zoomedImage.src}
          alt={zoomedImage.alt}
          isOpen={!!zoomedImage}
          onClose={handleCloseZoom}
        />
      )}
    </>
  );
});

DocumentCard.displayName = 'DocumentCard';

// Main Component
export function DocumentManagement() {
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | "All">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsPerPage] = useState(12);

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { documents, updateDocument, fetchDocumentsWithSignedUrls, loading } = useAdminStore();

  // Debounced search to avoid excessive filtering
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const handleAccept = useCallback(async (documentId: string, userId: string, email: string) => {
    try {
      await updateDocument(documentId, { status: "approved" }, userId, {
        docs_status: "accepted",
      }, email);
    } catch (error) {
      console.error("Error accepting document:", error);
    }
  }, [updateDocument]);

  const handleRejectClick = useCallback((document: Document) => {
    setSelectedDocument(document);
    setRejectionReason("");
    setShowRejectModal(true);
  }, []);

  const handleRejectConfirm = useCallback(async (email: string) => {
    if (!selectedDocument || !rejectionReason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateDocument(
        selectedDocument.id,
        {
          status: "rejected",
          rejection_reason: rejectionReason.trim()
        },
        selectedDocument.user_id,
        {
          docs_status: "rejected",
        },
        email
      );
      setShowRejectModal(false);
      setSelectedDocument(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting document:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedDocument, rejectionReason, updateDocument]);

  const handleRejectCancel = useCallback(() => {
    setShowRejectModal(false);
    setSelectedDocument(null);
    setRejectionReason("");
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesStatus = selectedStatus === "All" || doc.status === selectedStatus;
      const matchesSearch =
        doc.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        doc.identification_type.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        doc.legal_document_type.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [documents, selectedStatus, debouncedSearchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);
  const startIndex = (currentPage - 1) * documentsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + documentsPerPage);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
          {filteredDocuments.length > 0 && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Showing {startIndex + 1}-{Math.min(startIndex + documentsPerPage, filteredDocuments.length)} of {filteredDocuments.length} documents
            </p>
          )}
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
            onChange={(e) => {
              setSelectedStatus(e.target.value as DocumentStatus | "All");
              setCurrentPage(1);
            }}
            className="block w-full sm:w-40 rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:focus:border-primary-DEFAULT dark:focus:ring-primary-DEFAULT"
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Document Grid with Pagination */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedDocuments.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onAccept={handleAccept}
            onRejectClick={handleRejectClick}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === pageNumber
                  ? 'bg-primary-DEFAULT text-white'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Reject Document
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Please provide a reason for rejecting this document.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:border-red-500 dark:focus:ring-red-500 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {rejectionReason.length}/500 characters
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleRejectCancel}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleRejectConfirm(
                    typeof selectedDocument?.metadata === "object" &&
                      selectedDocument?.metadata !== null &&
                      "user_email" in selectedDocument.metadata
                      ? (selectedDocument.metadata as { user_email?: string }).user_email ?? ""
                      : ""
                  )
                }
                disabled={!rejectionReason.trim() || isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Reject Document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <Loader2 className="h-8 w-8 text-primary-DEFAULT animate-spin" />
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredDocuments.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No documents found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No documents match your current filters.
          </p>
        </div>
      )}
    </div>
  );
}