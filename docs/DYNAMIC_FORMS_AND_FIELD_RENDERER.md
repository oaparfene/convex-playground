## Dynamic Forms & Field Renderer

### Dynamic form generator
- TanStack Form (or compatible) with a Zod resolver for full type-safety.
- Inputs selected via `FieldRenderer` using `FieldMeta`.

### FieldRenderer responsibilities
- `string` → text/textarea; `format` maps to email/url/password/color.
- `number` → numeric input with step/min/max from Zod hints.
- `boolean` → checkbox/switch.
- `date` → date/time picker with optional range.
- `enum` → select/radio using `EnumMeta`.
- `id(relation)` → async select/picker with search; shows `displayField`.
- `array` → list editor; for ids: multi-select; for primitives: tag input; for objects: nested subform.
- `object` → collapsible subform; fields derived from nested `FieldMeta`.
- `json` → code editor/textarea with JSON validation.

### Inline cell editing
- Same `FieldRenderer` embedded in cells.
- Edit-on-double-click; commit on blur/enter; optimistic patch then server validation.

### Add/Edit flows
- Modal form from `TableMeta.fields`, defaults + visibility rules.
- Client and server validation with same Zod schema.

