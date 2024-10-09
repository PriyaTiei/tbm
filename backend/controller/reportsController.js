const catchAsyncError = require("../middleware/catchAsyncError");
const HeadModel = require("../mongoSchema/chekItemModel");
const DailyStatus = require("../mongoSchema/dailyStatusModel");
const PendingTask = require("../mongoSchema/pendingTaskModel");
const ApiFeaturePendingTask = require("../util/apiFeaturePendingTasks");
const ApiFeatureDailyStatus = require("../util/apiFeatureDailyStatus");
const ErrorHandler = require("../util/errorHandling");
const HolidayCalendarModel = require("../mongoSchema/holidayCalendarModel");
const { ObjectId } = require("../util/getObjectType");
const DailyStatusVerificationModel = require("../mongoSchema/dailyStatusVerificationModel");
const ApiFeatureHead = require("../util/apiFeatureHead");

async function getStartDate(month, year) {
    var tDate =  new Date(Date.UTC(year, month, 1));
    if(tDate.getUTCDay() === 1) {
        return tDate;
    }
    do {
        tDate.setUTCDate(tDate.getUTCDate() + 1);
    } while(tDate.getUTCDay() != 1) 
    return tDate;  
}

async function getEndDate(date) {
    var eDate = new Date(date);
    const month = eDate.getUTCMonth();
    while(month == eDate.getUTCMonth()) {
        eDate.setUTCDate(eDate.getUTCDate() + 1);
    }
    eDate.setUTCDate(eDate.getUTCDate() - 1);
    while(eDate.getUTCDay() != 0) {
        eDate.setUTCDate(eDate.getUTCDate() + 1);
    }
    return eDate;
}

async function fillHolidays(report) {
    let holidays = await HolidayCalendarModel.find({
        date: {
            $gte: report.startDate,
            $lte: report.endDate
        }
    });
    holidays.forEach((holiday) => {
        report.data.push({entryFor: holiday.date.toISOString().split('T')[0], holiday: true});
    });
    
    return report;
}

async function getItemsOKCount(report) {
    const dailyStatus = await DailyStatus.aggregate([
        {
            $match: { 
                checkedAt: { $gte: report.startDate, $lte: report.endDate},
                result: { $eq: "OK"}}
        },
        {
            $group: {
                _id: '$entryFor',
                count: { $sum: 1}
            }
        }
    ]);
    dailyStatus.forEach((task) => {
      let date = new Date(task._id);
      date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dateStr = date.toISOString().split('T')[0];
      report.data.push({entryFor: dateStr, okCount: task.count});
    });
}

async function getItemsNGCount(report) {
    const dailyStatus = await DailyStatus.aggregate([
        {
            $match: { 
                checkedAt: { $gte: report.startDate, $lte: report.endDate},
                result: { $eq: "NG"}}
        },
        {
            $group: {
                _id: '$entryFor',
                count: { $sum: 1}
            }
        }
    ]);
    dailyStatus.forEach((task) => {
      let date = new Date(task._id);
      date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dateStr = date.toISOString().split('T')[0];
      report.data.push({entryFor: dateStr, ngCount: task.count});
    });
}

async function getItemsPendingCount(report) {
    const pendingTasks = await PendingTask.aggregate([
        {
            $match: { 
                updatedAt: { $gte: report.startDate, $lte: report.endDate},
                result: { $eq: "PENDING"}}
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt"} },
                count: { $sum: 1}
            }
        }
    ]);
    pendingTasks.forEach((task) => {
      let date = new Date(task._id);
      date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dateStr = date.toISOString().split('T')[0];
      report.data.push({entryFor: dateStr, pendingCount: task.count});
    });
}

function findAndSetData(dataArray, strDate) {
    let tObj = dataArray.find(o => o.entryFor == strDate);
    if(tObj) {
        return tObj;
    } else {
        tObj = {};
        tObj.entryFor = strDate;
        dataArray.push(tObj)
        return tObj;
    }
}

