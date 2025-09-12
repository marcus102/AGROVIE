import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

interface ScrollToTopLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollToTopLink({ children, to, className, ...props }: ScrollToTopLinkProps) {
  const handleClick = () => {
    // Small delay to ensure navigation happens first
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 100);
  };

  return (
    <Link
      to={to}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}