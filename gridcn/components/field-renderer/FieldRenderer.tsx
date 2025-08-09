'use client';

import * as React from 'react';
import type { FieldMeta, FieldRendererType } from '@/lib/registry/types';
import { TextField } from './renderers/TextField';
import { TextareaField } from './renderers/TextareaField';
import { NumberField } from './renderers/NumberField';
import { CheckboxField } from './renderers/CheckboxField';
import { DateField } from './renderers/DateField';
import { DateTimeField } from './renderers/DateTimeField';
import { SelectField } from './renderers/SelectField';
import { IdSelectField } from './renderers/IdSelectField';
import { IdMultiSelectField } from './renderers/IdMultiSelectField';
import { JsonField } from './renderers/JsonField';
import { ColorField } from './renderers/ColorField';
import { ObjectField } from './renderers/ObjectField';
import { ArrayField } from './renderers/ArrayField';

export type FieldRendererProps = {
  field: FieldMeta;
  value: any;
  onChange: (value: any) => void;
  isForm?: boolean;
  isEditing?: boolean;
  autoFocus?: boolean;
};

export function FieldRenderer({ field, value, onChange, isForm = false, isEditing = false, autoFocus = false }: FieldRendererProps) {
  const component: FieldRendererType | undefined = field.render?.component;
  const label = field.render?.label ?? field.name;

  switch (component) {
    case 'textarea':
      return <TextareaField label={label} showLabel={isForm} value={value} onChange={onChange} isEditing={isEditing} autoFocus={autoFocus} />;
    case 'number':
      return <NumberField label={label} showLabel={isForm} value={value} onChange={onChange} isEditing={isEditing} autoFocus={autoFocus} />;
    case 'checkbox':
      return <CheckboxField label={label} showLabel={isForm} value={value} onChange={onChange} isEditing={isEditing} autoFocus={autoFocus} />;
    case 'date':
      return <DateField label={label} showLabel={isForm} value={value} onChange={onChange} isEditing={isEditing} autoFocus={autoFocus} />;
    case 'datetime':
      return <DateTimeField label={label} showLabel={isForm} value={value} onChange={onChange} isEditing={isEditing} autoFocus={autoFocus} />;
    case 'select':
      return <SelectField label={label} showLabel={isForm} field={field} value={value} onChange={onChange} isEditing={isEditing} autoFocus={autoFocus} />;
    case 'id-select':
      return <IdSelectField field={field} label={label} showLabel={isForm} value={value} onChange={onChange} isEditing={isEditing} autoFocus={autoFocus} />;
    case 'id-multi-select':
      return <IdMultiSelectField field={field} label={label} showLabel={isForm} value={value} onChange={onChange} isEditing={isEditing} autoFocus={autoFocus} />;
    case 'json':
      return <JsonField label={label} showLabel={isForm} value={value} onChange={onChange} isEditing={isEditing} autoFocus={autoFocus} />;
    case 'color':
      return <ColorField label={label} showLabel={isForm} value={value} onChange={onChange} isEditing={isEditing} autoFocus={autoFocus} />;
    case 'object':
      return <ObjectField label={label} showLabel={isForm} value={value} onChange={onChange} isEditing={isEditing} autoFocus={autoFocus} />;
    case 'array':
      return <ArrayField label={label} showLabel={isForm} value={value} onChange={onChange} isEditing={isEditing} autoFocus={autoFocus} />;
    case 'text':
    default:
      return <TextField label={label} showLabel={isForm} value={value} onChange={onChange} isEditing={isEditing} autoFocus={autoFocus} />;
  }
}

