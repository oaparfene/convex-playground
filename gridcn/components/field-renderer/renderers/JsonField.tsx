'use client';

import * as React from 'react';
import { FieldLabel, type CommonFieldProps } from './TextField';

export function JsonField({ label, showLabel, value, onChange, isEditing = false, autoFocus = false }: CommonFieldProps<any>) {
  const content = isEditing ? (
    <textarea
      autoFocus={autoFocus}
      className="block w-full rounded-md border px-3 py-2 text-sm font-mono"
      value={value ? JSON.stringify(value, null, 2) : ''}
      onChange={(e) => {
        try {
          onChange(e.target.value ? JSON.parse(e.target.value) : undefined);
        } catch {
          onChange(e.target.value);
        }
      }}
    />
  ) : (
    <span className="font-mono text-xs">{value ? JSON.stringify(value) : '—'}</span>
  );

  return (
    <div className={showLabel ? 'flex flex-col gap-1' : ''}>
      <FieldLabel label={label} showLabel={showLabel} />
      {content}
    </div>
  );
}


