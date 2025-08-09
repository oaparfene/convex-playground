import { useMemo, useState } from 'react';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import { generateColumnsFromMeta } from '@/lib/generate-columns';
import { toast } from 'sonner';

export interface UseDataTableProps {
  tableName: string;
  data: Record<string, any>[];
  mutateUpdate: any;
  mutateInsert: any;
  handleOpenEdit: (value: Record<string, any>) => void;
  handleDeleteRow: (id: string) => void;
  handleDuplicateRow: (value: Record<string, any>) => void;
  relatedDataLookup?: Record<string, Record<string, any>[]>;
}

export function useDataTable({
  tableName,
  data,
  mutateUpdate,
  mutateInsert,
  handleOpenEdit,
  handleDeleteRow,
  handleDuplicateRow,
  relatedDataLookup,
}: UseDataTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(() => {
    const metaColumns = generateColumnsFromMeta(tableName, relatedDataLookup, data);
    if (metaColumns.length > 0) return metaColumns;
    return [];
  }, [tableName, relatedDataLookup, data, handleOpenEdit, handleDeleteRow, handleDuplicateRow]);

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
    data,
    pageCount: Math.ceil((data?.length || 0) / pagination.pageSize),
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

  return {
    table,
    pagination,
    sorting,
    columnOrder,
    handleDragEnd,
    setPagination,
    setSorting,
    setColumnOrder,
  };
}
