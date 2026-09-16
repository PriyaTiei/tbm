// const catchAsyncError = require("../middleware/catchAsyncError");
// const HeadModel = require("../mongoSchema/chekItemModel");
// const DailyStatus = require("../mongoSchema/dailyStatusModel");
// const PendingTask = require("../mongoSchema/pendingTaskModel");
// const ApiFeaturePendingTask = require("../util/apiFeaturePendingTasks");
// const ApiFeatureDailyStatus = require("../util/apiFeatureDailyStatus");
// const ErrorHandler = require("../util/errorHandling");
// const HolidayCalendarModel = require("../mongoSchema/holidayCalendarModel");
// const { ObjectId } = require("../util/getObjectType");
// const DailyStatusVerificationModel = require("../mongoSchema/dailyStatusVerificationModel");
// const ApiFeatureHead = require("../util/apiFeatureHead");

// async function getStartDate(month, year) {
//   var tDate = new Date(Date.UTC(year, month, 1));
//   if (tDate.getUTCDay() === 1) {
//     return tDate;
//   }
//   do {
//     tDate.setUTCDate(tDate.getUTCDate() + 1);
//   } while (tDate.getUTCDay() != 1)
//   return tDate;
// }

// async function getEndDate(date) {
//   var eDate = new Date(date);
//   const month = eDate.getUTCMonth();
//   while (month == eDate.getUTCMonth()) {
//     eDate.setUTCDate(eDate.getUTCDate() + 1);
//   }
//   eDate.setUTCDate(eDate.getUTCDate() - 1);

//   while (eDate.getUTCDay() != 0) {
//     eDate.setUTCDate(eDate.getUTCDate() + 1);
//     console.log("getUTCDay", eDate.getUTCDay(), "eDate", eDate)
//   }
//   return eDate;
// }

// async function fillHolidays(report) {
//   let ed = report.endDate;
//   ed.setDate(ed.getDate() + 1);
//   let holidays = await HolidayCalendarModel.find({
//     date: {
//       $gte: report.startDate,
//       $lte: ed
//     }
//   });

//   holidays.forEach((holiday) => {
//     report.data.push({ entryFor: holiday.date.toISOString().split('T')[0], holiday: true });
//   });

//   return report;
// }

// async function getItemsOKCount(report, pS) {
//   const dailyStatus = await DailyStatus.aggregate([
//     {
//       $addFields: {
//         // Add any new fields or modify existing ones here if needed
//         dateEntryFor: { $dateFromString: { dateString: "$entryFor" } }
//       }
//     },
//     {
//       $match: {
//         dateEntryFor: { $gte: report.startDate, $lte: report.endDate },
//         result: { $eq: "OK" }, pS: pS
//       }
//     },
//     {
//       $group: {
//         _id: '$entryFor',
//         count: { $sum: 1 }
//       }
//     }
//   ]);
//   dailyStatus.forEach((task) => {
//     let date = new Date(task._id);
//     date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
//     const dateStr = date.toISOString().split('T')[0];
//     report.data.push({ entryFor: dateStr, okCount: task.count });
//   });
// }

// async function getItemsNGCount(report, pS) {
//   const dailyStatus = await DailyStatus.aggregate([
//     {
//       $addFields: {
//         // Add any new fields or modify existing ones here if needed
//         dateEntryFor: { $dateFromString: { dateString: "$entryFor" } }
//       }
//     },
//     {
//       $match: {
//         dateEntryFor: { $gte: report.startDate, $lte: report.endDate },
//         result: { $eq: "NG" }, pS: pS
//       }
//     },

//     {
//       $group: {
//         _id: '$entryFor',
//         count: { $sum: 1 }
//       }
//     }
//   ]);
//   dailyStatus.forEach((task) => {
//     let date = new Date(task._id);
//     date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
//     const dateStr = date.toISOString().split('T')[0];
//     report.data.push({ entryFor: dateStr, ngCount: task.count });
//   });
// }

// async function getItemsPendingCount(report) {
//   const pendingTasks = await PendingTask.aggregate([
//     {
//       $match: {
//         updatedAt: { $gte: report.startDate, $lte: report.endDate },
//         result: { $eq: "PENDING" }
//       }
//     },
//     {
//       $group: {
//         _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
//         count: { $sum: 1 }
//       }
//     }
//   ]);
//   pendingTasks.forEach((task) => {
//     let date = new Date(task._id);
//     date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
//     const dateStr = date.toISOString().split('T')[0];
//     report.data.push({ entryFor: dateStr, pendingCount: task.count });
//   });
// }

// function findAndSetData(dataArray, strDate) {
//   let tObj = dataArray.find(o => o.entryFor == strDate);
//   if (tObj) {
//     return tObj;
//   } else {
//     tObj = {};
//     tObj.entryFor = strDate;
//     dataArray.push(tObj)
//     return tObj;
//   }
// }

// async function refineData(report) {
//   let strDate = null;
//   let dataArray = [];

//   // Fill holidays
//   const holidays = report.data.filter(o => o.holiday == true);
//   holidays.forEach((holiday) => {
//     let hObj = {};
//     hObj.holiday = holiday.holiday;
//     hObj.entryFor = holiday.entryFor;
//     hObj.okCount = 0;
//     hObj.ngCount = 0;
//     hObj.pendingCount = 0;
//     hObj.cumPending = 0;
//     hObj.totalItemCount = 0;
//     dataArray.push(hObj);
//   });

