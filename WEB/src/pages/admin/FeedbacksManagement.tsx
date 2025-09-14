import React, { useState, useEffect } from "react";
import { useAdminStore, Feedback } from "../../store/adminStore";
import {
  Star,
  Trash2,
  Eye,
  Search,
  Calendar,
  User,
  Smartphone,
  Monitor,
  MessageSquare,
  AlertTriangle,
  X,
} from "lucide-react";

export function FeedbackManagement() {
  const {
    feedbacks = [],
    loading,
    error,
    getFeedbacks,
    getFeedbackById,
    deleteFeedback,
  } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  useEffect(() => {
    getFeedbacks();
  }, [getFeedbacks]);

  // Get unique values for filters
  const categories = [...new Set(feedbacks.map((f) => f.category))];
  const platforms = [...new Set(feedbacks.map((f) => f.platform))];

  // Filter and sort feedbacks
  const filteredFeedbacks = feedbacks
    .filter((feedback) => {
      const matchesSearch =
        feedback.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.feedback_text
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        feedback.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || feedback.category === selectedCategory;
      const matchesRating =
        selectedRating === "all" ||
        feedback.rating.toString() === selectedRating;
      const matchesPlatform =
        selectedPlatform === "all" || feedback.platform === selectedPlatform;

      return (
        matchesSearch && matchesCategory && matchesRating && matchesPlatform
      );
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof Feedback];
      let bValue = b[sortBy as keyof Feedback];

      if (sortBy === "created_at") {
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const handleDeleteFeedback = async (id: string) => {
    try {
      await deleteFeedback(id);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const feedback = await getFeedbackById(id);
      if (feedback) {
        setSelectedFeedback(feedback);
      }
    } catch (error) {
      console.error("Error fetching feedback details:", error);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      bug: "bg-red-100 text-red-800",
      feature: "bg-blue-100 text-blue-800",
      improvement: "bg-green-100 text-green-800",
      complaint: "bg-orange-100 text-orange-800",
      praise: "bg-purple-100 text-purple-800",
      general: "bg-gray-100 text-gray-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading && feedbacks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-lg shadow-md">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Feedback Management
                </h1>
                <p className="text-sm text-gray-600 mt-1 dark:text-gray-300">
                  Manage user feedback and reviews ({filteredFeedbacks.length}{" "}
                  items)
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-2">
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Average Rating: </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {feedbacks.length > 0
                      ? (
                          feedbacks.reduce((acc, f) => acc + f.rating, 0) /
                          feedbacks.length
                        ).toFixed(1)
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search feedback..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                >
                  <option value="all">All Ratings</option>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating.toString()}>
                      {rating} Stars
                    </option>
                  ))}
                </select>
              </div>

              {/* Platform Filter */}
              <div>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                >
                  <option value="all">All Platforms</option>
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field);
                    setSortOrder(order as "asc" | "desc");
                  }}
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="rating-desc">Highest Rating</option>
                  <option value="rating-asc">Lowest Rating</option>
                  <option value="user_name-asc">Name A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feedback List */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {filteredFeedbacks.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No feedback found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-1">
                            {renderStars(feedback.rating)}
                            <span
                              className={`text-sm font-medium ${getRatingColor(feedback.rating)} dark:text-white`}
                            >
                              {feedback.rating}/5
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(feedback.category)} dark:bg-opacity-20 dark:text-white`}
                          >
                            {feedback.category}
                          </span>
                        </div>

                        <div className="mb-2">
                          <p className="text-gray-900 text-sm leading-relaxed line-clamp-2 dark:text-gray-200">
                            {feedback.feedback_text}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {feedback.user_name} ({feedback.user_role})
                          </div>
                          <div className="flex items-center">
                            {feedback.platform.toLowerCase().includes("ios") ||
                            feedback.platform
                              .toLowerCase()
                              .includes("android") ? (
                              <Smartphone className="h-3 w-3 mr-1" />
                            ) : (
                              <Monitor className="h-3 w-3 mr-1" />
                            )}
                            {feedback.platform}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(feedback.created_at)}
                          </div>
                          <span>v{feedback.app_version}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleViewDetails(feedback.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(feedback.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Feedback"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Details Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Feedback Details
              </h2>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {renderStars(selectedFeedback.rating)}
                  <span
                    className={`text-lg font-medium ${getRatingColor(selectedFeedback.rating)}`}
                  >
                    {selectedFeedback.rating}/5
                  </span>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(selectedFeedback.category)} dark:bg-opacity-20 dark:text-white`}
                >
                  {selectedFeedback.category}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2 dark:text-gray-100">
                  Feedback Text
                </h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed dark:bg-gray-700 dark:text-gray-300">
                  {selectedFeedback.feedback_text}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1 dark:text-gray-100">
                    User Information
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedFeedback.user_name}</p>
                  <p className="text-gray-500 text-sm dark:text-gray-400">
                    {selectedFeedback.user_role}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1 dark:text-gray-100">
                    Submitted
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatDate(selectedFeedback.created_at)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1 dark:text-gray-100">
                    Platform
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedFeedback.platform}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1 dark:text-gray-100">
                    App Version
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    v{selectedFeedback.app_version}
                  </p>
                </div>
              </div>

              {selectedFeedback.user_agent && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    User Agent
                  </h3>
                  <p className="text-gray-600 text-sm bg-gray-50 p-2 rounded font-mono">
                    {selectedFeedback.user_agent}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Delete Feedback
                </h3>
              </div>
              <p className="text-gray-600 mb-6 dark:text-gray-400">
                Are you sure you want to delete this feedback? This action
                cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteFeedback(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
