'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { FieldLabel, type CommonFieldProps } from './TextField';

export function NumberField({ label, showLabel, value, onChange, isEditing = false, autoFocus = false }: CommonFieldProps<number | string | undefined>) {
  const display = value ?? '';
  const content = isEditing ? (
    <Input
      autoFocus={autoFocus}
      type="number"
      value={display as any}
      onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
    />
  ) : (
    <span className="font-mono">{display === '' ? '—' : String(display)}</span>
  );

  return (
    <div className={showLabel ? 'flex flex-col gap-1' : ''}>
      <FieldLabel label={label} showLabel={showLabel} />
      {content}
    </div>
  );
}


