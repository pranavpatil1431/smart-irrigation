import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Area from './models/Area.js';

dotenv.config();

const sampleAreas = [
  {
    name: 'North District Zone A',
    code: 'NDZ-A',
    district: 'North District',
    state: 'Maharashtra',
    description: 'Northern agricultural zone covering survey numbers 1-100',
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [73.8567, 18.5204],
        [73.8667, 18.5204],
        [73.8667, 18.5304],
        [73.8567, 18.5304],
        [73.8567, 18.5204]
      ]]
    }
  },
  {
    name: 'South District Zone B',
    code: 'SDZ-B',
    district: 'South District',
    state: 'Maharashtra',
    description: 'Southern agricultural zone covering survey numbers 101-200',
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [73.8567, 18.5104],
        [73.8667, 18.5104],
        [73.8667, 18.5204],
        [73.8567, 18.5204],
        [73.8567, 18.5104]
      ]]
    }
  },
  {
    name: 'East District Zone C',
    code: 'EDZ-C',
    district: 'East District',
    state: 'Maharashtra',
    description: 'Eastern agricultural zone covering survey numbers 201-300',
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [73.8667, 18.5204],
        [73.8767, 18.5204],
        [73.8767, 18.5304],
        [73.8667, 18.5304],
        [73.8667, 18.5204]
      ]]
    }
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Check if areas already exist
    const existingAreas = await Area.find();
    if (existingAreas.length > 0) {
      console.log('✅ Areas already exist:');
      existingAreas.forEach(area => {
        console.log(`   - ${area.name} (${area.code})`);
      });
      process.exit(0);
    }

    // Create sample areas
    for (const areaData of sampleAreas) {
      const area = new Area(areaData);
      await area.save();
      console.log(`✅ Created area: ${area.name} (${area.code})`);
    }

    console.log('\n📍 Sample areas created successfully!');
    console.log('\nNext steps:');
    console.log('1. Assign employees to areas using: POST /api/admin/areas/assign-employee');
    console.log('2. Create farms with survey numbers using: POST /api/admin/farms');
    console.log('3. Use survey numbers for farm distribution and management');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Seed error:', err);
    process.exit(1);
  });