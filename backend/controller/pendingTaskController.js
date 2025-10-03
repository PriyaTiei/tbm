const catchAsyncError = require("../middleware/catchAsyncError");
const HeadModel = require("../mongoSchema/chekItemModel");
const DailyStatus = require("../mongoSchema/dailyStatusModel");
const PendingTask = require("../mongoSchema/pendingTaskModel");
const ApiFeaturePendingTask = require("../util/apiFeaturePendingTasks");
const ApiFeatureDailyStatus = require("../util/apiFeatureDailyStatus");
const ErrorHandler = require("../util/errorHandling");
const CheckItemModel = require("../mongoSchema/chekItemModel");
// const { checkout } = require("../Router/pendingTaskRouter");

//original code
// exports.generatePendingTaskList = catchAsyncError(async (req, res, next) => {
//   let date = new Date();
//   date.setUTCDate(date.getUTCDate() - 1);

//   const year = date.getUTCFullYear();
//   const month = date.getUTCMonth() + 1;
//   const week = Math.ceil(date.getUTCDate() / 7);
//   const day = date.getUTCDate();
//   const dated = date.getUTCDate();

//   const pendingTaskObject = new ApiFeaturePendingTask(HeadModel, {
//     d: day,
//     m: month,
//     w: week,
//     y: year,
//   }).match();
//   const dailyStatusObject = new ApiFeatureDailyStatus(DailyStatus, {
//     entryFor: `${year}-${month}-${dated}`,
//   }).match();
//   const machineTaskList = await pendingTaskObject.query;

//   const dailyStatusList = await dailyStatusObject.query;
//   console.log("dailyStatusLis :", dailyStatusList);

//   console.log(machineTaskList);

//   if (machineTaskList.length === 0) {
//     return next(new ErrorHandler("could not find check list", 404));
//   }

//   const pendingTaskList = [];
//   machineTaskList.forEach((task) => {
//     let entryDates = [];
//     entryDates.push(date);
//     var newTask = {
//       checkItem: task._id,
//       line: task.line,
//       processNo: task.processNo,
//       workDetail: task.workDetail,
//       pS: task.pS,
//       result: task.result,
//       entryDates: entryDates,
//       rS: task.rS,
//     };

//     const matchingDailyStatus = dailyStatusList.find(
//       (status) => status.checkItem.toString() === task._id.toString()
//     );

//     if (matchingDailyStatus) {
//       newTask.result = matchingDailyStatus.result;
//       if (newTask.result === "PENDING") {
//         matchingDailyStatus.entryDates.push(date);
//       }
//     }
//     pendingTaskList.push(newTask);
//   });

//   const updatedPendingTaskList = pendingTaskList.filter(
//     (task) => task.result === "PENDING"
//   );

//   const bulkOps = updatedPendingTaskList.map(
//     (task) => (
//       {
//         updateOne: {
//           filter: { checkItem: task.checkItem },
//           update: { $set: task },
//           upsert: true,
//         },
//       }
//     )
//   );

//   await deletePendingTasks();
//   deleteOkTasks();

//   PendingTask.bulkWrite(bulkOps, (err, result) => {
//     if (err) {
//       console.error(err);
//     } else {
//       console.log(
//         `Updated ${result.modifiedCount} documents and inserted ${result.upsertedCount} documents in the Pending collection`
//       );
//     }
//   });

//   return res.status(200).json({
//     success: true,
//     dailyStatusList,
//     pendingTaskList,
//   });
// });


// const deleteOkTasks = async () => {
//   try {
//     const resultOk = await PendingTask.deleteMany({ result: "OK" });
//     const resultNG = await PendingTask.deleteMany({ result: "NG" });
//     console.log(
//       `Deleted ${resultOk.deletedCount} documents from PendingTask collection`
//     );
//     console.log(
//       `Deleted ${resultNG.deletedCount} documents from PendingTask collection`
//     );
//   } catch (err) {
//     console.error(err);
//   }
// };

