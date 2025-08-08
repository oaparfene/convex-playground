## Grid Features by Type (TanStack Table)

### Filtering
- String: contains/startsWith/endsWith/equals; case-insensitive optionally.
- Number/Date: lt/lte/gt/gte/between; range pickers.
- Boolean: is true/false.
- Enum: in/notIn via multi-select.
- Relation: in/notIn on referenced ids; optional search by display field.
- Array: contains/overlaps.

### Sorting
- Type-aware comparators; multi-column; custom comparator hooks for dates.

### Grouping
- Group by any `groupable` field; nested groups; summary rows (count, sum, avg) driven by field types.

### Search
- Global search across displayed fields; optional server search API in future.

### Pagination
- Client-side initially; later server-driven when flagged in `TableMeta`.

