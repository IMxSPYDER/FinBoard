'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useDashboardStore } from '@/store/dashboard-store';
import { WidgetCard } from '@/components/widget-card';
import { StockTableWidget } from '@/components/widgets/stock-table-widget';
import { FinanceCardWidget } from '@/components/widgets/finance-card-widget';
import { StockChartWidget } from '@/components/widgets/stock-chart-widget';
import type { Widget } from '@/types';
import { LayoutGrid } from 'lucide-react';

interface DashboardGridProps {
  onEditWidget: (widget: Widget) => void;
}

export function DashboardGrid({ onEditWidget }: DashboardGridProps) {
  const { widgets, moveWidget, removeWidget } = useDashboardStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);
  
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const oldWidget = widgets[oldIndex];
        const newWidget = widgets[newIndex];
        
        // Swap positions
        moveWidget(oldWidget.id, newWidget.position);
        moveWidget(newWidget.id, oldWidget.position);
      }
    }
  }, [widgets, moveWidget]);
  
  const activeWidget = activeId ? widgets.find((w) => w.id === activeId) : null;
  
  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case 'stock-table':
        return <StockTableWidget widget={widget} />;
      case 'finance-card':
        return <FinanceCardWidget widget={widget} />;
      case 'chart':
        return <StockChartWidget widget={widget} />;
      default:
        return null;
    }
  };
  
  if (widgets.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <LayoutGrid className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">No widgets yet</h3>
          <p className="max-w-md text-muted-foreground">
            Add widgets from the sidebar to start building your personalized finance dashboard.
            Choose from stock tables, finance cards, and charts.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
        <div className="grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {widgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              onEdit={() => onEditWidget(widget)}
              onDelete={() => removeWidget(widget.id)}
            >
              {renderWidgetContent(widget)}
            </WidgetCard>
          ))}
        </div>
      </SortableContext>
      
      <DragOverlay>
        {activeWidget ? (
          <div className="rounded-lg border border-border bg-card p-4 opacity-80 shadow-xl">
            <div className="font-medium">{activeWidget.title}</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
