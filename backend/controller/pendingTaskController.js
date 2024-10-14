const catchAsyncError = require("../middleware/catchAsyncError");
const HeadModel = require("../mongoSchema/chekItemModel");
const DailyStatus = require("../mongoSchema/dailyStatusModel");
const PendingTask = require("../mongoSchema/pendingTaskModel");
const ApiFeaturePendingTask = require("../util/apiFeaturePendingTasks");
const ApiFeatureDailyStatus = require("../util/apiFeatureDailyStatus");
const ErrorHandler = require("../util/errorHandling");
const CheckItemModel = require("../mongoSchema/chekItemModel");
// const { checkout } = require("../Router/pendingTaskRouter");


exports.generatePendingTaskList = catchAsyncError(async (req, res, next) => {
  let date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const week = Math.ceil(date.getUTCDate() / 7);
  const day = date.getUTCDate();
  const dated = date.getUTCDate();

  const pendingTaskObject = new ApiFeaturePendingTask(HeadModel, {
    d: day,
    m: month,
    w: week,
    y: year,
  }).match();
  const dailyStatusObject = new ApiFeatureDailyStatus(DailyStatus, {
    entryFor: `${year}-${month}-${dated}`,
  }).match();
  const machineTaskList = await pendingTaskObject.query;

  const dailyStatusList = await dailyStatusObject.query;
  console.log("dailyStatusLis :", dailyStatusList);

  console.log(machineTaskList);

  if (machineTaskList.length === 0) {
    return next(new ErrorHandler("could not find check list", 404));
  }

  const pendingTaskList = [];
  machineTaskList.forEach((task) => {
    let entryDates = [];
    entryDates.push(date);
    var newTask = {
      checkItem: task._id,
      line: task.line,
      processNo: task.processNo,
      workDetail: task.workDetail,
      pS: task.pS,
      result: task.result,
      entryDates: entryDates,
      rS: task.rS,
    };

    const matchingDailyStatus = dailyStatusList.find(
      (status) => status.checkItem.toString() === task._id.toString()
    );

    if (matchingDailyStatus) {
      newTask.result = matchingDailyStatus.result;
      if (newTask.result === "PENDING") {
        matchingDailyStatus.entryDates.push(date);
      }
    }
    pendingTaskList.push(newTask);
  });

  const updatedPendingTaskList = pendingTaskList.filter(
    (task) => task.result === "PENDING"
  );

  const bulkOps = updatedPendingTaskList.map(
    (task) => (
      {
        updateOne: {
          filter: { checkItem: task.checkItem },
          update: { $set: task },
          upsert: true,
        },
      }
    )
  );

  await deletePendingTasks();
  deleteOkTasks();

  PendingTask.bulkWrite(bulkOps, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log(
        `Updated ${result.modifiedCount} documents and inserted ${result.upsertedCount} documents in the Pending collection`
      );
    }
  });

  return res.status(200).json({
    success: true,
    dailyStatusList,
    pendingTaskList,
  });
});

const deleteOkTasks = async () => {
  try {
    const resultOk = await PendingTask.deleteMany({ result: "OK" });
    const resultNG = await PendingTask.deleteMany({ result: "NG" });
    console.log(
      `Deleted ${resultOk.deletedCount} documents from PendingTask collection`
    );
    console.log(
      `Deleted ${resultNG.deletedCount} documents from PendingTask collection`
    );
  } catch (err) {
    console.error(err);
  }
};

async function deletePendingTasks(pendingTaskList) {
  if(pendingTaskList) {
    pendingTaskList.forEach((pendingTask) => {
      PendingTask.remove({checkItem: pendingTask.checkItem});
    });
  }
} 

exports.getPendingTaskList = catchAsyncError(async (req, res, next) => {
  const pendingTaskObject = new ApiFeaturePendingTask(PendingTask, {
    ...req.query,
    result: "PENDING"
  });
  const pendingTaskObjectWithLine = pendingTaskObject.line();
  const pendingTaskList = await pendingTaskObjectWithLine.query;

  const totalCountBlock = await PendingTask.countDocuments({
    line: "Block",
  });

  const totalCountCrank = await PendingTask.countDocuments({
    line: "Crank",
  });

  const totalCountHead = await PendingTask.countDocuments({
    line: "Head",
  });

  let pendingData = [];

  pendingTaskList.forEach((item) => {
    let line = item._id;

    const counts = {};
    item.processList.forEach((el) => {
      counts[el.processNo] = el.processData.length;
    });

    let processList = item.processList;

    processList.sort((a, b) => {
      let x = a.processNo;
      let y = b.processNo;
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });

    pendingData = [...pendingData, { line, processList, counts }];
  });

  pendingData.sort((a, b) => {
    let x = a.line;
    let y = b.line;
    if (x < y) {
      return -1;
    }
    if (x > y) {
      return 1;
    }
    return 0;
  });

  /*
  pendingData.forEach((pData) => {
    pData.processList.forEach((pl) => {
      pl.processData.forEach((pd) => {
        console.log(pd.checkItem);
        var ckItem = CheckItemModel.find({_id: pd.checkItem});
        console.log(ckItem);
      });
    });
  });
  */

  return res.status(200).json({
    success: true,
    pendingData,
    totalCount: { totalCountBlock, totalCountCrank, totalCountHead },
  });
});

exports.getPendingTaskReport = catchAsyncError(async (req, res, next) => {
  const pendingTaskObject = new ApiFeaturePendingTask(PendingTask, {
    ...req.query,
    result: "PENDING"
  });
  const pendingTaskObjectWithLine = pendingTaskObject.lineReport();
  const pendingTaskList = await pendingTaskObjectWithLine.query;
console.log(pendingTaskList);

  const totalCountBlock = await PendingTask.countDocuments({
    line: "Block",
  });

  const totalCountCrank = await PendingTask.countDocuments({
    line: "Crank",
  });

  const totalCountHead = await PendingTask.countDocuments({
    line: "Head",
  });

  let pendingData = [];

  pendingTaskList.forEach((item) => {
    let line = item._id;

    const counts = {};
    item.processList.forEach((el) => {
      counts[el.processNo] = el.processData.length;
    });

    let processList = item.processList;

    processList.sort((a, b) => {
      let x = a.processNo;
      let y = b.processNo;
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });

    pendingData = [...pendingData, { line, processList, counts }];
  });

  pendingData.sort((a, b) => {
    let x = a.line;
    let y = b.line;
    if (x < y) {
      return -1;
    }
    if (x > y) {
      return 1;
    }
    return 0;
  });

  return res.status(200).json({
    success: true,
    pendingData,
    totalCount: { totalCountBlock, totalCountCrank, totalCountHead },
  });

});

exports.updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { result } = req.body;

    const data = await PendingTask.findByIdAndUpdate(id, { result: result });

    if (!data) {
      return res.status(404).send("Data not found");
    }

    res.send(data);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};
