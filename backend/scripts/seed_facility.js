/**
 * SEED FACILITY DATABASE ONLY
 * Database: facilityAutoMaint
 * Source: backend/data/facility_checkitems.json (46 items from 'FACILITY')
 * 
 * Usage:
 *   node backend/scripts/seed_facility.js [--host=10.82.126.73] [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const match = args.find((a) => a.startsWith(`--${name}=`));
  return match ? match.split('=')[1] : fallback;
};

const DB_NAME = 'facilityAutoMaint';
const host = getArg('host', process.env.MONGO_PATH || '10.82.126.73');
const isDryRun = args.includes('--dry-run');
const DATA_FILE = path.join(__dirname, '..', 'data', 'facility_checkitems.json');

async function seedFacility() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌ Data file not found: ${DATA_FILE}`);
    process.exit(1);
  }

  const items = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log(`\n======================================================`);
  console.log(`🚀 SEEDING FACILITY ONLY`);
  console.log(`📁 Source: backend/data/facility_checkitems.json`);
  console.log(`🎯 Target Database: ${DB_NAME}`);
  console.log(`📊 Total Facility Cards: ${items.length}`);
  console.log(`======================================================\n`);

  if (isDryRun) {
    console.log(`🔍 [DRY RUN] Would connect to: mongodb://${host}:27017/${DB_NAME}`);
    console.log(`🔍 [DRY RUN] First item sample:\n`, JSON.stringify(items[0], null, 2));
    console.log(`\n✅ [DRY RUN] Validated ${items.length} items. Nothing written to database.`);
    process.exit(0);
  }

  const connUri = `mongodb://${host}:27017/${DB_NAME}`;
  console.log(`⏳ Connecting to ${connUri}...`);

  const connection = await mongoose.createConnection(connUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(`✅ Connected to MongoDB database: ${DB_NAME}`);

  const checkItemCollection = connection.collection('checkitems');
  const existingCount = await checkItemCollection.countDocuments();
  console.log(`ℹ️ Existing records in ${DB_NAME}.checkitems: ${existingCount}`);

  const now = new Date();
  const docsToInsert = items.map((it) => ({
    ...it,
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  }));

  const result = await checkItemCollection.insertMany(docsToInsert);
  console.log(`\n🎉 SUCCESS! Inserted ${result.insertedCount} Facility cards into ${DB_NAME}.checkitems.`);

  await connection.close();
  console.log(`🔌 Disconnected from ${DB_NAME}.`);
  process.exit(0);
}

seedFacility().catch((err) => {
  console.error(`\n❌ Error seeding Facility:`, err);
  process.exit(1);
});
