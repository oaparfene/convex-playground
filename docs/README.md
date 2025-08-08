## Schema-Agnostic Dynamic Data Grid Docs

This directory contains the planning, design, and contributor docs for the schema-agnostic, fullstack, type-safe, excel-like data grid built with Shadcn UI, TanStack Table/Form, Convex, and Zod v3.

### What is this?
- **Schema agnostic UI**: No concrete table references in UI components; UI consumes only abstract meta-schemas from a registry layer.
- **Fullstack type safety**: Zod v3 validators on both client and server; Convex validators derived from Zod via `convex-helpers`.
- **Runtime extensibility**: New tables can be added by extending the registry; the grid and forms adapt automatically.

### Start here
- [PRD](./PRD.md)
- [Architecture](./ARCHITECTURE.md)
- [Meta-Schema](./META_SCHEMA.md)
- [Registry Pattern](./REGISTRY.md)
- [Validation & CRUD](./VALIDATION_AND_CRUD.md)
- [Dynamic Forms & Field Renderer](./DYNAMIC_FORMS_AND_FIELD_RENDERER.md)
- [Grid Features](./GRID_FEATURES.md)
- [Roadmap](./ROADMAP.md)
- [Contributing](./CONTRIBUTING.md)
- [Open Questions](./OPEN_QUESTIONS.md)

### Related existing doc
- `gridcn/DYNAMIC_TABLES.md` documents the current implementation state and routes.

