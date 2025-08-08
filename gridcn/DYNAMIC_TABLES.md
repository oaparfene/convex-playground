# Dynamic Database Tables

This application now supports dynamic data grid generation based on your Convex schema.

## Features

### 🚀 Dynamic Table Rendering
- **Route**: `/table/[tableName]` - View any table defined in your schema
- **Auto-generated columns** based on data structure
- **Smart data type detection** and formatting
- **Real-time data** from Convex database

### 📊 Supported Tables
Based on your `schema.ts`:
- `callsigns` - Aircraft callsigns and countries
- `sensors` - Sensor specifications and capabilities  
- `aircrafts` - Aircraft configurations with sensor assignments
- `scheduledFlights` - Flight scheduling and assignments

### 🔧 Usage

#### Navigation
- Visit `/tables` to see all available tables
- Click on any table to view its data
- Use `/admin` to seed sample data

#### Dynamic Data Grid Features
- **Search**: Full-text search across all fields
- **Sorting**: Click column headers to sort
- **Pagination**: Configurable page sizes
- **Column Management**: Resize, reorder, hide/show columns
- **Actions**: Copy IDs, edit, delete (placeholders)

#### Data Type Handling
The dynamic grid automatically detects and formats:
- **Numbers**: Currency formatting for balance/price fields
- **Dates**: ISO string to readable date format
- **Arrays**: Displayed as badges (e.g., sensor assignments)
- **Booleans**: Yes/No badges
- **Emails**: Styled with underline and blue color
- **IDs**: Monospace font for better readability

### 🛠 Implementation Details

#### File Structure
```
gridcn/
├── app/
│   ├── table/[tableName]/page.tsx    # Dynamic table route
│   ├── tables/page.tsx               # Table browser
│   ├── admin/page.tsx                # Database seeding
│   └── demo/page.tsx                 # Original static demo
├── components/
│   └── data-grid/
│       ├── crud.tsx                  # Original component (now accepts props)
│       └── dynamic-crud.tsx          # New dynamic component
└── convex/
    ├── callsigns.ts                  # Query handlers
    ├── sensors.ts
    ├── aircrafts.ts
    ├── scheduledFlights.ts
    └── seed.ts                       # Database seeding functions
```

#### Key Components

**DynamicDataGrid** (`dynamic-crud.tsx`)
- Generates columns from data structure at runtime
- Handles complex data types (arrays, objects, etc.)
- Provides consistent UI/UX across all tables

**Table Page** (`table/[tableName]/page.tsx`)
- Maps table names to Convex queries
- Handles loading states and error cases
- Type-safe query selection

#### Convex Integration
Each table has its corresponding query handler:
```typescript
// Example: callsigns.ts
export const getCallsigns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("callsigns").collect();
  },
});
```

### 🎯 Migration from Static Data

The original `crud.tsx` component has been updated to:
- Accept optional `data` prop for external data
- Fall back to hardcoded demo data if no prop provided
- Maintain backwards compatibility

### 🔄 Seeding Data with Faker

The application uses **Faker.js** to generate realistic, randomized test data:

#### Using the Admin Panel (`/admin`):
1. **Quick Setup**: Click "🌱 Seed All Data" to populate everything at once
2. **Individual Tables**: Seed specific tables as needed
3. **Clear Database**: Use "🗑️ Clear All Data" to reset everything

#### Generated Data Includes:
- **Callsigns** (15 entries): Random military-style callsigns with countries
- **Sensors** (8 entries): Realistic sensor specifications with varied ranges and capabilities
- **Aircrafts** (10 entries): Aircraft configurations with randomly assigned sensors
- **Scheduled Flights** (20 entries): Future flight schedules with realistic time windows

All data is generated dynamically using Faker, so each seeding operation creates unique, realistic entries.

### 🚦 Getting Started

1. **Start your Convex dev server**:
   ```bash
   npx convex dev
   ```

2. **Seed your database**:
   - Visit `/admin` and click "Seed All Data"

3. **Browse your tables**:
   - Visit `/tables` to see all available tables
   - Click any table to view dynamic data grid

4. **Test dynamic features**:
   - Try searching, sorting, and column management
   - Compare with static demo at `/demo`

The system automatically adapts to your schema changes - add new tables to `schema.ts`, create corresponding query handlers, and they'll work with the dynamic system immediately!
