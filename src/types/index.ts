// Widget Types
export type WidgetType = 'stock-table' | 'finance-card' | 'chart';
export type ChartType = 'line' | 'candlestick';
export type TimeInterval = 'daily' | 'weekly' | 'monthly';
export type RefreshInterval = 5000 | 10000 | 30000 | 0; // 0 = manual
export type ApiProvider = 'alpha-vantage' | 'finnhub';

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BaseWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  position: WidgetPosition;
  refreshInterval: RefreshInterval;
  apiProvider: ApiProvider;
  symbol: string;
  createdAt: number;
  updatedAt: number;
}

export interface StockTableWidget extends BaseWidget {
  type: 'stock-table';
  columns: string[];
  pageSize: number;
  symbols: string[];
}

export interface FinanceCardWidget extends BaseWidget {
  type: 'finance-card';
  showVolume: boolean;
  showMarketCap: boolean;
  isWatchlisted: boolean;
}

export interface ChartWidget extends BaseWidget {
  type: 'chart';
  chartType: ChartType;
  timeInterval: TimeInterval;
}

export type Widget = StockTableWidget | FinanceCardWidget | ChartWidget;

// Stock Data Types
export interface StockQuote {
  symbol: string;
  open: number;
  high: number;
  low: number;
  price: number;
  volume: number;
  latestTradingDay: string;
  previousClose: number;
  change: number;
  changePercent: number;
  marketCap?: number;
}

export interface StockTimeSeries {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

// API Response Types
export interface ApiError {
  message: string;
  code: 'RATE_LIMIT' | 'NETWORK_ERROR' | 'INVALID_KEY' | 'INVALID_SYMBOL' | 'UNKNOWN';
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
}

// Dashboard State
export interface DashboardLayout {
  widgets: Widget[];
  lastModified: number;
}

export interface ApiConfig {
  alphaVantageKey: string;
  finnhubKey: string;
}

export interface DashboardState {
  widgets: Widget[];
  layout: WidgetPosition[];
  watchlist: string[];
  apiConfig: ApiConfig;
  theme: 'light' | 'dark';
}

// Dashboard Templates
export type DashboardTemplate = 'trader' | 'investor' | 'analyst' | 'custom';

export type WidgetInput =
  | Omit<StockTableWidget, 'id' | 'createdAt' | 'updatedAt'>
  | Omit<FinanceCardWidget, 'id' | 'createdAt' | 'updatedAt'>
  | Omit<ChartWidget, 'id' | 'createdAt' | 'updatedAt'>;


export interface TemplateConfig {
  name: string;
  description: string;
  widgets: WidgetInput[];
}
