const express = require("express");

const { getPendingTaskList, generatePendingTaskList } = require("../controller/pendingTaskController");
const pendingRouter = express.Router();

//routes
pendingRouter.route("/generate").get(generatePendingTaskList);
pendingRouter.route("/").get(getPendingTaskList);

module.exports = pendingRouter;