//   // Fill Other Data
//   for (var iDate = report.startDate; iDate < report.endDate; iDate.setUTCDate(iDate.getUTCDate() + 1)) {
//     strDate = iDate.toISOString().split('T')[0];

//     const tStrDate = strDate.replaceAll('-0', '-');
//     const obj = report.data.filter(o => o.entryFor && (o.entryFor == strDate || o.entryFor == tStrDate));
//     if (obj && obj.length > 0) {
//       obj.forEach((o) => {
//         let tObj = findAndSetData(dataArray, strDate);
//         tObj.entryFor = strDate;
//         if (o.hasOwnProperty('okCount')) {
//           tObj.okCount = o.okCount;
//         }
//         if (o.hasOwnProperty('ngCount')) {
//           tObj.ngCount = o.ngCount;
//         }
//         if (o.hasOwnProperty('pendingCount')) {
//           tObj.pendingCount = o.pendingCount;
//         }
//         if (o.hasOwnProperty("holiday")) {
//           tObj.holiday = o.holiday;
//         }
//         if (o.hasOwnProperty("totalItemCount")) {
//           tObj.totalItemCount = o.totalItemCount;
//         }
//       });
//     } else {
//       let tObj = findAndSetData(dataArray, strDate);
//       tObj.entryFor = strDate;
//       tObj.okCount = 0;
//       tObj.ngCount = 0;
//       tObj.pendingCount = 0;
//       tObj.totalItemCount = 0;
//       tObj.holiday = false; // (tObj.hasAttribute('holiday')) ? tObj.holiday : false;
//     }
//   }

//   // Sort by Date
//   dataArray.sort((a, b) => { return new Date(a.entryFor) - new Date(b.entryFor) });
//   var cumPending = 0;
//   dataArray.forEach((o) => {
//     if (!o.hasOwnProperty('okCount')) {
//       o.okCount = 0;
//     }
//     if (!o.hasOwnProperty('ngCount')) {
//       o.ngCount = 0;
//     }
//     if (!o.hasOwnProperty('pendingCount')) {
//       o.pendingCount = 0;
//     }
//     if (!o.hasOwnProperty('totalItemCount')) {
//       o.totalItemCount = 0;
//     }
//     if (!o.hasOwnProperty("holiday")) {
//       o.holiday = false;
//     }
//     cumPending = cumPending + o.pendingCount;
//     o.cumPendingCount = cumPending;
//   });

//   report.data = dataArray;
// }

// function isItemScheduled(date, item) {
//   var result = false;
//   if (item.y && (item.y[0] == 9999 || item.y[0] == date.getUTCFullYear())) {
//     if (item.m && (item.m[0] == 9999 || item.m[0] == 99 || item.m[0] == (date.getUTCMonth() + 1))) {
//       if (item.w && (item.w[0] == 9999 || item.w[0] == 9 || item.w[0] == date.getUTCDate() / 7)) {
//         if (item.d && (item.d[0] == 9999 || item.d[0] == 9 || item.d[0] == date.getUTCDay())) {
//           return true;
//         }
//       }
//     }
//   }
//   return result;
// }

// function getDifferenceInDays(date1, date2) {
//   const diffInMilliseconds = Math.abs(date2 - date1);
//   const millisecondsPerDay = 1000 * 60 * 60 * 24;
//   return Math.trunc(Math.floor(diffInMilliseconds / millisecondsPerDay));
// }

// async function fillTotalItems(report, pS) {
//   var tDate = report.startDate;
//   let dataArray = report.data;
//   const strEndDate = report.endDate.toISOString().split('T')[0];
//   tDate = new Date(report.startDate);
//   var strTDate = tDate.toISOString().split('T')[0];

//   while (tDate <= report.endDate) {
//     let d = tDate.getDay();
//     d = (d == 0) ? 7 : d;
//     // let w = Math.trunc(tDate.getDate() / 7) + 1;
//     let w = Math.trunc((getDifferenceInDays(tDate, report.startDate) / 7)) + 1;

//     let m = tDate.getMonth() + 1;
//     let y = tDate.getFullYear();

//     let query = {
//       d: d, w: w, m: m, y: y, pS: pS
//     };

//     const headObject = new ApiFeatureHead(HeadModel, query).match();
//     const headCheckList = await headObject.query;

//     let totalItemCount = 0;
//     headCheckList.forEach((item) => {
//       totalItemCount += item.processList.length;
//     });

//     let strDate = tDate.toISOString().split('T')[0];
//     let tmpStrDate = strDate.replaceAll('-0', '-');
//     let tObj = dataArray.find((o) => (o.entryFor == strDate || o.entryFor == tmpStrDate));
//     if (tObj != null && typeof tObj !== "undefined") {
//       tObj.totalItemCount = (tObj.hasOwnProperty("totalItemCount")) ? tObj.totalItemCount + totalItemCount : totalItemCount;
//     } else {
//       tObj = {};
//       tObj.entryFor = strDate;
//       tObj.totalItemCount = totalItemCount;
//       dataArray.push(tObj);
//     }
//     tDate.setDate(tDate.getDate() + 1);
//     strTDate = tDate.toISOString().split('T')[0];
//   };

//   console.log(dataArray);
//   report.data = dataArray;
// }

