'use client';

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { genericListQuery } from "@/lib/registry/queries";
import { DynamicDataGrid } from "@/components/data-table/dynamic/data-table-dynamic-base";

export default function TablePage() {
  const params = useParams<{ tableName: string }>();
  const tableName = params.tableName as string;

  const result = useQuery(genericListQuery, { table: tableName });

  if (result === undefined) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        <p className="text-muted-foreground">Fetching {tableName} data...</p>
      </div>
    );
  }

  // Handle both old format (array) and new format ({ data, relations })
  const data = Array.isArray(result) ? result : result.data || [];
  const relations = Array.isArray(result) ? {} : result.relations || {};

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 capitalize">{tableName}</h1>
      <DynamicDataGrid
        tableName={tableName}
        data={data}
        relations={relations}
      />
    </div>
  );
}
