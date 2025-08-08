## Meta-Schema Specification (Abstract Model)

```ts
export type ScalarType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "id"
  | "enum"
  | "json"
  | "int64"
  | "bytes";

export type CollectionType =
  | { kind: "array"; element: FieldType }
  | { kind: "object"; fields: Record<string, FieldMeta> };

export type FieldType =
  | { kind: "scalar"; type: ScalarType; format?: string }
  | { kind: "collection"; collection: CollectionType }
  | { kind: "union"; options: FieldType[] };

export type RelationMeta = {
  kind: "relation";
  table: string;
  cardinality: "one" | "many";
  displayField?: string;
};

export type EnumMeta = {
  values: string[];
  labels?: Record<string, string>;
};

export type FilterOperator =
  | "eq" | "neq"
  | "contains" | "startsWith" | "endsWith"
  | "lt" | "lte" | "gt" | "gte"
  | "in" | "notIn"
  | "isNull" | "isNotNull"
  | "between";

export type SortDirection = "asc" | "desc";

export type FieldBehavior = {
  editable?: boolean;
  required?: boolean;
  unique?: boolean;
  defaultValue?: unknown;
  computed?: boolean;
  readOnly?: boolean;
};

export type FieldRenderHints = {
  label?: string;
  placeholder?: string;
  helpText?: string;
  width?: number;
  pinned?: "left" | "right";
  component?: string;
  options?: EnumMeta;
};

export type FieldValidation = {
  zod: unknown;
};

export type FieldMeta = {
  name: string;
  type: FieldType;
  relation?: RelationMeta;
  filterOperators: FilterOperator[];
  sortable: boolean;
  groupable: boolean;
  behaviors: FieldBehavior;
  render: FieldRenderHints;
  validation: FieldValidation;
};

export type IndexMeta = {
  name: string;
  fields: string[];
};

export type TableMeta = {
  name: string;
  label?: string;
  fields: Record<string, FieldMeta>;
  defaultSort?: { field: string; direction: SortDirection }[];
  indexes?: IndexMeta[];
  rowActions?: ("edit" | "delete" | "duplicate" | "custom")[];
  serverFiltering?: boolean;
  serverSorting?: boolean;
  serverPagination?: boolean;
};

export type RegistryMeta = {
  version: string;
  tables: Record<string, TableMeta>;
};
```

### Rationale
- Encodes enough info to derive columns, filters, sorts, groupers, editors, and forms.
- Encodes relations for pickers and display values; provides validators used across client and server.
- Leaves room for server-side pushdown and performance tuning.

### Required System Fields
- `_id` (read-only, pinned left) and `_creationTime` (optional) should exist on each `TableMeta` with `editable: false` and appropriate renderers.

