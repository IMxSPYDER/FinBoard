'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDashboardStore } from '@/store/dashboard-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sun, 
  Moon, 
  Settings, 
  Download, 
  Upload, 
  LayoutGrid,
  Menu,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { ApiStatusIndicator } from '@/components/api-status-indicator';

export function Header() {
  const { theme, toggleTheme, sidebarOpen, setSidebarOpen, exportConfig, importConfig, loadTemplate, widgets } = useDashboardStore();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importValue, setImportValue] = useState('');
  const [importError, setImportError] = useState('');
  
  const handleExport = () => {
    const config = exportConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finboard-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleImport = () => {
    setImportError('');
    const success = importConfig(importValue);
    if (success) {
      setImportDialogOpen(false);
      setImportValue('');
    } else {
      setImportError('Invalid configuration format');
    }
  };
  
  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">FinBoard</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ApiStatusIndicator />
          </div>
          
          <div className="hidden items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground sm:flex">
            <Activity className="h-3.5 w-3.5 text-positive" />
            <span className="font-medium">{widgets.length}</span>
            <span className="text-muted-foreground">widgets</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <LayoutGrid className="h-5 w-5" />
                <span className="sr-only">Templates</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => loadTemplate('trader')}>
                Trader Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => loadTemplate('investor')}>
                Investor Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => loadTemplate('analyst')}>
                Analyst Template
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => loadTemplate('custom')}>
                Clear Dashboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Download className="h-5 w-5" />
                <span className="sr-only">Import/Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export Configuration
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import Configuration
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
        </div>
      </header>
      
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Configuration</DialogTitle>
            <DialogDescription>
              Paste your exported dashboard configuration JSON below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste configuration JSON here..."
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            {importError && (
              <p className="text-sm text-destructive">{importError}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport}>Import</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
