'use client';

import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldLabel, type CommonFieldProps } from './TextField';
import type { FieldMeta } from '@/lib/registry/types';

type Props = CommonFieldProps<string | undefined> & { field: FieldMeta };

export function SelectField({ field, label, showLabel, value, onChange, isEditing = false, autoFocus = false }: Props) {
  const options = field.render?.options?.values ?? [];

  const content = isEditing ? (
    <Select value={value || '__none__'} onValueChange={(val) => onChange(val === '__none__' ? undefined : val)}>
      <SelectTrigger>
        <SelectValue placeholder="Select an option..." />
      </SelectTrigger>
      <SelectContent className="z-[10000]">
        <SelectItem value="__none__">
          <span className="text-muted-foreground">None</span>
        </SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {field.render?.options?.labels?.[opt] ?? opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : (
    <span>{value ?? '—'}</span>
  );

  return (
    <div className={showLabel ? 'flex flex-col gap-1' : ''}>
      <FieldLabel label={label} showLabel={showLabel} />
      {content}
    </div>
  );
}