// async function deletePendingTasks(pendingTaskList) {
//   if(pendingTaskList) {
//     pendingTaskList.forEach((pendingTask) => {
//       PendingTask.remove({checkItem: pendingTask.checkItem});
//     });
//   }
// } 
























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
  
  // GET EXISTING PENDING TASKS TO PRESERVE entryDates
  const existingPendingTasks = await PendingTask.find({});

  console.log("dailyStatusLis :", dailyStatusList);
  console.log(machineTaskList);

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
      entryDates: [date], // Start with current date
      rS: task.rS,
    };

    const matchingDailyStatus = dailyStatusList.find(
      (status) => status.checkItem.toString() === task._id.toString()
    );

    // Find existing pending task to preserve entryDates
    const existingPendingTask = existingPendingTasks.find(
      (existing) => existing.checkItem.toString() === task._id.toString()
    );

    if (matchingDailyStatus) {
      newTask.result = matchingDailyStatus.result;
      
      if (newTask.result === "PENDING") {
        // If there's an existing pending task, preserve its entryDates
        if (existingPendingTask && existingPendingTask.entryDates) {
          const existingDates = existingPendingTask.entryDates;
          const allDates = [...existingDates, date];
          
          // Remove duplicates by converting to Set and back to Array
          newTask.entryDates = [...new Set(allDates.map(d => new Date(d).toISOString()))].map(d => new Date(d));
        }
        // If no existing task, entryDates stays as [date]
      }
    } else if (existingPendingTask && existingPendingTask.entryDates) {
      // If no daily status but existing pending task, preserve entryDates
      newTask.entryDates = [...existingPendingTask.entryDates, date];
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

  // Only delete OK and NG tasks, not pending ones
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
  // Helper function to calculate days old from entryDates
  const calculateDaysOld = (entryDates) => {
    if (!entryDates || entryDates.length === 0) return 0;
    
    const earliestDate = new Date(Math.min(...entryDates.map(date => new Date(date))));
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - earliestDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  try {
    // Build basic match criteria
    let matchCriteria = { result: "PENDING" };
    
    // Apply filters from query parameters
    if (req.query.pS) matchCriteria.pS = req.query.pS;
    if (req.query.line) matchCriteria.line = req.query.line;
    if (req.query.rS) matchCriteria.rS = req.query.rS;

    console.log('Match criteria:', matchCriteria);

    // Get all pending tasks with populated checkItem
    const allPendingTasks = await PendingTask.find(matchCriteria)
      .populate('checkItem')
      .lean(); // Use lean() for better performance

    console.log('Found pending tasks:', allPendingTasks.length);

    // Filter out tasks with null checkItem
    let filteredTasks = allPendingTasks.filter(task => {
      if (!task.checkItem) {
        console.log('Warning: Task with null checkItem found:', task._id);
        return false;
      }
      return true;
    });

    // Get all checkItem IDs for batch lookup of daily status
    const checkItemIds = filteredTasks.map(task => task.checkItem._id);
    
    // Batch fetch latest daily status for all tasks
    const latestStatuses = {};
    if (checkItemIds.length > 0) {
      const dailyStatusDocs = await DailyStatus.aggregate([
        { $match: { checkItem: { $in: checkItemIds } } },
        { $sort: { checkItem: 1, updatedAt: -1 } },
        {
          $group: {
            _id: "$checkItem",
            latestStatus: { $first: "$$ROOT" }
          }
        }
      ]);

      // Create lookup map
      dailyStatusDocs.forEach(doc => {
        latestStatuses[doc._id.toString()] = doc.latestStatus;
      });
    }

    console.log('Latest statuses found:', Object.keys(latestStatuses).length);

    // Process tasks and group by line and process
    const lineGroups = {};
    
    filteredTasks.forEach(task => {
      if (!task.checkItem) return;
      
      const daysOld = calculateDaysOld(task.entryDates);
      const checkItemId = task.checkItem._id.toString();
      const latestStatus = latestStatuses[checkItemId] || null;

      // Extract latest actual values
      let latestActualValue = "N/A";
      let lastCompletedDate = "N/A";

      if (latestStatus) {
        // Get measurement values
        if (latestStatus.m_spec && latestStatus.m_spec.length > 0) {
          const values = latestStatus.m_spec
            .map(spec => spec.m_value)
            .filter(val => val !== null && val !== undefined && val !== "")
            .join(", ");
          latestActualValue = values || "N/A";
        }

        // Get last completed date
        if (latestStatus.result === "OK" || latestStatus.result === "NG") {
          lastCompletedDate = latestStatus.checkedAt || latestStatus.updatedAt || "N/A";
        }
      }

      // Initialize line group if not exists
      if (!lineGroups[task.line]) {
        lineGroups[task.line] = {};
      }

      // Initialize process group if not exists
      if (!lineGroups[task.line][task.processNo]) {
        lineGroups[task.line][task.processNo] = [];
      }

      // Add task data with flattened fields (same structure as filtered API)
      lineGroups[task.line][task.processNo].push({
        id: task._id,
        checkItem: task.checkItem,
        result: task.result,
        pS: task.pS,
        rS: task.rS,
        entryDates: task.entryDates,
        daysOld: daysOld,
        workDetail: task.checkItem?.workDetail || "N/A",
        frequency: task.checkItem?.cycle || "N/A",
        measurement: task.checkItem?.m_spec?.map(spec => 
          `${spec.m_lable || ''}(${spec.m_unit || ''})`
        ).join(", ") || "N/A",
        standardValue: task.checkItem?.m_spec?.map(spec => 
          spec.m_criteria || ""
        ).join(", ") || "N/A",
        latestActualValue: latestActualValue,
        lastCompletedDate: lastCompletedDate
      });
    });

    // Convert grouped data to expected format
    const pendingData = [];
    Object.keys(lineGroups).forEach(line => {
      const processList = [];
      
      Object.keys(lineGroups[line]).forEach(processNo => {
        processList.push({
          processNo: processNo,
          processData: lineGroups[line][processNo]
        });
      });

      // Sort processes
      processList.sort((a, b) => {
        if (a.processNo < b.processNo) return -1;
        if (a.processNo > b.processNo) return 1;
        return 0;
      });

      // Calculate counts
      const counts = {};
      processList.forEach(el => {
        counts[el.processNo] = el.processData.length;
      });

      pendingData.push({
        line: line,
        processList: processList,
        counts: counts
      });
    });

    // Sort by line
    pendingData.sort((a, b) => {
      if (a.line < b.line) return -1;
      if (a.line > b.line) return 1;
      return 0;
    });

    // Calculate counts for compatibility
    const totalCountBlock = await PendingTask.countDocuments({
      line: "Block",
    });

    const totalCountCrank = await PendingTask.countDocuments({
      line: "Crank",
    });

    const totalCountHead = await PendingTask.countDocuments({
      line: "Head",
    });

    console.log('Final response - pendingData length:', pendingData.length);

    return res.status(200).json({
      success: true,
      pendingData,
      totalCount: { totalCountBlock, totalCountCrank, totalCountHead },
    });

  } catch (error) {
    console.error('Error in getPendingTaskList:', error);
    console.error('Error stack:', error.stack);
    return next(new ErrorHandler(`Failed to fetch pending tasks: ${error.message}`, 500));
  }
});
















