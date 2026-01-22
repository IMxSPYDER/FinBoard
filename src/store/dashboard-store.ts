'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Widget, WidgetPosition, ApiConfig, DashboardTemplate, TemplateConfig, WidgetInput } from '@/types';

interface DashboardStore {
  // State
  widgets: Widget[];
  watchlist: string[];
  apiConfig: ApiConfig;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  
  // Widget Actions
  addWidget: (widget: WidgetInput) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  moveWidget: (id: string, position: WidgetPosition) => void;
  duplicateWidget: (id: string) => void;
  
  // Watchlist Actions
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  toggleWatchlist: (symbol: string) => void;
  
  // Config Actions
  setApiConfig: (config: Partial<ApiConfig>) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Import/Export
  exportConfig: () => string;
  importConfig: (config: string) => boolean;
  loadTemplate: (template: DashboardTemplate) => void;
  clearDashboard: () => void;
}

const generateId = () => `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const templates: Record<DashboardTemplate, TemplateConfig> = {
  trader: {
    name: 'Trader',
    description: 'Fast-paced trading view with charts and quick access',
    widgets: [
      {
        type: 'chart',
        title: 'AAPL Chart',
        symbol: 'AAPL',
        position: { x: 0, y: 0, w: 2, h: 2 },
        refreshInterval: 5000,
        apiProvider: 'alpha-vantage',
        chartType: 'candlestick',
        timeInterval: 'daily',
      },
      {
        type: 'finance-card',
        title: 'Tesla',
        symbol: 'TSLA',
        position: { x: 2, y: 0, w: 1, h: 1 },
        refreshInterval: 5000,
        apiProvider: 'alpha-vantage',
        showVolume: true,
        showMarketCap: true,
        isWatchlisted: true,
      },
      {
        type: 'finance-card',
        title: 'Microsoft',
        symbol: 'MSFT',
        position: { x: 3, y: 0, w: 1, h: 1 },
        refreshInterval: 5000,
        apiProvider: 'alpha-vantage',
        showVolume: true,
        showMarketCap: false,
        isWatchlisted: false,
      },
    ],
  },
  investor: {
    name: 'Investor',
    description: 'Long-term investment view with portfolio overview',
    widgets: [
      {
        type: 'stock-table',
        title: 'My Portfolio',
        symbol: 'PORTFOLIO',
        symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA'],
        position: { x: 0, y: 0, w: 2, h: 2 },
        refreshInterval: 30000,
        apiProvider: 'alpha-vantage',
        columns: ['symbol', 'price', 'change', 'changePercent'],
        pageSize: 10,
      },
      {
        type: 'chart',
        title: 'Market Overview',
        symbol: 'SPY',
        position: { x: 2, y: 0, w: 2, h: 2 },
        refreshInterval: 30000,
        apiProvider: 'alpha-vantage',
        chartType: 'line',
        timeInterval: 'monthly',
      },
    ],
  },
  analyst: {
    name: 'Analyst',
    description: 'In-depth analysis with multiple data points',
    widgets: [
      {
        type: 'chart',
        title: 'NVDA Analysis',
        symbol: 'NVDA',
        position: { x: 0, y: 0, w: 2, h: 2 },
        refreshInterval: 10000,
        apiProvider: 'alpha-vantage',
        chartType: 'candlestick',
        timeInterval: 'daily',
      },
      {
        type: 'stock-table',
        title: 'Tech Sector',
        symbol: 'TECH',
        symbols: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'AMD'],
        position: { x: 2, y: 0, w: 2, h: 2 },
        refreshInterval: 10000,
        apiProvider: 'alpha-vantage',
        columns: ['symbol', 'price', 'change', 'changePercent', 'volume'],
        pageSize: 10,
      },
    ],
  },
  custom: {
    name: 'Custom',
    description: 'Start with a blank dashboard',
    widgets: [],
  },
};

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      // Initial State
      widgets: [],
      watchlist: [],
      apiConfig: {
        alphaVantageKey: '',
        finnhubKey: '',
      },
      theme: 'dark',
      sidebarOpen: true,
      
      // Widget Actions
      addWidget: (widget) => {
        const newWidget = {
          ...widget,
          id: generateId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as Widget;
        
        set((state) => ({
          widgets: [...state.widgets, newWidget],
        }));
      },
      
      removeWidget: (id) => {
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        }));
      },
      
      updateWidget: (id, updates) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: Date.now() } as Widget : w
          ),
        }));
      },
      
      moveWidget: (id, position) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, position, updatedAt: Date.now() } : w
          ),
        }));
      },
      
      duplicateWidget: (id) => {
        const widget = get().widgets.find((w) => w.id === id);
        if (widget) {
          const newWidget = {
            ...widget,
            id: generateId(),
            title: `${widget.title} (Copy)`,
            position: {
              ...widget.position,
              x: widget.position.x + 1,
              y: widget.position.y,
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          set((state) => ({
            widgets: [...state.widgets, newWidget],
          }));
        }
      },
      
      // Watchlist Actions
      addToWatchlist: (symbol) => {
        set((state) => ({
          watchlist: state.watchlist.includes(symbol)
            ? state.watchlist
            : [...state.watchlist, symbol],
        }));
      },
      
      removeFromWatchlist: (symbol) => {
        set((state) => ({
          watchlist: state.watchlist.filter((s) => s !== symbol),
        }));
      },
      
      toggleWatchlist: (symbol) => {
        const { watchlist } = get();
        if (watchlist.includes(symbol)) {
          get().removeFromWatchlist(symbol);
        } else {
          get().addToWatchlist(symbol);
        }
      },
      
      // Config Actions
      setApiConfig: (config) => {
        set((state) => ({
          apiConfig: { ...state.apiConfig, ...config },
        }));
      },
      
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },
      
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      },
      
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },
      
      // Import/Export
      exportConfig: () => {
        const { widgets, watchlist, apiConfig, theme } = get();
        return JSON.stringify({ widgets, watchlist, apiConfig, theme }, null, 2);
      },
      
      importConfig: (config) => {
        try {
          const parsed = JSON.parse(config);
          if (parsed.widgets && Array.isArray(parsed.widgets)) {
            set({
              widgets: parsed.widgets,
              watchlist: parsed.watchlist || [],
              apiConfig: parsed.apiConfig || get().apiConfig,
              theme: parsed.theme || get().theme,
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
      
      loadTemplate: (template) => {
        const templateConfig = templates[template];
        const widgets = templateConfig.widgets.map((w) => ({
          ...w,
          id: generateId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })) as Widget[];
        
        set({ widgets });
      },
      
      clearDashboard: () => {
        set({ widgets: [] });
      },
    }),
    {
      name: 'finboard-dashboard',
      partialize: (state) => ({
        widgets: state.widgets,
        watchlist: state.watchlist,
        apiConfig: state.apiConfig,
        theme: state.theme,
      }),
    }
  )
);