async function refineData(report) {
    let strDate = null;
    let dataArray = [];
    
    // Fill holidays
    const holidays = report.data.filter(o => o.holiday == true);
    holidays.forEach((holiday) => {
        let hObj = {};
        hObj.holiday = holiday.holiday;
        hObj.entryFor = holiday.entryFor;
        hObj.okCount = 0;
        hObj.ngCount = 0;
        hObj.pendingCount = 0;
        hObj.cumPending = 0;
        hObj.totalItemCount = 0;
        dataArray.push(hObj);
    });

    // Fill Other Data
    for(var iDate = report.startDate; iDate < report.endDate; iDate.setUTCDate(iDate.getUTCDate() + 1)) {
        strDate = iDate.toISOString().split('T')[0];

        const tStrDate = strDate.replaceAll('-0', '-');
        const obj = report.data.filter(o => o.entryFor && (o.entryFor == strDate || o.entryFor == tStrDate));
        if(obj && obj.length > 0) {
            obj.forEach((o) => {
                let tObj = findAndSetData(dataArray, strDate);
                tObj.entryFor = strDate;
                if(o.hasOwnProperty('okCount')) {
                    tObj.okCount = o.okCount;
                }
                if(o.hasOwnProperty('ngCount')) {
                    tObj.ngCount = o.ngCount;
                }
                if(o.hasOwnProperty('pendingCount')) {
                    tObj.pendingCount = o.pendingCount;
                }
                if(o.hasOwnProperty("holiday")) {
                    tObj.holiday = o.holiday;
                }
                if(o.hasOwnProperty("totalItemCount")) {
                    tObj.totalItemCount = o.totalItemCount;
                }
            });
        } else {
            let tObj = findAndSetData(dataArray, strDate);
            tObj.entryFor = strDate;
            tObj.okCount = 0;
            tObj.ngCount = 0;
            tObj.pendingCount = 0;
            tObj.totalItemCount = 0;
            tObj.holiday = false; // (tObj.hasAttribute('holiday')) ? tObj.holiday : false;
        }
    }

    // Sort by Date
    dataArray.sort((a, b) => {return new Date(a.entryFor) - new Date(b.entryFor)});
    var cumPending = 0;
    dataArray.forEach((o) => {
        if(!o.hasOwnProperty('okCount')) {
            o.okCount = 0;
        }
        if(!o.hasOwnProperty('ngCount')) {
            o.ngCount = 0;
        }
        if(!o.hasOwnProperty('pendingCount')) {
            o.pendingCount = 0;
        }
        if(!o.hasOwnProperty('totalItemCount')) {
            o.totalItemCount = 0;
        }
        if(!o.hasOwnProperty("holiday")) {
            o.holiday = false;
        }
        cumPending = cumPending + o.pendingCount;
        o.cumPendingCount = cumPending;
    });

    report.data = dataArray;
}

function isItemScheduled(date, item) {
    var result = false;
    if(item.y && (item.y[0] == 9999 || item.y[0] == date.getUTCFullYear())) {
        if(item.m && (item.m[0] == 9999  || item.m[0] == 99 || item.m[0] == (date.getUTCMonth() + 1))) {
            if(item.w && (item.w[0] == 9999 || item.w[0] == 9 || item.w[0] == date.getUTCDate()/7)) {
                if(item.d && (item.d[0] == 9999 || item.d[0] == 9 || item.d[0] == date.getUTCDay())) {
                    return true;
                }
            }
        }
    }
    return result;
}

async function fillTotalItems(report) {
  var tDate = report.startDate;
  let dataArray = report.data;
  const strEndDate = report.endDate.toISOString().split('T')[0];
  tDate = new Date(report.startDate);
  var strTDate = tDate.toISOString().split('T')[0];

  while(tDate <= report.endDate) {
    let d = tDate.getDay();
    let w = Math.trunc(tDate.getDate()/7) + 1;
    let m = tDate.getMonth() + 1;
    let y = tDate.getFullYear();

    let query = {
      d: d, w: w, m: m, y: y, pS: 'S'
    };

    const headObject = new ApiFeatureHead(HeadModel, query).match();
    const headCheckList = await headObject.query;
//    console.log(headCheckList);
    let totalItemCount = 0;
    headCheckList.forEach((item) => {
      totalItemCount += item.processList.length;
    });

    let strDate = tDate.toISOString().split('T')[0];
    let tmpStrDate = strDate.replaceAll('-0', '-');
    let tObj = dataArray.find((o) => (o.entryFor == strDate || o.entryFor == tmpStrDate));
    if(tObj != null && typeof tObj !== "undefined") {
        tObj.totalItemCount = (tObj.hasOwnProperty("totalItemCount")) ? tObj.totalItemCount + totalItemCount : totalItemCount;
    } else {
        tObj = {};
        tObj.entryFor = strDate;
        tObj.totalItemCount = totalItemCount;
        dataArray.push(tObj);
    }
    tDate.setDate(tDate.getDate() + 1);
    strTDate = tDate.toISOString().split('T')[0];
  };

  console.log(dataArray);
  report.data = dataArray;   
}

exports.reportTBMStatus = catchAsyncError(async (req, res, next) => {
    var { user, month, year } = req.body;

    let report = {};

    if(year < 2000 || year > 3000) {
        return next(new ErrorHandler("Year is not in a valid range", 500));
    }

    if(month < 1 || month > 12) {
        return next(new ErrorHandler("Month is not in a valid range", 500));
    } else {
        month = month - 1;
    }

    const userObjID = ObjectId(user);

    report.startDate = await getStartDate(month, year);
    report.endDate = await getEndDate(report.startDate);
    report.data = [];

    await fillHolidays(report);
    await getItemsOKCount(report);
    await getItemsNGCount(report);
    await getItemsPendingCount(report);
    await fillTotalItems(report);
    await refineData(report);
    
    return res.status(200).json({ success: true, report });
});

exports.pendingForLesser30Days = catchAsyncError(async (req, res, next) => {
    const pendingTasks = await PendingTask.aggregate([
        {
          $unwind: {
            path: "$entryDates"
          }
        },
        {
          $sort: {
            checkItem: 1,
            updatedAt: 1
          }
        },
         {
          $addFields: {
            days: {
            $dateDiff: {
              startDate: "$entryDates",
              endDate: "$$NOW",
              unit: "day"
            }
          }
          }
        },
        {
          $match: {
            days: { $lte: 30}
          }
        }
        ]
    );
    return res.status(200).json({ success: true, pendingTasks });
});

