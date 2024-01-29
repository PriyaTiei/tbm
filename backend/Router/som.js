const express = require("express");
const {
  getSomAll, getSomStats,
} = require("../controller/som");
const dailyStatusRouter = express.Router();

dailyStatusRouter.route("/getAll").get(getSomAll);
dailyStatusRouter.route("/getSomStats").get(getSomStats);

module.exports = dailyStatusRouter;