// exports.reportTBMStatus = catchAsyncError(async (req, res, next) => {
//   var { user, month, year, pS } = req.body;

//   let report = {};

//   if (year < 2000 || year > 3000) {
//     return next(new ErrorHandler("Year is not in a valid range", 500));
//   }

//   if (month < 1 || month > 12) {
//     return next(new ErrorHandler("Month is not in a valid range", 500));
//   } else {
//     month = month - 1;
//   }

//   const userObjID = ObjectId(user);

//   report.startDate = await getStartDate(month, year);
//   report.endDate = await getEndDate(report.startDate);
//   report.data = [];

//   await fillHolidays(report);
//   await getItemsOKCount(report, pS);
//   await getItemsNGCount(report, pS);
//   await getItemsPendingCount(report);
//   await fillTotalItems(report, pS);
//   await refineData(report);

//   return res.status(200).json({ success: true, report });
// });

// exports.pendingForLesser30Days = catchAsyncError(async (req, res, next) => {
//   const pendingTasks = await PendingTask.aggregate([
//     {
//       $unwind: {
//         path: "$entryDates"
//       }
//     },
//     {
//       $sort: {
//         checkItem: 1,
//         updatedAt: 1
//       }
//     },
//     {
//       $addFields: {
//         days: {
//           $dateDiff: {
//             startDate: "$entryDates",
//             endDate: "$$NOW",
//             unit: "day"
//           }
//         }
//       }
//     },
//     {
//       $match: {
//         days: { $lte: 30 }
//       }
//     }
//   ]
//   );
//   return res.status(200).json({ success: true, pendingTasks });
// });

// exports.pendingForGreater30Days = catchAsyncError(async (req, res, next) => {
//   const pendingTasks = await PendingTask.aggregate([
//     {
//       $unwind: {
//         path: "$entryDates"
//       }
//     },
//     {
//       $sort: {
//         checkItem: 1,
//         updatedAt: 1
//       }
//     },
//     {
//       $addFields: {
//         days: {
//           $dateDiff: {
//             startDate: "$entryDates",
//             endDate: "$$NOW",
//             unit: "day"
//           }
//         }
//       }
//     },
//     {
//       $match: {
//         days: { $gte: 30 }
//       }
//     }
//   ]
//   );
//   return res.status(200).json({ success: true, pendingTasks });
// });

// exports.tbmFrequency = catchAsyncError(async (req, res, next) => {
//   const frequencyTasks = await PendingTask.aggregate([
//     {
//       $lookup: {
//         from: "dailystatuses",
//         localField: "checkItem",
//         foreignField: "checkItem",
//         as: "dialyStaus"
//       }
//     },
//     {
//       $lookup: {
//         from: "checkitems",
//         localField: "checkItem",
//         foreignField: "_id",
//         as: "items"
//       }
//     },
//     {
//       $group: {
//         _id: "$checkItem",
//         top: {
//           $top: {
//             output: { "checkItem": "$checkItem", "opNo": "$processNo", "workDetail": "$workDetail", "entryFor": "$dialyStaus.entryFor", "frequency": "$items.cycle" },
//             sortBy: { "dialyStaus.entryFor": -1 }
//           }
//         }
//       }
//     }
//   ]
//   );
//   return res.status(200).json({ success: true, frequencyTasks });
// });

// const getPageNumber = async (query, checkitem) => {
//   const checkItemss = checkitem;
//   let pageNo = 1;
//   const headObject = new ApiFeatureHead(HeadModel, query)
//     .search()
//     .filter()
//     .pagination(1);
//   var headCheckList = await headObject.query;

//   if (headCheckList.length === 0) {
//     return next(new ErrorHandler("could not find check list", 404));
//   }

//   // const totalCount = await HeadModel.countDocuments(headObject.newQueryStr);
//   const pageList = await HeadModel.aggregate([{
//     $match: headObject.newQueryStr
//   }]);

//   pageNo = pageList.findIndex((element) => element._id.toString() === checkItemss.toString());

//   console.log("pageNo", pageNo + 1)
//   return pageNo + 1;
//   // return totalCount;
// }

// exports.tlVerifyItems = catchAsyncError(async (req, res, next) => {
//   const tlList = await DailyStatusVerificationModel.aggregate([
//     {
//       $match: { pS: req.query.ps }
//     },
//     {
//       $match: { $or: [{ tlVerify: true }, { result: "NG" }] }
//     },
//     {
//       $lookup: {
//         from: "dailystatuses",
//         localField: "checkItem",
//         foreignField: "checkItem",
//         as: "dailystatus"
//       }
//     },
//     {
//       $lookup: {
//         from: "checkitems",
//         localField: "checkItem",
//         foreignField: "_id",
//         as: "item"
//       }
//     },
//     {
//       $unwind: {
//         path: "$dailystatus"
//       }
//     },
//     {
//       $match: {
//         $expr: {
//           $eq: ["$entryFor", "$dailystatus.entryFor"]
//         }
//       }
//     },
//     {
//       $addFields: {
//         "entryForDate": { $dateFromString: { dateString: "$entryFor" } }
//       }
//     },
//     {
//       $sort: { entryForDate: -1 }
//     }
//   ]);