//original get pending code and the above is modified



// exports.getPendingTaskList = catchAsyncError(async (req, res, next) => {
//   const pendingTaskObject = new ApiFeaturePendingTask(PendingTask, {
//     ...req.query,
//     result: "PENDING"
//   });
//   const pendingTaskObjectWithLine = pendingTaskObject.newLine();
//   const pendingTaskList = await pendingTaskObjectWithLine.query;

//   const totalCountBlock = await PendingTask.countDocuments({
//     line: "Block",
//   });

//   const totalCountCrank = await PendingTask.countDocuments({
//     line: "Crank",
//   });

//   const totalCountHead = await PendingTask.countDocuments({
//     line: "Head",
//   });

//   let pendingData = [];

//   pendingTaskList.forEach((item) => {
//     let line = item._id;

//     const counts = {};
//     item.processList.forEach((el) => {
//       counts[el.processNo] = el.processData.length;
//     });

//     let processList = item.processList;

//     processList.sort((a, b) => {
//       let x = a.processNo;
//       let y = b.processNo;
//       if (x < y) {
//         return -1;
//       }
//       if (x > y) {
//         return 1;
//       }
//       return 0;
//     });

//     pendingData = [...pendingData, { line, processList, counts }];
//   });

//   pendingData.sort((a, b) => {
//     let x = a.line;
//     let y = b.line;
//     if (x < y) {
//       return -1;
//     }
//     if (x > y) {
//       return 1;
//     }
//     return 0;
//   });

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

