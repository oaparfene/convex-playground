"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardTable } from "@/components/ui/card";
import { DataGrid } from "@/components/ui/data-grid";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import { DataGridTableDnd } from "@/components/ui/data-grid-table-dnd";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Copy, Download, Plus, Search, Trash, X } from "lucide-react";
import { toast } from "sonner";
import { Registry } from "@/lib/registry";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableGroupList } from "@/components/data-table/data-table-group-list";
import { DataTableDeleteDialog } from "@/components/data-table/data-table-delete-dialog";
import { useDataTable } from "@/hooks/use-data-table";
import { useTableFilters } from "@/hooks/use-table-filters";
import { useActionBar } from "@/hooks/use-action-bar";
import DataTableDynamicForms from "./data-table-dynamic-forms";
import DataTableDynamicActionBar from "./data-table-dynamic-action-bar";

interface DynamicDataGridProps {
  tableName: string;
  data: Record<string, any>[];
  relations: Record<string, Record<string, any>[]>;
}

export function DynamicDataGrid({ 
  tableName, 
  data: inputData, 
  relations = {} 
}: DynamicDataGridProps) {
  const mutateUpdate = useMutation(api.registry.update);
  const mutateInsert = useMutation(api.registry.insert);
  const mutateDelete = useMutation(api.registry.remove);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, any> | null>(
    null
  );
  const [duplicatingRow, setDuplicatingRow] = useState<Record<
    string,
    any
  > | null>(null);

  // Get table metadata
  const tableMeta = useMemo(() => {
    return Registry.describe().tables[tableName];
  }, [tableName]);

  // Use the relations passed from the server (no more client-side fetching needed!)
  const relatedDataLookup = useMemo(() => {
    // Extract just the data arrays from the server response
    const lookup: Record<string, Record<string, any>[]> = {};
    Object.entries(relations).forEach(([tableName, result]) => {
      // The relations are already just arrays from the server
      lookup[tableName] = result;
    });
    return lookup;
  }, [relations]);

  // Get column IDs for filtering
  const columnIds = useMemo(() => {
    if (!tableMeta) return [];
    return Object.keys(tableMeta.fields).filter((key) => key !== "_id");
  }, [tableMeta]);

  // Apply URL-based filters
  const { filteredData: urlFilteredData } = useTableFilters(
    columnIds,
    inputData,
    relatedDataLookup
  );

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
            searchableContent.push(...value.map((v) => String(v)));
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
                  const relatedItem = relatedData.find(
                    (r: any) => r._id === id
                  );
                  if (relatedItem && relatedItem[displayField]) {
                    searchableContent.push(String(relatedItem[displayField]));
                  }
                });
              } else {
                // Handle single relation (id_select)
                const relatedItem = relatedData.find(
                  (r: any) => r._id === item[fieldName]
                );
                if (relatedItem && relatedItem[displayField]) {
                  searchableContent.push(String(relatedItem[displayField]));
                }
              }
            }
          }
        });
      }

      // Check if search query matches any of the searchable content
      return searchableContent.join(" ").toLowerCase().includes(searchLower);
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
      toast.success("Row deleted");
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  const handleDuplicateRow = (value: Record<string, any>) => {
    setDuplicatingRow(value);
    setShowDuplicateModal(true);
  };

  // Batch operation handlers
  const handleBatchDelete = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => mutateDelete({ table: tableName, id: id as any })));
    } catch (e: any) {
      throw new Error(e?.message || "Batch delete failed");
    }
  };

  const handleBatchUpdate = async (fieldKey: string, value: any, selectedIds: string[]) => {
    try {
      await Promise.all(
        selectedIds.map(id => 
          mutateUpdate({ 
            table: tableName, 
            id: id as any, 
            patch: { [fieldKey]: value } 
          })
        )
      );
    } catch (e: any) {
      throw new Error(e?.message || "Batch update failed");
    }
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

  // Use the action bar hook
  const {
    selectedCount,
    showDeleteDialog,
    setShowDeleteDialog,
    isDeleting,
    handleDeleteClick,
    handleDeleteConfirm,
    handleBatchUpdate: actionBarBatchUpdate,
  } = useActionBar({
    table,
    onDelete: handleBatchDelete,
    onBatchUpdate: handleBatchUpdate,
  });

  return (
    <>
      {/* Toolbar */}
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
                onClick={() => setSearchQuery("")}
              >
                <X />
              </Button>
            )}
          </div>
        </div>
        <DataTableFilterList table={table} />
        <DataTableSortList table={table} />
        <DataTableGroupList table={table} />
        <Button onClick={() => setShowAddModal(true)} className="ml-auto">
          <Plus />
          New record
        </Button>
      </DataTableAdvancedToolbar>

      {/* Batch Action Bar */}
      <DataTableDynamicActionBar table={table} tableName={tableName} actionBarBatchUpdate={actionBarBatchUpdate} handleDeleteClick={handleDeleteClick} />

      {/* Grid Body */}
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
      </DataGrid>

      {/* Dynamic Forms */}
      <DataTableDynamicForms
        tableName={tableName}
        table={table}
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        showDuplicateModal={showDuplicateModal}
        setShowDuplicateModal={setShowDuplicateModal}
        duplicatingRow={duplicatingRow}
        setDuplicatingRow={setDuplicatingRow}
        editingRow={editingRow}
        setEditingRow={setEditingRow}
      />

      {/* Delete Confirmation Dialog */}
      <DataTableDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        selectedCount={selectedCount}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}
