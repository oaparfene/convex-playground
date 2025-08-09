'use client';

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldLabel, type CommonFieldProps } from './TextField';

export function CheckboxField({ label, showLabel, value, onChange, isEditing = false, autoFocus = false }: CommonFieldProps<boolean>) {
  if (!isEditing) {
    return (
      <div className={showLabel ? 'flex items-center gap-2' : 'flex items-center'}>
        <FieldLabel label={label} showLabel={showLabel} />
        <span className="text-sm">{value ? 'Yes' : 'No'}</span>
      </div>
    );
  }

  return (
    <div className={showLabel ? 'flex items-center gap-2' : 'flex items-center'}>
      <FieldLabel label={label} showLabel={showLabel} />
      {/* autoFocus for shadcn Checkbox -> focus the wrapper div */}
      <div tabIndex={autoFocus ? 0 : -1}>
        <Checkbox checked={!!value} onCheckedChange={(checked) => onChange(Boolean(checked))} />
      </div>
    </div>
  );
}


