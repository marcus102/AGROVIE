export type ThemeType = 'light' | 'dark';

export interface Theme {
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    muted: string;
  };
  statusBar: 'light' | 'dark';
}

export const lightTheme: Theme = {
  colors: {
    primary: '#166534',
    background: '#f9fafb',
    card: '#ffffff',
    text: '#111827',
    border: '#e5e7eb',
    notification: '#ef4444',
    success: '#059669',
    error: '#dc2626',
    warning: '#92400e',
    info: '#1d4ed8',
    muted: '#6b7280',
  },
  statusBar: 'dark',
};

export const darkTheme: Theme = {
  colors: {
    primary: '#4ade80',
    background: '#111827',
    card: '#1f2937',
    text: '#f9fafb',
    border: '#374151',
    notification: '#f87171',
    success: '#34d399',
    error: '#ef4444',
    warning: '#fbbf24',
    info: '#60a5fa',
    muted: '#9ca3af',
  },
  statusBar: 'light',
};