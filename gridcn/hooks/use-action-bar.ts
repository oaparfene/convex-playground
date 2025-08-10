import { useState, useCallback } from 'react';
import type { Table } from '@tanstack/react-table';

export function useActionBar<TData>({
  table,
  onDelete,
  onBatchUpdate,
}: {
  table: Table<TData>;
  onDelete: (ids: string[]) => Promise<void>;
  onBatchUpdate: (fieldKey: string, value: any, selectedIds: string[]) => Promise<void>;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleDeleteClick = useCallback(() => {
    if (selectedCount > 0) {
      setShowDeleteDialog(true);
    }
  }, [selectedCount]);

  const handleDeleteConfirm = useCallback(async () => {
    if (selectedCount === 0) return;

    setIsDeleting(true);
    try {
      const selectedIds = selectedRows.map((row) => (row.original as any)._id);
      await onDelete(selectedIds);
      table.resetRowSelection();
    } finally {
      setIsDeleting(false);
    }
  }, [selectedRows, onDelete, table, selectedCount]);

  const handleBatchUpdate = useCallback(async (
    fieldKey: string,
    value: any,
    selectedIds: string[]
  ) => {
    await onBatchUpdate(fieldKey, value, selectedIds);
  }, [onBatchUpdate]);

  return {
    selectedCount,
    showDeleteDialog,
    setShowDeleteDialog,
    isDeleting,
    handleDeleteClick,
    handleDeleteConfirm,
    handleBatchUpdate,
  };
}
