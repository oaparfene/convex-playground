import type { z } from "zod";

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
  colorField?: string;
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

export type FieldRendererType =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "date"
  | "datetime"
  | "select"
  | "radio"
  | "id-select"
  | "id-multi-select"
  | "json"
  | "color"
  | "tags"
  | "object"
  | "array";

export type FieldRenderHints = {
  label?: string;
  placeholder?: string;
  helpText?: string;
  width?: number;
  pinned?: "left" | "right";
  component?: FieldRendererType;
  options?: EnumMeta;
};

export type FieldValidation = {
  zod: z.ZodTypeAny;
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

export type FieldOverrides = Partial<Pick<
  FieldMeta,
  "relation" | "render" | "filterOperators" | "sortable" | "groupable" | "behaviors"
>>;

export type TableBuildOptions = {
  tableLabel?: string;
  fieldOverrides?: Record<string, FieldOverrides>;
  includeSystemFields?: boolean;
  defaultRenderers?: Partial<Record<
    | ScalarType
    | "relation_one"
    | "relation_many"
    | "array"
    | "object",
    FieldRendererType
  >>;
};

