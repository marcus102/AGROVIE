import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [pathname]);
}