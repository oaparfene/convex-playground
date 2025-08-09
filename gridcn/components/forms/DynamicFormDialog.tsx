'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Registry } from '@/lib/registry';
import { DynamicForm } from './DynamicForm';
import type { Table } from '@tanstack/react-table';

export type DynamicFormDialogProps = {
  tableName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'create' | 'edit';
  initialValues?: Record<string, any>;
  title?: string;
  onSubmit: (value: Record<string, any>) => Promise<void> | void;
  table: Table<any>;
};

export function DynamicFormDialog({
  tableName,
  open,
  onOpenChange,
  mode = 'create',
  initialValues,
  title,
  onSubmit,
  table,
}: DynamicFormDialogProps) {
  const tableLabel = Registry.describe().tables[tableName]?.label || tableName;
  const computedTitle = title ?? (mode === 'edit' ? `Edit ${tableLabel}` : `New ${tableLabel}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-full h-[80vh] p-0 overflow-hidden">
        <ScrollArea className="flex h-full flex-col">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>{computedTitle}</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <DynamicForm
              table={table}
              tableName={tableName}
              initialValues={initialValues}
              onCancel={() => onOpenChange(false)}
              onSubmit={onSubmit}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}


