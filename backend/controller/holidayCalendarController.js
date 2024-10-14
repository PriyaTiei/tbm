const catchAsyncError = require("../middleware/catchAsyncError");
const HolidayCalendarModel = require("../mongoSchema/holidayCalendarModel.js");
const { ObjectId } = require("../util/getObjectType");
const ErrorHandler = require("../util/errorHandling");
const util = require('util');

exports.createHolidayCalendar = catchAsyncError(async (req, res, next) => {
    const {
      date,
      reason,
      adhoc,
      user
    } = req.body;

    const userObjID = ObjectId(user);
    
    const holidayCalendarItem = await HolidayCalendarModel.create({
      date: new Date(date + " UTC"),
      reason: reason,
      adhoc: adhoc,
      user: userObjID
    });

    res.status(200).json({ success: true, holidayCalendarItem });
});

exports.updateHolidayCalendar = catchAsyncError(async (req, res, next) => {
    const id = req.params.id;
    const holidayCalendarItem = await HolidayCalendarModel.findById(id);
    if (!holidayCalendarItem) {
      return next(new ErrorHandler("cannot find this holidayCalendar item", 404));
    }

    if(holidayCalendarItem.deleted) {
      return next(new ErrorHandler("Holiday requested was deleted", 404));
    } 

    const {
      date,
      reason,
        adhoc,
        user
    } = req.body;

    holidayCalendarItem.date = new Date(date + " UTC");
    holidayCalendarItem.reason = reason;
    holidayCalendarItem.adhoc = adhoc;
    holidayCalendarItem.deleted = false;
    holidayCalendarItem.user = user;

    await holidayCalendarItem.save({ validateBeforeSave: false });
    res.status(201).json({ success: true, holidayCalendarItem });
  });

  exports.deleteHolidayCalendar = catchAsyncError(async (req, res, next) => {
    const id = req.params.id;
    const holidayCalendarItem = await HolidayCalendarModel.findById(id);
    if (!holidayCalendarItem) {
      return next(new ErrorHandler("cannot find this holidayCalendarItem", 404));
    }
  
    holidayCalendarItem.deleted = true;
    await holidayCalendarItem.save({ validateBeforeSave: false });
    res
      .status(201)
      .json({ success: true, message: "deleted holiday calendar Item successfully" });
  });
  
  exports.getHolidayCalendarAll = catchAsyncError(async (req, res, next) => {
    /*
    const fromDate = req.params.fromDate;
    var toDate = req.params.toDate;
    var createdAt = { $gte: fromDate, $lt: toDate }
    */
    let holidays = [];
    let holidayCalendarItems = await HolidayCalendarModel.find( {
      deleted: false
    } );

    holidayCalendarItems.map(item=>{
      holidays.push(item)
    })

    res.status(201).json({ success: true, holidays });
  });
  
  exports.getHolidayCalendar = catchAsyncError(async (req, res, next) => {
    const id = req.params.id;
    const holiday = await HolidayCalendarModel.findById(id); 

    if (!holiday) {
      return next(new ErrorHandler("cannot find this holiday item", 404));
    }

    if(holiday.deleted) {
      return next(new ErrorHandler("Holiday requested was deleted", 404));
    } 
  
    res.status(201).json({ success: true, holiday });
  });

  exports.prepopulate = catchAsyncError(async (req, res, next) => {
    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    const {
      year,
      user
    } = req.body;

    const userObjID = ObjectId(user);
    var date = new Date(year, 0, 1);

    while(date.getUTCDay() !== 0 && date.getUTCDay() !== 6) {
      date.setUTCDate(date.getUTCDate() + 1);
    }

    do {
      //var dateStr = date.toISOString().split('T')[0];
      if(date.getUTCFullYear() == year) {
        await HolidayCalendarModel.create({
          date: date,
          reason: weekday[date.getUTCDay()],
          adhoc: false,
          user: userObjID
        });  
      }
      date.setUTCDate(date.getUTCDate() + ((date.getUTCDay() == 0) ? 6 : 1));
    } while (date.getUTCFullYear() == year);

    res.status(200).json({ success: true });
  });
  