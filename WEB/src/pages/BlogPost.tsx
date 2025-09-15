import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Tag,
  ArrowLeft,
  User,
  Share2,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { useAdminStore } from "../store/adminStore";
import { fadeIn } from "../utils/animations";

export function BlogPost() {
  const { id } = useParams();
  const { blogPosts } = useAdminStore();
  const [post, setPost] = useState(blogPosts.find((p) => p.id === id));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-3 border-slate-200 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100 rounded-full"
        />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Article not found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            The article you're looking for doesn't exist or may have been removed.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center text-slate-900 dark:text-slate-100 hover:text-primary font-medium transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = blogPosts
    .filter((p) => p.id !== post.id && p.theme === post.theme)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation Bar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            to="/blog"
            className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Articles
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.header
        className="relative"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
          <motion.div className="text-center space-y-8">
            {/* Category Badge */}
            <div className="flex justify-center">
              <span className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-full border border-primary/20">
                {post.theme}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 leading-tight tracking-tight">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">Agro Team</span>
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={new Date(post.created_at).toISOString()}>
                  {format(new Date(post.created_at), "MMMM dd, yyyy")}
                </time>
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.reading_time} min read</span>
              </span>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Featured Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-5xl mx-auto px-6 mb-16"
      >
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={
              post.images[0] ||
              "https://raw.githubusercontent.com/marcus102/AGROVIE/refs/heads/main/assets/team/glenn-carstens-peters-piNf3C4TViA-unsplash.jpg"
            }
            alt={post.title}
            className="w-full h-[400px] lg:h-[500px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-20"
        >
          {/* Article Actions */}
          <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  <Tag className="h-3 w-3 mr-1.5" />
                  {tag}
                </span>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-all duration-200"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </motion.button>
          </div>

          {/* Article Content */}
          <div className="article-content">
            <div 
              className="prose prose-xl prose-slate max-w-none dark:prose-invert
                         prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-slate-100
                         prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-12 prose-h1:pb-4 prose-h1:border-b prose-h1:border-slate-200 dark:prose-h1:border-slate-700
                         prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-10 prose-h2:text-slate-800 dark:prose-h2:text-slate-200
                         prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-slate-700 dark:prose-h3:text-slate-300
                         prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-6 prose-h4:text-slate-600 dark:prose-h4:text-slate-400 prose-h4:font-semibold
                         prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-[1.8] prose-p:text-lg prose-p:mb-6
                         prose-p:first-of-type:text-xl prose-p:first-of-type:leading-[1.7] prose-p:first-of-type:text-slate-600 dark:prose-p:first-of-type:text-slate-400 prose-p:first-of-type:mb-8
                         prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-a:decoration-2 prose-a:underline-offset-2
                         prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-strong:font-semibold prose-strong:bg-slate-100 dark:prose-strong:bg-slate-800 prose-strong:px-2 prose-strong:py-0.5 prose-strong:rounded
                         prose-em:text-slate-600 dark:prose-em:text-slate-400 prose-em:font-medium
                         prose-img:rounded-xl prose-img:shadow-xl prose-img:border prose-img:border-slate-200 dark:prose-img:border-slate-700 prose-img:my-8
                         prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-900/50 
                         prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:my-8
                         prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300 prose-blockquote:text-lg prose-blockquote:leading-relaxed
                         prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-mono
                         prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800 prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700 prose-pre:my-8
                         prose-ul:space-y-3 prose-ol:space-y-3 prose-ul:my-6 prose-ol:my-6 prose-ul:pl-6 prose-ol:pl-6
                         prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-li:leading-relaxed prose-li:text-lg prose-li:mb-2
                         prose-li:marker:text-primary prose-li:marker:font-bold
                         prose-table:border-collapse prose-table:border prose-table:border-slate-200 dark:prose-table:border-slate-700 prose-table:rounded-lg prose-table:my-8
                         prose-th:bg-slate-50 dark:prose-th:bg-slate-800 prose-th:border prose-th:border-slate-200 dark:prose-th:border-slate-700 prose-th:px-4 prose-th:py-3 prose-th:font-semibold
                         prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-700 prose-td:px-4 prose-td:py-3
                         prose-hr:border-slate-300 dark:prose-hr:border-slate-600 prose-hr:my-12 dark:text-slate-300"
                        
              dangerouslySetInnerHTML={{ __html: post.description }}
            />
            
            {/* Reading Progress Indicator */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Reading time: {post.reading_time} minutes</span>
                <span>Published {format(new Date(post.created_at), "MMMM dd, yyyy")}</span>
              </div>
            </div>
          </div>
        </motion.article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Related Articles
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Continue exploring similar topics
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost, index) => (
                <motion.article
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="group"
                >
                  <Link
                    to={`/blog/${relatedPost.id}`}
                    className="block bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={relatedPost.images[0]}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-primary/90 backdrop-blur-sm text-white text-xs font-medium rounded-md">
                          {relatedPost.theme}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-3">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{relatedPost.reading_time} min read</span>
                        <span className="mx-2">•</span>
                        <time dateTime={new Date(relatedPost.created_at).toISOString()}>
                          {format(new Date(relatedPost.created_at), "MMM dd")}
                        </time>
                      </div>

                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
                        {relatedPost.title}
                      </h3>

                      <div className="flex items-center justify-between">
                        <span className="text-primary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                          Read article
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Footer CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Enjoyed this article?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
            Discover more insights and stay updated with our latest content
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/blog"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors duration-200"
            >
              Explore More Articles
            </Link>
            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <Share2 className="h-4 w-4" />
              Share this Article
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}