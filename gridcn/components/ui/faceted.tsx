"use client";

import { Check, ChevronsUpDown } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Option } from "@/types/data-table";

type FacetedContextValue = {
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  multiple?: boolean;
};

const FacetedContext = React.createContext<FacetedContextValue>({});

const useFaceted = () => React.useContext(FacetedContext);

function Faceted({
  value,
  onValueChange,
  open,
  onOpenChange,
  multiple,
  children,
}: FacetedContextValue & { children: React.ReactNode }) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <FacetedContext.Provider
        value={{ value, onValueChange, open, onOpenChange, multiple }}
      >
        {children}
      </FacetedContext.Provider>
    </Popover>
  );
}

const FacetedTrigger = PopoverTrigger;

const FacetedContent = PopoverContent;

const FacetedInput = CommandInput;

const FacetedList = CommandList;

const FacetedEmpty = CommandEmpty;

const FacetedGroup = CommandGroup;

interface FacetedItemProps extends React.ComponentProps<typeof CommandItem> {
  value: string;
}

function FacetedItem({ value, className, children, ...props }: FacetedItemProps) {
  const {
    value: contextValue,
    onValueChange,
    multiple,
    onOpenChange,
  } = useFaceted();

  const selectedValues = new Set(
    Array.isArray(contextValue) ? contextValue : [],
  );

  const isSelected = multiple
    ? selectedValues.has(value)
    : contextValue === value;

  const onSelect = React.useCallback(() => {
    if (multiple) {
      const newSelectedValues = new Set(selectedValues);
      if (isSelected) {
        newSelectedValues.delete(value);
      } else {
        newSelectedValues.add(value);
      }
      onValueChange?.(Array.from(newSelectedValues));
    } else {
      onValueChange?.(isSelected ? "" : value);
      onOpenChange?.(false);
    }
  }, [multiple, isSelected, value, selectedValues, onValueChange, onOpenChange]);

  return (
    <CommandItem
      value={value}
      className={cn("flex items-center gap-2", className)}
      onSelect={onSelect}
      {...props}
    >
      {multiple && (
        <div
          className={cn(
            "flex size-4 items-center justify-center rounded-sm border border-primary",
            isSelected ? "bg-primary text-primary-foreground" : "opacity-50",
          )}
        >
          <Check className="size-full" />
        </div>
      )}
      {children}
    </CommandItem>
  );
}
interface FacetedBadgeListProps extends React.ComponentProps<"div"> {
  options?: Option[];
  placeholder?: string;
  maxBadges?: number;
}

function FacetedBadgeList({
  options,
  placeholder,
  maxBadges = 3,
  className,
  ...props
}: FacetedBadgeListProps) {
  const { value: contextValue } = useFaceted();

  const selectedOptions = React.useMemo(() => {
    if (!options || !contextValue) return [];

    return options.filter((option) => {
      if (Array.isArray(contextValue)) {
        return contextValue.includes(option.value);
      }
      return contextValue === option.value;
    });
  }, [options, contextValue]);

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)} {...props}>
      <ChevronsUpDown className="text-muted-foreground" />
      <Separator orientation="vertical" className="h-4" />
      {selectedOptions.length > 0 ? (
        <>
          {selectedOptions.slice(0, maxBadges).map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="whitespace-nowrap rounded"
            >
              {option.label}
            </Badge>
          ))}
          {selectedOptions.length > maxBadges && (
            <Badge variant="secondary" className="whitespace-nowrap rounded">
              {selectedOptions.length - maxBadges} more
            </Badge>
          )}
        </>
      ) : (
        <span className="text-muted-foreground text-sm">{placeholder}</span>
      )}
    </div>
  );
}

export {
  Faceted,
  FacetedTrigger,
  FacetedContent,
  FacetedInput,
  FacetedList,
  FacetedEmpty,
  FacetedGroup,
  FacetedItem,
  FacetedBadgeList,
};
