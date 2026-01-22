'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDashboardStore } from '@/store/dashboard-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Key, Moon, Sun, Trash2, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function SettingsPage() {
  const { apiConfig, setApiConfig, theme, setTheme, clearDashboard, widgets } = useDashboardStore();
  const [alphaVantageKey, setAlphaVantageKey] = useState(apiConfig.alphaVantageKey);
  const [finnhubKey, setFinnhubKey] = useState(apiConfig.finnhubKey);
  const [saved, setSaved] = useState(false);
  
  const handleSaveApiKeys = () => {
    setApiConfig({
      alphaVantageKey,
      finnhubKey,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  
  const handleClearDashboard = () => {
    if (window.confirm('Are you sure you want to clear all widgets? This cannot be undone.')) {
      clearDashboard();
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-border bg-card px-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">Settings</h1>
      </header>
      
      <main className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Configure your API keys to fetch real-time stock data. Without API keys, demo data will be used.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Demo Mode Active</AlertTitle>
              <AlertDescription>
                The dashboard works without API keys using simulated data. Add your API keys to get real market data.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="alphaVantageKey">Alpha Vantage API Key</Label>
              <Input
                id="alphaVantageKey"
                type="password"
                value={alphaVantageKey}
                onChange={(e) => setAlphaVantageKey(e.target.value)}
                placeholder="Enter your Alpha Vantage API key"
              />
              <p className="text-xs text-muted-foreground">
                Get a free API key at{' '}
                <a
                  href="https://www.alphavantage.co/support/#api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  alphavantage.co
                </a>
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="finnhubKey">Finnhub API Key</Label>
              <Input
                id="finnhubKey"
                type="password"
                value={finnhubKey}
                onChange={(e) => setFinnhubKey(e.target.value)}
                placeholder="Enter your Finnhub API key"
              />
              <p className="text-xs text-muted-foreground">
                Get a free API key at{' '}
                <a
                  href="https://finnhub.io/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  finnhub.io
                </a>
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={handleSaveApiKeys}>Save API Keys</Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-positive">
                  <CheckCircle className="h-4 w-4" />
                  Saved!
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={(v) => setTheme(v as 'light' | 'dark')}>
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <span className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </span>
                  </SelectItem>
                  <SelectItem value="dark">
                    <span className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Dashboard Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Statistics</CardTitle>
            <CardDescription>
              Overview of your current dashboard configuration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted p-4">
                <div className="text-2xl font-bold">{widgets.length}</div>
                <div className="text-sm text-muted-foreground">Total Widgets</div>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <div className="text-2xl font-bold">
                  {widgets.filter((w) => w.type === 'chart').length}
                </div>
                <div className="text-sm text-muted-foreground">Charts</div>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <div className="text-2xl font-bold">
                  {widgets.filter((w) => w.type === 'stock-table').length}
                </div>
                <div className="text-sm text-muted-foreground">Tables</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions that affect your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
              <div>
                <h4 className="font-medium">Clear Dashboard</h4>
                <p className="text-sm text-muted-foreground">
                  Remove all widgets from your dashboard.
                </p>
              </div>
              <Button variant="destructive" onClick={handleClearDashboard}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            FinBoard - Customizable Finance Dashboard
          </p>
          <p className="mt-1">
            Built with Next.js, Tailwind CSS, and Zustand
          </p>
        </div>
      </main>
    </div>
  );
}
