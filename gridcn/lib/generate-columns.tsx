import { useState, useRef } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridTableRowSelect, DataGridTableRowSelectAll } from '@/components/ui/data-grid-table';
import { PopoverForm, PopoverFormButton } from '@/components/ui/popover-form';
import { FieldRenderer } from '@/components/field-renderer/FieldRenderer';
import { Registry } from '@/lib/registry';
import { ActionsCell } from '@/components/data-grid/actions-cell';
import { RowContextMenu } from '@/components/data-grid/row-context-menu';

// Helper function to format field names for display
function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Generate columns from registry meta schema
export function generateColumnsFromMeta(tableName: string): ColumnDef<Record<string, any>>[] {
  const meta = Registry.describe().tables[tableName];
  if (!meta) return [];

  const columns: ColumnDef<Record<string, any>>[] = [
    {
      accessorKey: '_id',
      id: '__rowSelection__',
      header: () => <DataGridTableRowSelectAll />,
      cell: ({ row, table }) => (
        <RowContextMenu
          row={row.original}
          tableName={tableName}
          onEdit={(table.options.meta as any)?.openEdit}
          onDelete={(table.options.meta as any)?.deleteRow}
          onDuplicate={(table.options.meta as any)?.duplicateRow}
        >
          <div className="w-full">
            <DataGridTableRowSelect row={row} />
          </div>
        </RowContextMenu>
      ),
      enableSorting: false,
      size: 35,
      meta: { headerClassName: '', cellClassName: '' },
      enableResizing: false,
    },
  ];

  // Sort fields: _id first, then others alphabetically
  const fieldEntries = Object.entries(meta.fields);
  fieldEntries.sort(([a], [b]) => {
    if (a === '_id') return -1;
    if (b === '_id') return 1;
    return a.localeCompare(b);
  });

  for (const [key, field] of fieldEntries) {
    // Determine filter variant based on field type
    const getFilterVariant = (field: any) => {
      if (field.type === 'boolean') return 'boolean';
      if (field.type === 'number' || field.type === 'bigint') return 'number';
      if (field.type === 'array' && field.optional) return 'multiSelect';
      if (field.type === 'union' && field.members?.some((m: any) => m.type === 'literal')) return 'select';
      return 'text';
    };

    columns.push({
      accessorKey: key,
      id: key,
      enableColumnFilter: key !== '_id', // Enable filtering for all columns except _id
      meta: {
        label: field.render?.label || formatFieldName(key),
        variant: getFilterVariant(field),
      },
      header: ({ column }) => (
        <DataGridColumnHeader title={field.render?.label || formatFieldName(key)} visibility={true} column={column} />
      ),
      cell: ({ row, table }) => {
        const value = row.original[key];
        const [popoverOpen, setPopoverOpen] = useState(false);
        const [localValue, setLocalValue] = useState(value);
        const [submitting, setSubmitting] = useState(false);
        const [showSuccess, setShowSuccess] = useState(false);
        const update = (table.options.meta as any)?.updateRow;

        if (!field.behaviors?.editable || key === '_id') {
          return (
            <RowContextMenu
              row={row.original}
              tableName={tableName}
              onEdit={(table.options.meta as any)?.openEdit}
              onDelete={(table.options.meta as any)?.deleteRow}
              onDuplicate={(table.options.meta as any)?.duplicateRow}
            >
              <div className="w-full">
                <FieldRenderer field={field} value={value} onChange={() => {}} isForm={false} isEditing={false} />
              </div>
            </RowContextMenu>
          );
        }

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setSubmitting(true);
          try {
            await update?.(row.original._id, { [key]: localValue });
            setShowSuccess(true);
            setTimeout(() => {
              setPopoverOpen(false);
              setShowSuccess(false);
            }, 1000);
          } catch (error) {
            console.error('Update failed:', error);
          } finally {
            setSubmitting(false);
          }
        };

        const handleOpenChange = (open: boolean) => {
          setPopoverOpen(open);
          if (open) {
            setLocalValue(value);
            setShowSuccess(false);
          }
        };

        const triggerRef = useRef<HTMLDivElement>(null);

        return (
          <PopoverForm
            open={popoverOpen}
            setOpen={handleOpenChange}
            showSuccess={showSuccess}
            title={`Edit ${field.render?.label || key}`}
            width="320px"
            height="auto"
            triggerRef={triggerRef}
            openChild={
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                <div className="mt-6">
                  <FieldRenderer
                    field={field}
                    value={localValue}
                    onChange={setLocalValue}
                    isForm={true}
                    isEditing={true}
                    autoFocus={true}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPopoverOpen(false)}
                    className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <PopoverFormButton loading={submitting} text="Save" />
                </div>
              </form>
            }
          >
            <RowContextMenu
              row={row.original}
              tableName={tableName}
              onEdit={(table.options.meta as any)?.openEdit}
              onDelete={(table.options.meta as any)?.deleteRow}
              onDuplicate={(table.options.meta as any)?.duplicateRow}
            >
              <div
                ref={triggerRef}
                className="w-full cursor-pointer rounded px-2 py-1 hover:bg-muted/50 min-h-[32px] flex items-center"
                onClick={() => setPopoverOpen(true)}
              >
                <FieldRenderer field={field} value={value} onChange={() => {}} isForm={false} isEditing={false} />
              </div>
            </RowContextMenu>
          </PopoverForm>
        );
      },
      size: 220,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
    });
  }

  columns.push({
    id: '__rowActions__',
    header: '',
    cell: ({ row, table }) => (
      <ActionsCell 
        row={row} 
        tableName={tableName} 
        onEdit={(table.options.meta as any)?.openEdit}
        onDelete={(table.options.meta as any)?.deleteRow}
        onDuplicate={(table.options.meta as any)?.duplicateRow}
      />
    ),
    size: 60,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    enableColumnFilter: false,
  });

  return columns;
}
