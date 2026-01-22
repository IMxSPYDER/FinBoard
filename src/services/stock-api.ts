import type { StockQuote, StockTimeSeries, ApiError, TimeInterval } from '@/types';

// Demo data for when API keys are not configured
const DEMO_STOCKS: Record<string, StockQuote> = {
  AAPL: {
    symbol: 'AAPL',
    open: 178.25,
    high: 182.50,
    low: 177.80,
    price: 181.45,
    volume: 52847300,
    latestTradingDay: new Date().toISOString().split('T')[0],
    previousClose: 178.10,
    change: 3.35,
    changePercent: 1.88,
    marketCap: 2850000000000,
  },
  TSLA: {
    symbol: 'TSLA',
    open: 242.10,
    high: 248.90,
    low: 240.25,
    price: 246.75,
    volume: 89234500,
    latestTradingDay: new Date().toISOString().split('T')[0],
    previousClose: 241.80,
    change: 4.95,
    changePercent: 2.05,
    marketCap: 782000000000,
  },
  MSFT: {
    symbol: 'MSFT',
    open: 378.40,
    high: 382.15,
    low: 376.90,
    price: 380.25,
    volume: 18923400,
    latestTradingDay: new Date().toISOString().split('T')[0],
    previousClose: 377.50,
    change: 2.75,
    changePercent: 0.73,
    marketCap: 2820000000000,
  },
  GOOGL: {
    symbol: 'GOOGL',
    open: 141.20,
    high: 143.80,
    low: 140.50,
    price: 142.95,
    volume: 23145600,
    latestTradingDay: new Date().toISOString().split('T')[0],
    previousClose: 140.85,
    change: 2.10,
    changePercent: 1.49,
    marketCap: 1780000000000,
  },
  AMZN: {
    symbol: 'AMZN',
    open: 185.30,
    high: 188.75,
    low: 184.20,
    price: 187.45,
    volume: 41256700,
    latestTradingDay: new Date().toISOString().split('T')[0],
    previousClose: 184.90,
    change: 2.55,
    changePercent: 1.38,
    marketCap: 1950000000000,
  },
  NVDA: {
    symbol: 'NVDA',
    open: 495.60,
    high: 512.40,
    low: 493.20,
    price: 508.75,
    volume: 45678900,
    latestTradingDay: new Date().toISOString().split('T')[0],
    previousClose: 494.30,
    change: 14.45,
    changePercent: 2.92,
    marketCap: 1250000000000,
  },
  META: {
    symbol: 'META',
    open: 485.20,
    high: 492.80,
    low: 483.10,
    price: 490.35,
    volume: 12345600,
    latestTradingDay: new Date().toISOString().split('T')[0],
    previousClose: 484.50,
    change: 5.85,
    changePercent: 1.21,
    marketCap: 1260000000000,
  },
  AMD: {
    symbol: 'AMD',
    open: 122.45,
    high: 126.80,
    low: 121.90,
    price: 125.60,
    volume: 56789000,
    latestTradingDay: new Date().toISOString().split('T')[0],
    previousClose: 122.10,
    change: 3.50,
    changePercent: 2.87,
    marketCap: 203000000000,
  },
  SPY: {
    symbol: 'SPY',
    open: 478.30,
    high: 482.15,
    low: 477.40,
    price: 480.90,
    volume: 78234500,
    latestTradingDay: new Date().toISOString().split('T')[0],
    previousClose: 477.85,
    change: 3.05,
    changePercent: 0.64,
    marketCap: 435000000000,
  },
};

// Generate demo time series data
function generateDemoTimeSeries(symbol: string, interval: TimeInterval): StockTimeSeries[] {
  const baseQuote = DEMO_STOCKS[symbol] || DEMO_STOCKS['AAPL'];
  const data: StockTimeSeries[] = [];
  const now = new Date();
  
  const points = interval === 'daily' ? 30 : interval === 'weekly' ? 52 : 24;
  const dayStep = interval === 'daily' ? 1 : interval === 'weekly' ? 7 : 30;
  
  let price = baseQuote.price * 0.85; // Start 15% lower
  
  for (let i = points; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * dayStep));
    
    const volatility = 0.02;
    const trend = 0.003;
    const change = (Math.random() - 0.5) * 2 * volatility + trend;
    price = price * (1 + change);
    
    const dayVolatility = price * 0.015;
    const open = price + (Math.random() - 0.5) * dayVolatility;
    const close = price;
    const high = Math.max(open, close) + Math.random() * dayVolatility;
    const low = Math.min(open, close) - Math.random() * dayVolatility;
    
    data.push({
      timestamp: date.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(baseQuote.volume * (0.8 + Math.random() * 0.4)),
    });
  }
  
  return data;
}

