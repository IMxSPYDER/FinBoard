'use client';

import { type ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDashboardStore } from '@/store/dashboard-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { GripVertical, MoreVertical, Pencil, Copy, Trash2, RefreshCw } from 'lucide-react';
import type { Widget } from '@/types';

interface WidgetCardProps {
  widget: Widget;
  children: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}

export function WidgetCard({ widget, children, onEdit, onDelete }: WidgetCardProps) {
  const { duplicateWidget } = useDashboardStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const getColSpan = () => {
    if (widget.position.w >= 2) return 'md:col-span-2';
    return '';
  };
  
  const getRowSpan = () => {
    if (widget.position.h >= 2) return 'row-span-2';
    return '';
  };
  
  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg',
        isDragging && 'opacity-50 shadow-2xl',
        getColSpan(),
        getRowSpan()
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none rounded p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <div>
            <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
            {widget.description && (
              <p className="text-xs text-muted-foreground">{widget.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {widget.refreshInterval > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              <RefreshCw className="h-3 w-3" />
              <span>{widget.refreshInterval / 1000}s</span>
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Widget options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Widget
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateWidget(widget.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto">
        {children}
      </CardContent>
    </Card>
  );
}