//   const tlListPromises = tlList.map(async (item) => {
//     console.log("allparameters", item.checkItem, item.item[0].processNo, item.item[0].line)
//     const pageNo = await getPageNumber({
//       d: item.item[0].d[0],
//       w: item.item[0].w[0],
//       m: item.item[0].m[0],
//       y: item.item[0].y[0],
//       pS: item.item[0].pS,
//       line: item.item[0].line,
//       processNo: item.item[0].processNo,
//       page: '1'
//     }, item.item[0]._id);
//     console.log("tlList", item.item[0]._id)

//     item.pageNo = pageNo;
//   });

//   await Promise.all(tlListPromises);

//   return res.status(200).json({ success: true, tlList });

// });

// exports.glVerifyItems = catchAsyncError(async (req, res, next) => {

//   const ps = req.query.ps
//   const glList = await DailyStatusVerificationModel.aggregate([
//     {
//       $match: { pS: req.query.ps }
//     },
//     {
//       $match: { $or: [{ glVerify: true }, { result: "NG" }] }
//     },
//     {
//       $lookup: {
//         from: "dailystatuses",
//         localField: "checkItem",
//         foreignField: "checkItem",
//         as: "dailystatus"
//       }
//     },
//     {
//       $lookup: {
//         from: "checkitems",
//         localField: "checkItem",
//         foreignField: "_id",
//         as: "item"
//       }
//     },
//     {
//       $unwind: {
//         path: "$dailystatus"
//       }
//     },
//     {
//       $match: {
//         $expr: {
//           $eq: ["$entryFor", "$dailystatus.entryFor"]
//         }
//       }
//     },
//     {
//       $addFields: {
//         "entryForDate": { $dateFromString: { dateString: "$entryFor" } }
//       }
//     },
//     {
//       $sort: { entryForDate: -1 }
//     }
//   ]);

//   const glListPromises = glList.map(async (item) => {
//     console.log("allparameters", item.checkItem, item.item[0].processNo, item.item[0].line)
//     const pageNo = await getPageNumber({
//       d: item.item[0].d[0],
//       w: item.item[0].w[0],
//       m: item.item[0].m[0],
//       y: item.item[0].y[0],
//       pS: item.item[0].pS,
//       line: item.item[0].line,
//       processNo: item.item[0].processNo,
//       page: '1'
//     }, item.item[0]._id);
//     console.log("glList", pageNo)

//     item.pageNo = pageNo;
//   });

//   await Promise.all(glListPromises);
//   return res.status(200).json({ success: true, glList });
// });

// exports.getVerifyItems = catchAsyncError(async (req, res, next) => {
//   // var dailyItems = await DailyStatus.find({}).populate("checkItem", "glVerify tlVerify");
//   const ps = req.query.ps;
//   var dailyItems = await DailyStatus.aggregate([{
//     $match: { pS: ps }
//   }, {
//     $lookup: {
//       from: "checkitems",
//       localField: "checkItem",
//       foreignField: "_id",
//       as: "checkItem"
//     }
//   },
//   {
//     $unwind: {
//       path: "$checkItem",
//       preserveNullAndEmptyArrays: true
//     }
//   },
//   {
//     $addFields: {
//       "entryForDate": { $dateFromString: { dateString: "$entryFor" } }
//     }
//   },
//   {
//     $sort: { entryForDate: -1 }
//   }
//   ]);

//   if (dailyItems == null || (dailyItems != null && dailyItems.length == 0)) {
//     return res.status(200).json({ success: true, dailyItemsWithGlTlVerify: [] });
//   }

//   var dailyItemsWithGlTlVerify = dailyItems.filter((dItem) => {
//     return (dItem.checkItem && (dItem.checkItem.glVerify == true || dItem.checkItem.tlVerify));
//   });

//   if (dailyItemsWithGlTlVerify && Array.isArray(dailyItemsWithGlTlVerify)) {
//     dailyItemsWithGlTlVerify.forEach((dItem) => {
//       if (!dItem.hasOwnProperty("m_spec")) {
//         dItem.m_spec = [];
//       }
//     });
//   }
//   // const tlListPromises = dailyItemsWithGlTlVerify.map(async (item) => {
//   //   const pageNo = await getPageNumber(item.checkItem._id, item.checkItem.processNo);
//   //   item.pageNo = pageNo;
//   // });

//   // await Promise.all(tlListPromises);

//   const dailyListPromises = dailyItemsWithGlTlVerify.map(async (item) => {
//     // console.log("allparameters", item.checkItem, item.item[0].processNo, item.item[0].line)
//     const pageNo = await getPageNumber({
//       d: item.checkItem.d[0],
//       w: item.checkItem.w[0],
//       m: item.checkItem.m[0],
//       y: item.checkItem.y[0],
//       pS: item.checkItem.pS,
//       line: item.checkItem.line,
//       processNo: item.checkItem.processNo,
//       page: '1'
//     }, item.checkItem._id);

//     item.pageNo = pageNo;
//   });

//   await Promise.all(dailyListPromises);
//   return res.status(200).json({ success: true, dailyItemsWithGlTlVerify });
// });

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
  var tDate = new Date(Date.UTC(year, month, 1));
  if (tDate.getUTCDay() === 1) {
    return tDate;
  }
  do {
    tDate.setUTCDate(tDate.getUTCDate() + 1);
  } while (tDate.getUTCDay() != 1);
  return tDate;
}

