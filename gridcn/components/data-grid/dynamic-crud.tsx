'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardTable } from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTableDnd } from '@/components/ui/data-grid-table-dnd';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { Registry } from '@/lib/registry';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { DynamicFormDialog } from '@/components/forms/DynamicFormDialog';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableFilterList } from '@/components/data-table/data-table-filter-list';
import { DataTableSortList } from '@/components/data-table/data-table-sort-list';
import { useDataTable } from '@/hooks/use-data-table';
import { useTableFilters } from '@/hooks/use-table-filters';

interface DynamicDataGridProps {
  tableName: string;
  data: Record<string, any>[];
}

export function DynamicDataGrid({ tableName, data }: DynamicDataGridProps) {
  const mutateUpdate = useMutation(api.registry.update);
  const mutateInsert = useMutation(api.registry.insert);
  const mutateDelete = useMutation(api.registry.remove);
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

  // Get column IDs for filtering
  const columnIds = useMemo(() => {
    if (!tableMeta) return [];
    return Object.keys(tableMeta.fields).filter(key => key !== '_id');
  }, [tableMeta]);

  // Apply URL-based filters
  const { filteredData: urlFilteredData } = useTableFilters(columnIds, data, relatedDataLookup);

  // Apply search query on top of URL filters
  const filteredData = useMemo(() => {
    if (!searchQuery) return urlFilteredData;
    
    const searchLower = searchQuery.toLowerCase();
    return urlFilteredData.filter((item) => {
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
  }, [urlFilteredData, searchQuery, tableMeta, relatedDataLookup]);

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

  // Use the custom data table hook
  const { table, handleDragEnd } = useDataTable({
    tableName,
    data: filteredData,
    mutateUpdate,
    mutateInsert,
    handleOpenEdit,
    handleDeleteRow,
    handleDuplicateRow,
    relatedDataLookup,
  });

  return (
    <>
      <DataTableAdvancedToolbar table={table}>
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
        <DataTableFilterList table={table} />
        <DataTableSortList table={table} />
        <Button onClick={() => setShowAddModal(true)} className="ml-auto">
          <Plus />
          New record
        </Button>
      </DataTableAdvancedToolbar>
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
          table={table}
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
          table={table}
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
          table={table}
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
    </>
  );
}
