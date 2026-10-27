const catchAsyncError = require("../middleware/catchAsyncError");
const DailyStatusModel = require("../mongoSchema/dailyStatusModel");
const PendingTask = require("../mongoSchema/pendingTaskModel");
const ErrorHandler = require("../util/errorHandling");
const ApiFeatureDailyStatus = require("../util/apiFeatureDailyStatus");
const { ObjectId } = require("../util/getObjectType");
const ApiFeatureHead = require("../util/apiFeatureHead");
const HeadModel = require("../mongoSchema/chekItemModel");
const DailyGraphModel = require("../mongoSchema/dailyGraphModel");
const DailyStatusVerificationModel = require("../mongoSchema/dailyStatusVerificationModel");
const AbnormalityModel = require("../mongoSchema/abnormalityModel");
const CardRaisedModel = require("../mongoSchema/cardRaisedModel");
var mongoose = require('mongoose');

exports.createDailyStatus = catchAsyncError(async (req, res, next) => {
  var { checkItem, result, value, user, entryFor, pS, line, remarks, checkedBy, m_specs } =
    req.body;

  const m_spec = m_specs;
  const cItemId = new ObjectId(checkItem);
  var dailystatusAvailable = await DailyStatusModel.findOne({
    checkItem: cItemId,
    entryFor,
  });
  console.log(checkItem);
  console.log(entryFor);
  console.log(dailystatusAvailable);

  //////////////////////////////////////////////////////////////
  // Check for tlVerify/glVerify and change results accordingly.
  // Added By Prasad Munaga
  //////////////////////////////////////////////////////////////
  if (!dailystatusAvailable) {
    dailystatusAvailable = await DailyStatusModel.create({ checkItem, result, value, user, entryFor, pS, line, remarks, checkedBy, m_specs });
  }
  const cItem = await HeadModel.findOne({ _id: checkItem });
  if (result == "OK" || result == "NG") {
    if (cItem) {
      const abItem = await AbnormalityModel.findOne({ checkItem: dailystatusAvailable.checkItem });
      if (cItem.tlVerify == true || cItem.glVerify == true || abItem) {
        await DailyStatusVerificationModel.deleteMany({ dailyStatusItemId: dailystatusAvailable._id });
        var obj = dailystatusAvailable.toObject();
        obj._id = new mongoose.Types.ObjectId();
        obj.result = result;
        obj.checkItem = cItem.id;
        obj.glVerify = cItem.glVerify;
        obj.tlVerify = cItem.tlVerify;
        obj.m_spec = dailystatusAvailable.m_spec;
        console.log("===>> " + dailystatusAvailable._id);
        obj.dailyStatusItemId = dailystatusAvailable._id;
        await DailyStatusVerificationModel.create(obj);
      }
    }
  }
  //////////////////////////////////////////////////////////////
  if (dailystatusAvailable) {
    dailystatusAvailable.result = result;
    dailystatusAvailable.value = value;
    dailystatusAvailable.remarks = remarks;
    dailystatusAvailable.checkedBy = checkedBy;
    dailystatusAvailable.m_spec = m_spec;
    dailystatusAvailable.tlVerify = cItem.tlVerify;
    dailystatusAvailable.glVerify = cItem.glVerify;
    const dailyStatus = await dailystatusAvailable.save({
      validateBeforeSave: false,
    });

    const pendingTask = await PendingTask.findOne({ checkItem: checkItem });
    if (pendingTask) {
      await pendingTask.remove();
    }

    return res.status(200).json({ success: true, dailyStatus });
  } else {
    const dailyStatus = await DailyStatusModel.create({
      checkItem,
      result,
      value,
      user,
      entryFor,
      pS,
      remarks,
      checkedBy,
      m_spec,
      tlVerify: cItem.tlVerify,
      glVerify: cItem.glVerify
    });

    const pendingTask = await PendingTask.findOne({ checkItem: checkItem });

    if (pendingTask) {
      // pendingTask.result = result;
      // await pendingTask.save();
      await pendingTask.remove();
      const graph = await DailyGraphModel.findOne({
        pS: pS,
        line: line,
        entryFor: entryFor
      });

      if (graph) {
        graph.totalPending = graph.totalPending - 1;
        if (result == "OK") {
          graph.totalOK = graph.totalOK + 1;
        } else {
          graph.totalNG = graph.totalNG + 1;
        }
        await graph.save()
      }

    }

    return res.status(200).json({ success: true, dailyStatus });
  }
});


