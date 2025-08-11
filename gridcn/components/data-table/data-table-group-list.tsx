"use client";

import type { GroupingState, Table } from "@tanstack/react-table";
import { ChevronsUpDown, GripVertical, ListTree, Trash2 } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "@/components/ui/sortable";
import { cn } from "@/lib/utils";

const OPEN_MENU_SHORTCUT = "g";
const REMOVE_GROUP_SHORTCUTS = ["backspace", "delete"];

interface DataTableGroupListProps<TData>
  extends React.ComponentProps<typeof PopoverContent> {
  table: Table<TData>;
}

export function DataTableGroupList<TData>({ table, ...props }: DataTableGroupListProps<TData>) {
  const id = React.useId();
  const labelId = React.useId();
  const descriptionId = React.useId();
  const [open, setOpen] = React.useState(false);
  const addButtonRef = React.useRef<HTMLButtonElement>(null);

  // Grouping state (feature is optional on table in this codebase, so cast via any)
  const grouping = ((table.getState() as any).grouping ?? []) as GroupingState;
  const setGrouping = (table as any).setGrouping as
    | ((updater: GroupingState | ((old: GroupingState) => GroupingState)) => void)
    | undefined;

  // Labels and available groupable columns
  const { columnLabels, columns } = React.useMemo(() => {
    const labels = new Map<string, string>();
    const active = new Set(grouping);
    const availableColumns: { id: string; label: string }[] = [];

    for (const column of table.getAllColumns()) {
      if (String(column.id).startsWith("__")) continue;
      const canGroup = (column as any).getCanGroup?.() ?? column.columnDef.enableGrouping ?? true;
      if (!canGroup) continue;

      const label = (column.columnDef as any).meta?.label ?? column.id;
      labels.set(column.id, label);

      if (!active.has(column.id)) {
        availableColumns.push({ id: column.id, label });
      }
    }

    return { columnLabels: labels, columns: availableColumns };
  }, [grouping, table]);

  const onGroupAdd = React.useCallback(() => {
    if (!setGrouping) return;
    const first = columns[0];
    if (!first) return;
    setGrouping((prev) => [...(prev ?? []), first.id]);
  }, [columns, setGrouping]);

  const onGroupUpdate = React.useCallback(
    (groupId: string, newId: string) => {
      if (!setGrouping) return;
      setGrouping((prev) => (prev ?? []).map((id) => (id === groupId ? newId : id)));
    },
    [setGrouping],
  );

  const onGroupRemove = React.useCallback(
    (groupId: string) => {
      if (!setGrouping) return;
      setGrouping((prev) => (prev ?? []).filter((id) => id !== groupId));
      requestAnimationFrame(() => addButtonRef.current?.focus());
    },
    [setGrouping],
  );

  const onGroupingReset = React.useCallback(() => {
    if (!setGrouping) return;
    const initial = ((table.initialState as any)?.grouping ?? []) as GroupingState;
    setGrouping(initial);
  }, [setGrouping, table.initialState]);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (
        event.key.toLowerCase() === OPEN_MENU_SHORTCUT &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey
      ) {
        event.preventDefault();
        setOpen(true);
      }

      if (
        event.key.toLowerCase() === OPEN_MENU_SHORTCUT &&
        event.shiftKey &&
        grouping.length > 0
      ) {
        event.preventDefault();
        onGroupingReset();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [grouping.length, onGroupingReset]);

  const onTriggerKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (
        REMOVE_GROUP_SHORTCUTS.includes(event.key.toLowerCase()) &&
        grouping.length > 0
      ) {
        event.preventDefault();
        onGroupRemove(grouping[grouping.length - 1]!);
      }
    },
    [grouping, onGroupRemove],
  );

  const canGroupAnything = React.useMemo(() => {
    return table
      .getAllColumns()
      .some((c) => (c as any).getCanGroup?.() ?? c.columnDef.enableGrouping ?? true);
  }, [table]);

  if (!canGroupAnything) {
    return (
      <Button variant="outline" size="sm" disabled>
        <ListTree />
        Group
      </Button>
    );
  }

  const sortableGroups = React.useMemo(() => grouping.map((id) => ({ id })), [grouping]);

  return (
    <Sortable
      value={sortableGroups}
      onValueChange={(items) => setGrouping?.(items.map((i) => i.id))}
      getItemValue={(item) => item.id}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" onKeyDown={onTriggerKeyDown}>
            <ListTree />
            Group
            {grouping.length > 0 && (
              <Badge
                variant="secondary"
                className="h-[18.24px] rounded-[3.2px] px-[5.12px] font-mono font-normal text-[10.4px]"
              >
                {grouping.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
          className="flex w-full max-w-[var(--radix-popover-content-available-width)] origin-[var(--radix-popover-content-transform-origin)] flex-col gap-3.5 p-4 sm:min-w-[380px]"
          {...props}
        >
          <div className="flex flex-col gap-1">
            <h4 id={labelId} className="font-medium leading-none">
              {grouping.length > 0 ? "Group by" : "No groups applied"}
            </h4>
            <p
              id={descriptionId}
              className={cn(
                "text-muted-foreground text-sm",
                grouping.length > 0 && "sr-only",
              )}
            >
              {grouping.length > 0
                ? "Modify groups to organize your rows."
                : "Add groups to organize your rows."}
            </p>
          </div>

          {grouping.length > 0 && (
            <SortableContent asChild>
              <ul className="flex max-h-[300px] flex-col gap-2 overflow-y-auto p-1">
                {grouping.map((groupId) => (
                  <DataTableGroupItem
                    key={groupId}
                    groupId={groupId}
                    groupItemId={`${id}-group-${groupId}`}
                    columns={columns}
                    columnLabels={columnLabels}
                    onGroupUpdate={onGroupUpdate}
                    onGroupRemove={onGroupRemove}
                  />
                ))}
              </ul>
            </SortableContent>
          )}

          <div className="flex w-full items-center gap-2">
            <Button
              size="sm"
              className="rounded"
              ref={addButtonRef}
              onClick={onGroupAdd}
              disabled={columns.length === 0}
            >
              Add group
            </Button>
            {grouping.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="rounded"
                onClick={onGroupingReset}
              >
                Reset groups
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <SortableOverlay>
        <div className="flex items-center gap-2">
          <div className="h-8 w-[180px] rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
        </div>
      </SortableOverlay>
    </Sortable>
  );
}

interface DataTableGroupItemProps {
  groupId: string;
  groupItemId: string;
  columns: { id: string; label: string }[];
  columnLabels: Map<string, string>;
  onGroupUpdate: (groupId: string, newId: string) => void;
  onGroupRemove: (groupId: string) => void;
}

function DataTableGroupItem({
  groupId,
  groupItemId,
  columns,
  columnLabels,
  onGroupUpdate,
  onGroupRemove,
}: DataTableGroupItemProps) {
  const fieldListboxId = `${groupItemId}-field-listbox`;
  const fieldTriggerId = `${groupItemId}-field-trigger`;

  const [showFieldSelector, setShowFieldSelector] = React.useState(false);

  const onItemKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLLIElement>) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (showFieldSelector) return;

      if (REMOVE_GROUP_SHORTCUTS.includes(event.key.toLowerCase())) {
        event.preventDefault();
        onGroupRemove(groupId);
      }
    },
    [groupId, showFieldSelector, onGroupRemove],
  );

  return (
    <SortableItem value={groupId} asChild>
      <li
        id={groupItemId}
        tabIndex={-1}
        className="flex items-center gap-2"
        onKeyDown={onItemKeyDown}
      >
        <Popover open={showFieldSelector} onOpenChange={setShowFieldSelector}>
          <PopoverTrigger asChild>
            <Button
              id={fieldTriggerId}
              aria-controls={fieldListboxId}
              variant="outline"
              size="sm"
              className="w-44 justify-between rounded font-normal"
            >
              <span className="truncate">{columnLabels.get(groupId)}</span>
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            id={fieldListboxId}
            className="w-[var(--radix-popover-trigger-width)] origin-[var(--radix-popover-content-transform-origin)] p-0"
          >
            <Command>
              <CommandInput placeholder="Search fields..." />
              <CommandList>
                <CommandEmpty>No fields found.</CommandEmpty>
                <CommandGroup>
                  {columns.map((column) => (
                    <CommandItem
                      key={column.id}
                      value={column.id}
                      onSelect={(value) => onGroupUpdate(groupId, value)}
                    >
                      <span className="truncate">{column.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button
          aria-controls={groupItemId}
          variant="outline"
          size="icon"
          className="size-8 shrink-0 rounded"
          onClick={() => onGroupRemove(groupId)}
        >
          <Trash2 />
        </Button>
        <SortableItemHandle asChild>
          <Button variant="outline" size="icon" className="size-8 shrink-0 rounded">
            <GripVertical />
          </Button>
        </SortableItemHandle>
      </li>
    </SortableItem>
  );
}
