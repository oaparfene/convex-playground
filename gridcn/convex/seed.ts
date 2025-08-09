import { mutation, internalMutation } from "./_generated/server";
import { faker } from '@faker-js/faker';

export const seedCallsigns = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if callsigns already exist
    const existing = await ctx.db.query("callsigns").first();
    if (existing) {
      return "Callsigns already seeded";
    }

    const callsigns = [];
    const countries = [
      "USA", "UK", "Canada", "Australia", "Germany", "France", "Japan", 
      "South Korea", "Italy", "Spain", "Netherlands", "Sweden", "Norway"
    ];

    // Generate 15 random callsigns
    for (let i = 0; i < 15; i++) {
      callsigns.push({
        name: `${faker.word.noun().toUpperCase()}-${faker.number.int({ min: 10, max: 99 })}`,
        country: faker.helpers.arrayElement(countries),
      });
    }

    for (const callsign of callsigns) {
      await ctx.db.insert("callsigns", callsign);
    }

    return `${callsigns.length} callsigns seeded successfully`;
  },
});

export const seedSensors = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("sensors").first();
    if (existing) {
      return "Sensors already seeded";
    }

    const sensorTypes = ["Thermal", "Optical", "Multi-Spectral", "Radar", "LiDAR", "Infrared"];
    
    const sensors = [];

    // Generate 8 random sensors
    for (let i = 0; i < 8; i++) {
      const minRange = faker.number.int({ min: 50, max: 1000 });
      const maxRange = minRange + faker.number.int({ min: 2000, max: 15000 });
      
      sensors.push({
        name: `${faker.helpers.arrayElement(sensorTypes)} ${faker.word.adjective()} ${faker.word.noun()}`,
        type: faker.helpers.arrayElement(sensorTypes),
        color: faker.color.rgb({ format: 'hex' }),
        min_range: minRange,
        max_range: maxRange,
        resolution: faker.helpers.arrayElement([1920, 2048, 4096, 8192, 1080]),
        circular_error_probable: faker.number.float({ min: 0.5, max: 5.0, fractionDigits: 1 }),
        min_detectable_velocity: `${faker.number.int({ min: 1, max: 10 })} m/s`,
      });
    }

    for (const sensor of sensors) {
      await ctx.db.insert("sensors", sensor);
    }

    return `${sensors.length} sensors seeded successfully`;
  },
});

export const seedAircrafts = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("aircrafts").first();
    if (existing) {
      return "Aircrafts already seeded";
    }

    // Get sensor IDs
    const sensors = await ctx.db.query("sensors").collect();
    if (sensors.length === 0) {
      return "Please seed sensors first";
    }

    const aircraftTypes = ["Drone", "UAV", "Fighter", "Reconnaissance", "Surveillance"];
    const manufacturers = ["MQ", "RQ", "F", "B", "SR"];
    
    const aircrafts = [];

    // Generate 10 random aircrafts
    for (let i = 0; i < 10; i++) {
      // Randomly select 1-3 sensors for each aircraft
      const numSensors = faker.number.int({ min: 1, max: Math.min(3, sensors.length) });
      const selectedSensors = faker.helpers.shuffle(sensors).slice(0, numSensors);
      
      aircrafts.push({
        name: `${faker.helpers.arrayElement(aircraftTypes)} ${faker.helpers.arrayElement(manufacturers)}-${faker.number.int({ min: 1, max: 50 })}`,
        op_altitude: faker.number.int({ min: 10000, max: 70000 }),
        cruising_speed: faker.number.int({ min: 100, max: 800 }),
        endurance: faker.number.int({ min: 8, max: 48 }),
        sensors: selectedSensors.map((s: any) => s._id),
      });
    }

    for (const aircraft of aircrafts) {
      await ctx.db.insert("aircrafts", aircraft);
    }

    return `${aircrafts.length} aircrafts seeded successfully`;
  },
});