exports.removeDailyStatus = async (req, res, next) => {
  const id = req.params.id;
  const { checkItem, result, value, user, entryFor, pS, remarks, checkedBy } =
    req.body;

  let dailyStatus = await DailyStatusModel.findById(id);
  if (!dailyStatus) {
    return next(new ErrorHandler("No such daily status check ", 404));
  }

  dailyStatus.checkItem = checkItem;
  dailyStatus.result = result;
  dailyStatus.value = value;
  dailyStatus.user = user;
  dailyStatus.entryFor = entryFor;
  dailyStatus.pS = pS;
  dailyStatus.remarks = remarks;
  dailyStatus.checkedBy = checkedBy;
  await dailyStatus.save({ validateBeforeSave: false });

  return res.status(201).json({ success: true, message: "Updated Successfully" });
}

exports.updateDailyStatus = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const { checkItem, result, value, user, entryFor, pS, remarks, checkedBy, m_specs } =
    req.body;

  const m_spec = m_specs;

  let dailyStatus = await DailyStatusModel.findById(id);
  if (!dailyStatus) {
    return next(new ErrorHandler("No such daily status check ", 404));
  }

  dailyStatus.checkItem = checkItem;
  dailyStatus.result = result;
  dailyStatus.value = value;
  dailyStatus.user = user;
  dailyStatus.entryFor = entryFor;
  dailyStatus.pS = pS;
  dailyStatus.remarks = remarks;
  dailyStatus.checkedBy = checkedBy;
  dailyStatus.m_spec = m_spec;
  dailyStatus.updatedAt = new Date();
  await dailyStatus.save({ validateBeforeSave: false });

  return res.status(201).json({ success: true, message: "Updated Successfully" });
});

exports.deleteDailyStatus = catchAsyncError(async (req, res, next) => {
  const { checkItem, entryFor } = req.body;

  console.log(checkItem, entryFor);

  const dailyStatus = await DailyStatusModel.findOne({
    checkItem: checkItem,
    entryFor: entryFor,
  });

  if (!dailyStatus) {
    console.log("===========================**********");
    return next(new ErrorHandler("No such daily status check ", 404));
  }

  if (dailyStatus) {
    await DailyStatusVerificationModel.deleteOne({ dailyStatusItemId: dailyStatus.id });
  }

  var dObj = dailyStatus.toObject();
  dObj.result = "PENDING";
  dObj._id = mongoose.Types.ObjectId();

  var pItem = PendingTask.find({ checkItem: checkItem });
  if (pItem) {
    await PendingTask.remove({ checkItem: checkItem });
  }

  var cItem = await HeadModel.findOne({ _id: dailyStatus.checkItem });
  if (cItem) {
    dObj.rS = cItem.rS;
    dObj.workDetail = cItem.workDetail;
    dObj.processNo = cItem.processNo;
    dObj.line = cItem.line;
    await PendingTask.create(dObj);
  } else {
    return res.status(400).json({
      success: false,
      message: `Failed to get checkItem , ${err.message} `,
    });
  }

  await dailyStatus.remove();
  return res.status(201).json({ success: true, message: "Deleted Successfully" });
});

exports.getDailyStatus = catchAsyncError(async (req, res, next) => {
  let { idCheckItem, entryFor } = req.params;

  let dailyStatus = await DailyStatusModel.findOne({
    checkItem: idCheckItem,
    entryFor,
  });
  if (!dailyStatus) {
    // return next(new ErrorHandler("No such daily status check ", 404));
    return res
      .status(201)
      .json({ success: true, dailyStatus: { result: "decisionPending" } });
  }

  return res.status(201).json({ success: true, dailyStatus });
});

