const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config(); // fallback

const mongoPath = process.env.MONGO_PATH || "localhost";
const dbName = process.env.DB_NAME || "tbm"; // Replace with your DB name if different
const mongoUri = process.env.MONGO_URI || `mongodb://${mongoPath}:27017/${dbName}`;

// Load models
const PendingTask = require("./mongoSchema/pendingTaskModel");
const CheckItem = require("./mongoSchema/chekItemModel");

async function verifyPendingData() {
  try {
    console.log(`\nConnecting to: ${mongoUri}...`);
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB successfully.\n");

    console.log("=================================================");
    console.log("           PENDING LIST DB DIAGNOSTIC            ");
    console.log("=================================================");

    // 1. Total Raw Counts by Result
    const totalAll = await PendingTask.countDocuments({});
    const totalPending = await PendingTask.countDocuments({ result: "PENDING" });
    const totalOK = await PendingTask.countDocuments({ result: "OK" });
    const totalNG = await PendingTask.countDocuments({ result: "NG" });

    console.log("\n1. Overall Collection Counts in 'pendingtasks':");
    console.log(`   - Total documents:       ${totalAll}`);
    console.log(`   - result = 'PENDING':    ${totalPending} (Only these qualify for Pending List)`);
    console.log(`   - result = 'OK':         ${totalOK}`);
    console.log(`   - result = 'NG':         ${totalNG}`);

    // 2. Breakdown by Plant Section (pS)
    const pSBreakdown = await PendingTask.aggregate([
      { $match: { result: "PENDING" } },
      { $group: { _id: "$pS", count: { $sum: 1 } } }
    ]);
    console.log("\n2. Pending Tasks by Plant Section (pS):");
    pSBreakdown.forEach((b) => {
      console.log(`   - pS = '${b._id}': ${b.count}`);
    });

    // 3. Fetch all pending tasks and populate checkItem to check for orphans
    const allPending = await PendingTask.find({ result: "PENDING" })
      .populate("checkItem")
      .lean();

    const validTasks = [];
    const orphanedTasks = [];

    allPending.forEach((task) => {
      if (!task.checkItem) {
        orphanedTasks.push(task);
      } else {
        validTasks.push(task);
      }
    });

    console.log("\n3. Data Integrity & CheckItem Population:");
    console.log(`   - Valid tasks (checkItem exists):   ${validTasks.length} (Rendered in UI)`);
    console.log(`   - Orphaned tasks (null checkItem):  ${orphanedTasks.length} (DROPPED by backend!)`);
    if (orphanedTasks.length > 0) {
      console.log("     Warning: These orphaned tasks exist in DB but will NOT show on UI cards.");
    }

    // 4. Aging Breakdown (1-10, 11-20, 20+)
    const ageSummary = { "1-10": 0, "11-20": 0, "20+": 0, "0 or Invalid": 0 };
    const currentDate = new Date();

    validTasks.forEach((task) => {
      if (!task.entryDates || task.entryDates.length === 0) {
        ageSummary["0 or Invalid"]++;
        return;
      }
      const earliest = new Date(Math.min(...task.entryDates.map((d) => new Date(d))));
      const daysOld = Math.ceil((currentDate.getTime() - earliest.getTime()) / (1000 * 3600 * 24));

      if (daysOld >= 1 && daysOld <= 10) {
        ageSummary["1-10"]++;
      } else if (daysOld >= 11 && daysOld <= 20) {
        ageSummary["11-20"]++;
      } else if (daysOld > 20) {
        ageSummary["20+"]++;
      } else {
        ageSummary["0 or Invalid"]++;
      }
    });

    console.log("\n4. Age Summary (Matches Badges in Pending UI):");
    console.log(`   - 1-10 days:   ${ageSummary["1-10"]}`);
    console.log(`   - 11-20 days:  ${ageSummary["11-20"]}`);
    console.log(`   - 20+ days:    ${ageSummary["20+"]}`);
    if (ageSummary["0 or Invalid"] > 0) {
      console.log(`   - 0 or Invalid: ${ageSummary["0 or Invalid"]}`);
    }

    // 5. Line and Process Card Breakdown
    const lineProcessMap = {};
    validTasks.forEach((task) => {
      const line = task.line || "Unknown Line";
      const processNo = task.processNo || "Unknown Process";

      if (!lineProcessMap[line]) lineProcessMap[line] = {};
      if (!lineProcessMap[line][processNo]) lineProcessMap[line][processNo] = 0;
      lineProcessMap[line][processNo]++;
    });

    console.log("\n5. Card Breakdown (Matches Total Count on Each Process Card):");
    for (const [line, processes] of Object.entries(lineProcessMap)) {
      console.log(`   Line: [${line}]`);
      for (const [proc, count] of Object.entries(processes)) {
        console.log(`      * Process ${proc.padEnd(15)}: ${count} tasks`);
      }
    }

    console.log("\n=================================================\n");
  } catch (err) {
    console.error("Verification error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

verifyPendingData();

