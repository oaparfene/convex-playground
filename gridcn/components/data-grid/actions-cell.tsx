import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRowActions } from '@/hooks/use-row-actions';
import { Row } from '@tanstack/react-table';
import { Ellipsis } from 'lucide-react';

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-7" mode="icon" variant="ghost">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuItem onClick={() => handleEdit(row.original)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDuplicate(row.original)}>
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCopyId(row.original)}>
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => handleDelete(row.original)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