//   return res.status(200).json({
//     success: true,
//     pendingData,
//     totalCount: { totalCountBlock, totalCountCrank, totalCountHead },
//   });
// });

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




//age filtering code by sanjana

// exports.getPendingTasksByAge = catchAsyncError(async (req, res, next) => {
//   const { ageRange } = req.query; // Expected values: '1-10', '11-20', '20+'
  
//   const currentDate = new Date();
  
//   // Helper function to calculate days difference
//   const calculateDaysOld = (entryDates) => {
//     if (!entryDates || entryDates.length === 0) return 0;
    
//     // Get the earliest entry date
//     const earliestDate = new Date(Math.min(...entryDates.map(date => new Date(date))));
//     const timeDiff = currentDate.getTime() - earliestDate.getTime();
//     return Math.ceil(timeDiff / (1000 * 3600 * 24));
//   };

//   // Helper function to check if task falls within age range
//   const isInAgeRange = (daysOld, range) => {
//     switch (range) {
//       case '1-10':
//         return daysOld >= 1 && daysOld <= 10;
//       case '11-20':
//         return daysOld >= 11 && daysOld <= 20;
//       case '20+':
//         return daysOld > 20;
//       default:
//         return true; // If no range specified, return all
//     }
//   };

//   // First, get all pending tasks and filter by age at the document level
//   let matchCriteria = { result: "PENDING" };
  
//   // Apply other filters from query parameters (pS, line, rS, etc.)
//   if (req.query.pS) {
//     matchCriteria.pS = req.query.pS;
//   }
  
//   if (req.query.line) {
//     matchCriteria.line = req.query.line;
//   }
  
//   if (req.query.rS) {
//     matchCriteria.rS = req.query.rS;
//   }
  
//   // If we have an age range, we need to filter by date
//   if (ageRange) {
//     const currentDate = new Date();
    
//     switch (ageRange) {
//       case '1-10':
//         const tenDaysAgo = new Date(currentDate);
//         tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
//         const oneDayAgo = new Date(currentDate);
//         oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
//         matchCriteria.entryDates = {
//           $elemMatch: {
//             $lte: oneDayAgo,
//             $gte: tenDaysAgo
//           }
//         };
//         break;
        
//       case '11-20':
//         const twentyDaysAgo = new Date(currentDate);
//         twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
//         const elevenDaysAgo = new Date(currentDate);
//         elevenDaysAgo.setDate(elevenDaysAgo.getDate() - 11);
        
//         matchCriteria.entryDates = {
//           $elemMatch: {
//             $lte: elevenDaysAgo,
//             $gte: twentyDaysAgo
//           }
//         };
//         break;
        
//       case '20+':
//         const twentyOneDaysAgo = new Date(currentDate);
//         twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);
        
//         matchCriteria.entryDates = {
//           $elemMatch: {
//             $lte: twentyOneDaysAgo
//           }
//         };
//         break;
//     }
//   }

//   // Get filtered pending tasks with populated checkItem references
//   const filteredTasks = await PendingTask.find(matchCriteria).populate('checkItem');

