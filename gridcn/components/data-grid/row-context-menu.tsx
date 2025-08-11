import * as React from 'react';
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuSeparator, 
  ContextMenuTrigger,
  ContextMenuLabel,
} from '@/components/ui/context-menu';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useRowActions } from '@/hooks/use-row-actions';
import { DataTableDeleteDialog } from '@/components/data-table/data-table-delete-dialog';

export interface RowContextMenuProps {
  children: React.ReactNode;
  row: Record<string, any>;
  tableName: string;
  onEdit?: (value: Record<string, any>) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (value: Record<string, any>) => void;
}

export function RowContextMenu({ 
  children, 
  row, 
  tableName, 
  onEdit, 
  onDelete,
  onDuplicate
}: RowContextMenuProps) {
  const { handleCopyId, handleEdit, handleDelete, handleDuplicate } = useRowActions({
    tableName,
    onEdit,
    onDelete,
    onDuplicate,
  });
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const idStr = String(row?._id ?? '');
  const displayId = idStr.length > 12 ? `${idStr.slice(0, 6)}…${idStr.slice(-4)}` : idStr;

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs">ROW ID:</span>
            <span className="font-mono text-xs truncate max-w-[120px]" title={idStr}>
              {displayId}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => handleCopyId(row)}
              aria-label="Copy row ID"
            >
              <Copy className="size-3.5" />
            </Button>
          </ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => handleEdit(row)}>
            Edit Row
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleDuplicate(row)}>
            Duplicate Row
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            Delete Row
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <DataTableDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        selectedCount={1}
        isDeleting={isDeleting}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            await handleDelete(row);
          } finally {
            setIsDeleting(false);
          }
        }}
      />
    </>
  );
}