async function getEndDate(date) {
  var eDate = new Date(date);
  const month = eDate.getUTCMonth();
  while (month == eDate.getUTCMonth()) {
    eDate.setUTCDate(eDate.getUTCDate() + 1);
  }
  eDate.setUTCDate(eDate.getUTCDate() - 1);

  while (eDate.getUTCDay() != 0) {
    eDate.setUTCDate(eDate.getUTCDate() + 1);
    console.log("getUTCDay", eDate.getUTCDay(), "eDate", eDate);
  }
  return eDate;
}

async function fillHolidays(report) {
  let ed = report.endDate;
  ed.setDate(ed.getDate() + 1);
  let holidays = await HolidayCalendarModel.find({
    date: {
      $gte: report.startDate,
      $lte: ed,
    },
  });

  holidays.forEach((holiday) => {
    report.data.push({
      entryFor: holiday.date.toISOString().split("T")[0],
      holiday: true,
    });
  });

  return report;
}

function getLineMatchCondition(line) {
  if (!line) return null;
  const lineLower = String(line).toLowerCase().trim();
  if (lineLower === "assembly" || lineLower === "all assembly") {
    return { $regex: "assembly", $options: "i" };
  }
  if (lineLower === "machining" || lineLower === "all machining") {
    return { $regex: "block|crank|head|cam", $options: "i" };
  }
  return line;
}

async function getItemsOKCountByLine(report, pS, line) {
  const pipeline = [
    {
      $addFields: {
        dateEntryFor: { $dateFromString: { dateString: "$entryFor" } },
      },
    },
    {
      $match: {
        dateEntryFor: { $gte: report.startDate, $lte: report.endDate },
        result: { $eq: "OK" },
        pS: pS,
      },
    },
    {
      $lookup: {
        from: "checkitems",
        localField: "checkItem",
        foreignField: "_id",
        as: "checkItemData",
      },
    },
    {
      $unwind: "$checkItemData",
    },
  ];

  if (line) {
    pipeline.push({
      $match: {
        "checkItemData.line": getLineMatchCondition(line),
      },
    });
  }

  pipeline.push({
    $group: {
      _id: {
        entryFor: "$entryFor",
        line: "$checkItemData.line",
      },
      count: { $sum: 1 },
    },
  });

  const dailyStatus = await DailyStatus.aggregate(pipeline);

  dailyStatus.forEach((task) => {
    let date = new Date(task._id.entryFor);
    date = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dateStr = date.toISOString().split("T")[0];
    report.data.push({
      entryFor: dateStr,
      line: task._id.line,
      okCount: task.count,
    });
  });
}

async function getItemsNGCountByLine(report, pS, line) {
  const pipeline = [
    {
      $addFields: {
        dateEntryFor: { $dateFromString: { dateString: "$entryFor" } },
      },
    },
    {
      $match: {
        dateEntryFor: { $gte: report.startDate, $lte: report.endDate },
        result: { $eq: "NG" },
        pS: pS,
      },
    },
    {
      $lookup: {
        from: "checkitems",
        localField: "checkItem",
        foreignField: "_id",
        as: "checkItemData",
      },
    },
    {
      $unwind: "$checkItemData",
    },
  ];

  if (line) {
    pipeline.push({
      $match: {
        "checkItemData.line": getLineMatchCondition(line),
      },
    });
  }
  pipeline.push({
    $group: {
      _id: {
        entryFor: "$entryFor",
        line: "$checkItemData.line",
      },
      count: { $sum: 1 },
    },
  });

  const dailyStatus = await DailyStatus.aggregate(pipeline);

  dailyStatus.forEach((task) => {
    let date = new Date(task._id.entryFor);
    date = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dateStr = date.toISOString().split("T")[0];
    report.data.push({
      entryFor: dateStr,
      line: task._id.line,
      ngCount: task.count,
    });
  });
}

async function getItemsPendingCountByLine(report, line) {
  const pipeline = [
    {
      $match: {
        updatedAt: { $gte: report.startDate, $lte: report.endDate },
        result: { $eq: "PENDING" },
      },
    },
    {
      $lookup: {
        from: "checkitems",
        localField: "checkItem",
        foreignField: "_id",
        as: "checkItemData",
      },
    },
    {
      $unwind: "$checkItemData",
    },
  ];
  if (line) {
    pipeline.push({
      $match: {
        "checkItemData.line": getLineMatchCondition(line),
      },
    });
  }
  pipeline.push({
    $group: {
      _id: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
        line: "$checkItemData.line",
      },
      count: { $sum: 1 },
    },
  });
  const pendingTasks = await PendingTask.aggregate(pipeline);

  pendingTasks.forEach((task) => {
    let date = new Date(task._id.date);
    date = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dateStr = date.toISOString().split("T")[0];
    report.data.push({
      entryFor: dateStr,
      line: task._id.line,
      pendingCount: task.count,
    });
  });
}

function findAndSetDataByLine(dataArray, strDate, line) {
  let tObj = dataArray.find((o) => o.entryFor == strDate && o.line == line);
  if (tObj) {
    return tObj;
  } else {
    tObj = {};
    tObj.entryFor = strDate;
    tObj.line = line;
    dataArray.push(tObj);
    return tObj;
  }
}