const sortData = (data) => {
  let dataList = [];

  data.forEach((item) => {
    //data
    let { line, processNo } = item.checkItem;
    let { result, _id } = item;

    //initial reference
    let lineAvailable = false;
    let lineIndex = null;
    let processAvailable = false;
    let processIndex = null;

    // check line & process availability
    dataList.forEach((item, ind) => {
      if (item.line === line) {
        lineAvailable = true;
        lineIndex = ind;
        dataList[lineIndex].processes.forEach((process, processInd) => {
          if (process.processNo === processNo) {
            processAvailable = true;
            processIndex = processInd;
          }
        });
      }
    });

    //check process availability

    // data filling
    if (!lineAvailable && result === "OK") {
      dataList.push({
        line,
        processes: [{ processNo, result: { OK: 1, NG: 0 } }],
      });
    }

    if (!lineAvailable && result === "NG") {
      dataList.push({
        line,
        processes: [{ processNo, result: { OK: 0, NG: 1 } }],
      });
    }

    if (lineAvailable && !processAvailable && result === "OK") {
      dataList[lineIndex].processes.push({
        processNo,
        result: { OK: 1, NG: 0 },
      });
    }

    if (lineAvailable && !processAvailable && result === "NG") {
      dataList[lineIndex].processes.push({
        processNo,
        result: { OK: 0, NG: 1 },
      });
    }

    if (lineAvailable && processAvailable && result === "OK") {
      dataList[lineIndex].processes[processIndex].result.OK =
        dataList[lineIndex].processes[processIndex].result.OK + 1;
    }
    if (lineAvailable && processAvailable && result === "NG") {
      dataList[lineIndex].processes[processIndex].result.NG =
        dataList[lineIndex].processes[processIndex].result.NG + 1;
    }
  });
  return dataList;
};

exports.getDailyStatusAll = catchAsyncError(async (req, res, next) => {
  req.query = { ...req.query };

  const dailyStatusAll = await DailyStatusModel.find(req.query)
    .populate("checkItem", "line method processNo pS")
    .populate("user", "name");
  if (!dailyStatusAll) {
    return next(new ErrorHandler("No such Daily status check", 404));
  }

  const sortedDailyStatus = sortData(dailyStatusAll);

  const totalDailyStatus = dailyStatusAll.length;
  return res.status(201).json({
    success: true,
    totalDailyStatus,
    sortedDailyStatus,
  });
  // return res.status(201).json({
  //   success: true,
  //    totalDailyStatus,
  //   dailyStatusAll,
  // });
});

// exports.getDailyStatusByCheckItem = catchAsyncError(async (req, res, next) => {
//   const query = {}
//   console.log("here");

//   console.log(req?.query?.byData === "yes");
//   const dailyStatusAll = await DailyStatusModel.find(
//     req?.query?.byData === "yes" ? {
//       ...req?.query?.query
//     } : {
//       checkItem: ObjectId(req.query.checkItem)
//     }
//   );

//   console.log(dailyStatusAll);

//   if (!dailyStatusAll) {
//     return res.status(201).json({
//       success: false,
//       dailyStatusAll: []
//     });
//   }

//   return res.status(201).json({
//     success: true,
//     dailyStatusAll: dailyStatusAll
//   });
// });

exports.getDailyStatusByCheckItem = catchAsyncError(async (req, res, next) => {
  const { checkItem, byData, result, limit, page, date } = req.query;

  const filter = {};

  if (byData !== "yes" && checkItem && checkItem !== "undefined" && checkItem !== "null") {
    try {
      filter.checkItem = ObjectId(checkItem);
    } catch (err) {
      console.warn("Invalid checkItem ObjectId in getDailyStatusByCheckItem:", checkItem);
    }
  }

  if (result && result !== "All" && result !== "") {
    filter.result = result;
  }

  if (date && date !== "undefined" && date !== "") {
    filter.entryFor = date;
  }

  const limitNum = Math.min(500, Math.max(10, parseInt(limit, 10) || 100));
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const skip = (pageNum - 1) * limitNum;

  // Use _id: -1 for lightning fast sorted retrieval using the native indexed primary key
  const [dailyStatusAll, totalCount] = await Promise.all([
    DailyStatusModel.find(filter)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    DailyStatusModel.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    total: totalCount,
    page: pageNum,
    totalPages: Math.ceil(totalCount / limitNum),
    dailyStatusAll,
  });
});

