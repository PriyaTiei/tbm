const express = require("express");

const { getPendingTaskList, generatePendingTaskList, updateResult, getPendingTaskReport } = require("../controller/pendingTaskController");
const pendingRouter = express.Router();

//routes
pendingRouter.route("/generate").get(generatePendingTaskList);
pendingRouter.route("/").get(getPendingTaskList);
pendingRouter.put('/:id', updateResult);
pendingRouter.route("/getPendingTaskReport").get(getPendingTaskReport)

module.exports = pendingRouter;
