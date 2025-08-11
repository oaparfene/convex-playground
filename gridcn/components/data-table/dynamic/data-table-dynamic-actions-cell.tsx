import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRowActions } from '@/hooks/use-row-actions';
import { Row } from '@tanstack/react-table';
import { Copy, Ellipsis } from 'lucide-react';
import * as React from 'react';
import { DataTableDeleteDialog } from '@/components/data-table/data-table-delete-dialog';

export interface ActionsCellProps {
  row: Row<Record<string, any>>;
  tableName: string;
  onEdit?: (value: Record<string, any>) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (value: Record<string, any>) => void;
}

export function ActionsCell({ 
  row, 
  tableName, 
  onEdit, 
  onDelete, 
  onDuplicate 
}: ActionsCellProps) {
  const { handleCopyId, handleEdit, handleDelete, handleDuplicate } = useRowActions({
    tableName,
    onEdit,
    onDelete,
    onDuplicate,
  });
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const idStr = String(row.original?._id ?? '');
  const displayId = idStr.length > 12 ? `${idStr.slice(0, 6)}…${idStr.slice(-4)}` : idStr;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="size-7" mode="icon" variant="ghost">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuLabel className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">ROW ID:</span>
          <span className="font-mono text-xs truncate max-w-[120px] text-foreground" title={idStr}>
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
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleEdit(row.original)}>
          Edit Row
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDuplicate(row.original)}>
          Duplicate Row
        </DropdownMenuItem>
        <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
          Delete Row
        </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DataTableDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        selectedCount={1}
        isDeleting={isDeleting}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            await handleDelete(row.original);
          } finally {
            setIsDeleting(false);
          }
        }}
      />
    </>
  );
}
