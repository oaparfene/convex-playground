import React from 'react';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { RiCheckboxCircleFill } from '@remixicon/react';
import { toast } from 'sonner';

export interface UseRowActionsProps {
  tableName: string;
  onEdit?: (value: Record<string, any>) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (value: Record<string, any>) => void;
}

export function useRowActions({
  tableName,
  onEdit,
  onDelete,
  onDuplicate,
}: UseRowActionsProps) {
  const { copy } = useCopyToClipboard();
  
  const handleCopyId = (row: Record<string, any>) => {
    const id = row._id || row.id || 'unknown';
    copy(id);
    const message = `${tableName} ID successfully copied: ${id}`;
    toast.custom(
      (t) => (
        React.createElement(Alert, {
          variant: "mono",
          icon: "primary",
          close: false,
          onClose: () => toast.dismiss(t)
        }, [
          React.createElement(AlertIcon, { key: "icon" }, React.createElement(RiCheckboxCircleFill)),
          React.createElement(AlertTitle, { key: "title" }, message)
        ])
      ),
      {
        position: 'top-center',
      },
    );
  };

  const handleEdit = (row: Record<string, any>) => {
    onEdit?.(row);
  };

  const handleDelete = (row: Record<string, any>) => {
    const id = row._id || row.id;
    if (id) {
      onDelete?.(id);
    }
  };

  const handleDuplicate = (row: Record<string, any>) => {
    // Create a copy without unique fields like _id, _creationTime, etc.
    const { _id, _creationTime, id, ...duplicateData } = row;
    onDuplicate?.(duplicateData);
  };

  return {
    handleCopyId,
    handleEdit,
    handleDelete,
    handleDuplicate,
  };
}
