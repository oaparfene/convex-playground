'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldLabel, type CommonFieldProps } from './TextField';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { FieldMeta } from '@/lib/registry/types';

export type IdSelectFieldProps = CommonFieldProps<string | undefined> & {
  field?: FieldMeta;
};

export function IdSelectField({ field, label, showLabel, value, onChange, isEditing = false, autoFocus = false }: IdSelectFieldProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Query the related table if we have relation metadata
  const relatedData = useQuery(
    api.registry.list,
    field?.relation ? { table: field.relation.table } : "skip"
  );

  const displayValue = React.useMemo(() => {
    if (!value || !relatedData || !field?.relation) return value ?? '—';
    
    const relatedItem = relatedData.find((item: any) => item._id === value);
    if (!relatedItem) return value;
    
    const displayField = field.relation.displayField;
    return displayField ? relatedItem[displayField] : relatedItem._id;
  }, [value, relatedData, field?.relation]);

  const content = isEditing ? (
    field?.relation && relatedData ? (
      <Select value={value || '__none__'} onValueChange={(val) => onChange(val === '__none__' ? undefined : val)}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${field.relation.table.slice(0, -1)}`} />
        </SelectTrigger>
        <SelectContent className="z-[10000]">
          <SelectItem value="__none__">
            <span className="text-muted-foreground">None</span>
          </SelectItem>
          {relatedData.map((item: any) => (
            <SelectItem key={item._id} value={item._id}>
              {field.relation!.displayField ? item[field.relation!.displayField] : item._id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : (
      <Input 
        autoFocus={autoFocus} 
        value={value ?? ''} 
        onChange={(e) => onChange(e.target.value || undefined)} 
        placeholder="Document ID" 
      />
    )
  ) : (
    <span className={field?.relation ? 'truncate' : 'font-mono text-xs'}>
      {displayValue}
    </span>
  );

  return (
    <div className={showLabel ? 'flex flex-col gap-1' : ''}>
      <FieldLabel label={label} showLabel={showLabel} />
      {content}
    </div>
  );
}


