const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// const envPath = `${__dirname}/config/config.env`;
// dotenv.config({path:envPath});
dotenv.config();

const mongoPath = process.env.MONGO_PATH || "10.82.126.73";
mongoose.connect(`mongodb://${mongoPath}:27017/${process.env.DB_NAME}`);

process.on("uncaughtException", (err) => {
  console.log(`Error : ${err.message}`);
  console.log("closing process");
  process.exit(1);
});

const port = process.env.PORT || 5051;

const server = app.listen(port, () => {
  console.log(`server started at port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`Error : ${err.message}`);
  console.log("closing server & exiting process");
  server.close(() => {
    process.exit(1);
  });
});