// Aggregare method not used yet
exports.getDailyStatusAggregated = catchAsyncError(async (req, res, next) => {
  req.query = { ...req.query };
  const dailyStatusAggregated = new ApiFeatureDailyStatus(
    DailyStatusModel,
    req.query
  ).match();
  const dailyStatusAggregatedList = await dailyStatusAggregated.query;

  if (dailyStatusAggregatedList.length === 0) {
    return next(new ErrorHandler("could not find check list", 404));
  }

  // // unique machne
  // let processNosUnique = [];
  // let machineData = [];

  // headCheckList.forEach((item) => {
  //   let line = item._id.line;

  //   item.processList.forEach((e) => {
  //     let ind = processNosUnique.indexOf(e);
  //     if (ind === -1) {
  //       processNosUnique.push(e);
  //     }
  //   });

  //   machineData = [...machineData, { line, processNos: processNosUnique }];
  //   processNosUnique = [];
  // });

  // return results
  return res.status(201).json({ success: true, dailyStatusAggregatedList });
});

exports.getTrendDailyStatus = catchAsyncError(async (req, res, next) => {
  const { idCheckItem, fromDate, toDate } = req.params;
  // console.log(req.params);
  // console.log(`checkedAt:{$gte:${fromDate}, $lt:${toDate}}`)

  // Buid date string array -> fromDate to toDate
  var dates = [];
  var tDate = new Date(fromDate);

  do {
    var strDate = tDate.toISOString().split('T')[0];
    dates.push(tDate.getFullYear() + '-' + (tDate.getMonth() + 1) + '-' + tDate.getDate());
    tDate.setUTCDate(tDate.getDate() + 1);
  } while (strDate != toDate);
  // console.log(dates);

  let dailyStatus = await DailyStatusModel.find(
    {
      checkItem: idCheckItem,
      entryFor: { $in: dates },
    },
    { value: 1, entryFor: 1, m_spec: 1 }
  );

  if (!dailyStatus) {
    return next(new ErrorHandler("could not find data / list is empty", 404));
  }

  res
    .status(201)
    .json({ success: true, total: dailyStatus.length, dailyStatus });
});