exports.pendingForGreater30Days = catchAsyncError(async (req, res, next) => {
    const pendingTasks = await PendingTask.aggregate([
        {
          $unwind: {
            path: "$entryDates"
          }
        },
        {
          $sort: {
            checkItem: 1,
            updatedAt: 1
          }
        },
         {
          $addFields: {
            days: {
            $dateDiff: {
              startDate: "$entryDates",
              endDate: "$$NOW",
              unit: "day"
            }
          }
          }
        },
        {
          $match: {
            days: { $gte: 30}
          }
        }
        ]
    );
    return res.status(200).json({ success: true, pendingTasks });
});

exports.tbmFrequency = catchAsyncError(async (req, res, next) => {
    const frequencyTasks = await PendingTask.aggregate([
        {
          $lookup: {
            from: "dailystatuses",
            localField: "checkItem",
            foreignField: "checkItem",
            as: "dialyStaus"
          }
        },
        {
          $lookup: {
            from: "checkitems",
            localField: "checkItem",
            foreignField: "_id",
            as: "items"
          }
        },
        {
          $group: {
            _id: "$checkItem",
            top: {
              $top: {
                output: {"checkItem": "$checkItem", "opNo":"$processNo", "workDetail":"$workDetail", "entryFor":"$dialyStaus.entryFor", "frequency":"$items.cycle"},
                sortBy: {"dialyStaus.entryFor" : -1}
              }
            }
          }
        }
      ]
    );
    return res.status(200).json({ success: true, frequencyTasks });
});

exports.tlVerifyItems = catchAsyncError(async (req, res, next) => {
    const tlList = await DailyStatusVerificationModel.aggregate([
        {
            $match: { $or: [{ tlVerify: true }, { result: "NG"}]}
        },
        {
          $lookup: {
            from: "dailystatuses",
            localField: "checkItem",
            foreignField: "checkItem",
            as: "dailystatus"
          }
        },
        {
          $lookup: {
            from: "checkitems",
            localField: "checkItem",
            foreignField: "_id",
            as: "item"
          }
        },
        {
          $unwind: {
            path: "$dailystatus"
          }
        },
        {
          $match: {
            $expr: {
              $eq: ["$entryFor", "$dailystatus.entryFor"]
            }
          }
        },
        {
          $addFields: {
            "entryForDate": { $dateFromString: { dateString: "$entryFor" }}
          }
        },
        {
            $sort: { entryForDate: -1}
        }
      ]);
    return res.status(200).json({ success: true, tlList });
});

exports.glVerifyItems = catchAsyncError(async (req, res, next) => {
    const glList = await DailyStatusVerificationModel.aggregate([
        {
          $match: { $or: [{ glVerify: true }, { result: "NG"}]}
        },
        {
          $lookup: {
            from: "dailystatuses",
            localField: "checkItem",
            foreignField: "checkItem",
            as: "dailystatus"
          }
        },
        {
          $lookup: {
            from: "checkitems",
            localField: "checkItem",
            foreignField: "_id",
            as: "item"
          }
        },
        {
          $unwind: {
            path: "$dailystatus"
          }
        },
        {
          $match: {
            $expr: {
              $eq: ["$entryFor", "$dailystatus.entryFor"]
            }
          }
        },
        {
          $addFields: {
            "entryForDate": { $dateFromString: { dateString: "$entryFor" }}
          }
        },
        {
            $sort: { entryForDate: -1}
        }
      ]);
    return res.status(200).json({ success: true, glList });
});

exports.getVerifyItems = catchAsyncError(async (req, res, next) => {
    // var dailyItems = await DailyStatus.find({}).populate("checkItem", "glVerify tlVerify");

    var dailyItems = await DailyStatus.aggregate([{
          $lookup: {
            from: "checkitems",
            localField: "checkItem",
            foreignField: "_id",
            as: "checkItem"
          }
        },
        {
          $unwind: {
            path: "$checkItem",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            "entryForDate": { $dateFromString: { dateString: "$entryFor" }}
          }
        },
        {
            $sort: { entryForDate: -1}
        }
      ]);

    if(dailyItems == null || (dailyItems != null && dailyItems.length == 0)) {
        return res.status(200).json({ success: true, dailyItemsWithGlTlVerify: [] });
    }

    var dailyItemsWithGlTlVerify = dailyItems.filter((dItem) => {
        return (dItem.checkItem && (dItem.checkItem.glVerify == true || dItem.checkItem.tlVerify));
    });

    if(dailyItemsWithGlTlVerify && Array.isArray(dailyItemsWithGlTlVerify)) {
      dailyItemsWithGlTlVerify.forEach((dItem) => {
        if(!dItem.hasOwnProperty("m_spec")) {
          dItem.m_spec = [];
        }
      });
    }

    return res.status(200).json({ success: true, dailyItemsWithGlTlVerify });
});

