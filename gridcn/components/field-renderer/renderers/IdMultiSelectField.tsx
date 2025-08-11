'use client';

import * as React from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldLabel, type CommonFieldProps } from './TextField';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { FieldMeta } from '@/lib/registry/types';
import { X } from 'lucide-react';

export type IdMultiSelectFieldProps = CommonFieldProps<string[] | undefined> & {
  field?: FieldMeta;
};

export function IdMultiSelectField({ field, label, showLabel, value, onChange, isEditing = false, autoFocus = false }: IdMultiSelectFieldProps) {
  const [selectedValue, setSelectedValue] = useState('');
  
  // Query the related table if we have relation metadata
  const relatedData = useQuery(
    api.registry.list,
    field?.relation ? { table: field.relation.table } : "skip"
  );

  const currentValues = Array.isArray(value) ? value : [];

  const displayItems = React.useMemo(() => {
    if (!relatedData || !field?.relation) return currentValues.map(id => ({ id, display: id, color: undefined }));
    
    return currentValues.map(id => {
      //console.log("relatedData", relatedData);
      const relatedItem = relatedData.data.find((item: any) => item._id === id);
      const displayField = field.relation!.displayField;
      const colorField = field.relation!.colorField;
      return {
        id,
        display: relatedItem && displayField ? relatedItem[displayField] : id,
        color: relatedItem && colorField ? relatedItem[colorField] : undefined
      };
    });
  }, [currentValues, relatedData, field?.relation]);

  const handleAdd = (newId: string) => {
    if (newId && !currentValues.includes(newId)) {
      onChange([...currentValues, newId]);
    }
    setSelectedValue('');
  };

  const handleRemove = (idToRemove: string) => {
    onChange(currentValues.filter(id => id !== idToRemove));
  };

  const availableOptions = React.useMemo(() => {
    if (!relatedData) return [];
    return relatedData.data.filter((item: any) => !currentValues.includes(item._id));
  }, [relatedData, currentValues]);

  const asCsv = currentValues.join(',');
  const content = isEditing ? (
    field?.relation && relatedData ? (
      <div className="space-y-2">
        <Select value={selectedValue} onValueChange={handleAdd}>
          <SelectTrigger>
            <SelectValue placeholder={`Add ${field.relation.table.slice(0, -1)}`} />
          </SelectTrigger>
          <SelectContent className="z-[10000]">
            {availableOptions.map((item: any) => (
              <SelectItem key={item._id} value={item._id}>
                {field.relation!.displayField ? item[field.relation!.displayField] : item._id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {displayItems.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {displayItems.map(({ id, display, color }) => (
              <Badge 
                size="md"
                key={id} 
                variant="secondary" 
                className="flex items-center gap-1"
                style={color ? { 
                  backgroundColor: color + '20', // 20% opacity
                  borderColor: color,
                  color: color
                } : undefined}
              >
                {color && (
                  <div 
                    className="w-2 h-2 rounded-full mr-1" 
                    style={{ backgroundColor: color }}
                  />
                )}
                {display}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => handleRemove(id)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    ) : (
      <Input
        autoFocus={autoFocus}
        value={asCsv}
        onChange={(e) => onChange(
          e.target.value
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        )}
        placeholder="Comma-separated IDs"
      />
    )
  ) : (
    <div className="flex flex-wrap gap-1">
      {displayItems.length > 0 ? (
        displayItems.map(({ id, display, color }) => (
          <Badge 
            key={id} 
            variant="secondary" 
            size="sm"
            className="flex items-center gap-1"
            style={color ? { 
              backgroundColor: color + '20', // 20% opacity
              borderColor: color,
              color: color
            } : undefined}
          >
            {color && (
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: color }}
              />
            )}
            {display}
          </Badge>
        ))
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
    </div>
  );

  return (
    <div className={showLabel ? 'flex flex-col gap-1' : ''}>
      <FieldLabel label={label} showLabel={showLabel} />
      {content}
    </div>
  );
}


