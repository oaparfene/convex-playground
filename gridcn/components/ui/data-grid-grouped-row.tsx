"use client";

import * as React from "react";
import { Row, Cell } from "@tanstack/react-table";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useDataGrid } from "@/components/ui/data-grid";

export function isGroupedRow<TData>(row: Row<TData>): boolean {
  // A row is considered a grouped row if any visible cell is marked as grouped
  return row.getVisibleCells().some((cell: Cell<TData, unknown>) =>
    (cell as any).getIsGrouped?.(),
  );
}

export function DataGridGroupedRow<TData>({ row }: { row: Row<TData> }) {
  const { table } = useDataGrid();
  // Find the first grouped cell to display group label/value
  const groupedCell = row
    .getVisibleCells()
    .find((cell: Cell<TData, unknown>) => (cell as any).getIsGrouped?.());

  const label = groupedCell
    ? ((groupedCell.column.columnDef as any)?.meta?.label ?? groupedCell.column.id)
    : "Group";

  // Prefer leaf row count to represent actual records in this group
  const count = row.getLeafRows ? row.getLeafRows().length : (row.subRows?.length ?? 0);

  const canExpand = row.getCanExpand?.() ?? Boolean(row.subRows?.length);
  const isExpanded = row.getIsExpanded?.() ?? false;

  // Selection state across leaf rows
  const leafRows = row.getLeafRows ? row.getLeafRows() : [];
  const allSelected = leafRows.length > 0 && leafRows.every((r) => r.getIsSelected());
  const someSelected = !allSelected && leafRows.some((r) => r.getIsSelected());

  return (
    <td colSpan={row.getVisibleCells().length} className={cn("p-0")}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => canExpand && row.toggleExpanded?.()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            canExpand && row.toggleExpanded?.();
          }
        }}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 text-left bg-muted/40 border-b border-border",
          "hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        )}
        aria-expanded={isExpanded}
      >
        <span style={{ paddingInlineStart: `${row.depth * 16}px` }} className="flex items-center gap-2">
          {table.options.enableRowSelection && (
            <Checkbox
              checked={allSelected || (someSelected && 'indeterminate')}
              onCheckedChange={(value) => {
                leafRows.forEach((r) => r.toggleSelected(!!value));
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              aria-label="Select all rows in group" 
              className="mr-1"
            />
          )}
          {canExpand ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={(ev) => {
                ev.stopPropagation();
                row.toggleExpanded?.();
              }}
              aria-label={isExpanded ? "Collapse group" : "Expand group"}
            >
              {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            </Button>
          ) : (
            <span className="inline-block w-4" />
          )}
          {renderMetaIcon(groupedCell)}
          <span className="uppercase text-muted-foreground text-[11px] tracking-wide">{label}</span>
          <span className="font-medium text-foreground">{formatGroupedValue(groupedCell) || "(Empty)"}</span>
        </span>
        <span className="text-muted-foreground text-sm">Count <span className="text-foreground font-medium">{count}</span></span>
      </div>
    </td>
  );
}

function formatGroupedValue<TData>(groupedCell?: Cell<TData, unknown>): string {
  if (!groupedCell) return "";
  const raw = groupedCell.getValue();
  const meta: any = (groupedCell.column.columnDef as any)?.meta;
  // If options are provided (enum/relation), map value -> label
  if (meta?.options && Array.isArray(meta.options)) {
    // Handle array of values (multi-select)
    if (Array.isArray(raw)) {
      const matches = raw.map(val => {
        const match = meta.options.find((opt: any) => String(opt.value) === String(val));
        return match?.label ?? val;
      });
      return matches.join(", ");
    }
    // Handle single value
    const match = meta.options.find((opt: any) => String(opt.value) === String(raw));
    if (match) return String(match.label ?? raw);
  }

  // Normalize boolean display
  if (typeof raw === "boolean") return raw ? "True" : "False";

  return raw != null && raw !== "" ? String(raw) : "";
}

export function renderMetaIcon<TData>(groupedCell?: Cell<TData, unknown>) {
  if (!groupedCell) return null;
  const meta: any = (groupedCell.column.columnDef as any)?.meta;
  const Icon = meta?.icon;
  if (!Icon) return null;
  return <Icon className="size-4 text-muted-foreground" />;
}