async function refineDataByLine(report, selectedLine) {
  let strDate = null;
  let dataArray = [];

  // Get all unique lines from the data
  let allLines = [
    ...new Set(report.data.map((item) => item.line).filter((l) => l && l !== "undefined")),
  ];
  if (selectedLine && !allLines.includes(selectedLine)) {
    const lineLower = String(selectedLine).toLowerCase().trim();
    if (lineLower !== "assembly" && lineLower !== "all assembly" && lineLower !== "machining" && lineLower !== "all machining") {
      allLines.push(selectedLine);
    }
  }

  // Fill holidays for each line
  const holidays = report.data.filter((o) => o.holiday == true);
  holidays.forEach((holiday) => {
    allLines.forEach((line) => {
      let hObj = {};
      hObj.holiday = holiday.holiday;
      hObj.entryFor = holiday.entryFor;
      hObj.line = line;
      hObj.okCount = 0;
      hObj.ngCount = 0;
      hObj.pendingCount = 0;
      hObj.cumPending = 0;
      hObj.totalItemCount = 0;
      dataArray.push(hObj);
    });
  });

  // Fill Other Data
  for (
    var iDate = new Date(report.startDate);
    iDate <= report.endDate;
    iDate.setUTCDate(iDate.getUTCDate() + 1)
  ) {
    strDate = iDate.toISOString().split("T")[0];
    const tStrDate = strDate.replaceAll("-0", "-");

    allLines.forEach((line) => {
      const obj = report.data.filter(
        (o) =>
          o.entryFor &&
          (o.entryFor == strDate || o.entryFor == tStrDate) &&
          o.line == line,
      );

      if (obj && obj.length > 0) {
        obj.forEach((o) => {
          let tObj = findAndSetDataByLine(dataArray, strDate, line);
          tObj.entryFor = strDate;
          tObj.line = line;
          if (o.hasOwnProperty("okCount")) tObj.okCount = o.okCount;
          if (o.hasOwnProperty("ngCount")) tObj.ngCount = o.ngCount;
          if (o.hasOwnProperty("pendingCount"))
            tObj.pendingCount = o.pendingCount;
          if (o.hasOwnProperty("holiday")) tObj.holiday = o.holiday;
          if (o.hasOwnProperty("totalItemCount"))
            tObj.totalItemCount = o.totalItemCount;
        });
      } else {
        let tObj = findAndSetDataByLine(dataArray, strDate, line);
        tObj.entryFor = strDate;
        tObj.line = line;
        tObj.okCount = 0;
        tObj.ngCount = 0;
        tObj.pendingCount = 0;
        tObj.totalItemCount = 0;
        tObj.holiday = false;
      }
    });
  }

  // Sort by Date and Line
  dataArray.sort((a, b) => {
    const dateCompare = new Date(a.entryFor) - new Date(b.entryFor);
    if (dateCompare !== 0) return dateCompare;
    return a.line.localeCompare(b.line);
  });

  // Calculate cumulative pending by line
  const lineCumPending = {};
  dataArray.forEach((o) => {
    if (!o.hasOwnProperty("okCount")) o.okCount = 0;
    if (!o.hasOwnProperty("ngCount")) o.ngCount = 0;
    if (!o.hasOwnProperty("pendingCount")) o.pendingCount = 0;
    if (!o.hasOwnProperty("totalItemCount")) o.totalItemCount = 0;
    if (!o.hasOwnProperty("holiday")) o.holiday = false;

    if (!lineCumPending[o.line]) lineCumPending[o.line] = 0;
    lineCumPending[o.line] += o.pendingCount;
    o.cumPendingCount = lineCumPending[o.line];
  });

  report.data = dataArray;
}

function isItemScheduled(date, item) {
  var result = false;
  if (item.y && (item.y[0] == 9999 || item.y[0] == date.getUTCFullYear())) {
    if (
      item.m &&
      (item.m[0] == 9999 ||
        item.m[0] == 99 ||
        item.m[0] == date.getUTCMonth() + 1)
    ) {
      if (
        item.w &&
        (item.w[0] == 9999 ||
          item.w[0] == 9 ||
          item.w[0] == date.getUTCDate() / 7)
      ) {
        if (
          item.d &&
          (item.d[0] == 9999 || item.d[0] == 9 || item.d[0] == date.getUTCDay())
        ) {
          return true;
        }
      }
    }
  }
  return result;
}

function getDifferenceInDays(date1, date2) {
  const diffInMilliseconds = Math.abs(date2 - date1);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.trunc(Math.floor(diffInMilliseconds / millisecondsPerDay));
}

