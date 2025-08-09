'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { FieldLabel, type CommonFieldProps } from './TextField';

function toLocalDateTimeInput(value: any): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  // Keep default timezone behaviour, not forced Zulu
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function DateTimeField({ label, showLabel, value, onChange, isEditing = false, autoFocus = false }: CommonFieldProps<any>) {
  const content = isEditing ? (
    <Input
      autoFocus={autoFocus}
      type="datetime-local"
      value={value ? toLocalDateTimeInput(value) : ''}
      onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : undefined)}
    />
  ) : (
    <span className="font-mono">{value ? new Date(value).toLocaleString() : '—'}</span>
  );

  return (
    <div className={showLabel ? 'flex flex-col gap-1' : ''}>
      <FieldLabel label={label} showLabel={showLabel} />
      {content}
    </div>
  );
}


