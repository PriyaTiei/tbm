const express = require("express");
const {
  createDailyStatus,
  updateDailyStatus,
  deleteDailyStatus,
  getDailyStatusAll,
  getDailyStatusAggregated,
  getDailyStatus,
  getTrendDailyStatus,
  removeDailyStatus,
  getDailyStatusByCheckItem,
  getGraphData,
  changeVerified,
  generateDailyGraph,
  updateGlComment,
  updateTlComment,
  updateGlConfirm,
  updateTlConfirm
} = require("../controller/dailyStatusController");
const dailyStatusRouter = express.Router();

dailyStatusRouter.route("/entry").post(createDailyStatus);
dailyStatusRouter.route("/dailyStatusByCheckItem").get(getDailyStatusByCheckItem);
dailyStatusRouter.route("/removeEntry").post(deleteDailyStatus);
dailyStatusRouter.route("/").get(getDailyStatusAll);
dailyStatusRouter
  .route("/update/:id")
  .put(updateDailyStatus)
  .delete(deleteDailyStatus);
  dailyStatusRouter.route("/find/:idCheckItem/entryFor/:entryFor").get(getDailyStatus)
  dailyStatusRouter.route("/find/:idCheckItem/fromDate/:fromDate/toDate/:toDate").get(getTrendDailyStatus);
  dailyStatusRouter.route("/aggregated").get(getDailyStatusAggregated)

dailyStatusRouter.route("/getGraphData").post(getGraphData)
dailyStatusRouter.route("/changeVerified").put(changeVerified)

dailyStatusRouter.route("/generateDailyGraph").get(generateDailyGraph)

dailyStatusRouter.route('/updateGlComment').post(updateGlComment);
dailyStatusRouter.route('/updateTlComment').post(updateTlComment);
dailyStatusRouter.route('/updateGlConfirm').post(updateGlConfirm);
dailyStatusRouter.route('/updateTlConfirm').post(updateTlConfirm);
module.exports = dailyStatusRouter;
