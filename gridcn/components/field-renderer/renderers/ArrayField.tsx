'use client';

import * as React from 'react';
import { FieldLabel, type CommonFieldProps } from './TextField';

export function ArrayField({ label, showLabel, value, onChange, isEditing = false, autoFocus = false }: CommonFieldProps<any[]>) {
  const content = isEditing ? (
    <textarea
      autoFocus={autoFocus}
      className="block w-full rounded-md border px-3 py-2 text-sm font-mono"
      value={Array.isArray(value) ? JSON.stringify(value, null, 2) : ''}
      onChange={(e) => {
        try {
          const parsed = JSON.parse(e.target.value);
          onChange(Array.isArray(parsed) ? parsed : value);
        } catch {
          // keep as-is
        }
      }}
    />
  ) : Array.isArray(value) ? (
    <div className="flex flex-wrap gap-1">
      {value.map((item, i) => (
        <span key={i} className="px-1.5 py-0.5 text-xs rounded bg-muted">
          {typeof item === 'object' ? JSON.stringify(item) : String(item)}
        </span>
      ))}
    </div>
  ) : (
    <span>—</span>
  );

  return (
    <div className={showLabel ? 'flex flex-col gap-1' : ''}>
      <FieldLabel label={label} showLabel={showLabel} />
      {content}
    </div>
  );
}