async function fillTotalItemsByLine(report, pS, line) {
  var tDate = new Date(report.startDate);
  let dataArray = report.data;

  while (tDate <= report.endDate) {
    let d = tDate.getDay();
    d = d == 0 ? 7 : d;
    let w = Math.trunc(getDifferenceInDays(tDate, report.startDate) / 7) + 1;
    let m = tDate.getMonth() + 1;
    let y = tDate.getFullYear();
    let query = {
      d: d,
      w: w,
      m: m,
      y: y,
      pS: pS,
    };
    if (line) {
      query.line = line;
    }

    const headObject = new ApiFeatureHead(HeadModel, query).match();
    const headCheckList = await headObject.query;

    // Group by line
    const lineGroups = {};
    headCheckList.forEach((item) => {
      const lineName = item._id && item._id.line ? item._id.line : item.line;
      if (lineName && lineName !== "undefined") {
        if (!lineGroups[lineName]) {
          lineGroups[lineName] = 0;
        }
        lineGroups[lineName] += item.processList ? item.processList.length : 0;
      }
    });

    let strDate = tDate.toISOString().split("T")[0];

    // Add data for each line
    Object.keys(lineGroups).forEach((lineName) => {
      let tmpStrDate = strDate.replaceAll("-0", "-");
      let tObj = dataArray.find(
        (o) =>
          (o.entryFor == strDate || o.entryFor == tmpStrDate) && o.line == lineName,
      );

      if (tObj != null && typeof tObj !== "undefined") {
        tObj.totalItemCount = tObj.hasOwnProperty("totalItemCount")
          ? tObj.totalItemCount + lineGroups[lineName]
          : lineGroups[lineName];
      } else {
        tObj = {};
        tObj.entryFor = strDate;
        tObj.line = lineName;
        tObj.totalItemCount = lineGroups[lineName];
        dataArray.push(tObj);
      }
    });

    tDate.setDate(tDate.getDate() + 1);
  }

  console.log(dataArray);
  report.data = dataArray;
}

exports.reportTBMStatus = catchAsyncError(async (req, res, next) => {
  var { user, month, year, pS, line } = req.body;

  let report = {};

  if (year < 2000 || year > 3000) {
    return next(new ErrorHandler("Year is not in a valid range", 500));
  }

  if (month < 1 || month > 12) {
    return next(new ErrorHandler("Month is not in a valid range", 500));
  } else {
    month = month - 1;
  }

  const userObjID = ObjectId(user);

  report.startDate = await getStartDate(month, year);
  report.endDate = await getEndDate(report.startDate);
  report.data = [];

  await fillHolidays(report);
  await getItemsOKCountByLine(report, pS, line);
  await getItemsNGCountByLine(report, pS, line);
  await getItemsPendingCountByLine(report, line);
  await fillTotalItemsByLine(report, pS, line);
  await refineDataByLine(report, line);

  return res.status(200).json({ success: true, report });
});

exports.pendingForLesser30Days = catchAsyncError(async (req, res, next) => {
  const pendingTasks = await PendingTask.aggregate([
    {
      $unwind: {
        path: "$entryDates",
      },
    },
    {
      $sort: {
        checkItem: 1,
        updatedAt: 1,
      },
    },
    {
      $addFields: {
        days: {
          $dateDiff: {
            startDate: "$entryDates",
            endDate: "$$NOW",
            unit: "day",
          },
        },
      },
    },
    {
      $match: {
        days: { $lte: 30 },
      },
    },
  ]);
  return res.status(200).json({ success: true, pendingTasks });
});

exports.pendingForGreater30Days = catchAsyncError(async (req, res, next) => {
  const pendingTasks = await PendingTask.aggregate([
    {
      $unwind: {
        path: "$entryDates",
      },
    },
    {
      $sort: {
        checkItem: 1,
        updatedAt: 1,
      },
    },
    {
      $addFields: {
        days: {
          $dateDiff: {
            startDate: "$entryDates",
            endDate: "$$NOW",
            unit: "day",
          },
        },
      },
    },
    {
      $match: {
        days: { $gte: 30 },
      },
    },
  ]);
  return res.status(200).json({ success: true, pendingTasks });
});

exports.tbmFrequency = catchAsyncError(async (req, res, next) => {
  const frequencyTasks = await PendingTask.aggregate([
    {
      $lookup: {
        from: "dailystatuses",
        localField: "checkItem",
        foreignField: "checkItem",
        as: "dialyStaus",
      },
    },
    {
      $lookup: {
        from: "checkitems",
        localField: "checkItem",
        foreignField: "_id",
        as: "items",
      },
    },
    {
      $group: {
        _id: "$checkItem",
        top: {
          $top: {
            output: {
              checkItem: "$checkItem",
              opNo: "$processNo",
              workDetail: "$workDetail",
              entryFor: "$dialyStaus.entryFor",
              frequency: "$items.cycle",
            },
            sortBy: { "dialyStaus.entryFor": -1 },
          },
        },
      },
    },
  ]);
  return res.status(200).json({ success: true, frequencyTasks });
});

const getPageNumber = async (query, checkitem) => {
  const checkItemss = checkitem;
  let pageNo = 1;
  const headObject = new ApiFeatureHead(HeadModel, query)
    .search()
    .filter()
    .pagination(1);
  var headCheckList = await headObject.query;

  if (headCheckList.length === 0) {
    return next(new ErrorHandler("could not find check list", 404));
  }

  // const totalCount = await HeadModel.countDocuments(headObject.newQueryStr);
  const pageList = await HeadModel.aggregate([
    {
      $match: headObject.newQueryStr,
    },
  ]);

  pageNo = pageList.findIndex(
    (element) => element._id.toString() === checkItemss.toString(),
  );

  console.log("pageNo", pageNo + 1);
  return pageNo + 1;
  // return totalCount;
};

