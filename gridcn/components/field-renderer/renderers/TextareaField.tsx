'use client';

import * as React from 'react';
import { FieldLabel, type CommonFieldProps } from './TextField';

export function TextareaField({ label, showLabel, value, onChange, isEditing = false, autoFocus = false }: CommonFieldProps<string>) {
  const content = isEditing ? (
    <textarea
      autoFocus={autoFocus}
      className="block w-full rounded-md border px-3 py-2 text-sm"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  ) : (
    <span className="truncate">{value ?? '—'}</span>
  );

  return (
    <div className={showLabel ? 'flex flex-col gap-1' : ''}>
      <FieldLabel label={label} showLabel={showLabel} />
      {content}
    </div>
  );
}