function parseDateParam(val) {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === "string") {
    if (/^\d{4}-\d{1,2}-\d{1,2}/.test(val)) {
      const parts = val.split("T")[0].split("-").map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    if (val.includes("/")) {
      const parts = val.split("/").map(Number);
      if (parts[2] > 1000) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
      if (parts[0] > 1000) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
    }
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

function getDatesInRange(startDate, endDate) {
  const d1 = parseDateParam(startDate);
  const d2 = parseDateParam(endDate);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  const start = d1 <= d2 ? d1 : d2;
  const end = d1 <= d2 ? d2 : d1;
  const curr = new Date(start.getTime());

  const dates = [];
  while (curr <= end) {
    const yyyy = curr.getFullYear();
    const mm = String(curr.getMonth() + 1).padStart(2, "0");
    const dd = String(curr.getDate()).padStart(2, "0");
    dates.push({
      dateObj: new Date(curr.getTime()),
      time: curr.getTime(),
      yyyyMMdd: `${yyyy}-${mm}-${dd}`,
      ddMMyyyy: `${dd}-${mm}-${yyyy}`,
    });
    curr.setDate(curr.getDate() + 1);
  }

  return dates;
}

exports.changeVerified = catchAsyncError(async (req, res, next) => {
  console.log(req.query);
  const dailyStatus = await DailyStatusModel.findOneAndUpdate({
    _id: ObjectId(req.query.id),
  }, {
    [req.query.role]: req.query.status == "false" ? false : true
  });

  if (!dailyStatus) {
    return res.status(201).json({
      success: false,
    });
  }

  return res.status(201).json({
    success: true,
    dailyStatus: dailyStatus
  });
})

exports.getGraphData = catchAsyncError(async (req, res, next) => {
  const { startDate, endDate, pS, line } = req.body;
  const dateRangeList = getDatesInRange(startDate, endDate);

  if (dateRangeList.length === 0) {
    return res.json({ totalData: {} });
  }

  const d1 = dateRangeList[0].dateObj;
  const d2 = dateRangeList[dateRangeList.length - 1].dateObj;
  const minDateStr = dateRangeList[0].yyyyMMdd;
  const maxDateStr = dateRangeList[dateRangeList.length - 1].yyyyMMdd;

  const dateStringsDDMM = dateRangeList.map((d) => d.ddMMyyyy);
  const dateStringsYYYYMM = dateRangeList.map((d) => d.yyyyMMdd);

  // 1. Fetch from DailyGraphModel if any pre-aggregated records exist
  const dailyGraphData = await DailyGraphModel.find({
    pS: pS,
    line: line,
    $or: [
      { graphFor: { $gte: d1, $lte: new Date(d2.getTime() + 86400000) } },
      { dateString: { $in: dateStringsDDMM } },
      { dateString: { $in: dateStringsYYYYMM } }
    ]
  });

  const graphDataMap = {};
  dailyGraphData.forEach((item) => {
    if (item.dateString) {
      graphDataMap[item.dateString] = item;
    }
    if (item.graphFor) {
      const gDate = new Date(item.graphFor);
      const yyyy = gDate.getFullYear();
      const mm = String(gDate.getMonth() + 1).padStart(2, "0");
      const dd = String(gDate.getDate()).padStart(2, "0");
      graphDataMap[`${yyyy}-${mm}-${dd}`] = item;
      graphDataMap[`${dd}-${mm}-${yyyy}`] = item;
    }
  });

  // 2. Count total items on this line
  const checkItems = await HeadModel.find({
    pS: pS,
    line: line
  }).select("_id");

  const lineTotalItems = checkItems.length;

  // 3. Query real-time DailyStatus aggregations for the date range
  const statuses = await DailyStatusModel.aggregate([
    {
      $match: {
        pS: pS,
        entryFor: { $gte: minDateStr, $lte: maxDateStr }
      }
    },
    {
      $lookup: {
        from: "checkitems",
        localField: "checkItem",
        foreignField: "_id",
        as: "checkItemData"
      }
    },
    {
      $unwind: "$checkItemData"
    },
    {
      $match: {
        "checkItemData.line": line
      }
    },
    {
      $group: {
        _id: {
          entryFor: "$entryFor",
          result: "$result",
          checkItem: "$checkItem"
        }
      }
    }
  ]);

  const statusByDate = {};
  statuses.forEach((st) => {
    const dateKey = st._id.entryFor;
    if (!statusByDate[dateKey]) {
      statusByDate[dateKey] = { okSet: new Set(), ngSet: new Set() };
    }
    const itemId = String(st._id.checkItem);
    if (st._id.result === "OK" || st._id.result === "ok") {
      statusByDate[dateKey].okSet.add(itemId);
    } else if (st._id.result === "NG" || st._id.result === "ng") {
      statusByDate[dateKey].ngSet.add(itemId);
    }
  });

  const now = new Date();
  const todayYyyyMmDd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const totalData = {};
  dateRangeList.forEach((d) => {
    const isToday = d.yyyyMMdd === todayYyyyMmDd;
    const existing = graphDataMap[d.yyyyMMdd] || graphDataMap[d.ddMMyyyy];

    if (existing && !isToday && existing.total !== undefined) {
      totalData[d.time] = {
        date: d.ddMMyyyy,
        total: existing.total,
        totalOK: existing.totalOK || 0,
        totalNG: existing.totalNG || 0,
        totalPending: existing.totalPending || 0,
      };
    } else {
      const okCount = statusByDate[d.yyyyMMdd]?.okSet.size || 0;
      const ngCount = statusByDate[d.yyyyMMdd]?.ngSet.size || 0;
      const total = lineTotalItems;
      const pendingCount = Math.max(0, total - (okCount + ngCount));

      totalData[d.time] = {
        date: d.ddMMyyyy,
        total: total,
        totalOK: okCount,
        totalNG: ngCount,
        totalPending: pendingCount,
      };
    }
  });

  res.json({
    totalData: totalData
  });
});

exports.generateDailyGraph = async (req, res, next) => {
  const { pS, reqDate } = req.query;
  if (!pS) {
    return next(new ErrorHandler("pS not found", 400));
  }

  var dateType = new Date();
  if (reqDate) {
    var rdateType = new Date(reqDate)
    if (rdateType.getTime() < dateType.getTime() && rdateType.getTime() > 946665000000) {
      dateType = rdateType
    }
    else {
      return next(new ErrorHandler("Enter valid reqDate format (yyyy/MM/dd) ", 500));
    }
  }
  else {
    dateType.setDate(dateType.getDate() - 1)
  }

  const headVal = {
    "d": dateType.getDay(),
    "w": Math.floor(dateType.getDate() / 7.1) + 1,
    "m": dateType.getMonth() + 1,
    "y": dateType.getFullYear(),
    "pS": pS
  }

  const yyyy = dateType.getFullYear();
  const mm = String(dateType.getMonth() + 1).padStart(2, "0");
  const dd = String(dateType.getDate()).padStart(2, "0");
  const fdate = `${yyyy}-${mm}-${dd}`;
  const dbDateString = `${dd}-${mm}-${yyyy}`;

  const deleted = await DailyGraphModel.deleteMany({
    dateString: dbDateString,
    pS: pS
  });

  const headObject = new ApiFeatureHead(HeadModel, headVal).match();
  const headCheckList = await headObject.query;

  if (headCheckList.length === 0) {
    return next(new ErrorHandler("could not find check list", 404));
  }

  // unique machne
  let processNosUnique = [];
  let machineData = [];

  headCheckList.forEach((item) => {
    let line = item._id.line;

    const counts = {};
    item.processList.forEach((el) => {
      counts[el] = counts[el] ? (counts[el] += 1) : 1;
    });

    item.processList.forEach((e) => {
      let ind = processNosUnique.indexOf(e);
      if (ind === -1) {
        processNosUnique.push(e);
      }
    });

    machineData = [
      ...machineData,
      { line, processNos: processNosUnique, counts },
    ];
    processNosUnique = [];
  });

  var totalGraphData = {};

  machineData.map((machine) => {
    var total = machine?.processNos ? machine.processNos.length : 0;
    totalGraphData[machine.line] = {
      total: total,
      totalOK: 0,
      totalNG: 0,
      totalPending: total
    }
  })

  var statusVal = {
    "entryFor": fdate,
    "pS": pS
  }

  const dailyStatusAll = await DailyStatusModel.find(statusVal)
    .populate("checkItem", "line method processNo pS")
    .populate("user", "name");
  if (!dailyStatusAll) {
    return next(new ErrorHandler("No such Daily status check", 404));
  }

  const sortedDailyStatus = sortData(dailyStatusAll);

  sortedDailyStatus.map(dailystat => {
    var totalOK = 0, totalNG = 0;
    dailystat?.processes.map(process => {
      if (process?.result?.OK && process?.result?.OK > 0) {
        totalOK += 1;
      }
      if (process?.result?.NG && process?.result?.NG > 0) {
        totalNG += 1;
      }
    })
    var total = totalGraphData && totalGraphData[dailystat.line] ? totalGraphData[dailystat.line].total : 0;
    totalGraphData[dailystat.line] = {
      total: total,
      totalOK: totalOK,
      totalNG: totalNG,
      totalPending: Math.max(0, total - (totalOK + totalNG))
    }
  })

  var dailyGraphData = []
  Object.keys(totalGraphData).map((key) => {
    const data = {
      pS: pS,
      dateString: dbDateString,
      graphFor: dateType,
      line: key,
      ...totalGraphData[key]
    }
    dailyGraphData.push(data)
  })

  const dailyGraph = await DailyGraphModel.insertMany(dailyGraphData);

  if (dailyGraph) {
    res.json({
      dailyGraph: dailyGraph
    })
  }
  else {
    return next(new ErrorHandler("Daily graph not generated ", 500));
  }
}

// Added By Prasad Munaga
async function createCard(user, checkItem, dailyStatusId) {
  // console.log("createCard checkItem: " + checkItem);
  const ciObjId = new ObjectId(checkItem)
  const cardList = await CardRaisedModel.find({ checkItem: ciObjId });
  if (cardList && cardList.length > 0) {
    return;
  }

  const abItem = await AbnormalityModel.find({ checkItem: ciObjId });
  if ((abItem && abItem.length > 0) || dailystatusId) {
    // console.log(abItem);
    const card = await CardRaisedModel.create({
      cardType: "White",
      abnormality: abItem[0].abnormality,
      checkItem: ciObjId,
      user,
      line: abItem[0].line,
      processNo: abItem[0].processNo,
      status: abItem[0].status,
      image: abItem[0].image,
      pS: abItem[0].pS,
      dailyStatusId: new ObjectId(dailyStatusId)
    });
  } else {
    console.log("No abnormal record for check item " + checkItem);
  }
}

exports.updateGlComment = async (req, res, next) => {
  const { ids, user, comment } = req.body;

  var dsvList = await DailyStatusVerificationModel.find({ _id: { $in: ids.map(id => id) } })
    .populate("checkItem", "tlVerify glVerify")
    .populate("dailyStatusItemId", "_id, glBy, tlBy");

  var result = await DailyStatusModel.updateMany({ _id: { $in: dsvList.map(doc => doc.dailyStatusItemId._id) } },
    { "$set": { "glAt": new Date(), "glBy": new ObjectId(user), "glComment": comment } });

  const delList = dsvList.filter((delItem) => {
    return ((delItem.checkItem != null && delItem.checkItem.tlVerify == true && delItem.dailyStatusItemId.tlBy != null) || (delItem.checkItem.tlVerify == false));
  });

  result = await DailyStatusVerificationModel.deleteMany({ _id: { $in: delList.map(doc => doc._id) } });

  return res.status(200).json({ success: true });
}

exports.updateTlComment = async (req, res, next) => {
  const { ids, user, comment } = req.body;

  var dsvList = await DailyStatusVerificationModel.find({ _id: { $in: ids.map(id => id) } })
    .populate("checkItem", "tlVerify glVerify")
    .populate("dailyStatusItemId", "_id, glBy, tlBy");

  var result = await DailyStatusModel.updateMany({ _id: { $in: dsvList.map(doc => doc.dailyStatusItemId._id) } },
    { "$set": { "tlAt": new Date(), "tlBy": new ObjectId(user), "tlComment": comment } });

  const delList = dsvList.filter((delItem) => {
    return ((delItem.checkItem != null && delItem.checkItem.glVerify == true && delItem.dailyStatusItemId.glBy != null) || (delItem.checkItem.glVerify == false));
  });

  result = await DailyStatusVerificationModel.deleteMany({ _id: { $in: delList.map(doc => doc._id) } });

  return res.status(200).json({ success: true });
}

exports.updateGlConfirm = async (req, res, next) => {
  const { ids, user } = req.body;

  var dsvList = await DailyStatusVerificationModel.find({ _id: { $in: ids.map(id => id) } })
    .populate("checkItem", "tlVerify glVerify")
    .populate("dailyStatusItemId", "_id, glBy, tlBy");

  var result = await DailyStatusModel.updateMany({ _id: { $in: dsvList.map(doc => doc.dailyStatusItemId._id) } },
    { "$set": { "glAt": new Date(), "glBy": new ObjectId(user) } });

  const delList = dsvList.filter((delItem) => {
    return ((delItem.checkItem != null && delItem.checkItem.tlVerify == true && delItem.dailyStatusItemId.tlBy != null) || (delItem.checkItem.tlVerify == false));
  });

  console.log(JSON.stringify(delList));
  result = await DailyStatusVerificationModel.deleteMany({ _id: { $in: delList.map(doc => doc._id) } });

  var dsNGList = await DailyStatusModel.find({ _id: { $in: dsvList.map(doc => doc.dailyStatusItemId._id) } });
  dsNGList.forEach((item) => {
    if (item.result == "NG") {
      createCard(user, item.checkItem, item._id);
    }
  });

  return res.status(200).json({ success: true });
}

exports.updateTlConfirm = async (req, res, next) => {
  const { ids, user } = req.body;

  var dsvList = await DailyStatusVerificationModel.find({ _id: { $in: ids.map(id => id) } })
    .populate("checkItem", "tlVerify glVerify")
    .populate("dailyStatusItemId", "_id, glBy, tlBy");

  var result = await DailyStatusModel.updateMany({ _id: { $in: dsvList.map(doc => doc.dailyStatusItemId._id) } },
    { "$set": { "tlAt": new Date(), "tlBy": new ObjectId(user) } });

  const delList = dsvList.filter((delItem) => {
    return ((delItem.checkItem != null && delItem.checkItem.glVerify == true && delItem.dailyStatusItemId.glBy != null) || (delItem.checkItem.glVerify == false));
  });

  result = await DailyStatusVerificationModel.deleteMany({ _id: { $in: delList.map(doc => doc._id) } });

  var dsNGList = await DailyStatusModel.find({ _id: { $in: dsvList.map(doc => doc.dailyStatusItemId._id) } });
  dsNGList.forEach((item) => {
    if (item.result == "NG") {
      createCard(user, item.checkItem, item._id);
    }
  });

  return res.status(200).json({ success: true });
}

//////////////////////////////////////////////////////////////////////

//unused
// exports.getGraphData = catchAsyncError(async (req, res, next) => {

//   console.log(req.body.startDate);
//   var start = req.body.startDate.split("/")
//   start = start[2] + "-" + start[1] + "-" + start[0]
//   var end = req.body.endDate.split("/")
//   end = end[2] + "-" + end[1] + "-" + end[0]
//   const d1 = new Date(start);
//   const d2 = new Date(end);

//   var dates = getDatesInRange(d1, d2)

//   var totalData = {}

//   dates.map(async (date, i) => {

//     const dateType = new Date(date[1]);

//     const headVal = {
//       "d": dateType.getDate(),
//       "w": Math.floor(dateType.getDate() / 7.1) + 1,
//       "m": dateType.getMonth() + 1,
//       "y": dateType.getFullYear(),
//       "pS": req.body.pS
//     }

//     const headObject = new ApiFeatureHead(HeadModel, headVal).match();
//     const headCheckList = await headObject.query;

//     if (headCheckList.length === 0) {
//       return next(new ErrorHandler("could not find check list", 404));
//     }

//     // unique machne
//     let processNosUnique = [];
//     let machineData = [];
//     // let processCount=[]

//     headCheckList.forEach((item) => {
//       let line = item._id.line;

//       const counts = {};
//       item.processList.forEach((el) => {
//         counts[el] = counts[el] ? (counts[el] += 1) : 1;
//       });

//       item.processList.forEach((e) => {
//         let ind = processNosUnique.indexOf(e);
//         if (ind === -1) {
//           processNosUnique.push(e);
//         }
//       });

//       machineData = [
//         ...machineData,
//         { line, processNos: processNosUnique, counts },
//       ];
//       processNosUnique = [];
//     });

//     //done here
//     var total = 0;
//     machineData = machineData.filter(data => data.line == req.body.line)

//     Object.values(machineData[0]?.counts).forEach(val => {
//       if (val) {
//         total += val
//       }
//     });

//     var statusVal = {
//       "entryFor": date[0],
//       "pS": req.body.pS
//     }

//     const dailyStatusAll = await DailyStatusModel.find(statusVal)
//       .populate("checkItem", "line method processNo pS")
//       .populate("user", "name");
//     if (!dailyStatusAll) {
//       return next(new ErrorHandler("No such Daily status check", 404));
//     }

//     const sortedDailyStatus = sortData(dailyStatusAll);

//     const filteresSortedDailyStatus = sortedDailyStatus.filter(data => data.line == req.body.line)

//     const totalDailyStatus = dailyStatusAll.length;

//     var totalOK = 0;
//     var totalNG = 0;
//     filteresSortedDailyStatus.length && filteresSortedDailyStatus[0]?.processes.map((process) => {
//       if (process?.result?.OK) {
//         totalOK += process.result.OK
//       }
//       if (process?.result?.NG) {
//         totalNG += process.result.NG
//       }
//     })

//     totalData[dateType.getTime()] = {
//       date: date[0],
//       total,
//       totalOK,
//       totalNG,
//     }

//     if (Object.keys(totalData).length == dates.length) {
//       console.log(totalData);

//       res.status(201).json({
//         success: true,
//         totalData: totalData
//       });
//     }

//   })
// })