exports.tlVerifyItems = catchAsyncError(async (req, res, next) => {
  const tlList = await DailyStatusVerificationModel.aggregate([
    {
      $match: { pS: req.query.ps },
    },
    {
      $match: { $or: [{ tlVerify: true }, { result: "NG" }] },
    },
    {
      $lookup: {
        from: "dailystatuses",
        localField: "checkItem",
        foreignField: "checkItem",
        as: "dailystatus",
      },
    },
    {
      $lookup: {
        from: "checkitems",
        localField: "checkItem",
        foreignField: "_id",
        as: "item",
      },
    },
    {
      $unwind: {
        path: "$dailystatus",
      },
    },
    {
      $match: {
        $expr: {
          $eq: ["$entryFor", "$dailystatus.entryFor"],
        },
      },
    },
    {
      $addFields: {
        entryForDate: { $dateFromString: { dateString: "$entryFor" } },
      },
    },
    {
      $sort: { entryForDate: -1 },
    },
  ]);

  const tlListPromises = tlList.map(async (item) => {
    console.log(
      "allparameters",
      item.checkItem,
      item.item[0].processNo,
      item.item[0].line,
    );
    const pageNo = await getPageNumber(
      {
        d: item.item[0].d[0],
        w: item.item[0].w[0],
        m: item.item[0].m[0],
        y: item.item[0].y[0],
        pS: item.item[0].pS,
        line: item.item[0].line,
        processNo: item.item[0].processNo,
        page: "1",
      },
      item.item[0]._id,
    );
    console.log("tlList", item.item[0]._id);

    item.pageNo = pageNo;
  });

  await Promise.all(tlListPromises);

  return res.status(200).json({ success: true, tlList });
});

exports.glVerifyItems = catchAsyncError(async (req, res, next) => {
  const ps = req.query.ps;
  const glList = await DailyStatusVerificationModel.aggregate([
    {
      $match: { pS: req.query.ps },
    },
    {
      $match: { $or: [{ glVerify: true }, { result: "NG" }] },
    },
    {
      $lookup: {
        from: "dailystatuses",
        localField: "checkItem",
        foreignField: "checkItem",
        as: "dailystatus",
      },
    },
    {
      $lookup: {
        from: "checkitems",
        localField: "checkItem",
        foreignField: "_id",
        as: "item",
      },
    },
    {
      $unwind: {
        path: "$dailystatus",
      },
    },
    {
      $match: {
        $expr: {
          $eq: ["$entryFor", "$dailystatus.entryFor"],
        },
      },
    },
    {
      $addFields: {
        entryForDate: { $dateFromString: { dateString: "$entryFor" } },
      },
    },
    {
      $sort: { entryForDate: -1 },
    },
  ]);

  const glListPromises = glList.map(async (item) => {
    console.log(
      "allparameters",
      item.checkItem,
      item.item[0].processNo,
      item.item[0].line,
    );
    const pageNo = await getPageNumber(
      {
        d: item.item[0].d[0],
        w: item.item[0].w[0],
        m: item.item[0].m[0],
        y: item.item[0].y[0],
        pS: item.item[0].pS,
        line: item.item[0].line,
        processNo: item.item[0].processNo,
        page: "1",
      },
      item.item[0]._id,
    );
    console.log("glList", pageNo);

    item.pageNo = pageNo;
  });

  await Promise.all(glListPromises);
  return res.status(200).json({ success: true, glList });
});

exports.getVerifyItems = catchAsyncError(async (req, res, next) => {
  // var dailyItems = await DailyStatus.find({}).populate("checkItem", "glVerify tlVerify");
  const ps = req.query.ps;
  var dailyItems = await DailyStatus.aggregate([
    {
      $match: { pS: ps },
    },
    {
      $lookup: {
        from: "checkitems",
        localField: "checkItem",
        foreignField: "_id",
        as: "checkItem",
      },
    },
    {
      $unwind: {
        path: "$checkItem",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        entryForDate: { $dateFromString: { dateString: "$entryFor" } },
      },
    },
    {
      $sort: { entryForDate: -1 },
    },
  ]);

  if (dailyItems == null || (dailyItems != null && dailyItems.length == 0)) {
    return res
      .status(200)
      .json({ success: true, dailyItemsWithGlTlVerify: [] });
  }

  var dailyItemsWithGlTlVerify = dailyItems.filter((dItem) => {
    return (
      dItem.checkItem &&
      (dItem.checkItem.glVerify == true || dItem.checkItem.tlVerify)
    );
  });

  if (dailyItemsWithGlTlVerify && Array.isArray(dailyItemsWithGlTlVerify)) {
    dailyItemsWithGlTlVerify.forEach((dItem) => {
      if (!dItem.hasOwnProperty("m_spec")) {
        dItem.m_spec = [];
      }
    });
  }
  // const tlListPromises = dailyItemsWithGlTlVerify.map(async (item) => {
  //   const pageNo = await getPageNumber(item.checkItem._id, item.checkItem.processNo);
  //   item.pageNo = pageNo;
  // });

  // await Promise.all(tlListPromises);

  const dailyListPromises = dailyItemsWithGlTlVerify.map(async (item) => {
    // console.log("allparameters", item.checkItem, item.item[0].processNo, item.item[0].line)
    const pageNo = await getPageNumber(
      {
        d: item.checkItem.d[0],
        w: item.checkItem.w[0],
        m: item.checkItem.m[0],
        y: item.checkItem.y[0],
        pS: item.checkItem.pS,
        line: item.checkItem.line,
        processNo: item.checkItem.processNo,
        page: "1",
      },
      item.checkItem._id,
    );

    item.pageNo = pageNo;
  });

  await Promise.all(dailyListPromises);
  return res.status(200).json({ success: true, dailyItemsWithGlTlVerify });
});
