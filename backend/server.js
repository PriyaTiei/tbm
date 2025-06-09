// // const app = require("./app");
// // const mongoose = require("mongoose");
// // const dotenv = require("dotenv");
 
// // dotenv.config();

// // const mongoPath = process.env.MONGO_PATH ;
// // mongoose.connect(`mongodb://${mongoPath}:27017/${process.env.DB_NAME}`);

// // process.on("uncaughtException", (err) => {
// //   console.log(`Error : ${err.message}`);
// //   console.log("closing process");
// //   process.exit(1);
// // });

// // const port = process.env.PORT || 5051;

// // const server = app.listen(port, () => {
// //   console.log(`server started at port ${port}`);
// // });

// // process.on("unhandledRejection", (err) => {
// //   console.log(`Error : ${err.message}`);
// //   console.log("closing server & exiting process");
// //   server.close(() => {
// //     process.exit(1);
// //   });
// // });

// const app = require("./app");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const path = require("path");

// dotenv.config();

// const mongoPath = process.env.MONGO_PATH;
// mongoose.connect(`mongodb://${mongoPath}:27017/${process.env.DB_NAME}`, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// process.on("uncaughtException", (err) => {
//   console.log(`Error : ${err.message}`);
//   console.log("closing process");
//   process.exit(1);
// });

// const port = process.env.PORT || 5051;

// // Serve static files (images, etc.) from backend/public folder at /assets
// app.use("/assets", express.static(path.join(__dirname, "public")));

// const server = app.listen(port, () => {
//   console.log(`server started at port ${port}`);
// });

// process.on("unhandledRejection", (err) => {
//   console.log(`Error : ${err.message}`);
//   console.log("closing server & exiting process");
//   server.close(() => {
//     process.exit(1);
//   });
// });

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const app = require("./app"); // ✅ Import the actual Express app

dotenv.config();

// MongoDB connection
const mongoPath = process.env.MONGO_PATH || "localhost";
const dbName = process.env.DB_NAME || "your_db_name";
mongoose.connect(`mongodb://${mongoPath}:27017/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ MongoDB connected");
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});

const port = process.env.PORT || 5051;

const server = app.listen(port, () => {
  console.log(`🚀 Server started at http://localhost:${port}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  server.close(() => {
    process.exit(1);
  });
});
