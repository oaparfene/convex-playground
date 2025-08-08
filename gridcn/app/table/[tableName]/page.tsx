'use client';

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { tableQueries } from "@/lib/registry/queries";
import { DynamicDataGrid } from "@/components/data-grid/dynamic-crud";

export default function TablePage() {
  const params = useParams<{ tableName: string }>();
  const tableName = params.tableName as string;

  // Type-safe query selection
  const query = tableQueries[tableName as keyof typeof tableQueries];

  // Fetch data using the appropriate query
  const data = useQuery(query);

  if (!query) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Table not found</h1>
        <p className="text-muted-foreground">
          The table "{tableName}" does not exist. Available tables: {Object.keys(tableQueries).join(', ')}
        </p>
      </div>
    );
  }

  if (data === undefined) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        <p className="text-muted-foreground">Fetching {tableName} data...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 capitalize">{tableName}</h1>
      <DynamicDataGrid
        tableName={tableName}
        data={data || []}
      />
    </div>
  );
}
