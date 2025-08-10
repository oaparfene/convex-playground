import React, { useState } from "react";
import { DynamicFormDialog } from "../forms/DynamicFormDialog";
import { Table } from "@tanstack/react-table";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

interface DataTableDynamicFormsProps {
  tableName: string;
  table: Table<any>;
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
  showDuplicateModal: boolean;
  setShowDuplicateModal: (show: boolean) => void;
  duplicatingRow: any;
  setDuplicatingRow: (value: any) => void;
  editingRow: any;
  setEditingRow: (value: any) => void;
}

function DataTableDynamicForms({ tableName, table, showAddModal, setShowAddModal, showEditModal, setShowEditModal, showDuplicateModal, setShowDuplicateModal, duplicatingRow, setDuplicatingRow, editingRow, setEditingRow }: DataTableDynamicFormsProps) {

  const mutateInsert = useMutation(api.registry.insert);
  const mutateUpdate = useMutation(api.registry.update);
  const mutateDelete = useMutation(api.registry.remove);

  return (
    <div>
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
            toast.success("Row inserted");
          } catch (e: any) {
            toast.error(e?.message || "Insert failed");
          }
        }}
      />

      <DynamicFormDialog
        tableName={tableName}
        table={table}
        mode="edit"
        open={showEditModal}
        onOpenChange={(o) => {
          setShowEditModal(o);
          if (!o) setEditingRow(null);
        }}
        initialValues={editingRow ?? undefined}
        onSubmit={async (value) => {
          if (!editingRow?._id) {
            toast.error("Missing row id");
            return;
          }
          try {
            console.log("value", value);
            await mutateUpdate({
              table: tableName,
              id: editingRow._id as any,
              patch: value,
            });
            console.log("updated");
            setShowEditModal(false);
            setEditingRow(null);
            toast.success("Row updated");
          } catch (e: any) {
            toast.error(e?.message || "Update failed");
          }
        }}
      />

      <DynamicFormDialog
        tableName={tableName}
        table={table}
        mode="create"
        title="Duplicate Row"
        open={showDuplicateModal}
        onOpenChange={(o) => {
          setShowDuplicateModal(o);
          if (!o) setDuplicatingRow(null);
        }}
        initialValues={duplicatingRow ?? undefined}
        onSubmit={async (value) => {
          try {
            await mutateInsert({ table: tableName, value });
            setShowDuplicateModal(false);
            setDuplicatingRow(null);
            toast.success("Row duplicated successfully");
          } catch (e: any) {
            toast.error(e?.message || "Duplicate failed");
          }
        }}
      />
    </div>
  );
}

export default DataTableDynamicForms;
