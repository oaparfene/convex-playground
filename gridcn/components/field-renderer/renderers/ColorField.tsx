'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { FieldLabel, type CommonFieldProps } from './TextField';

export function ColorField({ label, showLabel, value, onChange, isEditing = false, autoFocus = false }: CommonFieldProps<string | undefined>) {
  const content = isEditing ? (
    <div className="flex items-center gap-2">
      <FieldLabel label={label} showLabel={showLabel} />
      <Input autoFocus={autoFocus} type="color" value={value ?? '#000000'} onChange={(e) => onChange(e.target.value)} />
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <FieldLabel label={label} showLabel={showLabel} />
      <div className="w-4 h-4 rounded border" style={{ backgroundColor: value || '#000000' }} />
      <span className="font-mono text-xs">{value ?? '—'}</span>
    </div>
  );

  // If no label in grid-cell mode, don't add extra wrapper layout
  if (!showLabel) return content;
  return <div className="flex flex-col gap-1">{content}</div>;
}


