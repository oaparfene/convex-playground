'use client';

import Link from 'next/link';
import { Card, CardHeader, CardHeading } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const tables = [
  { name: 'callsigns', description: 'Manage aircraft callsigns and countries' },
  { name: 'sensors', description: 'View and edit sensor specifications' },
  { name: 'aircrafts', description: 'Aircraft configurations and sensor assignments' },
  { name: 'scheduledFlights', description: 'Flight scheduling and assignments' },
];

export default function TablesPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Database Tables</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <Card className="p-4" key={table.name}>
            <CardHeader>
              <CardHeading className="capitalize">{table.name}</CardHeading>
              <p className="text-muted-foreground text-sm">{table.description}</p>
            </CardHeader>
              <div className="pt-0">
                <Link href={`/table/${table.name}`}>
                  <Button variant="outline" className="w-full">
                    View Table
                  </Button>
                </Link>
              </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
