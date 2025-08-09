'use client';

import * as React from 'react';
import { FieldLabel, type CommonFieldProps } from './TextField';
import type { FieldMeta } from '@/lib/registry/types';

type Props = CommonFieldProps<string | undefined> & { field: FieldMeta };

export function SelectField({ field, label, showLabel, value, onChange, isEditing = false, autoFocus = false }: Props) {
  const options = field.render?.options?.values ?? [];

  if (!isEditing) {
    return (
      <div className={showLabel ? 'flex flex-col gap-1' : ''}>
        <FieldLabel label={label} showLabel={showLabel} />
        <span>{value ?? '—'}</span>
      </div>
    );
  }

  return (
    <div className={showLabel ? 'flex flex-col gap-1' : ''}>
      <FieldLabel label={label} showLabel={showLabel} />
      <select
        autoFocus={autoFocus}
        className="block w-full rounded-md border px-3 py-2 text-sm"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {field.render?.options?.labels?.[opt] ?? opt}
          </option>
        ))}
      </select>
    </div>
  );
}


