const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config({path:__dirname + '/.env'});

console.log(`http://${process.env.host}:${process.env.port}/pendingTasks/generate`);

axios
  .get(`http://${process.env.host}:${process.env.port}/pendingTasks/generate`)
  

//to generate dailystatus graph data for yesterday for production
axios
  .get(`http://${process.env.host}:${process.env.port}/dailyStatus/generateDailyGraph?pS=S`)
  

//to generate dailystatus graph data for yesterday for maintenance
axios
  .get(`http://${process.env.host}:${process.env.port}/dailyStatus/generateDailyGraph?pS=P`)
 