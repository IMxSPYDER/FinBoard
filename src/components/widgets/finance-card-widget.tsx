'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDashboardStore } from '@/store/dashboard-store';
import { fetchStockQuote, formatCurrency, formatPercent, formatNumber } from '@/services/stock-api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Star, AlertCircle, BarChart3, DollarSign } from 'lucide-react';
import type { FinanceCardWidget as FinanceCardWidgetType, StockQuote } from '@/types';

interface FinanceCardWidgetProps {
  widget: FinanceCardWidgetType;
}

export function FinanceCardWidget({ widget }: FinanceCardWidgetProps) {
  const { apiConfig, watchlist, toggleWatchlist } = useDashboardStore();
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isWatchlisted = watchlist.includes(widget.symbol);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: apiError } = await fetchStockQuote(
      widget.symbol,
      apiConfig.alphaVantageKey || undefined
    );
    
    if (apiError) {
      setError(apiError.message);
    } else {
      setQuote(data);
    }
    
    setLoading(false);
  }, [widget.symbol, apiConfig.alphaVantageKey]);
  
  useEffect(() => {
    fetchData();
    
    if (widget.refreshInterval > 0) {
      const interval = setInterval(fetchData, widget.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, widget.refreshInterval]);
  
  if (loading && !quote) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <Skeleton className="h-12 w-32" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
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
  
  if (!quote) return null;
  
  const isPositive = quote.change >= 0;
  
  return (
    <div className="space-y-4">
      {/* Header with symbol and watchlist */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold font-mono">{quote.symbol}</span>
          <span
            className={cn(
              'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
              isPositive
                ? 'bg-positive/10 text-positive'
                : 'bg-negative/10 text-negative'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {formatPercent(quote.changePercent)}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => toggleWatchlist(widget.symbol)}
        >
          <Star
            className={cn(
              'h-4 w-4',
              isWatchlisted ? 'fill-warning text-warning' : 'text-muted-foreground'
            )}
          />
        </Button>
      </div>
      
      {/* Price */}
      <div>
        <div className="text-3xl font-bold font-mono">
          {formatCurrency(quote.price)}
        </div>
        <div
          className={cn(
            'flex items-center gap-1 text-sm font-mono',
            isPositive ? 'text-positive' : 'text-negative'
          )}
        >
          {isPositive ? '+' : ''}
          {formatCurrency(quote.change)} today
        </div>
      </div>
      
      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <DollarSign className="h-3 w-3" />
            Open
          </div>
          <div className="font-mono font-medium">{formatCurrency(quote.open)}</div>
        </div>
        
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <DollarSign className="h-3 w-3" />
            Previous
          </div>
          <div className="font-mono font-medium">{formatCurrency(quote.previousClose)}</div>
        </div>
        
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            High
          </div>
          <div className="font-mono font-medium text-positive">{formatCurrency(quote.high)}</div>
        </div>
        
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingDown className="h-3 w-3" />
            Low
          </div>
          <div className="font-mono font-medium text-negative">{formatCurrency(quote.low)}</div>
        </div>
        
        {widget.showVolume && (
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BarChart3 className="h-3 w-3" />
              Volume
            </div>
            <div className="font-mono font-medium">{formatNumber(quote.volume)}</div>
          </div>
        )}
        
        {widget.showMarketCap && quote.marketCap && (
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              Market Cap
            </div>
            <div className="font-mono font-medium">{formatNumber(quote.marketCap)}</div>
          </div>
        )}
      </div>
      
      {/* Last updated */}
      <div className="text-xs text-muted-foreground">
        Last trading day: {quote.latestTradingDay}
      </div>
    </div>
  );
}
