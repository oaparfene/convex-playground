'use client';

import { useMemo, useState, useRef } from 'react';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardHeading, CardTable, CardToolbar } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/components/ui/data-grid-table';
import { DataGridTableDnd } from '@/components/ui/data-grid-table-dnd';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import { RiCheckboxCircleFill } from '@remixicon/react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Ellipsis, Filter, Search, UserRoundPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Registry } from '@/lib/registry';
import { FieldRenderer } from '@/components/field-renderer/FieldRenderer';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { DynamicFormDialog } from '@/components/forms/DynamicFormDialog';
import { PopoverForm, PopoverFormButton } from '@/components/ui/popover-form';
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuSeparator, 
  ContextMenuTrigger 
} from '@/components/ui/context-menu';

interface DynamicDataGridProps {
  tableName: string;
  data: Record<string, any>[];
}

// Reusable hook for row actions
function useRowActions(
  tableName: string, 
  onEdit?: (value: Record<string, any>) => void, 
  onDelete?: (id: string) => void,
  onDuplicate?: (value: Record<string, any>) => void
) {
  const { copy } = useCopyToClipboard();
  
  const handleCopyId = (row: Record<string, any>) => {
    const id = row._id || row.id || 'unknown';
    copy(id);
    const message = `${tableName} ID successfully copied: ${id}`;
    toast.custom(
      (t) => (
        <Alert variant="mono" icon="primary" close={false} onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <RiCheckboxCircleFill />
          </AlertIcon>
          <AlertTitle>{message}</AlertTitle>
        </Alert>
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

function ActionsCell({ row, tableName, onEdit, onDelete, onDuplicate }: { 
  row: Row<Record<string, any>>; 
  tableName: string; 
  onEdit?: (value: Record<string, any>) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (value: Record<string, any>) => void;
}) {
  const { handleCopyId, handleEdit, handleDelete, handleDuplicate } = useRowActions(tableName, onEdit, onDelete, onDuplicate);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-7" mode="icon" variant="ghost">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuItem onClick={() => handleEdit(row.original)}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDuplicate(row.original)}>Duplicate</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCopyId(row.original)}>Copy ID</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => handleDelete(row.original)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Row context menu component
function RowContextMenu({ 
  children, 
  row, 
  tableName, 
  onEdit, 
  onDelete,
  onDuplicate
}: { 
  children: React.ReactNode; 
  row: Record<string, any>; 
  tableName: string; 
  onEdit?: (value: Record<string, any>) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (value: Record<string, any>) => void;
}) {
  const { handleCopyId, handleEdit, handleDelete, handleDuplicate } = useRowActions(tableName, onEdit, onDelete, onDuplicate);

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

// Helper function to format field names for display
function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to render cell content based on data type
function renderCellContent(value: any, fieldName: string): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  // Handle arrays (like sensors array in aircrafts)
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item, index) => (
          <Badge key={index} variant="secondary" size="sm">
            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
          </Badge>
        ))}
      </div>
    );
  }

  // Handle objects
  if (typeof value === 'object') {
    return <span className="font-mono text-xs">{JSON.stringify(value)}</span>;
  }

  // Handle numbers
  if (typeof value === 'number') {
    // Check if it's a currency-like field
    if (fieldName.toLowerCase().includes('balance') || fieldName.toLowerCase().includes('price')) {
      return <span className="font-mono">${value.toFixed(2)}</span>;
    }
    return <span className="font-mono">{value}</span>;
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return (
      <Badge variant={value ? 'primary' : 'secondary'} size="sm">
        {value ? 'Yes' : 'No'}
      </Badge>
    );
  }

  // Handle strings
  const stringValue = String(value);
  
  // Email detection
  if (fieldName.toLowerCase().includes('email') || stringValue.includes('@')) {
    return <span className="text-blue-600 underline">{stringValue}</span>;
  }

  // Date detection
  if (fieldName.toLowerCase().includes('time') || fieldName.toLowerCase().includes('date')) {
    try {
      const date = new Date(stringValue);
      if (!isNaN(date.getTime())) {
        return <span className="font-mono">{date.toLocaleDateString()}</span>;
      }
    } catch {
      // Not a valid date, continue with regular string handling
    }
  }

  // Country codes or flags
  if (fieldName.toLowerCase().includes('country') || /^[\u{1F1E6}-\u{1F1FF}]{2}$/u.test(stringValue)) {
    return <span className="text-lg">{stringValue}</span>;
  }

  return <span>{stringValue}</span>;
}

