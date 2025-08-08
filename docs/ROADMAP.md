## Roadmap & Milestones

### M1: Meta-schema foundation
- Define meta types; implement zod→meta extraction and basic registry with current tables.
- Wire `DynamicDataGrid` to build columns from meta; read-only and client-side filtering/sorting.

### M2: Generic CRUD with validation
- Generic list/get/insert/update/delete using convex-helpers Zod v3.
- Add/Edit forms with FieldRenderer; inline cell editing; client + server validation.

### M3: Relations & advanced filters
- Relation pickers; per-type filter UIs; grouping & summaries; optimistic updates; error surfaces.

### M4: Server pushdown & performance
- Server-side pagination/sorting/filtering (opt-in in `TableMeta`); add recommended Convex indexes.

### M5: Runtime registry
- Serve meta from Convex; hot-load schemas without redeploy.

### M6: Packaging for Shadcn registry
- Extract reusable components, publishable registry entry, docs, examples.

