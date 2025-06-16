import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';

interface Notification {
  id: string;
  message: string;
  type: 'message' | 'news' | 'update' | 'ads';
  active: boolean;
  created_at: string;
  expires_at: string | null;
}

export function Billboard() {
  // const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hiddenNotifications, setHiddenNotifications] = useState<Set<string>>(new Set());
  const { fetchNotifications, notifications, loading, error } = useAdminStore();

  useEffect(() => {
    async function fetchData() {
      await fetchNotifications();
    }
    fetchData();
  }, []);

  const hideNotification = (id: string) => {
    setHiddenNotifications(prev => new Set([...prev, id]));
    localStorage.setItem('hiddenNotifications', JSON.stringify([...hiddenNotifications, id]));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'news':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'update':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'ads':
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'news':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'update':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'ads':
        return 'bg-red-50 dark:bg-gray-900/20';
    }
  };

  const visibleNotifications = notifications.filter(
    notification => !hiddenNotifications.has(notification.id)
  );

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-gray-50 dark:bg-gray-900 px-6 py-2.5 sm:px-3.5">
      <AnimatePresence>
        {visibleNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`flex w-full items-center justify-between gap-x-4 rounded-lg ${getBackgroundColor(
              notification.type
            )} px-4 py-2`}
          >
            <div className="flex items-center gap-x-2">
              {getIcon(notification.type)}
              <p className="text-sm leading-6 text-gray-900 dark:text-gray-100">
                {notification.context}
              </p>
            </div>
            <button
              type="button"
              className="flex-none rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => hideNotification(notification.id)}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}