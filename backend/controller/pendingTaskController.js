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
  let date;
  if (req.query.date) {
    const parts = String(req.query.date).split("-").map(Number);
    if (parts.length === 3) {
      date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    } else {
      date = new Date(req.query.date);
    }
  } else {
    date = new Date();
    date.setUTCDate(date.getUTCDate() - 1);
  }

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const dated = date.getUTCDate();
  const week = Math.floor(dated / 7.1) + 1;
  const day = date.getUTCDay();

  console.log(`[generatePendingTaskList] Checking date: ${year}-${month}-${dated} (d=${day}, w=${week})`);

  const pendingTaskObject = new ApiFeaturePendingTask(HeadModel, {
    d: day,
    m: month,
    w: week,
    y: year,
  }).match();
  const dateVariations = [
    `${year}-${month}-${dated}`,
    `${year}-${String(month).padStart(2, "0")}-${String(dated).padStart(2, "0")}`,
    `${dated}-${month}-${year}`,
    `${String(dated).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`
  ];
  const machineTaskList = await pendingTaskObject.query;
  const dailyStatusList = await DailyStatus.find({
    entryFor: { $in: dateVariations }
  });
  
  // GET EXISTING PENDING TASKS TO PRESERVE entryDates
  const existingPendingTasks = await PendingTask.find({});

  console.log("dailyStatusLis :", dailyStatusList);
  console.log(machineTaskList);

  if (machineTaskList.length === 0) {
    return res.status(200).json({
      success: true,
      message: `No scheduled tasks found for ${year}-${month}-${dated}`,
      count: 0,
      pendingTaskList: []
    });
  }

  const pendingTaskList = [];
  machineTaskList.forEach((task) => {
    var newTask = {
      checkItem: task._id,
      line: task.line,
      processNo: task.processNo,
      workDetail: task.workDetail,
      pS: task.pS,
      result: "PENDING",
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
      }
    } else {
      // No daily status record exists for scheduled day -> unperformed check is PENDING
      newTask.result = "PENDING";
      if (existingPendingTask && existingPendingTask.entryDates) {
        const existingDates = existingPendingTask.entryDates;
        const allDates = [...existingDates, date];
        newTask.entryDates = [...new Set(allDates.map(d => new Date(d).toISOString()))].map(d => new Date(d));
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

  // Only delete OK and NG tasks, not pending ones
  await deleteOkTasks();

  if (bulkOps.length > 0) {
    try {
      const result = await PendingTask.bulkWrite(bulkOps);
      console.log(
        `Updated ${result.modifiedCount} documents and inserted ${result.upsertedCount} documents in the Pending collection`
      );
    } catch (err) {
      console.error("PendingTask bulkWrite error:", err);
    }
  }

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
    // Also clean up any orphaned pending tasks where checkItem is null
    await PendingTask.deleteMany({ checkItem: null });
    console.log(
      `Deleted ${resultOk.deletedCount} OK tasks and ${resultNG.deletedCount} NG tasks from PendingTask collection`
    );
  } catch (err) {
    console.error(err);
  }
};

async function deletePendingTasks(pendingTaskList) {
  if (pendingTaskList && pendingTaskList.length > 0) {
    const itemIds = pendingTaskList.map((pt) => pt.checkItem).filter(Boolean);
    if (itemIds.length > 0) {
      await PendingTask.deleteMany({ checkItem: { $in: itemIds } });
    }
  }
} 






















// Helper to parse target date from query
const parseTargetDate = (query) => {
  if (query.date) {
    const parts = String(query.date).split("-").map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    const parsed = new Date(query.date);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  if (query.y && query.m && query.dt) {
    return new Date(Number(query.y), Number(query.m) - 1, Number(query.dt));
  }
  return new Date();
};

// Helper function to calculate days old relative to target date
const calculateDaysOld = (entryDates, targetDate) => {
  if (!entryDates || entryDates.length === 0) return 0;
  
  const earliestTime = Math.min(...entryDates.map(date => new Date(date).getTime()));
  const ref = targetDate || new Date();
  const timeDiff = ref.getTime() - earliestTime;
  return Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
};

// Helper to determine if a task matches date/schedule query parameters
const matchesDateFilter = (task, query) => {
  const { date, d, w, m, y, dt } = query;
  
  const hasDateFilter = 
    date || 
    (d !== undefined && d !== null && d !== "") ||
    (w !== undefined && w !== null && w !== "") ||
    (m !== undefined && m !== null && m !== "") ||
    (y !== undefined && y !== null && y !== "") ||
    (dt !== undefined && dt !== null && dt !== "");

  if (!hasDateFilter) return true;

  const checkItem = task.checkItem;
  if (!checkItem) return false;

  let targetDate = null;
  if (date) {
    const parts = String(date).split("-").map(Number);
    if (parts.length === 3) {
      targetDate = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) targetDate = parsed;
    }
  } else if (y && m && dt) {
    targetDate = new Date(Number(y), Number(m) - 1, Number(dt));
  }

  // If task was generated in the future relative to targetDate, exclude it
  if (targetDate && task.entryDates && task.entryDates.length > 0) {
    const earliestTime = Math.min(...task.entryDates.map(ed => new Date(ed).getTime()));
    const endOfTargetDay = new Date(targetDate);
    endOfTargetDay.setHours(23, 59, 59, 999);
    if (earliestTime > endOfTargetDay.getTime()) {
      return false;
    }
  }

  // Check if entryDates contains targetDate
  let matchesEntryDate = false;
  if (targetDate && task.entryDates && task.entryDates.length > 0) {
    const tY = targetDate.getFullYear();
    const tM = targetDate.getMonth() + 1;
    const tD = targetDate.getDate();

    matchesEntryDate = task.entryDates.some((ed) => {
      const itemDate = new Date(ed);
      return (
        (itemDate.getFullYear() === tY && itemDate.getMonth() + 1 === tM && itemDate.getDate() === tD) ||
        (itemDate.getUTCFullYear() === tY && itemDate.getUTCMonth() + 1 === tM && itemDate.getUTCDate() === tD)
      );
    });
  }

  // Check if checkItem schedule matches d, w, m, y
  let matchesSchedule = true;

  if (d !== undefined && d !== null && d !== "") {
    const dNum = Number(d);
    const itemD = Number(checkItem.d);
    const validD = [9999, 9, dNum];
    if (dNum === 0 && !validD.includes(7)) validD.push(7);
    if (dNum === 7 && !validD.includes(0)) validD.push(0);
    if (dNum === 0 || dNum === 7) {
      const idx = validD.indexOf(9);
      if (idx !== -1) validD.splice(idx, 1);
    }
    if (!validD.includes(itemD)) {
      matchesSchedule = false;
    }
  }

  if (matchesSchedule && w !== undefined && w !== null && w !== "") {
    const wNum = Number(w);
    const itemW = Number(checkItem.w);
    const validW = [9999, 9, wNum];
    if (!validW.includes(itemW)) {
      matchesSchedule = false;
    }
  }

  if (matchesSchedule && m !== undefined && m !== null && m !== "") {
    const mNum = Number(m);
    const itemM = Number(checkItem.m);
    const validM = [9999, 99, 9, mNum];
    if (!validM.includes(itemM)) {
      matchesSchedule = false;
    }
  }

  if (matchesSchedule && y !== undefined && y !== null && y !== "") {
    const yNum = Number(y);
    const itemY = Number(checkItem.y);
    const validY = [9999, yNum];
    if (!validY.includes(itemY)) {
      matchesSchedule = false;
    }
  }

  return matchesSchedule || matchesEntryDate;
};

exports.getPendingTaskList = catchAsyncError(async (req, res, next) => {
  const targetDate = parseTargetDate(req.query);

  try {
    // Build basic match criteria
    let matchCriteria = { result: "PENDING" };
    
    // Apply filters from query parameters
    if (req.query.pS) matchCriteria.pS = req.query.pS;
    if (req.query.line) {
      const lineLower = String(req.query.line).toLowerCase().trim();
      if (lineLower === "assembly" || lineLower === "all assembly") {
        matchCriteria.line = { $regex: "assembly", $options: "i" };
      } else if (lineLower === "machining" || lineLower === "all machining") {
        matchCriteria.line = { $regex: "block|crank|head|cam", $options: "i" };
      } else if (lineLower === "other lines" || lineLower === "other parts") {
        matchCriteria.line = { $not: { $regex: "assembly|block|crank|head|cam", $options: "i" } };
      } else {
        matchCriteria.line = req.query.line;
      }
    }
    if (req.query.rS) matchCriteria.rS = req.query.rS;

    console.log('Match criteria:', matchCriteria);

    // Get all pending tasks with populated checkItem
    const allPendingTasks = await PendingTask.find(matchCriteria)
      .populate('checkItem')
      .lean(); // Use lean() for better performance

    console.log('Found pending tasks:', allPendingTasks.length);

    // Filter out tasks with null checkItem and apply date/schedule filtering
    let filteredTasks = allPendingTasks.filter(task => {
      if (!task.checkItem) {
        console.log('Warning: Task with null checkItem found:', task._id);
        return false;
      }
      return matchesDateFilter(task, req.query);
    });

    console.log('Date filtered tasks count:', filteredTasks.length);

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
      
      const daysOld = calculateDaysOld(task.entryDates, targetDate);
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
        action: task.checkItem?.action || "N/A",
        criterion: task.checkItem?.criterion || "N/A",
        measurement: task.checkItem?.m_spec?.map(spec => 
          `${spec.m_lable || ''}(${spec.m_unit || ''})`
        ).join(", ") || "N/A",
        standardValue: task.checkItem?.criterion || (task.checkItem?.m_spec?.length ? task.checkItem.m_spec.map(spec => spec.m_criteria || "").filter(Boolean).join(", ") : "N/A"),
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
  // Use the same robust query and date filtering as getPendingTaskList
  return exports.getPendingTaskList(req, res, next);
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
  let { ageRange } = req.query; // Expected values: '1-10', '11-20', '20+'
  if (ageRange) {
    ageRange = String(ageRange).trim();
    // Handle URL decoding where '+' becomes a space ('20 ' -> '20+')
    if (ageRange === '20' || ageRange === '20 ' || ageRange === '>20') {
      ageRange = '20+';
    }
  }
  const targetDate = parseTargetDate(req.query);

  // Helper function to check if task falls within age range
  const isInAgeRange = (daysOld, range) => {
    if (!range || range === 'ALL' || range === 'all') return true;
    const cleanRange = String(range).trim();
    switch (cleanRange) {
      case '1-10':
        return daysOld >= 0 && daysOld <= 10;
      case '11-20':
        return daysOld >= 11 && daysOld <= 20;
      case '20+':
      case '>20':
      case '20':
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
    if (req.query.line) {
      const lineLower = String(req.query.line).toLowerCase().trim();
      if (lineLower === "assembly" || lineLower === "all assembly") {
        matchCriteria.line = { $regex: "assembly", $options: "i" };
      } else if (lineLower === "machining" || lineLower === "all machining") {
        matchCriteria.line = { $regex: "block|crank|head|cam", $options: "i" };
      } else if (lineLower === "other lines" || lineLower === "other parts") {
        matchCriteria.line = { $not: { $regex: "assembly|block|crank|head|cam", $options: "i" } };
      } else {
        matchCriteria.line = req.query.line;
      }
    }
    if (req.query.rS) matchCriteria.rS = req.query.rS;

    console.log('Match criteria:', matchCriteria);

    // Get all pending tasks with populated checkItem
    const allPendingTasks = await PendingTask.find(matchCriteria)
      .populate('checkItem')
      .lean(); // Use lean() for better performance

    console.log('Found pending tasks:', allPendingTasks.length);

    // Filter out tasks with null checkItem and apply date/schedule filtering
    let dateFilteredTasks = allPendingTasks.filter(task => {
      if (!task.checkItem) {
        return false;
      }
      return matchesDateFilter(task, req.query);
    });

    console.log('Date filtered tasks in getPendingTasksByAge:', dateFilteredTasks.length);

    // Calculate age summary from date-matching tasks relative to targetDate
    const ageSummary = {
      '1-10': 0,
      '11-20': 0,
      '20+': 0
    };

    dateFilteredTasks.forEach(task => {
      const daysOld = calculateDaysOld(task.entryDates, targetDate);
      if (daysOld >= 1 && daysOld <= 10) {
        ageSummary['1-10']++;
      } else if (daysOld >= 11 && daysOld <= 20) {
        ageSummary['11-20']++;
      } else if (daysOld > 20) {
        ageSummary['20+']++;
      }
    });

    // Filter by age range if specified
    let filteredTasks = dateFilteredTasks.filter(task => {
      if (!ageRange) return true;
      const daysOld = calculateDaysOld(task.entryDates, targetDate);
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
      
      const daysOld = calculateDaysOld(task.entryDates, targetDate);
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

    // ageSummary already calculated from date-filtered tasks above

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