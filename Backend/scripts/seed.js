#!/usr/bin/env node

// Seed script for QuickServe dummy data
require('dotenv').config();
const { seedDummyData, clearAllData } = require('../src/utils/seedDummyData');

async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'seed':
        console.log('🌱 Seeding dummy data...');
        await seedDummyData();
        break;
        
      case 'clear':
        console.log('🗑️ Clearing all data...');
        await clearAllData();
        break;
        
      case 'reset':
        console.log('🔄 Resetting database with fresh dummy data...');
        await clearAllData();
        await seedDummyData();
        break;
        
      default:
        console.log(`
📋 QuickServe Database Seeder

Usage:
  npm run seed:data     - Add dummy data to database
  npm run seed:clear    - Clear all data from database  
  npm run seed:reset    - Clear and re-seed with fresh data

Commands:
  node scripts/seed.js seed     - Seed dummy data
  node scripts/seed.js clear    - Clear all data
  node scripts/seed.js reset    - Reset with fresh data
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();