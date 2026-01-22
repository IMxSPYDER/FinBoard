'use client';

import { useState, useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboard-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';

import type {
  Widget,
  WidgetType,
  ChartType,
  TimeInterval,
  RefreshInterval,
  ApiProvider,
  BaseWidget,
} from '@/types';

interface WidgetBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgetType?: WidgetType;
  editWidget?: Widget;
}

const defaultPositions = {
  'stock-table': { x: 0, y: 0, w: 2, h: 2 },
  'finance-card': { x: 0, y: 0, w: 1, h: 1 },
  chart: { x: 0, y: 0, w: 2, h: 2 },
};

const columnOptions = [
  { value: 'symbol', label: 'Symbol' },
  { value: 'price', label: 'Price' },
  { value: 'change', label: 'Change' },
  { value: 'changePercent', label: '% Change' },
  { value: 'volume', label: 'Volume' },
  { value: 'high', label: 'High' },
  { value: 'low', label: 'Low' },
  { value: 'open', label: 'Open' },
];

export function WidgetBuilderModal({
  open,
  onOpenChange,
  widgetType,
  editWidget,
}: WidgetBuilderModalProps) {
  const { addWidget, updateWidget } = useDashboardStore();

  // Common fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [symbol, setSymbol] = useState('AAPL');
  const [apiProvider, setApiProvider] =
    useState<ApiProvider>('alpha-vantage');
  const [refreshInterval, setRefreshInterval] =
    useState<RefreshInterval>(10000);

  // Stock Table fields
  const [symbols, setSymbols] = useState<string[]>([
    'AAPL',
    'TSLA',
    'MSFT',
  ]);
  const [columns, setColumns] = useState<string[]>([
    'symbol',
    'price',
    'change',
    'changePercent',
  ]);
  const [pageSize, setPageSize] = useState(5);
  const [newSymbol, setNewSymbol] = useState('');

  // Finance Card fields
  const [showVolume, setShowVolume] = useState(true);
  const [showMarketCap, setShowMarketCap] = useState(true);

  // Chart fields
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeInterval, setTimeInterval] =
    useState<TimeInterval>('daily');

  const activeType = editWidget?.type || widgetType;

  useEffect(() => {
    if (!open) return;

    if (editWidget) {
      setTitle(editWidget.title);
      setDescription(editWidget.description || '');
      setSymbol(editWidget.symbol);
      setApiProvider(editWidget.apiProvider);
      setRefreshInterval(editWidget.refreshInterval);

      if (editWidget.type === 'stock-table') {
        setSymbols(editWidget.symbols);
        setColumns(editWidget.columns);
        setPageSize(editWidget.pageSize);
      } else if (editWidget.type === 'finance-card') {
        setShowVolume(editWidget.showVolume);
        setShowMarketCap(editWidget.showMarketCap);
      } else if (editWidget.type === 'chart') {
        setChartType(editWidget.chartType);
        setTimeInterval(editWidget.timeInterval);
      }
    } else {
      setTitle(getDefaultTitle(activeType));
      setDescription('');
      setSymbol('AAPL');
      setApiProvider('alpha-vantage');
      setRefreshInterval(10000);
      setSymbols(['AAPL', 'TSLA', 'MSFT']);
      setColumns(['symbol', 'price', 'change', 'changePercent']);
      setPageSize(5);
      setShowVolume(true);
      setShowMarketCap(true);
      setChartType('line');
      setTimeInterval('daily');
    }
  }, [open, editWidget, activeType]);

  function getDefaultTitle(type?: WidgetType): string {
    switch (type) {
      case 'stock-table':
        return 'Stock Table';
      case 'finance-card':
        return 'Finance Card';
      case 'chart':
        return 'Stock Chart';
      default:
        return 'Widget';
    }
  }

  const handleAddSymbol = () => {
    if (newSymbol && !symbols.includes(newSymbol.toUpperCase())) {
      setSymbols([...symbols, newSymbol.toUpperCase()]);
      setNewSymbol('');
    }
  };

  const handleRemoveSymbol = (symbolToRemove: string) => {
    setSymbols(symbols.filter((s) => s !== symbolToRemove));
  };

  const handleToggleColumn = (column: string) => {
    setColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column],
    );
  };

  const handleSubmit = () => {
    if (!activeType) return;

    const now = Date.now();

    const baseWidget: Omit<
      BaseWidget,
      'id' | 'createdAt' | 'updatedAt' | 'type'
    > = {
      title,
      description: description || undefined,
      symbol,
      apiProvider,
      refreshInterval,
      position:
        editWidget?.position || defaultPositions[activeType],
    };

    if (editWidget) {
      // UPDATE WIDGET
      if (activeType === 'stock-table') {
        updateWidget(editWidget.id, {
          ...baseWidget,
          symbols,
          columns,
          pageSize,
          updatedAt: now,
        });
      } else if (activeType === 'finance-card') {
        updateWidget(editWidget.id, {
          ...baseWidget,
          showVolume,
          showMarketCap,
          updatedAt: now,
        });
      } else if (activeType === 'chart') {
        updateWidget(editWidget.id, {
          ...baseWidget,
          chartType,
          timeInterval,
          updatedAt: now,
        });
      }
    } else {
      // ADD WIDGET
      const id = crypto.randomUUID();

      if (activeType === 'stock-table') {
        addWidget({
          id,
          createdAt: now,
          updatedAt: now,
          type: 'stock-table',
          ...baseWidget,
          symbols,
          columns,
          pageSize,
        });
      } else if (activeType === 'finance-card') {
        addWidget({
          id,
          createdAt: now,
          updatedAt: now,
          type: 'finance-card',
          ...baseWidget,
          showVolume,
          showMarketCap,
          isWatchlisted: false,
        });
      } else if (activeType === 'chart') {
        addWidget({
          id,
          createdAt: now,
          updatedAt: now,
          type: 'chart',
          ...baseWidget,
          chartType,
          timeInterval,
        });
      }
    }

    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editWidget ? 'Edit Widget' : 'Add Widget'}
          </DialogTitle>
          <DialogDescription>
            Configure your {activeType?.replace('-', ' ')} widget settings.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="data">Data Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Widget Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter widget title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a brief description"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="refresh">Refresh Interval</Label>
              <Select
                value={refreshInterval.toString()}
                onValueChange={(v) => setRefreshInterval(parseInt(v) as RefreshInterval)}
              >
                <SelectTrigger id="refresh">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5000">5 seconds</SelectItem>
                  <SelectItem value="10000">10 seconds</SelectItem>
                  <SelectItem value="30000">30 seconds</SelectItem>
                  <SelectItem value="0">Manual only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="provider">API Provider</Label>
              <Select
                value={apiProvider}
                onValueChange={(v) => setApiProvider(v as ApiProvider)}
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alpha-vantage">Alpha Vantage</SelectItem>
                  <SelectItem value="finnhub">Finnhub</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4 pt-4">
            {activeType === 'stock-table' && (
              <>
                <div className="space-y-2">
                  <Label>Stock Symbols</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSymbol}
                      onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                      placeholder="Add symbol (e.g., AAPL)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSymbol();
                        }
                      }}
                    />
                    <Button onClick={handleAddSymbol} variant="secondary">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {symbols.map((s) => (
                      <Badge key={s} variant="secondary" className="gap-1">
                        {s}
                        <button
                          onClick={() => handleRemoveSymbol(s)}
                          className="ml-1 rounded-full hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Display Columns</Label>
                  <div className="flex flex-wrap gap-2">
                    {columnOptions.map((col) => (
                      <Badge
                        key={col.value}
                        variant={columns.includes(col.value) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleToggleColumn(col.value)}
                      >
                        {col.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pageSize">Page Size</Label>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(v) => setPageSize(parseInt(v))}
                  >
                    <SelectTrigger id="pageSize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 rows</SelectItem>
                      <SelectItem value="10">10 rows</SelectItem>
                      <SelectItem value="20">20 rows</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            {activeType === 'finance-card' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cardSymbol">Stock Symbol</Label>
                  <Input
                    id="cardSymbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="Enter symbol (e.g., AAPL)"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showVolume">Show Volume</Label>
                    <Switch
                      id="showVolume"
                      checked={showVolume}
                      onCheckedChange={setShowVolume}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showMarketCap">Show Market Cap</Label>
                    <Switch
                      id="showMarketCap"
                      checked={showMarketCap}
                      onCheckedChange={setShowMarketCap}
                    />
                  </div>
                </div>
              </>
            )}
            
            {activeType === 'chart' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="chartSymbol">Stock Symbol</Label>
                  <Input
                    id="chartSymbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="Enter symbol (e.g., AAPL)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="chartType">Chart Type</Label>
                  <Select
                    value={chartType}
                    onValueChange={(v) => setChartType(v as ChartType)}
                  >
                    <SelectTrigger id="chartType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="candlestick">Bar Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeInterval">Time Interval</Label>
                  <Select
                    value={timeInterval}
                    onValueChange={(v) => setTimeInterval(v as TimeInterval)}
                  >
                    <SelectTrigger id="timeInterval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editWidget ? 'Save Changes' : 'Add Widget'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
