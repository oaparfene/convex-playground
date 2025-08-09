'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { FieldLabel, type CommonFieldProps } from './TextField';

function toDateInputValue(value: any): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  // Keep local date (no forced Zulu)
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DateField({ label, showLabel, value, onChange, isEditing = false, autoFocus = false }: CommonFieldProps<any>) {
  const content = isEditing ? (
    <Input
      autoFocus={autoFocus}
      type="date"
      value={value ? toDateInputValue(value) : ''}
      onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : undefined)}
    />
  ) : (
    <span className="font-mono">{value ? new Date(value).toLocaleDateString() : '—'}</span>
  );

  return (
    <div className={showLabel ? 'flex flex-col gap-1' : ''}>
      <FieldLabel label={label} showLabel={showLabel} />
      {content}
    </div>
  );
}


