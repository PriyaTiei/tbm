/**
 * SEED UTILITY DATABASE ONLY
 * Database: utilityAutoMaint
 * Source: backend/data/utility_checkitems.json (202 items from 'UTILITY DEPT')
 * 
 * Usage:
 *   node backend/scripts/seed_utility.js [--host=10.82.126.73] [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const match = args.find((a) => a.startsWith(`--${name}=`));
  return match ? match.split('=')[1] : fallback;
};

const DB_NAME = 'utilityAutoMaint';
const host = getArg('host', process.env.MONGO_PATH || '10.82.126.73');
const isDryRun = args.includes('--dry-run');
const DATA_FILE = path.join(__dirname, '..', 'data', 'utility_checkitems.json');

async function seedUtility() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌ Data file not found: ${DATA_FILE}`);
    process.exit(1);
  }

  const items = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log(`\n======================================================`);
  console.log(`🚀 SEEDING UTILITY ONLY`);
  console.log(`📁 Source: backend/data/utility_checkitems.json`);
  console.log(`🎯 Target Database: ${DB_NAME}`);
  console.log(`📊 Total Utility Cards: ${items.length}`);
  console.log(`======================================================\n`);

  if (isDryRun) {
    console.log(`🔍 [DRY RUN] Would connect to: mongodb://${host}:27017/${DB_NAME}`);
    console.log(`🔍 [DRY RUN] First item sample:\n`, JSON.stringify(items[0], null, 2));
    console.log(`\n✅ [DRY RUN] Validated ${items.length} items. Nothing written to database.`);
    process.exit(0);
  }

  let mongoose;
  try {
    mongoose = require('mongoose');
  } catch (e) {
    try {
      mongoose = require(path.join(__dirname, '..', 'node_modules', 'mongoose'));
    } catch (e2) {
      console.error('❌ Mongoose not found. Run npm install inside backend/ first.');
      process.exit(1);
    }
  }

  let bcryptjs;
  try {
    bcryptjs = require('bcryptjs');
  } catch (e) {
    try {
      bcryptjs = require(path.join(__dirname, '..', 'node_modules', 'bcryptjs'));
    } catch (e2) {
      bcryptjs = null;
    }
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

  // Clean insert or update
  const now = new Date();
  const docsToInsert = items.map((it) => ({
    ...it,
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  }));

  if (existingCount > 0) {
    console.log(`⚠️ Overwriting existing ${existingCount} records in ${DB_NAME}.checkitems...`);
    await checkItemCollection.deleteMany({});
  }

  const result = await checkItemCollection.insertMany(docsToInsert);
  console.log(`\n🎉 SUCCESS! Inserted ${result.insertedCount} Utility cards into ${DB_NAME}.checkitems.`);

  // Ensure users collection is populated so operators & TLs can log in
  try {
    const usersCollection = connection.collection('users');
    const userCount = await usersCollection.countDocuments();

    // 1. Try copying existing users from autoMaint
    if (userCount === 0) {
      console.log(`ℹ️ No users found in ${DB_NAME}.users. Attempting to copy from autoMaint...`);
      try {
        const sourceDb = connection.client.db('autoMaint');
        const sourceUsers = await sourceDb.collection('users').find({}).toArray();
        if (sourceUsers.length > 0) {
          await usersCollection.insertMany(sourceUsers);
          console.log(`✅ Copied ${sourceUsers.length} user accounts from autoMaint into ${DB_NAME}.users.`);
        }
      } catch (err) {
        console.log(`ℹ️ Could not copy from autoMaint: ${err.message}`);
      }
    }

    // 2. Ensure admin account exists with admin123
    const adminExists = await usersCollection.findOne({ name: 'admin' });
    if (!adminExists && bcryptjs) {
      const hashedPassword = await bcryptjs.hash('admin123', 10);
      await usersCollection.insertOne({
        name: 'admin',
        password: hashedPassword,
        role: 'admin',
        level: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ Created default admin account: Username: "admin" | Password: "admin123"`);
    }

    const finalUsers = await usersCollection.find({}, { projection: { name: 1, role: 1, level: 1 } }).toArray();
    console.log(`\n📋 Available Users in ${DB_NAME}:`);
    finalUsers.forEach((u) => console.log(`   - ${u.name} (Role: ${u.role || 'user'}, Level: ${u.level})`));
  } catch (userErr) {
    console.log(`ℹ️ User copy note: ${userErr.message}`);
  }

  await connection.close();
  console.log(`\n🔌 Disconnected from ${DB_NAME}.`);
  process.exit(0);
}

seedUtility().catch((err) => {
  console.error(`\n❌ Error seeding Utility:`, err);
  process.exit(1);
});
