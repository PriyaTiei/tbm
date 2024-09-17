const express = require("express");
const { isAuthenticated } = require("../middleware/isAuthenticated");

const {
    createHolidayCalendar,
    updateHolidayCalendar,
    deleteHolidayCalendar,
    getHolidayCalendarAll,
    getHolidayCalendar,
    prepopulate
  } = require("../controller/holidayCalendarController");
  
const holidayCalendarRouter = express.Router();

holidayCalendarRouter.route("/").post(createHolidayCalendar);
holidayCalendarRouter
  .route("/:id")
  .put(updateHolidayCalendar)
  .delete(deleteHolidayCalendar);

  holidayCalendarRouter.route("/:id").get(getHolidayCalendar);
  // holidayCalendarRouter.route("/fromDate/:fromDate/toDate/:toDate").get(getHolidayCalendarAll);
  holidayCalendarRouter.route("/").get(getHolidayCalendarAll);
  holidayCalendarRouter.route("/prepopulate").post(prepopulate);
  

module.exports = holidayCalendarRouter;
