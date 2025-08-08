import { z } from "zod";
import type {
  CollectionType,
  EnumMeta,
  FieldMeta,
  FieldOverrides,
  FieldRendererType,
  FieldType,
  FilterOperator,
  RegistryMeta,
  ScalarType,
  TableBuildOptions,
  TableMeta,
} from "../types";

function scalarTypeFromZod(schema: z.ZodTypeAny): { type: ScalarType; format?: string } | null {
  const def = (schema as any)._def;
  const t = def?.typeName;
  switch (t) {
    case z.ZodFirstPartyTypeKind.ZodString:
      // Try to infer format via checks
      const checks: any[] = def.checks || [];
      const email = checks.some((c) => c.kind === "email");
      const url = checks.some((c) => c.kind === "url");
      const uuid = checks.some((c) => c.kind === "uuid");
      const cuid = checks.some((c) => c.kind === "cuid" || c.kind === "cuid2");
      return { type: "string", format: email ? "email" : url ? "url" : uuid ? "uuid" : cuid ? "cuid" : undefined };
    case z.ZodFirstPartyTypeKind.ZodNumber:
      return { type: "number" };
    case z.ZodFirstPartyTypeKind.ZodBoolean:
      return { type: "boolean" };
    case z.ZodFirstPartyTypeKind.ZodDate:
      return { type: "date" };
    case z.ZodFirstPartyTypeKind.ZodBigInt:
      return { type: "int64" };
    case z.ZodFirstPartyTypeKind.ZodLiteral:
      // literal of string/number could be treated as enum of one, but keep json/string for now
      return { type: typeof def.value === "number" ? "number" : "string" };
    case z.ZodFirstPartyTypeKind.ZodNull:
    case z.ZodFirstPartyTypeKind.ZodNaN:
    case z.ZodFirstPartyTypeKind.ZodUndefined:
      return { type: "json" };
    case z.ZodFirstPartyTypeKind.ZodAny:
    case z.ZodFirstPartyTypeKind.ZodUnknown:
    case z.ZodFirstPartyTypeKind.ZodVoid:
      return { type: "json" };
    default:
      return null;
  }
}

function filterOperatorsFor(fieldType: FieldType): FilterOperator[] {
  if (fieldType.kind === "scalar") {
    switch (fieldType.type) {
      case "string":
        return ["contains", "startsWith", "endsWith", "eq", "neq", "isNull", "isNotNull", "in", "notIn"];
      case "number":
      case "int64":
        return ["eq", "neq", "lt", "lte", "gt", "gte", "between", "isNull", "isNotNull"];
      case "boolean":
        return ["eq", "neq", "isNull", "isNotNull"];
      case "date":
        return ["eq", "neq", "lt", "lte", "gt", "gte", "between", "isNull", "isNotNull"];
      case "enum":
        return ["eq", "neq", "in", "notIn", "isNull", "isNotNull"];
      case "id":
        return ["eq", "neq", "in", "notIn", "isNull", "isNotNull"];
      case "json":
      case "bytes":
        return ["isNull", "isNotNull"];
    }
  }
  if (fieldType.kind === "collection") {
    return ["contains", "in", "notIn", "isNull", "isNotNull"];
  }
  return ["eq", "neq"];
}

function toFieldMeta(
  name: string,
  schema: z.ZodTypeAny,
  overrides?: FieldOverrides,
  defaultRenderer?: (args: { fieldType: FieldType; relation?: { cardinality?: "one" | "many" } }) => FieldRendererType | undefined
): FieldMeta {
  // optional unwrap
  let optional = false;
  let inner = schema as z.ZodTypeAny;
  while (inner instanceof z.ZodOptional || inner instanceof z.ZodNullable) {
    optional = true;
    inner = (inner as any)._def.innerType;
  }

  const shape = (inner as any)._def;
  let fieldType: FieldType;
  let renderFormat: string | undefined;

  if (inner instanceof z.ZodArray) {
    const elementMeta = toFieldMeta(name + "[]", (inner as any)._def.type, undefined, defaultRenderer);
    fieldType = { kind: "collection", collection: { kind: "array", element: elementMeta.type } };
  } else if (inner instanceof z.ZodObject) {
    const objectShape: Record<string, z.ZodTypeAny> = (inner as any)._def.shape();
    const fields: Record<string, FieldMeta> = {};
    for (const [k, v] of Object.entries(objectShape)) {
      fields[k] = toFieldMeta(k, v, undefined, defaultRenderer);
    }
    fieldType = { kind: "collection", collection: { kind: "object", fields } };
  } else if (inner instanceof z.ZodEnum) {
    const values = (inner as z.ZodEnum<[string, ...string[]]>).options;
    fieldType = { kind: "scalar", type: "enum" };
    // stash enum values in render options by default
    const enumMeta: EnumMeta = { values: Array.from(values) };
    return {
      name,
      type: fieldType,
      relation: overrides?.relation,
      filterOperators: overrides?.filterOperators ?? filterOperatorsFor(fieldType),
      sortable: overrides?.sortable ?? true,
      groupable: overrides?.groupable ?? true,
      behaviors: {
        required: !optional,
        editable: overrides?.behaviors?.editable ?? true,
        readOnly: overrides?.behaviors?.readOnly ?? false,
        unique: overrides?.behaviors?.unique,
        defaultValue: overrides?.behaviors?.defaultValue,
        computed: overrides?.behaviors?.computed,
      },
      render: { ...overrides?.render, options: overrides?.render?.options ?? enumMeta },
      validation: { zod: schema },
    };
  } else {
    const scalar = scalarTypeFromZod(inner);
    if (scalar) {
      fieldType = { kind: "scalar", type: scalar.type, format: scalar.format };
      renderFormat = scalar.format;
    } else {
      // fallback to json
      fieldType = { kind: "scalar", type: "json" };
    }
  }

  const computedComponent: FieldRendererType | undefined =
    overrides?.render?.component ??
    (defaultRenderer
      ? defaultRenderer({ fieldType, relation: overrides?.relation })
      : undefined);

  return {
    name,
    type: fieldType,
    relation: overrides?.relation,
    filterOperators: overrides?.filterOperators ?? filterOperatorsFor(fieldType),
    sortable: overrides?.sortable ?? true,
    groupable: overrides?.groupable ?? true,
    behaviors: {
      required: !optional,
      editable: overrides?.behaviors?.editable ?? true,
      readOnly: overrides?.behaviors?.readOnly ?? false,
      unique: overrides?.behaviors?.unique,
      defaultValue: overrides?.behaviors?.defaultValue,
      computed: overrides?.behaviors?.computed,
    },
    render: { ...overrides?.render, component: computedComponent, ...(renderFormat ? { placeholder: renderFormat } : {}) },
    validation: { zod: schema },
  };
}

