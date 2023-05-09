const catchAsyncError = require("../middleware/catchAsyncError");
const DailyStatusModel = require("../mongoSchema/dailyStatusModel");
const PendingTask = require("../mongoSchema/pendingTaskModel")
const ErrorHandler = require("../util/errorHandling");
const ApiFeatureDailyStatus = require("../util/apiFeatureDailyStatus");

exports.createDailyStatus = catchAsyncError(async (req, res, next) => {
  const { checkItem, result, value, user, entryFor, pS, remarks } = req.body;

  const dailystatusAvailable = await DailyStatusModel.findOne({
    checkItem,
    entryFor,
  });

  if (dailystatusAvailable) {
    dailystatusAvailable.result = result;
    dailystatusAvailable.value = value;
    dailystatusAvailable.remarks = remarks;
    const dailyStatus = await dailystatusAvailable.save({
      validateBeforeSave: false,
    });

    res.status(200).json({ success: true, dailyStatus });
  } else {
    const dailyStatus = await DailyStatusModel.create({
      checkItem,
      result,
      value,
      user,
      entryFor,
      pS,
      remarks
    });

    const pendingTask = await PendingTask.findOne({ checkItem : checkItem})

    if(pendingTask) {
      pendingTask.result = result;
      await pendingTask.save()
    }

    res.status(200).json({ success: true, dailyStatus });
  }
});

exports.updateDailyStatus = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const { checkItem, result, value, user, entryFor, pS, remarks } = req.body;

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
  await dailyStatus.save({ validateBeforeSave: false });

  res.status(201).json({ success: true, message: "Updated Successfully" });
});

exports.deleteDailyStatus = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  let dailyStatus = await DailyStatusModel.findById(id);
  if (!dailyStatus) {
    return next(new ErrorHandler("No such daily status check ", 404));
  }

  await dailyStatus.remove();
  res.status(201).json({ success: true, message: "Deleted Successfully" });
});

exports.getDailyStatus = catchAsyncError(async (req, res, next) => {
  const { idCheckItem, entryFor } = req.params;

  let dailyStatus = await DailyStatusModel.findOne({
    checkItem: idCheckItem,
    entryFor,
  });
  if (!dailyStatus) {
    // return next(new ErrorHandler("No such daily status check ", 404));
    res
      .status(201)
      .json({ success: true, dailyStatus: { result: "decisionPending" } });
  }

  res.status(201).json({ success: true, dailyStatus });
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
  res.status(201).json({
    success: true,
    totalDailyStatus,
    sortedDailyStatus,
  });
  // res.status(201).json({
  //   success: true,
  //    totalDailyStatus,
  //   dailyStatusAll,
  // });
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
  res.status(201).json({ success: true, dailyStatusAggregatedList });
});

exports.getTrendDailyStatus = catchAsyncError(async (req, res, next) => {
  const { idCheckItem, fromDate, toDate } = req.params;
  // console.log(req.params);
  // console.log(`checkedAt:{$gte:${fromDate}, $lt:${toDate}}`)
  let dailyStatus = await DailyStatusModel.find({
    checkItem: idCheckItem,
    checkedAt: { $gte: fromDate, $lt: toDate },
  },{value:1, entryFor:1});

  if (!dailyStatus) {
    return next(new ErrorHandler("could not find data / list is empty", 404));
  }

  res
    .status(201)
    .json({ success: true, total: dailyStatus.length, dailyStatus });
});
