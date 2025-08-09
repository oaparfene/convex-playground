'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { FieldLabel, type CommonFieldProps } from './TextField';

export function IdSelectField({ label, showLabel, value, onChange, isEditing = false, autoFocus = false }: CommonFieldProps<string | undefined>) {
  const content = isEditing ? (
    <Input autoFocus={autoFocus} value={value ?? ''} onChange={(e) => onChange(e.target.value || undefined)} placeholder="Document ID" />
  ) : (
    <span className="font-mono text-xs">{value ?? '—'}</span>
  );

  return (
    <div className={showLabel ? 'flex flex-col gap-1' : ''}>
      <FieldLabel label={label} showLabel={showLabel} />
      {content}
    </div>
  );
}


