import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuSeparator, 
  ContextMenuTrigger 
} from '@/components/ui/context-menu';
import { useRowActions } from '@/hooks/use-row-actions';

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

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => handleEdit(row)}>
          Edit
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleDuplicate(row)}>
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleCopyId(row)}>
          Copy ID
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onClick={() => handleDelete(row)}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
