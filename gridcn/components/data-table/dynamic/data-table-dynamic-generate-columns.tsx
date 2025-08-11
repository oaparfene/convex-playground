import { useState, useRef } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridTableRowSelect, DataGridTableRowSelectAll } from '@/components/ui/data-grid-table';
import { PopoverForm, PopoverFormButton } from '@/components/ui/popover-form';
import { FieldRenderer } from '@/components/field-renderer/FieldRenderer';
import { Registry } from '@/lib/registry';
import { ActionsCell } from '@/components/data-table/dynamic/data-table-dynamic-actions-cell';
import { RowContextMenu } from '@/components/data-table/dynamic/data-table-dynamic-row-context-menu';
import {
  Text,
  Hash,
  Calendar,
  Clock,
  ToggleLeft,
  List,
  ChevronDown,
  Link,
  type LucideIcon
} from 'lucide-react';
import { renderMetaIcon } from '@/components/ui/data-grid-grouped-row';

// Helper function to format field names for display
export function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to get appropriate icon for field types
function getFieldIcon(field: any, key: string): LucideIcon {
  if (field.type.type === 'boolean') return ToggleLeft;
  if (field.type.type === 'number' || field.type.type === 'bigint') return Hash;
  if (key.toLowerCase().includes('time') || key.toLowerCase().includes('date')) return Calendar;
  if (field.type.type === 'array') return List;
  if (field.type.type === 'union') return ChevronDown;
  if (field.relation) return Link;
  return Text;
}

// Generate columns from registry meta schema
export function generateColumnsFromMeta(
  tableName: string,
  relatedDataLookup: Record<string, Record<string, any>[]>,
  data?: Record<string, any>[]
): ColumnDef<Record<string, any>>[] {
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
    // Determine filter variant and metadata based on field type
    const getFilterMetadata = (field: any, key: string) => {
      const baseLabel = field.render?.label || formatFieldName(key);
      const icon = getFieldIcon(field, key);

      // Boolean fields
      if (field.type.type === 'boolean') {
        return {
          label: baseLabel,
          variant: 'boolean' as const,
          placeholder: `Filter by ${baseLabel.toLowerCase()}...`,
          icon,
        };
      }

      // Number fields
      if (field.type.type === 'number' || field.type.type === 'bigint') {
        // Check if this should be a range filter based on data spread
        if (data && data.length > 0) {
          const values = data
            .map(row => row[key])
            .filter(val => typeof val === 'number' && !isNaN(val));

          if (values.length > 0) {
            const min = Math.min(...values);
            const max = Math.max(...values);

            // Use range filter if there's meaningful spread (more than 10 unique values or wide range)
            const uniqueValues = new Set(values);
            if (uniqueValues.size > 10 || (max - min) > 10) {
              return {
                label: baseLabel,
                variant: 'range' as const,
                placeholder: `Filter ${baseLabel.toLowerCase()}...`,
                range: [min, max] as [number, number],
                icon,
              };
            }
          }
        }

        return {
          label: baseLabel,
          variant: 'number' as const,
          placeholder: `Enter ${baseLabel.toLowerCase()}...`,
          icon,
        };
      }

      // Date/time fields
      if (key.toLowerCase().includes('time') || key.toLowerCase().includes('date') || field.type === 'number' && key.includes('Time')) {
        return {
          label: baseLabel,
          variant: 'dateRange' as const,
          placeholder: `Select ${baseLabel.toLowerCase()}...`,
          icon,
        };
      }

      // Array fields (multi-select)
      if (field.type.type === 'array') {
        return {
          label: baseLabel,
          variant: 'multiSelect' as const,
          placeholder: `Select ${baseLabel.toLowerCase()}...`,
          options: [], // Will be populated dynamically if needed
          icon,
        };
      }

      // Union fields with literals (select)
      if (field.type.type === 'enum') {
        const literals = field.validation.zod._def.values;

        // Calculate counts if data is available
        let options = literals.map((m: any) => {
          const value = String(m);
          let count = 0;

          if (data && data.length > 0) {
            count = data.filter(row => String(row[key]) === value).length;
          }

          return {
            label: value.charAt(0).toUpperCase() + value.slice(1),
            value,
            ...(count > 0 && { count }),
          };
        });

        return {
          label: baseLabel,
          variant: 'select' as const,
          placeholder: `Select ${baseLabel.toLowerCase()}...`,
          options,
          icon,
        };
      }

      // ID fields that reference other tables (relation fields)
      if (field.relation) {
        const relatedData = relatedDataLookup[field.relation.table];
        const displayField = field.relation.displayField;

        const options = relatedData.map((item: any) => ({
          label: displayField ? String(item[displayField] || item._id) : String(item._id),
          value: String(item._id),
        }));

        const result = {
          label: baseLabel,
          variant: field.relation.cardinality === 'many' ? 'multiSelect' as const : 'select' as const,
          placeholder: `Select ${baseLabel.toLowerCase()}...`,
          options,
          icon,
        }

        return result;
      }

      // Default to text
      return {
        label: baseLabel,
        variant: 'text' as const,
        placeholder: `Search ${baseLabel.toLowerCase()}...`,
        icon,
      };
    };

    const filterMeta = getFilterMetadata(field, key);

    columns.push({
      accessorKey: key,
      id: key,
      enableColumnFilter: key !== '_id', // Enable filtering for all columns except _id
      meta: filterMeta,
      header: ({ column }) => {
        const Icon = (column.columnDef.meta as any)?.icon as ((props: { className?: string }) => React.ReactElement) | undefined;
        return (
          <DataGridColumnHeader
            title={field.render?.label || formatFieldName(key)}
            visibility={true}
            column={column}
            icon={Icon ? <Icon className="size-3.5 opacity-60" /> : undefined}
          />
        );
      },
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
                <FieldRenderer field={field} value={value} onChange={() => { }} isForm={false} isEditing={false} />
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

        const helpText = (field.validation?.zod as any)?.description ?? (field.validation?.zod as any)?._def?.description;

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
                  {helpText && (
                    <p className="text-muted-foreground text-xs">{helpText}</p>
                  )}
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
                <FieldRenderer field={field} value={value} onChange={() => { }} isForm={false} isEditing={false} />
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
