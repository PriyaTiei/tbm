const axios = require("axios");

axios
  .get("http://localhost:5051/pendingTasks/generate")
  .then(() => {
    console.log("pending card generated");
  })
  .catch((err) => {
    console.log(err);
  });
