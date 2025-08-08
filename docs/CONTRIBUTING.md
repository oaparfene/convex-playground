## Contributing

### Dependencies
- Zod v3, Convex, convex-helpers, TanStack Table, TanStack Form, Shadcn UI.

### Adding a new table (schema-agnostic)
1. Define Zod schema for the table.
2. Create `TableMeta` via zod-adapter and place it in `lib/registry/tables/<table>.ts`.
3. Register it in `lib/registry/index.ts` so it appears in `Registry.describe()`.
4. No UI changes required — grid & forms adapt from meta.

### Validations
- Define Zod schemas with `.describe()`/`.meta()` where useful for the UI.
- Client pre-validates; server revalidates in convex mutations/queries.

### Testing
- Unit-test zod→meta extraction and render mapping.
- E2E CRUD flows: list, add, inline edit, delete; validation errors surface correctly.

