const express = require("express");
const { isAuthenticated } = require("../middleware/isAuthenticated");

const {
    reportTBMStatus,
    pendingForLesser30Days,
    pendingForGreater30Days,
    tbmFrequency,
    glVerifyItems,
    tlVerifyItems
} = require("../controller/reportsController");
  
const reportsRouter = express.Router();

reportsRouter.route("/tbmStatus").post(reportTBMStatus);
reportsRouter.route("/pendingForLesser30Days").get(pendingForLesser30Days);
reportsRouter.route("/pendingForGreater30Days").get(pendingForGreater30Days);
reportsRouter.route("/glVerifyItems").get(glVerifyItems);
reportsRouter.route("/tlVerifyItems").get(tlVerifyItems);
reportsRouter.route("/tbmFrequency").get(tbmFrequency);


module.exports = reportsRouter;
