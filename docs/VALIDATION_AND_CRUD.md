## Validation & CRUD Strategy (Zod v3 + Convex)

### Validation flow
- Client: preflight validate with Zod (form submit, inline edit commit).
- Server: zCustomMutation/Query from `convex-helpers/server/zod` converts Zod to Convex validator and revalidates.
- Convex schema stays aligned via `zodOutputToConvex` for `defineTable` fields where applicable.

### Error surfaces
- Field-level errors under inputs and in-cell tooltips; row-level errors in toast and row banners.
- Server errors map to form and cell state; optimistic updates rollback.

### Generic CRUD endpoints (conceptual)
- `list(table, query)`
  - Args: `table: string`, `pagination`, `filters`, `sorts`
  - Behavior: client-side initially; server pushdown later with indexes.
- `get(table, id)`
- `insert(table, data)`
  - Validate with full Zod schema; coerce defaults; return created row.
- `update(table, id, patch)`
  - Validate partial schema; merge server-side; return updated row.
- `delete(table, id)`

### IDs & relations
- Model relations via `FieldMeta.relation` and ensure server-side `v.id("table")` mapping.
- UI renders pickers and translates display values using `displayField`.

### Indexing & performance (later)
- Registry can recommend Convex indexes from common filter/sort patterns in `TableMeta.indexes`.

