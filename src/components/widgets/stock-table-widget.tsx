'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDashboardStore } from '@/store/dashboard-store';
import { fetchMultipleQuotes, formatCurrency, formatPercent, formatNumber } from '@/services/stock-api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import type { StockTableWidget as StockTableWidgetType, StockQuote } from '@/types';

interface StockTableWidgetProps {
  widget: StockTableWidgetType;
}

export function StockTableWidget({ widget }: StockTableWidgetProps) {
  const { apiConfig } = useDashboardStore();
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, errors } = await fetchMultipleQuotes(
      widget.symbols,
      apiConfig.alphaVantageKey || undefined
    );
    
    if (errors.length > 0 && data.length === 0) {
      setError(errors[0].error.message);
    } else {
      setQuotes(data);
    }
    
    setLoading(false);
  }, [widget.symbols, apiConfig.alphaVantageKey]);
  
  useEffect(() => {
    fetchData();
    
    if (widget.refreshInterval > 0) {
      const interval = setInterval(fetchData, widget.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, widget.refreshInterval]);
  
  const filteredQuotes = quotes.filter((q) =>
    q.symbol.toLowerCase().includes(search.toLowerCase())
  );
  
  const pageSize = widget.pageSize || 5;
  const totalPages = Math.ceil(filteredQuotes.length / pageSize);
  const paginatedQuotes = filteredQuotes.slice(page * pageSize, (page + 1) * pageSize);
  
  const columnLabels: Record<string, string> = {
    symbol: 'Symbol',
    price: 'Price',
    change: 'Change',
    changePercent: '% Change',
    volume: 'Volume',
    high: 'High',
    low: 'Low',
    open: 'Open',
  };
  
  if (loading && quotes.length === 0) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
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
  
  return (
    <div className="space-y-3 h-auto">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search symbols..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="pl-8"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {widget.columns.map((col) => (
                <TableHead key={col} className="whitespace-nowrap">
                  {columnLabels[col] || col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedQuotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={widget.columns.length} className="text-center text-muted-foreground">
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              paginatedQuotes.map((quote) => (
                <TableRow key={quote.symbol}>
                  {widget.columns.map((col) => (
                    <TableCell key={col} className="whitespace-nowrap">
                      {col === 'symbol' && (
                        <span className="font-mono font-semibold">{quote.symbol}</span>
                      )}
                      {col === 'price' && (
                        <span className="font-mono">{formatCurrency(quote.price)}</span>
                      )}
                      {col === 'change' && (
                        <span
                          className={cn(
                            'flex items-center gap-1 font-mono',
                            quote.change >= 0 ? 'text-positive' : 'text-negative'
                          )}
                        >
                          {quote.change >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatCurrency(Math.abs(quote.change))}
                        </span>
                      )}
                      {col === 'changePercent' && (
                        <span
                          className={cn(
                            'font-mono',
                            quote.changePercent >= 0 ? 'text-positive' : 'text-negative'
                          )}
                        >
                          {formatPercent(quote.changePercent)}
                        </span>
                      )}
                      {col === 'volume' && (
                        <span className="font-mono">{formatNumber(quote.volume)}</span>
                      )}
                      {col === 'high' && (
                        <span className="font-mono">{formatCurrency(quote.high)}</span>
                      )}
                      {col === 'low' && (
                        <span className="font-mono">{formatCurrency(quote.low)}</span>
                      )}
                      {col === 'open' && (
                        <span className="font-mono">{formatCurrency(quote.open)}</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
