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
  TrendingUp,
  Users,
  Eye,
  Star,
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
    { id: "all", name: translations.blog.allCategories, icon: BookOpen },
    { id: "Technology", name: translations.blog.technology, icon: TrendingUp },
    { id: "Agriculture", name: translations.blog.agriculture, icon: Users },
    { id: "Innovation", name: translations.blog.innovation, icon: Star },
    { id: "Sustainability", name: translations.blog.sustainability, icon: Eye },
    { id: "Business", name: translations.blog.business, icon: Filter },
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

  const featuredPost = filteredPosts[0];
  const recentPosts = filteredPosts.slice(1, 7);

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <motion.div
        className="relative bg-gradient-to-br from-primary via-primary-dark to-green-900 py-32 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1920&h=1080&fit=crop"
            alt="Blog background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-dark/80" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} className="text-center">
            <motion.div
              variants={slideIn}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-8"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Latest Agricultural Insights
            </motion.div>

            <motion.h1
              variants={slideIn}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-montserrat mb-8"
            >
              {translations.blog.title}
            </motion.h1>

            <motion.p
              variants={slideIn}
              className="text-xl lg:text-2xl text-gray-100 max-w-4xl mx-auto mb-12 leading-relaxed"
            >
              {translations.blog.description}
            </motion.p>

          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-primary" />
                <input
                  type="text"
                  placeholder={translations.blog.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 w-full rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:text-white py-4 text-lg transition-all duration-300"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <motion.button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`inline-flex items-center px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                        selectedCategory === category.id
                          ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {category.name}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
            />
          </div>
        )}

        {/* Featured Post */}
        {!isLoading && featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
              <div className="lg:grid lg:grid-cols-2 lg:gap-0">
                <div className="relative h-64 lg:h-auto">
                  <img
                    src={featuredPost.images[0]}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:hidden"></div>
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full">
                      Featured
                    </span>
                  </div>
                </div>

                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <span className="mr-4">
                      {format(
                        new Date(featuredPost.created_at),
                        "MMM dd, yyyy"
                      )}
                    </span>
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span>
                      {featuredPost.reading_time} min {translations.blog.read}
                    </span>
                  </div>

                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                    {featuredPost.title}
                  </h2>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredPost.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <motion.div whileHover={{ x: 5 }}>
                    <Link
                      to={`/blog/${featuredPost.id}`}
                      className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-lg group"
                    >
                      {translations.blog.readMore}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Posts Grid */}
        {!isLoading && recentPosts.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {translations.blog.recentPosts}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  variants={fadeIn}
                  custom={index}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group bg-white dark:bg-gray-900 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 overflow-hidden"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.images[0]}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-primary/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                        {post.theme}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <Calendar className="h-4 w-4 mr-1 text-primary" />
                      <span className="mr-3">
                        {format(new Date(post.created_at), "MMM dd, yyyy")}
                      </span>
                      <Clock className="h-4 w-4 mr-1 text-primary" />
                      <span>
                        {post.reading_time} min {translations.blog.read}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      <Link to={`/blog/${post.id}`}>{post.title}</Link>
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {translations.blog.by} Agro
                        </span>
                      </div>
                      <motion.div whileHover={{ x: 5 }}>
                        <Link
                          to={`/blog/${post.id}`}
                          className="inline-flex items-center text-primary hover:text-primary-dark font-medium text-sm group"
                        >
                          {translations.blog.readMore}
                          <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        )}

        {/* No Results */}
        {!isLoading && filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No articles found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors duration-300"
            >
              Clear Filters
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
