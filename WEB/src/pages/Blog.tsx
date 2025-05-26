import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  Clock,
  Tag,
  BookOpen,
  Filter,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { useAdminStore } from "../store/adminStore";
import { fadeIn, staggerContainer, slideIn } from "../utils/animations";
import { Language, Translations } from "../types";

interface BlogProps {
  language: Language;
  translations: Translations[Language];
}

export function Blog({ translations }: BlogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { fetchBlogPosts, blogPosts } = useAdminStore();
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    translations.blog.technology,
    translations.blog.agriculture,
    translations.blog.innovation,
    translations.blog.sustainability,
    translations.blog.business,
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        await fetchBlogPosts();
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [fetchBlogPosts]);

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "all" || post.theme === selectedCategory;
    const isOnline = post.status === "online";
    return matchesSearch && matchesCategory && isOnline;
  });

  return (
    <div className="bg-background-light dark:dark:bg-gray-900/80 min-h-screen">
      {/* Hero Section */}
      <motion.div
        className="relative bg-primary-DEFAULT py-24"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg"
            alt="Blog background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} className="text-center">
            <motion.h1
              variants={slideIn}
              className="text-4xl font-bold text-white font-montserrat mb-4"
            >
              {translations.blog.title}
            </motion.h1>
            <motion.p
              variants={slideIn}
              className="text-lg text-gray-100 max-w-2xl mx-auto"
            >
              {translations.blog.description}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
                <input
                  type="text"
                  placeholder={translations.blog.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 rounded-lg border-gray-300 focus:ring-primary focus:border-primary dark:bg-gray-900 dark:text-white"
                >
                  <option value="all">{translations.blog.allCategories}</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-primary-light border-t-primary-DEFAULT rounded-full"
            />
          </div>
        )}

        {/* Blog Posts Grid */}
        {!isLoading && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                variants={fadeIn}
                custom={index}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden transform transition-all duration-200"
              >
                <div className="relative">
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">
                      {post.theme}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-1 text-primary" />
                    <span className="mr-2 text-gray-600 dark:text-gray-400">
                      {format(new Date(post.created_at), "MMM dd, yyyy")}
                    </span>
                    <div className="mx-2 h-1 w-1 bg-gray-300 rounded-full" />
                    <Clock className="h-4 w-4 mr-1 text-primary" />
                    <span className="mr-2 text-gray-600 dark:text-gray-400">
                      {post.reading_time} min {translations.blog.read}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    <Link
                      to={`/blog/${post.id}`}
                      className="hover:text-primary text-gray-900 dark:text-white transition-colors duration-200"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light/10 text-primary"
                      >
                        <Tag className="h-3 w-3 mr-1 text-primary" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-200">{`${translations.blog.by} Agro`}</span>
                    </div>
                    <Link
                      to={`/blog/${post.id}`}
                      className="inline-flex items-center text-primary hover:text-primary-dark font-medium text-sm transition-colors duration-200"
                    >
                      {translations.blog.readMore}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}

        {/* No Results */}
        {!isLoading && filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <BookOpen className="mx-auto h-12 w-12 text-primary" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No articles found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
