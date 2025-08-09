'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';

export type CommonFieldProps<T = any> = {
  label?: string;
  showLabel?: boolean;
  value: T;
  onChange: (value: T) => void;
  isEditing?: boolean;
  autoFocus?: boolean;
};

export function FieldLabel({ label, showLabel }: { label?: string; showLabel?: boolean }) {
  if (!showLabel) return null;
  return <label className="text-sm font-medium">{label}</label>;
}

export function TextField({ label, showLabel, value, onChange, isEditing = false, autoFocus = false }: CommonFieldProps<string>) {
  const content = isEditing ? (
    <Input autoFocus={autoFocus} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
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