//   // Now group the filtered tasks by line and process and fetch latest daily status for each
//   let pendingData = [];
//   const lineGroups = {};

//   // Process each task and fetch its latest daily status
//   for (const task of filteredTasks) {
//     const daysOld = calculateDaysOld(task.entryDates);
    
//     if (!lineGroups[task.line]) {
//       lineGroups[task.line] = {};
//     }
    
//     if (!lineGroups[task.line][task.processNo]) {
//       lineGroups[task.line][task.processNo] = [];
//     }
    
//     // Fetch latest daily status for this checkItem
//     let latestDailyStatus = null;
//     try {
//       latestDailyStatus = await DailyStatus.findOne({ 
//         checkItem: task.checkItem._id 
//       }).sort({ updatedAt: -1 });
//     } catch (error) {
//       console.error("Error fetching daily status:", error);
//     }
    
//     // Extract latest actual values from daily status
//     let latestActualValue = "N/A";
//     let lastCompletedDate = "N/A";
    
//     if (latestDailyStatus) {
//       if (latestDailyStatus.m_spec && latestDailyStatus.m_spec.length > 0) {
//         latestActualValue = latestDailyStatus.m_spec
//           .map(spec => spec.m_value || "")
//           .filter(val => val !== "")
//           .join(", ") || "N/A";
//       }
      
//       // Get last completed date from daily status
//       if (latestDailyStatus.result === "OK" || latestDailyStatus.result === "NG") {
//         lastCompletedDate = latestDailyStatus.checkedAt || latestDailyStatus.updatedAt || "N/A";
//       }
//     }
    
//     lineGroups[task.line][task.processNo].push({
//       id: task._id,
//       checkItem: task.checkItem,
//       result: task.result,
//       pS: task.pS,
//       entryDates: task.entryDates,
//       rS: task.rS,
//       daysOld: daysOld,
//       // Add detailed fields from populated checkItem
//       workDetail: task.checkItem?.workDetail || "N/A",
//       frequency: task.checkItem?.cycle || "N/A",
//       measurement: task.checkItem?.m_spec?.map(spec => `${spec.m_lable}(${spec.m_unit})`).join(", ") || "N/A",
//       standardValue: task.checkItem?.m_spec?.map(spec => spec.m_criteria || "").join(", ") || "N/A",
//       latestActualValue: latestActualValue,
//       lastCompletedDate: lastCompletedDate
//     });
//   }

//   // Convert grouped data to the expected format
//   Object.keys(lineGroups).forEach((line) => {
//     let processList = [];
    
//     Object.keys(lineGroups[line]).forEach((processNo) => {
//       processList.push({
//         processNo: processNo,
//         processData: lineGroups[line][processNo]
//       });
//     });
    
//     // Sort process list
//     processList.sort((a, b) => {
//       if (a.processNo < b.processNo) return -1;
//       if (a.processNo > b.processNo) return 1;
//       return 0;
//     });
    
//     const counts = {};
//     processList.forEach((el) => {
//       counts[el.processNo] = el.processData.length;
//     });
    
//     pendingData.push({
//       line: line,
//       processList: processList,
//       counts: counts
//     });
//   });

//   // Sort by line
//   pendingData.sort((a, b) => {
//     if (a.line < b.line) return -1;
//     if (a.line > b.line) return 1;
//     return 0;
//   });

//   // Calculate totals for each age range
//   const ageSummary = {
//     '1-10': 0,
//     '11-20': 0,
//     '20+': 0
//   };

//   // Get all pending tasks for summary calculation
//   const allPendingTasks = await PendingTask.find({ result: "PENDING" });
  
//   allPendingTasks.forEach((task) => {
//     const daysOld = calculateDaysOld(task.entryDates);
//     if (daysOld >= 1 && daysOld <= 10) {
//       ageSummary['1-10']++;
//     } else if (daysOld >= 11 && daysOld <= 20) {
//       ageSummary['11-20']++;
//     } else if (daysOld > 20) {
//       ageSummary['20+']++;
//     }
//   });