// Add some randomness to demo data
function addVariation(quote: StockQuote): StockQuote {
  const variation = (Math.random() - 0.5) * 0.02;
  const newPrice = quote.price * (1 + variation);
  const change = newPrice - quote.previousClose;
  const changePercent = (change / quote.previousClose) * 100;
  
  return {
    ...quote,
    price: Number(newPrice.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    high: Math.max(quote.high, newPrice),
    low: Math.min(quote.low, newPrice),
  };
}

// Cache for API responses
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

function setCachedData(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function fetchStockQuote(
  symbol: string,
  apiKey?: string
): Promise<{ data: StockQuote | null; error: ApiError | null }> {
  const cacheKey = `quote-${symbol}`;
  const cached = getCachedData<StockQuote>(cacheKey);
  
  if (cached) {
    return { data: addVariation(cached), error: null };
  }
  
  // Use demo data if no API key
  if (!apiKey) {
    const demoData = DEMO_STOCKS[symbol.toUpperCase()];
    if (demoData) {
      const data = addVariation(demoData);
      setCachedData(cacheKey, data);
      return { data, error: null };
    }
    // Generate random data for unknown symbols
    const randomData: StockQuote = {
      symbol: symbol.toUpperCase(),
      open: 100 + Math.random() * 100,
      high: 110 + Math.random() * 100,
      low: 90 + Math.random() * 100,
      price: 100 + Math.random() * 100,
      volume: Math.floor(Math.random() * 10000000),
      latestTradingDay: new Date().toISOString().split('T')[0],
      previousClose: 99 + Math.random() * 100,
      change: Math.random() * 10 - 5,
      changePercent: Math.random() * 5 - 2.5,
    };
    randomData.change = Number(randomData.change.toFixed(2));
    randomData.changePercent = Number(randomData.changePercent.toFixed(2));
    randomData.price = Number(randomData.price.toFixed(2));
    setCachedData(cacheKey, randomData);
    return { data: randomData, error: null };
  }
  
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Network error');
    }
    
    const json = await response.json();
    
    if (json['Error Message']) {
      return {
        data: null,
        error: { message: 'Invalid symbol', code: 'INVALID_SYMBOL' },
      };
    }
    
    if (json['Note']) {
      return {
        data: null,
        error: { message: 'API rate limit exceeded', code: 'RATE_LIMIT' },
      };
    }
    
    const quote = json['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      return {
        data: null,
        error: { message: 'No data available', code: 'UNKNOWN' },
      };
    }
    
    const data: StockQuote = {
      symbol: quote['01. symbol'],
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      price: parseFloat(quote['05. price']),
      volume: parseInt(quote['06. volume']),
      latestTradingDay: quote['07. latest trading day'],
      previousClose: parseFloat(quote['08. previous close']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
    };
    
    setCachedData(cacheKey, data);
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'NETWORK_ERROR',
      },
    };
  }
}

export async function fetchTimeSeries(
  symbol: string,
  interval: TimeInterval,
  apiKey?: string
): Promise<{ data: StockTimeSeries[] | null; error: ApiError | null }> {
  const cacheKey = `timeseries-${symbol}-${interval}`;
  const cached = getCachedData<StockTimeSeries[]>(cacheKey);
  
  if (cached) {
    return { data: cached, error: null };
  }
  
  // Use demo data if no API key
  if (!apiKey) {
    const data = generateDemoTimeSeries(symbol.toUpperCase(), interval);
    setCachedData(cacheKey, data);
    return { data, error: null };
  }
  
  const functionMap: Record<TimeInterval, string> = {
    daily: 'TIME_SERIES_DAILY',
    weekly: 'TIME_SERIES_WEEKLY',
    monthly: 'TIME_SERIES_MONTHLY',
  };
  
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=${functionMap[interval]}&symbol=${symbol}&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Network error');
    }
    
    const json = await response.json();
    
    if (json['Error Message']) {
      return {
        data: null,
        error: { message: 'Invalid symbol', code: 'INVALID_SYMBOL' },
      };
    }
    
    if (json['Note']) {
      return {
        data: null,
        error: { message: 'API rate limit exceeded', code: 'RATE_LIMIT' },
      };
    }
    
    const timeSeriesKey = Object.keys(json).find((key) =>
      key.includes('Time Series')
    );
    
    if (!timeSeriesKey) {
      return {
        data: null,
        error: { message: 'No data available', code: 'UNKNOWN' },
      };
    }
    
    const timeSeries = json[timeSeriesKey];
    const data: StockTimeSeries[] = Object.entries(timeSeries)
      .slice(0, 100)
      .map(([date, values]) => {
        const v = values as Record<string, string>;
        return {
          timestamp: date,
          open: parseFloat(v['1. open']),
          high: parseFloat(v['2. high']),
          low: parseFloat(v['3. low']),
          close: parseFloat(v['4. close']),
          volume: parseInt(v['5. volume']),
        };
      })
      .reverse();
    
    setCachedData(cacheKey, data);
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'NETWORK_ERROR',
      },
    };
  }
}

export async function fetchMultipleQuotes(
  symbols: string[],
  apiKey?: string
): Promise<{ data: StockQuote[]; errors: Array<{ symbol: string; error: ApiError }> }> {
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      const result = await fetchStockQuote(symbol, apiKey);
      return { symbol, ...result };
    })
  );
  
  const data: StockQuote[] = [];
  const errors: Array<{ symbol: string; error: ApiError }> = [];
  
  for (const result of results) {
    if (result.data) {
      data.push(result.data);
    } else if (result.error) {
      errors.push({ symbol: result.symbol, error: result.error });
    }
  }
  
  return { data, errors };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(2)}T`;
  }
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toLocaleString();
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
