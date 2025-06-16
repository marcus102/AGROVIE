import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ 
            scale: 1.1, 
            y: -2,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 group"
          aria-label="Scroll to top"
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-light/20 to-primary/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Icon container */}
          <div className="relative">
            <ArrowUp className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
          </div>
          
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full border-2 border-white/20 scale-100 group-hover:scale-125 opacity-100 group-hover:opacity-0 transition-all duration-500"></div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}