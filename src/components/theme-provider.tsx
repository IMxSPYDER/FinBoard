'use client';

import { useEffect, type ReactNode } from 'react';
import { useDashboardStore } from '@/store/dashboard-store';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useDashboardStore((state) => state.theme);
  
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);
  
  return <>{children}</>;
}
