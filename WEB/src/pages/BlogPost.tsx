import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Tag, ArrowLeft, User, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAdminStore } from '../store/adminStore';
import { fadeIn, slideIn } from '../utils/animations';

export function BlogPost() {
  const { id } = useParams();
  const { blogPosts } = useAdminStore();
  const [post, setPost] = useState(blogPosts.find(p => p.id === id));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!post) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
          <Link
            to="/blog"
            className="inline-flex items-center text-primary-DEFAULT hover:text-primary-dark"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:dark:bg-gray-900/80">
      {/* Hero Section */}
      <motion.div 
        className="relative bg-primary-DEFAULT py-24"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="absolute inset-0">
          <img
            src={post.images[0] || "https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg"}
            alt={post.title}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center text-white hover:text-gray-200 mb-8"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Blog
          </Link>
          <motion.div variants={slideIn} className="text-center">
            <span className="inline-block px-3 py-1 bg-white text-primary-DEFAULT text-sm font-medium rounded-full mb-4">
              {post.theme}
            </span>
            <h1 className="text-4xl font-bold text-white font-montserrat mb-4">
              {post.title}
            </h1>
            <div className="flex items-center justify-center text-gray-100 space-x-4">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {format(new Date(post.created_at), "MMM dd, yyyy")}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {post.reading_time} min read
              </span>
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {'Agro'}
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8"
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-light/10 text-primary"
              >
                <Tag className="h-4 w-4 mr-2 text-primary" />
                {tag}
              </span>
            ))}
          </div>

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none text-gray-900 dark:text-gray-200"
            dangerouslySetInnerHTML={{ __html: post.description }}
          />

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src="https://images.pexels.com/photos/5717277/pexels-photo-5717277.jpeg"
                  alt={'Agro'}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{'Agro'}</h3>
                  <p className="text-gray-600 dark:text-gray-400">Agricultural Expert</p>
                </div>
              </div>
              <button
                onClick={() => navigator.share({ 
                  title: post.title,
                  text: post.title,
                  url: window.location.href
                })}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-primary hover:bg-gray-800"
              >
                <Share2 className="h-4 w-4 mr-2 text-primary" />
                Share
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}