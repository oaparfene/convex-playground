## Architecture Overview

### Layers
- **Registry layer** (`lib/registry`): Declares abstract meta-schemas for tables/fields, exposes typed generic queries/mutations, and supplies Zod validators. Concrete table hookups live here only.
- **UI layer** (`components/data-grid`, `components/forms`): Consumes registry abstractions only. Renders columns, filters, editors purely from meta; no table-specific code.
- **Server layer** (`convex/*`): Generic CRUD endpoints (list/get/insert/update/delete) wrapped in zod-custom queries/mutations; optional table-specific helpers if needed, but registry should prefer generic endpoints.

### Data flow
- UI requests `Registry.describe()` to retrieve meta-schemas (static import initially; Convex query later for runtime updates).
- UI renders grid and forms using meta. TanStack Table handles core grid mechanics; Shadcn renders controls.
- Client-side Zod validates requests; server-side convex-helpers revalidates using Zod-derived validators.

### Runtime schema updates
- Phase 1: Static registry module export (build-time).
- Phase 2: Convex `registry.describe` query returns meta at runtime to support new schemas without redeploy.

### Files & Directories (planned)
- `gridcn/lib/registry/types.ts` (meta types)
- `gridcn/lib/registry/adapters/zod.ts` (zod→meta extraction)
- `gridcn/lib/registry/adapters/convex.ts` (meta→convex validators)
- `gridcn/lib/registry/crud.ts` (generic API bindings)
- `gridcn/lib/registry/client.ts` (meta retrieval)
- `gridcn/lib/registry/index.ts` (aggregates concrete descriptors)
- `gridcn/lib/registry/tables/*` (concrete tables; used only by the registry)
- `gridcn/components/field-renderer/*` (renderers per type)
- `gridcn/components/forms/DynamicForm.tsx` (TanStack Form + Zod)
- `gridcn/components/data-grid/*` (enhanced dynamic-crud to consume Registry)

