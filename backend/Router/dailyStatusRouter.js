const express = require("express");
const {
  createDailyStatus,
  updateDailyStatus,
  deleteDailyStatus,
  getDailyStatusAll,
  getDailyStatusAggregated,
  getDailyStatus,
  getTrendDailyStatus,
} = require("../controller/dailyStatusController");
const dailyStatusRouter = express.Router();

dailyStatusRouter.route("/entry").post(createDailyStatus);
dailyStatusRouter.route("/").get(getDailyStatusAll);
dailyStatusRouter
  .route("/update/:id")
  .put(updateDailyStatus)
  .delete(deleteDailyStatus);
  dailyStatusRouter.route("/find/:idCheckItem/entryFor/:entryFor").get(getDailyStatus)
  dailyStatusRouter.route("/find/:idCheckItem/fromDate/:fromDate/toDate/:toDate").get(getTrendDailyStatus);
  dailyStatusRouter.route("/aggregated").get(getDailyStatusAggregated)



module.exports = dailyStatusRouter;
