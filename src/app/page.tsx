'use client';

import { useState } from 'react';
import { useDashboardStore } from '@/store/dashboard-store';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { DashboardGrid } from '@/components/dashboard-grid';
import { WidgetBuilderModal } from '@/components/widget-builder-modal';
import { cn } from '@/lib/utils';
import type { Widget, WidgetType } from '@/types';

export default function DashboardPage() {
  const { sidebarOpen } = useDashboardStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType | undefined>();
  const [editWidget, setEditWidget] = useState<Widget | undefined>();
  
  const handleAddWidget = (type: WidgetType) => {
    setSelectedWidgetType(type);
    setEditWidget(undefined);
    setModalOpen(true);
  };
  
  const handleEditWidget = (widget: Widget) => {
    setEditWidget(widget);
    setSelectedWidgetType(undefined);
    setModalOpen(true);
  };
  
  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setSelectedWidgetType(undefined);
      setEditWidget(undefined);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <div className="flex flex-1">

       <aside className="sticky top-14 h-screen overflow-hidden">
          <Sidebar onAddWidget={handleAddWidget} />
        </aside>
        <main
          className={cn(
            'flex-1 overflow-y-auto" transition-all duration-300',
            sidebarOpen ? 'lg:ml-0' : ''
          )}
        >
          <div className="h-full min-h-[calc(100vh-3.5rem)] bg-muted/30">
            <DashboardGrid onEditWidget={handleEditWidget} />
          </div>
        </main>
      </div>
      
      <WidgetBuilderModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        widgetType={selectedWidgetType}
        editWidget={editWidget}
      />
    </div>
  );
}
