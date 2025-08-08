'use client';

import { useMemo, useState } from 'react';
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

interface DynamicDataGridProps {
  tableName: string;
  data: Record<string, any>[];
}

function ActionsCell({ row, tableName }: { row: Row<Record<string, any>>; tableName: string }) {
  const { copy } = useCopyToClipboard();
  const handleCopyId = () => {
    const id = row.original._id || row.original.id || 'unknown';
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-7" mode="icon" variant="ghost">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuItem onClick={() => {}}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyId}>Copy ID</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => {}}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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

// Render cell content using meta schema field definition
function renderCellFromMeta(fieldName: string, value: any, tableName: string): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  // Handle arrays
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

  // Objects
  if (typeof value === 'object') {
    return <span className="font-mono text-xs">{JSON.stringify(value)}</span>;
  }

  // Numbers
  if (typeof value === 'number') {
    return <span className="font-mono">{value}</span>;
  }

  // Booleans
  if (typeof value === 'boolean') {
    return (
      <Badge variant={value ? 'primary' : 'secondary'} size="sm">
        {value ? 'Yes' : 'No'}
      </Badge>
    );
  }

  // Strings
  const stringValue = String(value);
  if (fieldName.toLowerCase().includes('time') || fieldName.toLowerCase().includes('date')) {
    const d = new Date(stringValue);
    if (!isNaN(d.getTime())) return <span className="font-mono">{d.toLocaleString()}</span>;
  }
  return <span>{stringValue}</span>;
}

// Generate columns dynamically based on the data structure
function generateColumnsFromData(data: Record<string, any>[], tableName: string): ColumnDef<Record<string, any>>[] {
  if (!data || data.length === 0) {
    return [];
  }

  // Get all unique keys from all objects
  const allKeys = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });

  const columns: ColumnDef<Record<string, any>>[] = [
    // Selection column
    {
      accessorKey: '_id',
      id: 'select',
      header: () => <DataGridTableRowSelectAll />,
      cell: ({ row }) => <DataGridTableRowSelect row={row} />,
      enableSorting: false,
      size: 35,
      meta: {
        headerClassName: '',
        cellClassName: '',
      },
      enableResizing: false,
    },
  ];

  // Sort keys to put _id first, then alphabetically
  const sortedKeys = Array.from(allKeys).sort((a, b) => {
    if (a === '_id') return -1;
    if (b === '_id') return 1;
    return a.localeCompare(b);
  });

  // Create columns for each field
  sortedKeys.forEach(key => {
    if (key === '_id') {
      // ID column with special formatting
      columns.push({
        accessorKey: key,
        id: key,
        header: ({ column }) => <DataGridColumnHeader title="ID" visibility={true} column={column} />,
        cell: ({ row }) => {
          const value = row.original[key];
          return <span className="font-mono text-xs">{value}</span>;
        },
        size: 120,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      });
    } else {
      columns.push({
        accessorKey: key,
        id: key,
        header: ({ column }) => (
          <DataGridColumnHeader title={formatFieldName(key)} visibility={true} column={column} />
        ),
        cell: ({ row }) => renderCellContent(row.original[key], key),
        size: 150,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      });
    }
  });

  // Actions column
  columns.push({
    id: 'actions',
    header: '',
    cell: ({ row }) => <ActionsCell row={row} tableName={tableName} />,
    size: 60,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  });

  return columns;
}

// Generate columns from registry meta schema
function generateColumnsFromMeta(tableName: string): ColumnDef<Record<string, any>>[] {
  const meta = Registry.describe().tables[tableName];
  if (!meta) return [];

  const columns: ColumnDef<Record<string, any>>[] = [
    {
      accessorKey: '_id',
      id: 'select',
      header: () => <DataGridTableRowSelectAll />,
      cell: ({ row }) => <DataGridTableRowSelect row={row} />,
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
      cell: ({ row }) => renderCellFromMeta(key, row.original[key], tableName),
      size: 150,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true,
    });
  }

  columns.push({
    id: 'actions',
    header: '',
    cell: ({ row }) => <ActionsCell row={row} tableName={tableName} />,
    size: 60,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  });

  return columns;
}

export function DynamicDataGrid({ tableName, data }: DynamicDataGridProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    const searchLower = searchQuery.toLowerCase();
    return data.filter((item) =>
      Object.values(item)
        .join(' ')
        .toLowerCase()
        .includes(searchLower)
    );
  }, [data, searchQuery]);

  const columns = useMemo(() => {
    const metaColumns = generateColumnsFromMeta(tableName);
    if (metaColumns.length > 0) return metaColumns;
    return generateColumnsFromData(data, tableName);
  }, [data, tableName]);

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
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
            <Button>
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
    </DataGrid>
  );
}
