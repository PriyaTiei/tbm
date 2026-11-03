const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config({ path: __dirname + "/.env" });

const args = process.argv.slice(2);
function getArg(name, def) {
  for (const a of args) {
    if (a.startsWith(`--${name}=`)) {
      return a.split("=")[1];
    }
  }
  return def;
}

const host = getArg("host", process.env.host || process.env.REACT_APP_HOST || "10.82.126.73");
const port = getArg("port", process.env.port || "5082");
const targetDate = getArg("date", "");

const dateQuery = targetDate ? `?date=${targetDate}` : "";
const generateUrl = `http://${host}:${port}/pendingTasks/generate${dateQuery}`;

console.log("===========================================================");
console.log("  TBM PENDING TASKS GENERATOR");
console.log(`  Target Backend : http://${host}:${port}`);
if (targetDate) {
  console.log(`  Target Date    : ${targetDate}`);
} else {
  console.log(`  Target Scope   : Yesterday (Default)`);
}
console.log("===========================================================");

async function run() {
  try {
    console.log(`[*] Requesting: ${generateUrl}`);
    const res = await axios.get(generateUrl, { timeout: 8000 });
    console.log(`[+] SUCCESS:`, res.data.message || "Pending task list generated.");
    if (res.data.count !== undefined) {
      console.log(`    Total Pending Items: ${res.data.count}`);
    }
    if (res.data.pendingTaskList && res.data.pendingTaskList.length > 0) {
      console.log("    Sample generated pending tasks:");
      res.data.pendingTaskList.slice(0, 5).forEach((t, idx) => {
        console.log(`      ${idx + 1}. [${t.line}] ${t.processNo} | ${t.workDetail}`);
      });
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    console.error(`[-] ERROR generating pending tasks: ${msg}`);
  }

  // Also trigger daily graph generations if available
  try {
    await axios.get(`http://${host}:${port}/dailyStatus/generateDailyGraph?pS=S`, { timeout: 5000 });
    await axios.get(`http://${host}:${port}/dailyStatus/generateDailyGraph?pS=P`, { timeout: 5000 });
    console.log("[+] Daily status graphs updated.");
  } catch (err) {
    // Ignore optional graph errors
  }
  console.log("===========================================================");
}

run();
