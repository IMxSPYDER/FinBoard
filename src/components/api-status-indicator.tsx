'use client';

import { useDashboardStore } from '@/store/dashboard-store';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ApiStatusIndicator() {
  const { apiConfig } = useDashboardStore();
  
  const hasApiKey = Boolean(apiConfig.alphaVantageKey || apiConfig.finnhubKey);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium',
              hasApiKey
                ? 'bg-positive/10 text-positive'
                : 'bg-warning/10 text-warning'
            )}
          >
            {hasApiKey ? (
              <>
                <Wifi className="h-3 w-3" />
                <span>Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>Demo</span>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {hasApiKey
            ? 'Connected to stock API'
            : 'Using demo data - Add API keys in Settings'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
