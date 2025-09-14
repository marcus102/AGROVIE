import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '../utils/animations';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className = '' }: LayoutProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${className}`}
    >
      {children}
    </motion.div>
  );
}