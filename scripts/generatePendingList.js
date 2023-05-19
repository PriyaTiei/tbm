const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

axios
  .get(`http://${process.env.host}:${process.env.port}/pendingTasks/generate`)
  .then(() => {
    console.log("pending card generated");
  })
  .catch((err) => {
    console.log(err);
  });
