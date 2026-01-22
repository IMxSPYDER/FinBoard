'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDashboardStore } from '@/store/dashboard-store';
import { fetchTimeSeries, formatCurrency } from '@/services/stock-api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ComposedChart,
  Bar,
} from 'recharts';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import type { ChartWidget as ChartWidgetType, StockTimeSeries, TimeInterval } from '@/types';

interface StockChartWidgetProps {
  widget: ChartWidgetType;
}

export function StockChartWidget({ widget }: StockChartWidgetProps) {
  const { apiConfig, updateWidget } = useDashboardStore();
  const [data, setData] = useState<StockTimeSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data: timeSeriesData, error: apiError } = await fetchTimeSeries(
      widget.symbol,
      widget.timeInterval,
      apiConfig.alphaVantageKey || undefined
    );
    
    if (apiError) {
      setError(apiError.message);
    } else if (timeSeriesData) {
      setData(timeSeriesData);
    }
    
    setLoading(false);
  }, [widget.symbol, widget.timeInterval, apiConfig.alphaVantageKey]);
  
  useEffect(() => {
    fetchData();
    
    if (widget.refreshInterval > 0) {
      const interval = setInterval(fetchData, widget.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, widget.refreshInterval]);
  
  const handleIntervalChange = (interval: TimeInterval) => {
    updateWidget(widget.id, { timeInterval: interval });
  };
  
  if (loading && data.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchData}>
          Retry
        </Button>
      </div>
    );
  }
  
  const intervals: Array<{ value: TimeInterval; label: string }> = [
    { value: 'daily', label: '1D' },
    { value: 'weekly', label: '1W' },
    { value: 'monthly', label: '1M' },
  ];
  
  const priceChange = data.length >= 2 
    ? data[data.length - 1].close - data[0].close 
    : 0;
  const isPositive = priceChange >= 0;
  
  // Format data for chart
  const chartData = data.map((d) => ({
    ...d,
    date: d.timestamp.slice(5), // Show MM-DD format
  }));
  
  return (
    <div className="space-y-4">
      {/* Interval selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {intervals.map((interval) => (
            <Button
              key={interval.value}
              variant={widget.timeInterval === interval.value ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => handleIntervalChange(interval.value)}
            >
              {interval.label}
            </Button>
          ))}
        </div>
        <span className="text-sm font-mono font-medium">{widget.symbol}</span>
      </div>
      
      {/* Chart */}
      <div className="h-[200px] w-full">
        {widget.chartType === 'line' ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                className="fill-muted-foreground"
                width={60}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as StockTimeSeries & { date: string };
                    return (
                      <div className="rounded-lg border bg-card p-2 shadow-lg">
                        <p className="text-xs text-muted-foreground">{data.timestamp}</p>
                        <p className="font-mono font-medium">{formatCurrency(data.close)}</p>
                        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <span className="text-muted-foreground">Open:</span>
                          <span className="font-mono">{formatCurrency(data.open)}</span>
                          <span className="text-muted-foreground">High:</span>
                          <span className="font-mono text-positive">{formatCurrency(data.high)}</span>
                          <span className="text-muted-foreground">Low:</span>
                          <span className="font-mono text-negative">{formatCurrency(data.low)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="close"
                stroke={isPositive ? 'var(--positive)' : 'var(--negative)'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          // Candlestick chart approximation using bar chart
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                className="fill-muted-foreground"
                width={60}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as StockTimeSeries & { date: string };
                    const candlePositive = data.close >= data.open;
                    return (
                      <div className="rounded-lg border bg-card p-2 shadow-lg">
                        <p className="text-xs text-muted-foreground">{data.timestamp}</p>
                        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <span className="text-muted-foreground">Open:</span>
                          <span className="font-mono">{formatCurrency(data.open)}</span>
                          <span className="text-muted-foreground">Close:</span>
                          <span className={cn('font-mono', candlePositive ? 'text-positive' : 'text-negative')}>
                            {formatCurrency(data.close)}
                          </span>
                          <span className="text-muted-foreground">High:</span>
                          <span className="font-mono">{formatCurrency(data.high)}</span>
                          <span className="text-muted-foreground">Low:</span>
                          <span className="font-mono">{formatCurrency(data.low)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="close"
                fill="var(--chart-1)"
                radius={[2, 2, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Summary stats */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {data.length} data points
        </span>
        <span
          className={cn(
            'font-mono font-medium',
            isPositive ? 'text-positive' : 'text-negative'
          )}
        >
          {isPositive ? '+' : ''}
          {formatCurrency(priceChange)} ({((priceChange / (data[0]?.close || 1)) * 100).toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}