//   return res.status(200).json({
//     success: true,
//     pendingData: pendingData,
//     ageRange: ageRange || 'all',
//     ageSummary: ageSummary,
//     totalFiltered: pendingData.reduce((total, line) => {
//       return total + line.processList.reduce((lineTotal, process) => {
//         return lineTotal + process.processData.length;
//       }, 0);
//     }, 0)
//   });
// });



exports.getPendingTasksByAge = catchAsyncError(async (req, res, next) => {
  const { ageRange } = req.query; // Expected values: '1-10', '11-20', '20+'
  
  // Helper function to calculate days old from entryDates
  // Current data issue: entryDates array length is always 1 due to bug in generatePendingTaskList
  // Temporary fix: calculate from earliest date in array until generation logic is fixed
  const calculateDaysOld = (entryDates) => {
    if (!entryDates || entryDates.length === 0) return 0;
    
    // TODO: Once generatePendingTaskList is fixed, change this back to: return entryDates.length;
    const earliestDate = new Date(Math.min(...entryDates.map(date => new Date(date))));
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - earliestDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  // Helper function to check if task falls within age range
  const isInAgeRange = (daysOld, range) => {
    switch (range) {
      case '1-10':
        return daysOld >= 1 && daysOld <= 10;
      case '11-20':
        return daysOld >= 11 && daysOld <= 20;
      case '20+':
        return daysOld > 20;
      default:
        return true; // If no range specified, return all
    }
  };

  try {
    // Build basic match criteria
    let matchCriteria = { result: "PENDING" };
    
    // Apply filters from query parameters
    if (req.query.pS) matchCriteria.pS = req.query.pS;
    if (req.query.line) matchCriteria.line = req.query.line;
    if (req.query.rS) matchCriteria.rS = req.query.rS;

    console.log('Match criteria:', matchCriteria);

    // Get all pending tasks with populated checkItem
    const allPendingTasks = await PendingTask.find(matchCriteria)
      .populate('checkItem')
      .lean(); // Use lean() for better performance

    console.log('Found pending tasks:', allPendingTasks.length);

    // Filter out tasks with null checkItem and filter by age range if specified
    let filteredTasks = allPendingTasks.filter(task => {
      // Skip tasks with null checkItem
      if (!task.checkItem) {
        console.log('Warning: Task with null checkItem found:', task._id);
        return false;
      }
      
      // If no age range specified, include all tasks with valid checkItem
      if (!ageRange) return true;
      
      // Filter by age range
      const daysOld = calculateDaysOld(task.entryDates);
      return isInAgeRange(daysOld, ageRange);
    });

    console.log('Filtered tasks after removing null checkItems:', filteredTasks.length);

    // Get all checkItem IDs for batch lookup of daily status
    const checkItemIds = filteredTasks.map(task => task.checkItem._id);
    
    // Batch fetch latest daily status for all tasks
    const latestStatuses = {};
    if (checkItemIds.length > 0) {
      const dailyStatusDocs = await DailyStatus.aggregate([
        { $match: { checkItem: { $in: checkItemIds } } },
        { $sort: { checkItem: 1, updatedAt: -1 } },
        {
          $group: {
            _id: "$checkItem",
            latestStatus: { $first: "$$ROOT" }
          }
        }
      ]);

      // Create lookup map
      dailyStatusDocs.forEach(doc => {
        latestStatuses[doc._id.toString()] = doc.latestStatus;
      });
    }

    console.log('Latest statuses found:', Object.keys(latestStatuses).length);

    // Process tasks and group by line and process
    const lineGroups = {};
    
    filteredTasks.forEach(task => {
      // Skip if checkItem is null (already filtered above, but double-check)
      if (!task.checkItem) return;
      
      const daysOld = calculateDaysOld(task.entryDates);
      const checkItemId = task.checkItem._id.toString();
      const latestStatus = latestStatuses[checkItemId] || null;

      // Extract latest actual values
      let latestActualValue = "N/A";
      let lastCompletedDate = "N/A";

      if (latestStatus) {
        // Get measurement values
        if (latestStatus.m_spec && latestStatus.m_spec.length > 0) {
          const values = latestStatus.m_spec
            .map(spec => spec.m_value)
            .filter(val => val !== null && val !== undefined && val !== "")
            .join(", ");
          latestActualValue = values || "N/A";
        }

        // Get last completed date
        if (latestStatus.result === "OK" || latestStatus.result === "NG") {
          lastCompletedDate = latestStatus.checkedAt || latestStatus.updatedAt || "N/A";
        }
      }

      // Initialize line group if not exists
      if (!lineGroups[task.line]) {
        lineGroups[task.line] = {};
      }

      // Initialize process group if not exists
      if (!lineGroups[task.line][task.processNo]) {
        lineGroups[task.line][task.processNo] = [];
      }

      // Add task data
      lineGroups[task.line][task.processNo].push({
        id: task._id,
        checkItem: task.checkItem,
        result: task.result,
        pS: task.pS,
        rS: task.rS,
        entryDates: task.entryDates,
        daysOld: daysOld,
        workDetail: task.checkItem?.workDetail || "N/A",
        frequency: task.checkItem?.cycle || "N/A",
        measurement: task.checkItem?.m_spec?.map(spec => 
          `${spec.m_lable || ''}(${spec.m_unit || ''})`
        ).join(", ") || "N/A",
        standardValue: task.checkItem?.m_spec?.map(spec => 
          spec.m_criteria || ""
        ).join(", ") || "N/A",
        latestActualValue: latestActualValue,
        lastCompletedDate: lastCompletedDate
      });
    });

    // Convert grouped data to expected format
    const pendingData = [];
    Object.keys(lineGroups).forEach(line => {
      const processList = [];
      
      Object.keys(lineGroups[line]).forEach(processNo => {
        processList.push({
          processNo: processNo,
          processData: lineGroups[line][processNo]
        });
      });

      // Sort processes
      processList.sort((a, b) => {
        if (a.processNo < b.processNo) return -1;
        if (a.processNo > b.processNo) return 1;
        return 0;
      });

      // Calculate counts
      const counts = {};
      processList.forEach(el => {
        counts[el.processNo] = el.processData.length;
      });

      pendingData.push({
        line: line,
        processList: processList,
        counts: counts
      });
    });

    // Sort by line
    pendingData.sort((a, b) => {
      if (a.line < b.line) return -1;
      if (a.line > b.line) return 1;
      return 0;
    });

    // Calculate age summary from all pending tasks
    const ageSummary = {
      '1-10': 0,
      '11-20': 0,
      '20+': 0
    };

    allPendingTasks.forEach(task => {
      const daysOld = calculateDaysOld(task.entryDates);
      if (daysOld >= 1 && daysOld <= 10) {
        ageSummary['1-10']++;
      } else if (daysOld >= 11 && daysOld <= 20) {
        ageSummary['11-20']++;
      } else if (daysOld > 20) {
        ageSummary['20+']++;
      }
    });

    // Calculate total filtered
    const totalFiltered = pendingData.reduce((total, line) => {
      return total + line.processList.reduce((lineTotal, process) => {
        return lineTotal + process.processData.length;
      }, 0);
    }, 0);

    console.log('Final response - pendingData length:', pendingData.length);
    console.log('Total filtered:', totalFiltered);

    return res.status(200).json({
      success: true,
      pendingData: pendingData,
      ageRange: ageRange || 'all',
      ageSummary: ageSummary,
      totalFiltered: totalFiltered
    });

  } catch (error) {
    console.error('Error in getPendingTasksByAge:', error);
    console.error('Error stack:', error.stack);
    return next(new ErrorHandler(`Failed to fetch pending tasks by age: ${error.message}`, 500));
  }
});