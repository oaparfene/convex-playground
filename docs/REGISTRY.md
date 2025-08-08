## Registry Pattern

The registry is the single source of truth for table meta-schemas, Zod validators, and generic CRUD wiring. UI components consume only the registry abstractions.

### Goals
- Hoist all references to concrete schemas into `lib/registry/tables/*`.
- Keep UI strictly schema-agnostic by consuming `RegistryMeta` and generic CRUD APIs.

### Structure (planned)
- `gridcn/lib/registry/types.ts` — Meta types (see META_SCHEMA.md)
- `gridcn/lib/registry/adapters/zod.ts` — Zod v3 → `FieldMeta` extraction
- `gridcn/lib/registry/adapters/convex.ts` — `zodOutputToConvex` alignment and id/relation mapping
- `gridcn/lib/registry/crud.ts` — Generic list/get/insert/update/delete bindings to Convex
- `gridcn/lib/registry/client.ts` — Retrieval of `RegistryMeta` (static import → Convex query later)
- `gridcn/lib/registry/index.ts` — Aggregates `tables/*` and exports `Registry.describe()`
- `gridcn/lib/registry/tables/*` — Concrete table descriptors combining Zod schemas + hints

### Generic Endpoints (conceptual)
- `list(table, query)` — pagination and optional filter/sort descriptors
- `get(table, id)`
- `insert(table, data)` — client and server Zod validate
- `update(table, id, patch)` — partial Zod validate
- `delete(table, id)`

### UI Consumption
- `DynamicDataGrid` obtains `TableMeta` via registry by `tableName` and builds:
  - Columns, filters, groupers, sorters, editors
  - Add/Edit forms & inline editing
  - Calls generic CRUD endpoints

### Runtime Meta Delivery
- Phase 1: Static export of `RegistryMeta` at build-time
- Phase 2: Convex `registry.describe` query to enable runtime additions without redeploy

