'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { FieldMeta, FieldRendererType } from '@/lib/registry/types';

export type FieldRendererProps = {
  field: FieldMeta;
  value: any;
  onChange: (value: any) => void;
};

export function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  const component: FieldRendererType | undefined = field.render?.component;
  const label = field.render?.label ?? field.name;

  switch (component) {
    case 'textarea':
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{label}</label>
          <textarea
            className="block w-full rounded-md border px-3 py-2 text-sm"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case 'number':
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{label}</label>
          <Input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          />
        </div>
      );
    case 'checkbox':
      return (
        <div className="flex items-center gap-2">
          <Checkbox checked={!!value} onCheckedChange={(checked) => onChange(Boolean(checked))} />
          <span className="text-sm">{label}</span>
        </div>
      );
    case 'date':
    case 'datetime':
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{label}</label>
          <Input
            type={component === 'date' ? 'date' : 'datetime-local'}
            value={value ? toInputDateTime(value, component) : ''}
            onChange={(e) => onChange(fromInputDateTime(e.target.value))}
          />
        </div>
      );
    case 'select': {
      const options = field.render?.options?.values ?? [];
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{label}</label>
          <select
            className="block w-full rounded-md border px-3 py-2 text-sm"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
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
    case 'id-select':
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{label}</label>
          <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="Document ID" />
        </div>
      );
    case 'id-multi-select':
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{label}</label>
          <Input
            value={Array.isArray(value) ? value.join(',') : ''}
            onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
            placeholder="Comma-separated IDs"
          />
        </div>
      );
    case 'json':
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{label}</label>
          <textarea
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
        </div>
      );
    case 'color':
      return (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium w-36">{label}</label>
          <Input type="color" value={value ?? '#000000'} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case 'object':
    case 'array':
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{label}</label>
          <textarea
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
        </div>
      );
    case 'text':
    default:
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{label}</label>
          <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
  }
}

function toInputDateTime(value: any, kind: 'date' | 'datetime') {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  if (kind === 'date') return d.toISOString().slice(0, 10);
  const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
  return iso.slice(0, 16);
}

function fromInputDateTime(value: string) {
  if (!value) return undefined;
  return new Date(value).toISOString();
}