export const seedScheduledFlights = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("scheduledFlights").first();
    if (existing) {
      return "Scheduled flights already seeded";
    }

    const callsigns = await ctx.db.query("callsigns").collect();
    const aircrafts = await ctx.db.query("aircrafts").collect();
    
    if (callsigns.length === 0 || aircrafts.length === 0) {
      return "Please seed callsigns and aircrafts first";
    }

    const flights = [];

    // Generate 20 random scheduled flights
    for (let i = 0; i < 20; i++) {
      const startTime = faker.date.future({ years: 1 });
      const endTime = new Date(startTime.getTime() + faker.number.int({ min: 2, max: 24 }) * 60 * 60 * 1000);
      
      flights.push({
        callsign: (faker.helpers.arrayElement(callsigns) as any)._id,
        aircraft: (faker.helpers.arrayElement(aircrafts) as any)._id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      });
    }

    for (const flight of flights) {
      await ctx.db.insert("scheduledFlights", flight);
    }

    return `${flights.length} scheduled flights seeded successfully`;
  },
});

export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear all data from all tables
    const scheduledFlights = await ctx.db.query("scheduledFlights").collect();
    const aircrafts = await ctx.db.query("aircrafts").collect();
    const sensors = await ctx.db.query("sensors").collect();
    const callsigns = await ctx.db.query("callsigns").collect();

    for (const flight of scheduledFlights) {
      await ctx.db.delete(flight._id);
    }
    for (const aircraft of aircrafts) {
      await ctx.db.delete(aircraft._id);
    }
    for (const sensor of sensors) {
      await ctx.db.delete(sensor._id);
    }
    for (const callsign of callsigns) {
      await ctx.db.delete(callsign._id);
    }

    return "All data cleared successfully";
  },
});

// Internal functions to be called by seedAll
const _seedCallsigns = async (ctx: any) => {
  const existing = await ctx.db.query("callsigns").first();
  if (existing) {
    return "Callsigns already seeded";
  }

  const callsigns = [];
  const countries = [
    "USA", "UK", "Canada", "Australia", "Germany", "France", "Japan", 
    "South Korea", "Italy", "Spain", "Netherlands", "Sweden", "Norway"
  ];

  for (let i = 0; i < 15; i++) {
    callsigns.push({
      name: `${faker.word.noun().toUpperCase()}-${faker.number.int({ min: 10, max: 99 })}`,
      country: faker.helpers.arrayElement(countries),
    });
  }

  for (const callsign of callsigns) {
    await ctx.db.insert("callsigns", callsign);
  }

  return `${callsigns.length} callsigns seeded successfully`;
};

const _seedSensors = async (ctx: any) => {
  const existing = await ctx.db.query("sensors").first();
  if (existing) {
    return "Sensors already seeded";
  }

  const sensorTypes = ["Thermal", "Optical", "Multi-Spectral", "Radar", "LiDAR", "Infrared"];
  const colorTypes = ["RGB", "Infrared", "Multi", "Monochrome", "False Color"];
  
  const sensors = [];

  for (let i = 0; i < 8; i++) {
    const minRange = faker.number.int({ min: 50, max: 1000 });
    const maxRange = minRange + faker.number.int({ min: 2000, max: 15000 });
    
    sensors.push({
      name: `${faker.helpers.arrayElement(sensorTypes)} ${faker.word.adjective()} ${faker.word.noun()}`,
      type: faker.helpers.arrayElement(sensorTypes),
      color: faker.helpers.arrayElement(colorTypes),
      min_range: minRange,
      max_range: maxRange,
      resolution: faker.helpers.arrayElement([1920, 2048, 4096, 8192, 1080]),
      circular_error_probable: faker.number.float({ min: 0.5, max: 5.0, fractionDigits: 1 }),
      min_detectable_velocity: `${faker.number.int({ min: 1, max: 10 })} m/s`,
    });
  }

  for (const sensor of sensors) {
    await ctx.db.insert("sensors", sensor);
  }

  return `${sensors.length} sensors seeded successfully`;
};

