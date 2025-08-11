import { DataTableActionBar } from "./data-table-action-bar";
import { DataTableActionBarSelection } from "./data-table-action-bar";
import { DataTableBatchEditDialog } from "./data-table-batch-edit-dialog";
import { DataTableExportPopover } from "./data-table-export-popover";
import { DataTableActionBarAction } from "./data-table-action-bar";
import { Separator } from "@/components/ui/separator";
import { Copy, Download, Edit, Trash } from "lucide-react";
import { Table } from "@tanstack/react-table";

interface DataTableDynamicActionBarProps {
  table: Table<any>;
  tableName: string;
  actionBarBatchUpdate: (fieldKey: string, value: any, selectedIds: string[]) => Promise<void>;
  handleDeleteClick: () => void;
}

function DataTableDynamicActionBar({ table, tableName, actionBarBatchUpdate, handleDeleteClick }: DataTableDynamicActionBarProps) {
  return (
    <DataTableActionBar table={table} >
        <DataTableActionBarSelection table={table} />
        <Separator orientation="vertical" className="hidden data-[orientation=vertical]:h-5 sm:block" />
        
        <DataTableBatchEditDialog
          table={table}
          tableName={tableName}
          onBatchUpdate={actionBarBatchUpdate}
        >
          <DataTableActionBarAction tooltip="Batch edit selection">
            <Edit className="text-yellow-500" />
          </DataTableActionBarAction>
        </DataTableBatchEditDialog>
        
        <DataTableExportPopover table={table} >
          <DataTableActionBarAction tooltip="Export selection">
            <Download className="text-blue-500" />
          </DataTableActionBarAction>
        </DataTableExportPopover>
        
        <DataTableActionBarAction tooltip="Delete selection" onClick={handleDeleteClick}>
          <Trash className="text-red-500" />
        </DataTableActionBarAction>
      </DataTableActionBar>
  )
}

export default DataTableDynamicActionBar