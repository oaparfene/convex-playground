'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardHeading } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">Convex Playground</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardHeading>Dynamic Tables</CardHeading>
            <p className="text-muted-foreground">
              View and edit data from your Convex database with dynamically generated columns
            </p>
            <div className="pt-4">
              <Link href="/tables">
                <Button className="w-full">
                  Browse Database Tables
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      </div>


    </div>
  );
}