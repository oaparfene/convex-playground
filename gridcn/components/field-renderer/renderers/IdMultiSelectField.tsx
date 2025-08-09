'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { FieldLabel, type CommonFieldProps } from './TextField';

export function IdMultiSelectField({ label, showLabel, value, onChange, isEditing = false, autoFocus = false }: CommonFieldProps<string[] | undefined>) {
  const asCsv = Array.isArray(value) ? value.join(',') : '';
  const content = isEditing ? (
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
  ) : (
    <span className="truncate">{asCsv || '—'}</span>
  );

  return (
    <div className={showLabel ? 'flex flex-col gap-1' : ''}>
      <FieldLabel label={label} showLabel={showLabel} />
      {content}
    </div>
  );
}