const _seedAircrafts = async (ctx: any) => {
  const existing = await ctx.db.query("aircrafts").first();
  if (existing) {
    return "Aircrafts already seeded";
  }

  const sensors = await ctx.db.query("sensors").collect();
  if (sensors.length === 0) {
    return "Please seed sensors first";
  }

  const aircraftTypes = ["Drone", "UAV", "Fighter", "Reconnaissance", "Surveillance"];
  const manufacturers = ["MQ", "RQ", "F", "B", "SR"];
  
  const aircrafts = [];

  for (let i = 0; i < 10; i++) {
    const numSensors = faker.number.int({ min: 1, max: Math.min(3, sensors.length) });
    const selectedSensors = faker.helpers.shuffle(sensors).slice(0, numSensors);
    
    aircrafts.push({
      name: `${faker.helpers.arrayElement(aircraftTypes)} ${faker.helpers.arrayElement(manufacturers)}-${faker.number.int({ min: 1, max: 50 })}`,
      op_altitude: faker.number.int({ min: 10000, max: 70000 }),
      cruising_speed: faker.number.int({ min: 100, max: 800 }),
      endurance: faker.number.int({ min: 8, max: 48 }),
      sensors: selectedSensors.map((s: any) => s._id),
    });
  }

  for (const aircraft of aircrafts) {
    await ctx.db.insert("aircrafts", aircraft);
  }

  return `${aircrafts.length} aircrafts seeded successfully`;
};

const _seedScheduledFlights = async (ctx: any) => {
  const existing = await ctx.db.query("scheduledFlights").first();
  if (existing) {
    return "Scheduled flights already seeded";
  }

  const callsigns = await ctx.db.query("callsigns").collect();
  const aircrafts = await ctx.db.query("aircrafts").collect();
  
  if (callsigns.length === 0 || aircrafts.length === 0) {
    return "Please seed callsigns and aircrafts first";
  }

  const flights = [];

  for (let i = 0; i < 20; i++) {
    const startTime = faker.date.future({ years: 1 });
    const endTime = new Date(startTime.getTime() + faker.number.int({ min: 2, max: 24 }) * 60 * 60 * 1000);
    
    flights.push({
      callsign: (faker.helpers.arrayElement(callsigns) as any)._id,
      aircraft: (faker.helpers.arrayElement(aircrafts) as any)._id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
    });
  }

  for (const flight of flights) {
    await ctx.db.insert("scheduledFlights", flight);
  }

  return `${flights.length} scheduled flights seeded successfully`;
};

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const results = [];
    
    // Seed in dependency order
    results.push(await _seedCallsigns(ctx));
    results.push(await _seedSensors(ctx));
    results.push(await _seedAircrafts(ctx));
    results.push(await _seedScheduledFlights(ctx));
    // rendererSamples depends on nothing
    results.push(await _seedRendererSamples(ctx));
    
    return results.join(", ");
  },
});

// New seeder for rendererSamples
const _seedRendererSamples = async (ctx: any) => {
  const existing = await ctx.db.query("rendererSamples").first();
  if (existing) return "Renderer samples already seeded";

  const sample = {
    text: faker.lorem.words(3),
    textarea: faker.lorem.sentences(2),
    number: faker.number.int({ min: 0, max: 1000 }),
    boolean: faker.datatype.boolean(),
    date: faker.date.recent().toISOString(),
    datetime: faker.date.soon().toISOString(),
    select: faker.helpers.arrayElement(["optA", "optB", "optC"]),
    id_select: faker.string.uuid(),
    id_multi_select: [faker.string.uuid(), faker.string.uuid()],
    json: { foo: "bar", n: 1 },
    color: faker.color.rgb({ format: 'hex' }),
    obj: { nested: "value" },
    arr: ["a", 1, "b", 2],
  };

  await ctx.db.insert("rendererSamples", sample);
  return "Renderer samples seeded";
};