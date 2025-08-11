'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { z } from 'zod';
import { Registry } from '@/lib/registry';
import type { FieldMeta } from '@/lib/registry/types';
import { FieldRenderer } from '@/components/field-renderer/FieldRenderer';
import { Button } from '@/components/ui/button';
import type { Table } from "@tanstack/react-table";

type DynamicFormProps<TData> = {
  table: Table<TData>;
  tableName: string;
  onSubmit: (value: Record<string, any>) => Promise<void> | void;
  onCancel?: () => void;
  initialValues?: Record<string, any>;
};

export function DynamicForm<TData>({ tableName, onSubmit, onCancel, initialValues, table }: DynamicFormProps<TData>) {
  const tableMeta = Registry.describe().tables[tableName];

  const columns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== "undefined" && column.getCanHide(),
        ),
    [table],
  );

  const editableFields = useMemo(() => {
    if (!tableMeta) return [] as [string, FieldMeta][];
    return Object.entries(tableMeta.fields).filter(([name, field]) => field.behaviors?.editable !== false && !field.behaviors?.readOnly && name !== '_id');
  }, [tableMeta]);

  const zodObject = useMemo(() => {
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const [name, field] of editableFields) {
      shape[name] = field.validation?.zod ?? z.any();
    }
    return z.object(shape);
  }, [editableFields]);

  const [values, setValues] = useState<Record<string, any>>(() => {
    const base: Record<string, any> = {};
    for (const [name] of editableFields) base[name] = initialValues?.[name] ?? undefined;
    return base;
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = zodObject.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path?.[0];
        if (typeof path === 'string' && !fieldErrors[path]) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit(parsed.data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {editableFields.map(([name, field], index) => {
        const column = columns.find((c) => c.id === name);
        const helpText = (field.validation?.zod as any)?.description ?? (field.validation?.zod as any)?._def?.description;
        return (
          <div key={name} className="space-y-1">
            <FieldRenderer
              column={column}
              field={field}
              value={values[name]}
              onChange={(v) => handleChange(name, v)}
              isForm={true}
              isEditing={true}
            />
            {helpText && !errors[name] && (
              <p className="text-muted-foreground text-xs">{helpText}</p>
            )}
            {errors[name] && (
              <p className="text-destructive text-xs">{errors[name]}</p>
            )}
          </div>
        );
      })}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}


