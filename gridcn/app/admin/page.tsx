'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardHeading } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  
  const seedCallsigns = useMutation(api.seed.seedCallsigns);
  const seedSensors = useMutation(api.seed.seedSensors);
  const seedAircrafts = useMutation(api.seed.seedAircrafts);
  const seedScheduledFlights = useMutation(api.seed.seedScheduledFlights);
  const seedAll = useMutation(api.seed.seedAll);
  const clearAllData = useMutation(api.seed.clearAllData);

  const handleSeedAll = async () => {
    setIsSeeding(true);
    try {
      const result = await seedAll({});
      toast.success(`Database seeded: ${result}`);
    } catch (error) {
      toast.error(`Failed to seed database: ${error}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedTable = async (mutation: any, tableName: string) => {
    try {
      const result = await mutation({});
      toast.success(`${tableName} seeded: ${result}`);
    } catch (error) {
      toast.error(`Failed to seed ${tableName}: ${error}`);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }
    
    try {
      const result = await clearAllData({});
      toast.success(`Database cleared: ${result}`);
    } catch (error) {
      toast.error(`Failed to clear database: ${error}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      <div className="mb-8">
        <div className="flex gap-4">
          <Button 
            onClick={handleSeedAll} 
            disabled={isSeeding}
            size="lg"
          >
            {isSeeding ? 'Seeding...' : '🌱 Seed All Data'}
          </Button>
          <Button 
            variant="destructive"
            onClick={handleClearAll}
            size="lg"
          >
            🗑️ Clear All Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardHeading>Seed Callsigns</CardHeading>
            <p className="text-muted-foreground text-sm">
              Generate realistic callsigns using Faker (15 entries)
            </p>
            <div className="pt-4">
              <Button 
                variant="outline"
                onClick={() => handleSeedTable(seedCallsigns, 'Callsigns')}
                className="w-full"
              >
                Seed Callsigns
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardHeading>Seed Sensors</CardHeading>
            <p className="text-muted-foreground text-sm">
              Generate sensor specs with Faker (8 entries)
            </p>
            <div className="pt-4">
              <Button 
                variant="outline"
                onClick={() => handleSeedTable(seedSensors, 'Sensors')}
                className="w-full"
              >
                Seed Sensors
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardHeading>Seed Aircrafts</CardHeading>
            <p className="text-muted-foreground text-sm">
              Generate aircraft configs with Faker (10 entries)
            </p>
            <div className="pt-4">
              <Button 
                variant="outline"
                onClick={() => handleSeedTable(seedAircrafts, 'Aircrafts')}
                className="w-full"
              >
                Seed Aircrafts
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardHeading>Seed Flights</CardHeading>
            <p className="text-muted-foreground text-sm">
              Generate future flights with Faker (20 entries)
            </p>
            <div className="pt-4">
              <Button 
                variant="outline"
                onClick={() => handleSeedTable(seedScheduledFlights, 'Scheduled Flights')}
                className="w-full"
              >
                Seed Flights
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