// Generate columns from registry meta schema
function generateColumnsFromMeta(tableName: string): ColumnDef<Record<string, any>>[] {
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
    columns.push({
      accessorKey: key,
      id: key,
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
  });

  return columns;
}

export function DynamicDataGrid({ tableName, data }: DynamicDataGridProps) {
  const mutateUpdate = useMutation(api.registry.update);
  const mutateInsert = useMutation(api.registry.insert);
  const mutateDelete = useMutation(api.registry.remove);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, any> | null>(null);
  const [duplicatingRow, setDuplicatingRow] = useState<Record<string, any> | null>(null);

  // Get table metadata to identify relation fields
  const tableMeta = useMemo(() => {
    return Registry.describe().tables[tableName];
  }, [tableName]);

  // Get all unique relation tables that we need to fetch
  const relationTables = useMemo(() => {
    if (!tableMeta) return [];
    
    const tables = new Set<string>();
    Object.values(tableMeta.fields).forEach(field => {
      if (field.relation?.table) {
        tables.add(field.relation.table);
      }
    });
    return Array.from(tables);
  }, [tableMeta]);

  // Fetch all related table data
  const aircraftsData = useQuery(api.registry.list, relationTables.includes('aircrafts') ? { table: 'aircrafts' } : 'skip');
  const sensorsData = useQuery(api.registry.list, relationTables.includes('sensors') ? { table: 'sensors' } : 'skip');
  const callsignsData = useQuery(api.registry.list, relationTables.includes('callsigns') ? { table: 'callsigns' } : 'skip');

  // Create lookup for all related data
  const relatedDataLookup = useMemo(() => {
    const lookup: Record<string, Record<string, any>[]> = {};
    if (aircraftsData) lookup.aircrafts = aircraftsData;
    if (sensorsData) lookup.sensors = sensorsData;
    if (callsignsData) lookup.callsigns = callsignsData;
    return lookup;
  }, [aircraftsData, sensorsData, callsignsData]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    const searchLower = searchQuery.toLowerCase();
    return data.filter((item) => {
      // Build searchable content including original values
      const searchableContent: string[] = [];
      
      // Add all original field values
      Object.entries(item).forEach(([fieldName, value]) => {
        if (value != null) {
          if (Array.isArray(value)) {
            searchableContent.push(...value.map(v => String(v)));
          } else {
            searchableContent.push(String(value));
          }
        }
      });

      // Add resolved display values for relation fields
      if (tableMeta) {
        Object.entries(tableMeta.fields).forEach(([fieldName, field]) => {
          if (field.relation && item[fieldName] != null) {
            const relatedData = relatedDataLookup[field.relation.table];
            const displayField = field.relation.displayField;
            
            if (relatedData && displayField) {
              if (Array.isArray(item[fieldName])) {
                // Handle multi-select relation (id_multi_select)
                item[fieldName].forEach((id: string) => {
                  const relatedItem = relatedData.find((r: any) => r._id === id);
                  if (relatedItem && relatedItem[displayField]) {
                    searchableContent.push(String(relatedItem[displayField]));
                  }
                });
              } else {
                // Handle single relation (id_select)
                const relatedItem = relatedData.find((r: any) => r._id === item[fieldName]);
                if (relatedItem && relatedItem[displayField]) {
                  searchableContent.push(String(relatedItem[displayField]));
                }
              }
            }
          }
        });
      }

      // Check if search query matches any of the searchable content
      return searchableContent
        .join(' ')
        .toLowerCase()
        .includes(searchLower);
    });
  }, [data, searchQuery, tableMeta, relatedDataLookup]);

  // Define the edit and delete handlers
  const handleOpenEdit = (value: Record<string, any>) => {
    setEditingRow(value);
    setShowEditModal(true);
  };

  const handleDeleteRow = async (id: string) => {
    try {
      await mutateDelete({ table: tableName, id: id as any });
      toast.success('Row deleted');
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed');
    }
  };

  const handleDuplicateRow = (value: Record<string, any>) => {
    setDuplicatingRow(value);
    setShowDuplicateModal(true);
  };

  const columns = useMemo(() => {
    const metaColumns = generateColumnsFromMeta(tableName);
    if (metaColumns.length > 0) return metaColumns;
    return [];
  }, [data, tableName, handleOpenEdit, handleDeleteRow, handleDuplicateRow]);

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      // Prevent moving locked columns
      const locked = ['__rowSelection__', '__rowActions__'];
      if (locked.includes(String(active.id)) || locked.includes(String(over.id))) {
        return;
      }
      setColumnOrder((currentOrder) => {
        const oldIndex = currentOrder.indexOf(active.id as string);
        const newIndex = currentOrder.indexOf(over.id as string);
        if (oldIndex === -1 || newIndex === -1) return currentOrder;
        return arrayMove(currentOrder, oldIndex, newIndex);
      });
    }
  };

  const table = useReactTable({
    columns,
    data: filteredData,
    pageCount: Math.ceil((filteredData?.length || 0) / pagination.pageSize),
    getRowId: (row: Record<string, any>) => row._id || row.id || Math.random().toString(),
    state: {
      pagination,
      sorting,
      columnOrder,
    },
    meta: {
      updateRow: async (id: string, patch: Record<string, any>) => {
        try {
          console.log("updateRow", id, patch);
          await mutateUpdate({ table: tableName, id: id as any, patch });
          toast.success('Row updated');
        } catch (e: any) {
          toast.error(e?.message || 'Update failed');
        }
      },
      insertRow: async (value: Record<string, any>) => {
        try {
          await mutateInsert({ table: tableName, value });
          toast.success('Row inserted');
        } catch (e: any) {
          toast.error(e?.message || 'Insert failed');
        }
      },
      deleteRow: handleDeleteRow,
      duplicateRow: handleDuplicateRow,
      openEdit: handleOpenEdit,
    },
    columnResizeMode: 'onChange',
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DataGrid
      table={table}
      recordCount={filteredData?.length || 0}
      tableLayout={{
        columnsPinnable: true,
        columnsResizable: true,
        columnsMovable: true,
        columnsVisibility: true,
        columnsDraggable: true,
      }}
    >
      <Card>
        <CardHeader className="py-4">
          <CardHeading>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-9 w-40"
                />
                {searchQuery.length > 0 && (
                  <Button
                    mode="icon"
                    variant="ghost"
                    className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => setSearchQuery('')}
                  >
                    <X />
                  </Button>
                )}
              </div>
            </div>
          </CardHeading>
          <CardToolbar>
            <Button onClick={() => setShowAddModal(true)}>
              <UserRoundPlus />
              Add new
            </Button>
          </CardToolbar>
        </CardHeader>
        <CardTable>
          <ScrollArea>
            <DataGridTableDnd handleDragEnd={handleDragEnd} />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardTable>
        <CardFooter>
          <DataGridPagination />
        </CardFooter>
      </Card>
      <DynamicFormDialog
        tableName={tableName}
        mode="create"
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={async (value) => {
          try {
            await mutateInsert({ table: tableName, value });
            setShowAddModal(false);
            toast.success('Row inserted');
          } catch (e: any) {
            toast.error(e?.message || 'Insert failed');
          }
        }}
      />

      <DynamicFormDialog
        tableName={tableName}
        mode="edit"
        open={showEditModal}
        onOpenChange={(o) => { setShowEditModal(o); if (!o) setEditingRow(null); }}
        initialValues={editingRow ?? undefined}
        onSubmit={async (value) => {
          if (!editingRow?._id) {
            toast.error('Missing row id');
            return;
          }
          try {
            console.log("value", value);
            await mutateUpdate({ table: tableName, id: editingRow._id as any, patch: value });
            console.log("updated");
            setShowEditModal(false);
            setEditingRow(null);
            toast.success('Row updated');
          } catch (e: any) {
            toast.error(e?.message || 'Update failed');
          }
        }}
      />

      <DynamicFormDialog
        tableName={tableName}
        mode="create"
        title="Duplicate Row"
        open={showDuplicateModal}
        onOpenChange={(o) => { setShowDuplicateModal(o); if (!o) setDuplicatingRow(null); }}
        initialValues={duplicatingRow ?? undefined}
        onSubmit={async (value) => {
          try {
            await mutateInsert({ table: tableName, value });
            setShowDuplicateModal(false);
            setDuplicatingRow(null);
            toast.success('Row duplicated successfully');
          } catch (e: any) {
            toast.error(e?.message || 'Duplicate failed');
          }
        }}
      />
    </DataGrid>
  );
}
