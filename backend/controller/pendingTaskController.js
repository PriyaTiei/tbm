const catchAsyncError = require("../middleware/catchAsyncError");
const HeadModel = require("../mongoSchema/chekItemModel");
const DailyStatus = require("../mongoSchema/dailyStatusModel");
const PendingTask = require("../mongoSchema/pendingTaskModel");
const ApiFeaturePendingTask = require("../util/apiFeaturePendingTasks");
const ApiFeatureDailyStatus = require("../util/apiFeatureDailyStatus");
const ErrorHandler = require("../util/errorHandling");

exports.generatePendingTaskList = catchAsyncError(async (req, res, next) => {
  let date = new Date();
  date.setDate(date.getDate() - 1);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const week = Math.ceil(date.getDate() / 7);
  const day = date.getDay();  
  const dated = date.getDate(); 
 

  const pendingTaskObject = new ApiFeaturePendingTask(HeadModel, {
    pS: "P",
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


  if (machineTaskList.length === 0) {
    return next(new ErrorHandler("could not find check list", 404));
  }

  const pendingTaskList = [];
  machineTaskList.forEach((task) => {
    var newTask = {
      checkItem: task._id, 
      line: task.line,
      processNo: task.processNo,
      workDetail: task.workDetail,
      pS: task.pS,
      result: task.result, 
    } 
    const matchingDailyStatus = dailyStatusList.find(status => status.checkItem.toString() === task._id.toString()); 
    if (matchingDailyStatus) { 
      newTask.result = matchingDailyStatus.result;
    }
    pendingTaskList.push(newTask)
  })
   

  const updatedPendingTaskList = pendingTaskList.filter(task => task.result === 'PENDING'); 

  

  const bulkOps = updatedPendingTaskList.map(task => ({
    updateOne: {
      filter: { checkItem: task.checkItem },
      update: { $set: task },
      upsert: true
    }
  }));

  deleteOkTasks()
  
  PendingTask.bulkWrite(bulkOps, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Updated ${result.modifiedCount} documents and inserted ${result.upsertedCount} documents in the Pending collection`);
    }
  });
  
  res.status(201).json({
    success: true, 
    dailyStatusList,
    pendingTaskList
  });

   
 
});



const deleteOkTasks = async () => {
  try {
    const resultOk = await PendingTask.deleteMany({ result: 'OK' });
    const resultNG = await PendingTask.deleteMany({ result: 'NG' });
    console.log(`Deleted ${resultOk.deletedCount} documents from PendingTask collection`);
    console.log(`Deleted ${resultNG.deletedCount} documents from PendingTask collection`);
  } catch (err) {
    console.error(err);
  }
}



exports.getPendingTaskList = catchAsyncError(async (req, res, next) => {
  const pendingTaskObject = new ApiFeaturePendingTask(PendingTask);
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
      counts[el.processNo] = counts[el.processNo] ? (counts[el.processNo] += 1) : 1;
    });

   let processList = item.processList;

    pendingData = [
      ...pendingData,
      { line,  processList, counts},
    ]; 
  });

  
 

  res.status(201).json({
    success: true,  
    pendingData,
    totalCount: { totalCountBlock, totalCountCrank, totalCountHead },
  });
})

 
