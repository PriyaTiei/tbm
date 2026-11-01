/**
 * Database Seeder for Utility & Facility
 * 
 * Usage:
 *   node backend/scripts/seed_database.js --target=utility [--host=10.82.126.73] [--dry-run]
 *   node backend/scripts/seed_database.js --target=facility [--host=10.82.126.73] [--dry-run]
 *   node backend/scripts/seed_database.js --target=all [--host=10.82.126.73]
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const match = args.find((a) => a.startsWith(`--${name}=`));
  return match ? match.split('=')[1] : fallback;
};

const target = getArg('target', 'all').toLowerCase();
const host = getArg('host', process.env.MONGO_PATH || '10.82.126.73');
const isDryRun = args.includes('--dry-run');

const UTILITY_DATA_FILE = path.join(__dirname, '..', 'data', 'utility_checkitems.json');
const FACILITY_DATA_FILE = path.join(__dirname, '..', 'data', 'facility_checkitems.json');

async function seedCollection(dbName, dataFile, label) {
  if (!fs.existsSync(dataFile)) {
    console.error(`❌ Data file not found for ${label}: ${dataFile}`);
    return;
  }

  const items = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  console.log(`\n======================================================`);
  console.log(`[${label.toUpperCase()}] Target DB: ${dbName}`);
  console.log(`[${label.toUpperCase()}] Total items to seed: ${items.length}`);
  console.log(`======================================================`);

  if (isDryRun) {
    console.log(`🔍 [DRY RUN] Would connect to: mongodb://${host}:27017/${dbName}`);
    console.log(`🔍 [DRY RUN] First item sample:`, items[0]);
    console.log(`🔍 [DRY RUN] Validation successful. Nothing written to database.`);
    return;
  }

  const connUri = `mongodb://${host}:27017/${dbName}`;
  console.log(`⏳ Connecting to ${connUri}...`);

  const connection = await mongoose.createConnection(connUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(`✅ Connected to ${dbName}`);

  const checkItemCollection = connection.collection('checkitems');
  const existingCount = await checkItemCollection.countDocuments();
  console.log(`ℹ️ Existing documents in ${dbName}.checkitems: ${existingCount}`);

  // Insert items with timestamps
  const now = new Date();
  const docsToInsert = items.map((it) => ({
    ...it,
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  }));

  const result = await checkItemCollection.insertMany(docsToInsert);
  console.log(`🎉 Successfully inserted ${result.insertedCount} checklist cards into ${dbName}.checkitems!`);

  await connection.close();
  console.log(`🔌 Disconnected from ${dbName}`);
}

async function run() {
  try {
    if (target === 'utility' || target === 'all') {
      await seedCollection('utilityAutoMaint', UTILITY_DATA_FILE, 'Utility');
    }
    if (target === 'facility' || target === 'all') {
      await seedCollection('facilityAutoMaint', FACILITY_DATA_FILE, 'Facility');
    }
    console.log(`\n✨ Seeding process completed successfully.`);
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Error during seeding:`, err);
    process.exit(1);
  }
}

run();
