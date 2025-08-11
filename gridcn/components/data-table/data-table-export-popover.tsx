"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Download, Copy, FileSpreadsheet, File } from "lucide-react";
import { toast } from "sonner";
import type { Table } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";

interface DataTableExportPopoverProps<TData> {
  table: Table<TData>;
  children: React.ReactNode;
}

export function DataTableExportPopover<TData>({
  table,
  children,
}: DataTableExportPopoverProps<TData>) {
  const [open, setOpen] = React.useState(false);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const allRows = table.getFilteredRowModel().rows;
  const rowsToExport = selectedRows.length > 0 ? selectedRows : allRows;

  // Get column headers and data for export
  const getExportData = () => {
    const visibleColumns = table.getVisibleLeafColumns().filter(
      (column) => column.id !== "__rowSelection__" && (column.columnDef as any).accessorKey
    );

    const headers = visibleColumns.map((column) => {
      const header = column.columnDef.header;
      if (typeof header === "string") return header;
      if (typeof header === "function") {
        // Try to extract title from header function
        try {
          const headerElement = header({ column, header: column.columnDef.header, table } as any);
          if (React.isValidElement(headerElement)) {
            // Look for title prop or text content
            return (headerElement.props as any)?.title || column.id;
          }
        } catch {
          // If header function fails, fallback to column id
        }
        return column.id;
      }
      return column.id;
    });

    const data = rowsToExport.map((row) => {
      return visibleColumns.map((column) => {
        const cellValue = row.getValue(column.id);
        const cell = column.columnDef.cell;
        const meta: any = (column.columnDef as any).meta;

        // Prefer using column meta options for select/multiSelect to map IDs to labels
        if (meta?.variant === "select" && Array.isArray(meta?.options)) {
          const match = meta.options.find((o: any) => String(o.value) === String(cellValue));
          return match ? String(match.label ?? match.value) : String(cellValue ?? "");
        }
        if (meta?.variant === "multiSelect" && Array.isArray(meta?.options)) {
          const values: string[] = Array.isArray(cellValue)
            ? cellValue.map((v: any) => String(v))
            : typeof cellValue === "string" && cellValue
              ? [cellValue]
              : [];
          const labels = values.map((v) => {
            const match = meta.options.find((o: any) => String(o.value) === v);
            return String(match?.label ?? v);
          });
          return labels.join(", ");
        }

        // Format date/time values similarly to UI
        if (meta?.variant === "date" || meta?.variant === "dateRange") {
          const ms = typeof cellValue === "number"
            ? cellValue
            : Number.parseFloat(String(cellValue));
          if (!Number.isNaN(ms)) {
            return formatDate(Math.floor(ms), {
              month: "numeric",
              day: "numeric",
              year: "numeric",
            });
          }
        }

        // Otherwise, try to get display value from cell renderer
        if (typeof cell === "function") {
          try {
            const cellElement = cell({
              getValue: () => cellValue,
              row,
              column,
              cell: {} as any,
              table,
              renderValue: () => cellValue,
            } as any);

            if (React.isValidElement(cellElement)) {
              const extractText = (element: any): string => {
                if (typeof element === "string" || typeof element === "number") {
                  return String(element);
                }
                if (React.isValidElement(element)) {
                  const props = element.props as any;
                  if (props?.children) {
                    if (typeof props.children === "string") return props.children;
                    if (Array.isArray(props.children)) return props.children.map(extractText).join("");
                    return extractText(props.children);
                  }
                }
                return String(cellValue ?? "");
              };
              return extractText(cellElement);
            }
          } catch {
            // fall through to raw value
          }
        }

        // Fallback to raw value
        return String(cellValue ?? "");
      });
    });

    return { headers, data };
  };

  const handleCopyToClipboard = async () => {
    try {
      const { headers, data } = getExportData();
      const csvContent = [headers, ...data]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");

      await navigator.clipboard.writeText(csvContent);
      toast.success(
        `Copied ${rowsToExport.length} ${rowsToExport.length === 1 ? 'row' : 'rows'} to clipboard`
      );
      setOpen(false);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
      console.error("Copy error:", error);
    }
  };

  const handleDownloadCSV = () => {
    try {
      const { headers, data } = getExportData();
      const csvContent = [headers, ...data]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `export-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast.success(
        `Downloaded ${rowsToExport.length} ${rowsToExport.length === 1 ? 'row' : 'rows'} as CSV`
      );
      setOpen(false);
    } catch (error) {
      toast.error("Failed to download CSV");
      console.error("CSV download error:", error);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      // For Excel export, we'll use a simple workbook format
      // In production, you might want to use a library like xlsx
      const { headers, data } = getExportData();

      console.log(headers, data);

      const cleanData = data.map((row) => row.map((cell) => String(cell).replace(/,/g, "/")));

      console.log(cleanData);
      
      // Create a simple tab-separated format that Excel can open
      const tsvContent = [headers, ...cleanData]
        .map((row) => row.join("\t"))
        .join("\n");

      console.log(tsvContent);

      const blob = new Blob([tsvContent], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      const link = document.createElement("a");
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `export-${new Date().toISOString().split('T')[0]}.xlsx`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast.success(
        `Downloaded ${rowsToExport.length} ${rowsToExport.length === 1 ? 'row' : 'rows'} as Excel`
      );
      setOpen(false);
    } catch (error) {
      toast.error("Failed to download Excel file");
      console.error("Excel download error:", error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="grid gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={handleCopyToClipboard}
          >
            <Copy className="mr-2 h-4 w-4 text-blue-500" />
            Copy to Clipboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={handleDownloadCSV}
          >
            <File className="mr-2 h-4 w-4 text-gray-500" />
            Download CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={handleDownloadExcel}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4 text-green-500" />
            Download Excel
          </Button>
        </div>
        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
          {rowsToExport.length} {rowsToExport.length === 1 ? 'row' : 'rows'} to export
        </div>
      </PopoverContent>
    </Popover>
  );
}