export function buildTableMeta(
  tableName: string,
  zodObject: z.ZodObject<any, any, any, any>,
  options?: TableBuildOptions
): TableMeta {
  const shape = zodObject.shape;
  const fields: Record<string, FieldMeta> = {};

  const pickDefaultRenderer = (args: { fieldType: FieldType; relation?: { cardinality?: "one" | "many" } }): FieldRendererType | undefined => {
    const custom = options?.defaultRenderers;
    // Relations first
    if (args.relation?.cardinality === "one") return custom?.["relation_one"] ?? "id-select";
    if (args.relation?.cardinality === "many") return custom?.["relation_many"] ?? "id-multi-select";
    // Collections
    if (args.fieldType.kind === "collection") {
      if (args.fieldType.collection.kind === "array") return custom?.["array"] ?? "array";
      if (args.fieldType.collection.kind === "object") return custom?.["object"] ?? "object";
    }
    // Scalars
    if (args.fieldType.kind === "scalar") {
      switch (args.fieldType.type) {
        case "string":
          return custom?.["string"] ?? "text";
        case "number":
        case "int64":
          return custom?.["number"] ?? "number";
        case "boolean":
          return custom?.["boolean"] ?? "checkbox";
        case "date":
          return custom?.["date"] ?? "date";
        case "enum":
          return custom?.["enum"] ?? "select";
        case "id":
          return custom?.["id"] ?? "id-select";
        case "json":
        case "bytes":
          return custom?.["json"] ?? "json";
      }
    }
    return undefined;
  };

  const includeSystem = options?.includeSystemFields ?? true;
  if (includeSystem) {
    // System fields; UI should treat _id as read-only, pinned left, sortable/groupable
    fields["_id"] = {
      name: "_id",
      type: { kind: "scalar", type: "id" },
      relation: undefined,
      filterOperators: ["eq", "neq", "in", "notIn", "isNull", "isNotNull"],
      sortable: true,
      groupable: true,
      behaviors: { editable: false, readOnly: true, required: true },
      render: { label: "ID", pinned: "left", component: pickDefaultRenderer({ fieldType: { kind: "scalar", type: "id" } }) },
      validation: { zod: z.any() },
    };
    fields["_creationTime"] = {
      name: "_creationTime",
      type: { kind: "scalar", type: "date" },
      relation: undefined,
      filterOperators: ["eq", "neq", "lt", "lte", "gt", "gte", "between", "isNull", "isNotNull"],
      sortable: true,
      groupable: false,
      behaviors: { editable: false, readOnly: true, required: false },
      render: { label: "Created", component: pickDefaultRenderer({ fieldType: { kind: "scalar", type: "date" } }) },
      validation: { zod: z.any() },
    };
  }

  for (const [name, schema] of Object.entries(shape as Record<string, z.ZodTypeAny>)) {
    fields[name] = toFieldMeta(
      name,
      schema as z.ZodTypeAny,
      options?.fieldOverrides?.[name],
      pickDefaultRenderer
    );
  }

  const tableMeta: TableMeta = {
    name: tableName,
    label: options?.tableLabel ?? tableName,
    fields,
    defaultSort: options?.includeSystemFields ? [{ field: "_creationTime", direction: "desc" }] : undefined,
    indexes: [],
  };

  return tableMeta;
}

export function buildRegistryMeta(tables: TableMeta[]): RegistryMeta {
  return {
    version: "0.1.0",
    tables: Object.fromEntries(tables.map((t) => [t.name, t])),
  };
}

