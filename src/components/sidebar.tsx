'use client';

import { useDashboardStore } from '@/store/dashboard-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Plus,
  Table,
  CreditCard,
  LineChart,
  ChevronLeft,
  Star,
  X,
} from 'lucide-react';
import type { WidgetType } from '@/types';

interface SidebarProps {
  onAddWidget: (type: WidgetType) => void;
}

const widgetTypes: Array<{ type: WidgetType; icon: typeof Table; label: string; description: string }> = [
  {
    type: 'stock-table',
    icon: Table,
    label: 'Stock Table',
    description: 'Paginated list of stocks with search and filter',
  },
  {
    type: 'finance-card',
    icon: CreditCard,
    label: 'Finance Card',
    description: 'Single stock summary with key metrics',
  },
  {
    type: 'chart',
    icon: LineChart,
    label: 'Stock Chart',
    description: 'Line or candlestick chart with time intervals',
  },
];

export function Sidebar({ onAddWidget }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen, watchlist, removeFromWatchlist } = useDashboardStore();
  
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sticky inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside
        className={cn(
          // Mobile: fixed overlay
          'fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] w-[85vw] max-w-[320px] bg-sidebar border-r border-border transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: sticky sidebar
          'lg:static lg:translate-x-0 lg:w-72 lg:h-[calc(100vh-3.5rem)] lg:top-14'
        )}
      >

  {/* Header */}
  <div className="flex items-center justify-between border-b border-sidebar-border p-4 flex-shrink-0">
    <h2 className="font-semibold text-sidebar-foreground">Widget Builder</h2>
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      onClick={() => setSidebarOpen(false)}
    >
      <ChevronLeft className="h-5 w-5" />
    </Button>
  </div>

  {/* Scrollable Content */}
  <ScrollArea className="flex-1 overflow-y-auto p-4">
    <div className="space-y-6">
      {/* Add Widget Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Add Widget</h3>
        <div className="space-y-2">
          {widgetTypes.map((widget) => (
            <button
              key={widget.type}
              onClick={() => {
                onAddWidget(widget.type);
                setSidebarOpen(false);
              }}
              className="flex w-full items-start gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3 text-left transition-colors hover:bg-sidebar-accent"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <widget.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sidebar-foreground">{widget.label}</span>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">{widget.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Watchlist Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          <Star className="mr-1.5 inline-block h-4 w-4" />
          Watchlist
        </h3>
        {watchlist.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No stocks in watchlist. Add stocks from Finance Cards.
          </p>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {watchlist.map((symbol) => (
              <div
                key={symbol}
                className="flex items-center justify-between rounded-md bg-sidebar-accent/50 px-3 py-2"
              >
                <span className="font-mono text-sm font-medium">{symbol}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeFromWatchlist(symbol)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </ScrollArea>

  {/* Footer */}
  <div className="border-t border-sidebar-border p-4 flex-shrink-0">
    <p className="text-xs text-muted-foreground">
      Drag widgets to reposition. Click edit to configure.
    </p>
  </div>
</aside>
    </>
  );
}
