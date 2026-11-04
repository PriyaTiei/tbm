/**
 * USER MANAGEMENT CLI SCRIPT FOR TBM (Utility & Facility)
 * ======================================================
 * Allows listing, adding, and updating users with roles and levels.
 *
 * Usage:
 *   # List all users in Utility:
 *   node backend/scripts/create_user.js --db=utilityAutoMaint --list
 *
 *   # List all users in Facility:
 *   node backend/scripts/create_user.js --db=facilityAutoMaint --list
 *
 *   # Add an Operator (Level 10):
 *   node backend/scripts/create_user.js --db=utilityAutoMaint --name=operator1 --pass=pass123 --role=operator --level=10
 *
 *   # Add a Team Leader (Level 20):
 *   node backend/scripts/create_user.js --db=utilityAutoMaint --name=tl_user --pass=tl123 --role=tl --level=20
 *
 *   # Add a Group Leader (Level 30):
 *   node backend/scripts/create_user.js --db=utilityAutoMaint --name=gl_user --pass=gl123 --role=gl --level=30
 *
 *   # Add an Admin (Level 100):
 *   node backend/scripts/create_user.js --db=utilityAutoMaint --name=new_admin --pass=admin123 --role=admin --level=100
 */

const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config();

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const match = args.find((a) => a.startsWith(`--${name}=`));
  return match ? match.split("=")[1] : fallback;
};

const hasFlag = (flag) => args.includes(`--${flag}`) || args.includes(`-${flag}`);

const host = getArg("host", process.env.MONGO_PATH || "localhost");
const dbName = getArg("db", process.env.DB_NAME || "utilityAutoMaint");
const userName = getArg("name");
const password = getArg("pass");
const roleArg = (getArg("role") || "").toLowerCase();
const levelArg = getArg("level");
const isList = hasFlag("list");

// Helper to deduce role & level
function resolveRoleAndLevel(roleInput, levelInput) {
  let level = 10;
  let role = "user";

  if (levelInput !== undefined) {
    level = Number(levelInput);
  } else if (roleInput.includes("admin")) {
    level = 100;
  } else if (roleInput === "gl" || roleInput.includes("group")) {
    level = 30;
  } else if (roleInput === "tl" || roleInput.includes("team") || roleInput.includes("lead")) {
    level = 20;
  } else {
    level = 10;
  }

  if (level >= 100 || roleInput === "admin") {
    role = "admin";
  } else if (roleInput) {
    role = roleInput;
  } else if (level === 30) {
    role = "gl";
  } else if (level === 20) {
    role = "tl";
  } else {
    role = "user";
  }

  return { role, level };
}

function getRoleTitle(level, role) {
  if (level >= 100 || role === "admin") return "Admin (Full Access)";
  if (level === 30 || role === "gl") return "Group Leader (GL Verification)";
  if (level === 20 || role === "tl") return "Team Leader (TL Verification & Add Cards)";
  if (level >= 10) return "Operator (Daily Inspection & Input)";
  return "Viewer / Guest";
}

async function run() {
  const mongoUri = `mongodb://${host}:27017/${dbName}`;
  console.log(`\n======================================================`);
  console.log(`👤 TBM USER MANAGEMENT TOOL`);
  console.log(`🎯 Database: ${dbName} (${host})`);
  console.log(`======================================================`);

  let connection;
  try {
    connection = await mongoose.createConnection(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ Connected to MongoDB: ${dbName}\n`);
  } catch (err) {
    console.error(`❌ Connection failed: ${err.message}`);
    process.exit(1);
  }

  const usersCollection = connection.collection("users");

  // LIST USERS
  if (isList || (!userName && !password)) {
    const users = await usersCollection.find({}, { projection: { name: 1, role: 1, level: 1, createdAt: 1 } }).toArray();
    console.log(`📋 Total Registered Users in [${dbName}]: ${users.length}\n`);
    if (users.length === 0) {
      console.log("   (No users found)");
    } else {
      console.log(`   ${"Username".padEnd(20)} | ${"Level".padEnd(6)} | ${"Role".padEnd(10)} | Description`);
      console.log(`   ${"-".repeat(20)}-+--------+------------+-----------------------------------`);
      users.forEach((u) => {
        const desc = getRoleTitle(u.level || 10, u.role || "user");
        console.log(`   ${String(u.name).padEnd(20)} | ${String(u.level ?? 10).padEnd(6)} | ${String(u.role || "user").padEnd(10)} | ${desc}`);
      });
    }
    console.log(`\n💡 To add a new user:`);
    console.log(`   node backend/scripts/create_user.js --db=${dbName} --name=<username> --pass=<password> --level=<10|20|30|100>\n`);
    await connection.close();
    process.exit(0);
  }

  // CREATE OR UPDATE USER
  if (!userName || !password) {
    console.error("❌ Error: Both --name=<username> and --pass=<password> are required to create a user.");
    await connection.close();
    process.exit(1);
  }

  const { role, level } = resolveRoleAndLevel(roleArg, levelArg);
  const hashedPassword = await bcryptjs.hash(password, 10);
  const existingUser = await usersCollection.findOne({ name: userName });

  if (existingUser) {
    console.log(`⚠️ User '${userName}' already exists. Updating password, role, and level...`);
    await usersCollection.updateOne(
      { _id: existingUser._id },
      {
        $set: {
          password: hashedPassword,
          role: role,
          level: level,
          updatedAt: new Date(),
        },
      }
    );
    console.log(`✅ User '${userName}' updated successfully!`);
  } else {
    await usersCollection.insertOne({
      name: userName,
      password: hashedPassword,
      role: role,
      level: level,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`🎉 New user '${userName}' created successfully!`);
  }

  console.log(`   - Username : ${userName}`);
  console.log(`   - Role     : ${role}`);
  console.log(`   - Level    : ${level} (${getRoleTitle(level, role)})`);
  console.log(`   - Database : ${dbName}\n`);

  await connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});

