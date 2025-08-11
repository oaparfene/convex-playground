"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronDown, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Table } from "@tanstack/react-table";
import { Registry } from "@/lib/registry";
import { FieldRenderer } from "@/components/field-renderer/FieldRenderer";
import { formatFieldName } from "@/components/data-table/dynamic/data-table-dynamic-generate-columns";

interface DataTableBatchEditDialogProps<TData> {
  table: Table<TData>;
  tableName: string;
  children: React.ReactNode;
  onBatchUpdate: (fieldKey: string, value: any, selectedIds: string[]) => Promise<void>;
}

interface EditableField {
  key: string;
  label: string;
  field: any;
}

export function DataTableBatchEditDialog<TData>({
  table,
  tableName,
  children,
  onBatchUpdate,
}: DataTableBatchEditDialogProps<TData>) {
  const [fieldSelectorOpen, setFieldSelectorOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedField, setSelectedField] = React.useState<EditableField | null>(null);
  const [fieldValue, setFieldValue] = React.useState<any>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  // Get editable fields from table metadata
  const editableFields = React.useMemo(() => {
    const meta = Registry.describe().tables[tableName];
    console.log("meta", meta);
    if (!meta) return [];

    const fields: EditableField[] = [];
    
    Object.entries(meta.fields).forEach(([key, field]) => {
      // Skip system fields and unique fields
      if (key === '_id' || key === '_creationTime') return;
      
      // Skip if field is marked as non-editable
      if (field.behaviors?.editable === false) return;
      
      const fieldType = (field.type as any)?.type || field.type;
     
        fields.push({
          key,
          label: field.render?.label || formatFieldName(key),
          field,
        });
      
    });

    return fields;
  }, [tableName]);

  const handleFieldSelect = (field: EditableField) => {
    setSelectedField(field);
    setFieldValue(null); // Reset value when changing fields
    setFieldSelectorOpen(false);
    setDialogOpen(true);
  };

  const handleConfirmEdit = async () => {
    if (!selectedField || selectedRows.length === 0) return;

    setIsUpdating(true);
    try {
      const selectedIds = selectedRows.map((row) => (row.original as any)._id);
      await onBatchUpdate(selectedField.key, fieldValue, selectedIds);
      
      toast.success(
        `Successfully updated ${selectedField.label} for ${selectedRows.length} ${
          selectedRows.length === 1 ? 'record' : 'records'
        }`
      );
      
      setDialogOpen(false);
      setSelectedField(null);
      setFieldValue(null);
      table.resetRowSelection();
    } catch (error) {
      toast.error("Failed to update records. Please try again.");
      console.error("Batch update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setSelectedField(null);
    setFieldValue(null);
  };

  if (selectedRows.length === 0) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Edit className="mr-2 h-4 w-4" />
        Edit
      </Button>
    );
  }

  return (
    <>
      <Popover open={fieldSelectorOpen} onOpenChange={setFieldSelectorOpen}>
        <PopoverTrigger asChild>
          {children}
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search fields..." />
            <CommandList>
              <CommandEmpty>No editable fields found.</CommandEmpty>
              <CommandGroup>
                {editableFields.map((field) => (
                  <CommandItem
                    key={field.key}
                    value={field.key}
                    onSelect={() => handleFieldSelect(field)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedField?.key === field.key ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {field.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          <div className="p-2 pt-0 border-t text-xs text-muted-foreground">
            {selectedRows.length} {selectedRows.length === 1 ? 'record' : 'records'} selected
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Batch Edit {selectedField?.label}
            </DialogTitle>
            <DialogDescription>
              Edit {selectedField?.label} for {selectedRows.length} selected{" "}
              {selectedRows.length === 1 ? "record" : "records"}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedField && (
            <div className="py-4">
              <FieldRenderer
                field={selectedField.field}
                value={fieldValue}
                onChange={setFieldValue}
                isForm={true}
                isEditing={true}
                autoFocus={true}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmEdit}
              disabled={isUpdating || fieldValue === null}
            >
              {isUpdating ? "Updating..." : "Update All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
