// import React, { Fragment, useEffect, useState, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { getPendingTasks } from "../../redux/pendingTasks/pendingActions";
// import * as XLSX from "xlsx";
// import PendingLine from "./PendingLine";
// import Loading from "../Loading";
// import { Button } from "react-bootstrap";
// import axios from "axios";

// export default function PendingTask() {
//   const dispatch = useDispatch();

//   const pendingTasks = useSelector((state) => state.pendingTasks);
//   const filters = useSelector((state) => state.filters);

//   const [header, setHeader] = useState([]);
//   const [body, setBody] = useState([]);
//   const [excelData, setExcelData] = useState([]);
//   const [ageFilter, setAgeFilter] = useState("ALL");
//   const [isExcelDataReady, setIsExcelDataReady] = useState(false);
//   const [isExcelApiLoaded, setIsExcelApiLoaded] = useState(false);

//   const queryStr =
//     `pS=${filters.pS}` +
//     (filters.line ? `&line=${filters.line}` : "") +
//     (filters.rS ? `&rS=${filters.rS}` : "");

//   useEffect(() => {
//     dispatch(getPendingTasks(queryStr));
//   }, [dispatch, queryStr]);

//   const { loading, pendingTasksData, error } = pendingTasks;

//   // Fetch Excel data from the report endpoint with ALL filters applied
//   useEffect(() => {
//     setIsExcelApiLoaded(false);
//     setIsExcelDataReady(false);
    
//     // Use the same queryStr that's used for display data to ensure consistency
//     const url = `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/pendingTasks/getPendingTaskReport?${queryStr}`;
    
//     axios
//       .get(url)
//       .then((res) => {
//         if (res.data && res.data.success && res.data.pendingData) {
//           setExcelData(res.data);
//           setIsExcelApiLoaded(true);
//         } else {
//           // Use display data as fallback
//           setExcelData({ 
//             success: true, 
//             pendingData: pendingTasksData?.pendingData || [] 
//           });
//           setIsExcelApiLoaded(true);
//         }
//       })
//       .catch((err) => {
//         console.error("Excel data fetch error:", err);
//         // Fallback to using display data if Excel API fails
//         setExcelData({ 
//           success: true, 
//           pendingData: pendingTasksData?.pendingData || [] 
//         });
//         setIsExcelApiLoaded(true);
//       });
//   }, [queryStr, pendingTasksData]); // Changed dependency from filters to queryStr

//   // Sanitize and prepare the Excel data with proper createdAt dates
//   const sanitizedExcelData = useMemo(() => {
//     return (excelData?.pendingData || []).map((item) => ({
//       ...item,
//       processList: (item.processList || []).map((entry) => {
//         const direct = entry.createdAt;
//         const fromProcessData =
//           entry.processData?.[0]?.createdAt ||
//           entry.processData?.[0]?.entryDates?.[0] ||
//           null;

//         const createdAt = direct || fromProcessData;

//         return {
//           ...entry,
//           createdAt,
//         };
//       }),
//     }));
//   }, [excelData]);

//   // Sanitize and prepare the pending data with proper createdAt dates
//   const sanitizedPendingData = useMemo(() => {
//     return (pendingTasksData?.pendingData || []).map((item) => ({
//       ...item,
//       processList: (item.processList || []).map((entry) => {
//         const direct = entry.createdAt;
//         const fromProcessData =
//           entry.processData?.[0]?.createdAt ||
//           entry.processData?.[0]?.entryDates?.[0] ||
//           null;

//         const createdAt = direct || fromProcessData;

//         return {
//           ...entry,
//           createdAt,
//         };
//       }),
//     }));
//   }, [pendingTasksData]);

//   // Filter data based on age filter
//   const filterDataByAge = (data) => {
//     const now = new Date();

//     return data
//       .map((item) => {
//         const filteredProcessList = item.processList.filter((entry) => {
//           const createdAt = new Date(entry.createdAt);

//           if (!entry.createdAt) return ageFilter === "ALL";

//           const createdDate = new Date(createdAt);
//           if (isNaN(createdDate)) return ageFilter === "ALL";

//           const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);

//           switch (ageFilter) {
//             case "ALL":
//               return true;
//             case "1-10":
//               return diffDays >= 0 && diffDays < 10;
//             case "11-20":
//               return diffDays >= 10 && diffDays < 20;
//             case ">20":
//               return diffDays >= 20;
//             default:
//               return true;
//           }
//         });

//         return filteredProcessList.length > 0 ? { ...item, processList: filteredProcessList } : null;
//       })
//       .filter(Boolean);
//   };

//   // Filter the Excel data based on age filter
//   const filteredExcelData = useMemo(() => {
//     return filterDataByAge(sanitizedExcelData);
//   }, [sanitizedExcelData, ageFilter]);

//   // Filter the display data based on age filter
//   const filteredPendingData = useMemo(() => {
//     return filterDataByAge(sanitizedPendingData);
//   }, [sanitizedPendingData, ageFilter]);

//   // Build Excel data whenever filtered data changes - but only after Excel API is loaded
//   useEffect(() => {
//     // Don't build Excel data until the Excel API has loaded
//     if (!isExcelApiLoaded) {
//       setIsExcelDataReady(false);
//       return;
//     }

//     setIsExcelDataReady(false); // Mark as not ready when starting to build
    
//     const columns = [
//       "SL NO",
//       "LATEST PLAN DATE",
//       "LINE",
//       "OP NO",
//       "WORK DETAIL",
//       "FREQUENCY",
//       "MEASUREMENT",
//       "STANDARD VALUE",
//       "LATEST ACTUAL VALUE",
//       "LAST COMPLETED DATE",
//     ];
//     setHeader(columns);

//     // Prioritize Excel data over display data - only use display data if Excel data is truly empty
//     // const dataToUse = (filteredExcelData.length > 0) ? filteredExcelData : filteredPendingData;
//     // Filter Excel data to match only displayed items
//     const displayedProcessNos = new Set(
//       filteredPendingData.flatMap(item => 
//         item.processList.map(process => process.processNo)
//       )
//     );

//     const syncedExcelData = filteredExcelData.map(item => ({
//       ...item,
//       processList: item.processList.filter(process => 
//         displayedProcessNos.has(process.processNo)
//       )
//     })).filter(item => item.processList.length > 0);

//     // Use Excel data (with populated fields) but only for displayed cards
//     // const dataToUse = syncedExcelData.length > 0 ? syncedExcelData : filteredPendingData;

//     // Filter to show only the latest entry for each process
// const latestEntriesData = syncedExcelData.map(item => ({
//   ...item,
//   processList: item.processList.map(process => ({
//     ...process,
//     processData: process.processData && process.processData.length > 0 
//       ? [process.processData.reduce((latest, current) => {
//           const latestDate = new Date(latest.entryDate?.[0] || latest.createdAt || 0);
//           const currentDate = new Date(current.entryDate?.[0] || current.createdAt || 0);
//           return currentDate > latestDate ? current : latest;
//         })]
//       : process.processData
//   }))
// }));

// // Use Excel data (with populated fields) but only for displayed cards and latest entries
// const dataToUse = latestEntriesData.length > 0 ? latestEntriesData : filteredPendingData;
//     // Add a delay to ensure Excel API data is fully processed
//     const buildExcelData = () => {
//       try {
//         const rows = buildExcelRowsFromFilteredData(dataToUse);
//         setBody(rows);
        
//         // Additional validation: ensure we have the complete data set
//         // If we're using Excel data, verify it has populated values
//         if (filteredExcelData.length > 0) {
//           // Check if the Excel data has populated references (not just ObjectIds)
//           const hasPopulatedData = rows.some(row => {
//             const workDetail = row[4]; // Work detail column
//             const frequency = row[5]; // Frequency column
//             // Check if these fields contain actual data rather than ObjectIds or empty values
//             return workDetail && workDetail !== "No work details available" && 
//                    !workDetail.match(/^[0-9a-fA-F]{24}$/) &&
//                    workDetail.length > 10; // Reasonable length for actual work details
//           });
          
//           if (hasPopulatedData) {
//             setIsExcelDataReady(true);
//           } else {
//             // Excel data might not be fully populated yet, wait a bit more
//             setTimeout(() => {
//               setIsExcelDataReady(true);
//             }, 1000);
//           }
//         } else {
//           setIsExcelDataReady(true);
//         }
//       } catch (error) {
//         console.error("Error building Excel data:", error);
//         setIsExcelDataReady(false);
//       }
//     };

//     // Use a longer timeout to ensure Excel API data is fully processed
//     const timeoutId = setTimeout(buildExcelData, 500);
    
//     return () => clearTimeout(timeoutId);
//   }, [filteredExcelData, filteredPendingData, isExcelApiLoaded]);

//   // Helper function to safely extract string value from object or ObjectId
//   function extractStringValue(value, fallback = "") {
//     if (!value) return fallback;
    
//     // If it's a string that looks like an ObjectId (24 characters, hexadecimal), return fallback
//     if (typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/)) {
//       return fallback;
//     }
    
//     // If it's an object with common text properties, extract them
//     if (typeof value === 'object' && value !== null) {
//       return value.name || value.title || value.description || value.workDetail || 
//              value.workInstruction || value.checkPoint || value.label || 
//              value.text || value.value || fallback;
//     }
    
//     // If it's a regular string, return it
//     if (typeof value === 'string') {
//       return value;
//     }
    
//     return fallback;
//   }

//   // Function to build Excel rows from filtered data
//   function buildExcelRowsFromFilteredData(data) {
//     let index = 1;
//     const rows = [];

//     data.forEach((pending) => {
//       if (!pending.processList) return;

//       pending.processList.forEach((process) => {
//         // Handle case where processData might not exist
//         if (!process.processData || process.processData.length === 0) {
//           rows.push([
//             index++,
//             process.createdAt?.split("T")[0] || "",
//             pending.line || "",
//             process.processNo || "",
//             extractStringValue(process.workDetail, "No work details available"),
//             extractStringValue(process.frequency || process.cycle, ""),
//             "",
//             "",
//             "",
//             process.lastCompleted?.split("T")[0] || process.lastChecked?.split("T")[0] || "",
//           ]);
//           return;
//         }

//         process.processData.forEach((dataItem) => {
//           // Extract check items - handle both populated and non-populated references
//           const checkItems = dataItem.checkitems || (dataItem.checkItem ? [dataItem.checkItem] : []);
          
//           if (!checkItems || checkItems.length === 0) {
//             // Create a basic row with available data
//             const measurementText = dataItem.itemSpec?.m_spec?.map((spec) => `${spec.m_label}(${spec.m_unit})`).join(", ") || "";
//             const standardValue = dataItem.itemSpec?.m_spec?.map((spec) => spec.m_criteria || "").join(", ") || "";
//             const actualValue = dataItem.itemSpec?.m_spec?.map((spec) => spec.m_value || "").join(", ") || "";
            
//             rows.push([
//               index++,
//               dataItem.entryDates?.[0]?.split("T")[0] || process.createdAt?.split("T")[0] || "",
//               pending.line || "",
//               process.processNo || "",
//               extractStringValue(dataItem.workDetail, "No check items available"),
//               extractStringValue(dataItem.frequency || dataItem.cycle, ""),
//               measurementText,
//               standardValue,
//               actualValue,
//               dataItem.lastCompleted?.split("T")[0] || dataItem.lastChecked?.split("T")[0] || 
//               (dataItem.entryDates && dataItem.entryDates.length > 1 ? dataItem.entryDates[dataItem.entryDates.length - 2]?.split("T")[0] : "") || "",
//             ]);
//             return;
//           }

//           // Handle check items - process both populated objects and ObjectId strings
//           const itemsToProcess = Array.isArray(checkItems) ? checkItems : [checkItems];
          
//           itemsToProcess.forEach((item) => {
//             // Extract work detail - handle ObjectId references
//             let workDetail = "";
//             if (typeof item === 'object' && item !== null) {
//               // If item is populated object, extract meaningful text
//               workDetail = extractStringValue(item.workDetail || item.description || item.workInstruction || item.checkPoint) ||
//                           extractStringValue(dataItem.workDetail) ||
//                           `Process ${process.processNo} Check`;
//             } else if (typeof item === 'string') {
//               // If item is ObjectId string or simple string
//               if (item.match(/^[0-9a-fA-F]{24}$/)) {
//                 // It's an ObjectId, use fallback
//                 workDetail = extractStringValue(dataItem.workDetail) || `Process ${process.processNo} - Referenced Item`;
//               } else {
//                 // It's a regular string
//                 workDetail = extractStringValue(dataItem.workDetail) || `Check item: ${item}`;
//               }
//             } else {
//               workDetail = extractStringValue(dataItem.workDetail) || `Process ${process.processNo}`;
//             }

//             // Extract frequency - handle ObjectId references
//             const frequency = extractStringValue(dataItem.frequency || dataItem.cycle || dataItem.checkFrequency || 
//                             dataItem.scheduledFrequency || dataItem.itemSpec?.frequency) ||
//                             (typeof item === 'object' && item !== null ? extractStringValue(item.frequency || item.cycle) : "") ||
//                             extractStringValue(process.frequency || process.cycle, "");

//             // Extract last completed date - handle ObjectId references
//             const lastCompletedRaw = dataItem.lastCompleted || dataItem.lastCompletedDate || 
//                                 dataItem.lastChecked || dataItem.previousCompletionDate || 
//                                 dataItem.itemSpec?.checkedAt || dataItem.itemSpec?.lastCompleted ||
//                                 (typeof item === 'object' && item !== null ? (item.lastCompleted || item.lastChecked) : "") ||
//                                 process.lastCompleted || process.lastChecked ||
//                                 (dataItem.entryDates && dataItem.entryDates.length > 1 ? dataItem.entryDates[dataItem.entryDates.length - 2] : "") ||
//                                 "";

//             const lastCompleted = extractStringValue(lastCompletedRaw, "");

//             const measurementText = dataItem.itemSpec?.m_spec?.map((spec) => `${spec.m_label}(${spec.m_unit})`).join(", ") || "";
//             const standardValue = dataItem.itemSpec?.m_spec?.map((spec) => spec.m_criteria || "").join(", ") || "";
//             const actualValue = dataItem.itemSpec?.m_spec?.map((spec) => spec.m_value || "").join(", ") || "";
            
//             rows.push([
//               index++,
//               dataItem.entryDates?.[0]?.split("T")[0] || process.createdAt?.split("T")[0] || "",
//               pending.line || "",
//               process.processNo || "",
//               workDetail,
//               frequency,
//               measurementText,
//               standardValue,
//               actualValue,
//               lastCompleted ? lastCompleted.split("T")[0] : "",
//             ]);
//           });
//         });
//       });
//     });

//     return rows;
//   }

//   // Excel download function
//   function handleDownloadExcel() {
//     if (body.length === 0) {
//       alert("No data available to export");
//       return;
//     }

//     const currentDate = new Date().toISOString().slice(0, 10);
//     const filterSuffix = ageFilter !== "ALL" ? `-${ageFilter}-days` : "";
    
//     // Add filter information to filename for better identification
//     let filterInfo = "";
//     if (filters.line) filterInfo += `-line-${filters.line}`;
//     if (filters.rS) filterInfo += `-rS-${filters.rS}`;
    
//     const filename = `${currentDate}-pending-cards${filterInfo}${filterSuffix}.xlsx`;
    
//     const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Pending Tasks");
//     XLSX.writeFile(workbook, filename);
//   }

//   return (
//     <Fragment>
//       {loading ? (
//         <Loading />
//       ) : error ? (
//         <div className="text-center text-danger py-4">Error: {error}</div>
//       ) : (
//         <Fragment>
//           <div className="mx-3 my-2">
//             <label className="me-2">
//               <strong>Filter by Age:</strong>
//             </label>
//             <select
//               className="form-select-sm"
//               value={ageFilter}
//               onChange={(e) => setAgeFilter(e.target.value)}
//             >
//               <option value="ALL">All</option>
//               <option value="1-10">1–10 days</option>
//               <option value="11-20">11–20 days</option>
//               <option value=">20">More than 20 days</option>
//             </select>
//           </div>

//           <div>
//             {isExcelDataReady && isExcelApiLoaded && body.length > 0 ? (
//               <Button
//                 variant="warning"
//                 style={{ position: "absolute", right: 150 }}
//                 onClick={handleDownloadExcel}
//               >
//                 Download Excel ({body.length} rows)
//               </Button>
//             ) : (
//               <Button
//                 disabled
//                 style={{
//                   position: "absolute",
//                   right: 150,
//                   backgroundColor: "#666",
//                   cursor: "not-allowed",
//                 }}
//               >
//                 {loading ? "Loading data..." : 
//                  !isExcelApiLoaded ? "Fetching complete data..." :
//                  !isExcelDataReady ? "Preparing Excel data..." : 
//                  "No data to export"}
//               </Button>
//             )}
//           </div>

//           <div className="overflow-auto" style={{ height: "75vh", paddingBottom: "10%" }}>
//             {filteredPendingData.length > 0 ? (
//               filteredPendingData.map((item) => (
//                 <PendingLine
//                   key={item.line}
//                   line={item.line}
//                   processList={item.processList}
//                   counts={item.counts || { [item.line]: item.processList.length }}
//                 />
//               ))
//             ) : (
//               <div className="text-center w-100 py-4">No pending tasks available.</div>
//             )}
//           </div>
//         </Fragment>
//       )}
//     </Fragment>
//   );
// }


// import React, { Fragment, useEffect, useState, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { getPendingTasks } from "../../redux/pendingTasks/pendingActions";
// import * as XLSX from "xlsx";
// import PendingLine from "./PendingLine";
// import Loading from "../Loading";
// import { Button } from "react-bootstrap";
// import axios from "axios";

// export default function PendingTask() {
//   const dispatch = useDispatch();

//   const pendingTasks = useSelector((state) => state.pendingTasks);
//   const filters = useSelector((state) => state.filters);

//   const [header, setHeader] = useState([]);
//   const [body, setBody] = useState([]);
//   const [ageFilter, setAgeFilter] = useState("ALL");
//   const [ageFilteredData, setAgeFilteredData] = useState(null);
//   const [ageFilterLoading, setAgeFilterLoading] = useState(false);
//   const [ageSummary, setAgeSummary] = useState({ "1-10": 0, "11-20": 0, "20+": 0 });
//   const [isExcelDataReady, setIsExcelDataReady] = useState(false);

//   const queryStr =
//     `pS=${filters.pS}` +
//     (filters.line ? `&line=${filters.line}` : "") +
//     (filters.rS ? `&rS=${filters.rS}` : "");

//   // Fetch regular pending tasks data (for when ageFilter is "ALL")
//   useEffect(() => {
//     if (ageFilter === "ALL") {
//       dispatch(getPendingTasks(queryStr));
//     }
//   }, [dispatch, queryStr, ageFilter]);

//   // Fetch age summary whenever filters change (including pS, line, rS)
//   useEffect(() => {
//     const summaryUrl = `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/pendingTasks/by-age?${queryStr}`;
//     axios
//       .get(summaryUrl)
//       .then((res) => {
//         if (res.data && res.data.success && res.data.ageSummary) {
//           setAgeSummary(res.data.ageSummary);
//         }
//       })
//       .catch((err) => {
//         console.error("Age summary fetch error:", err);
//         setAgeSummary({ "1-10": 0, "11-20": 0, "20+": 0 });
//       });
//   }, [queryStr]); // This will update whenever any filter changes

//   // Fetch age-filtered data from the new API
//   useEffect(() => {
//     if (ageFilter !== "ALL") {
//       setAgeFilterLoading(true);
//       setAgeFilteredData(null);
      
//       // Convert filter values to match API expectations
//       const ageRangeMap = {
//         "1-10": "1-10",
//         "11-20": "11-20", 
//         ">20": "20+"
//       };
      
//       const ageRange = ageRangeMap[ageFilter];
//       const ageQueryStr = queryStr + (ageRange ? `&ageRange=${ageRange}` : "");
      
//       const url = `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/pendingTasks/by-age?${ageQueryStr}`;
      
//       axios
//         .get(url)
//         .then((res) => {
//           if (res.data && res.data.success) {
//             setAgeFilteredData(res.data);
//           } else {
//             setAgeFilteredData({ success: true, pendingData: [] });
//           }
//           setAgeFilterLoading(false);
//         })
//         .catch((err) => {
//           console.error("Age filter API error:", err);
//           setAgeFilteredData({ success: true, pendingData: [] });
//           setAgeFilterLoading(false);
//         });
//     }
//   }, [ageFilter, queryStr]);

//   const { loading, pendingTasksData, error } = pendingTasks;

//   // Determine which data to use for display
//   const displayData = useMemo(() => {
//     if (ageFilter === "ALL") {
//       return pendingTasksData?.pendingData || [];
//     } else {
//       return ageFilteredData?.pendingData || [];
//     }
//   }, [ageFilter, pendingTasksData, ageFilteredData]);

//   // Determine loading state
//   const isLoading = ageFilter === "ALL" ? loading : ageFilterLoading;

//   // Build Excel data whenever display data changes
//   useEffect(() => {
//     if (!displayData || displayData.length === 0) {
//       setIsExcelDataReady(false);
//       setBody([]);
//       return;
//     }

//     setIsExcelDataReady(false);

//     const columns = [
//       "SL NO",
//       "LATEST PLAN DATE", 
//       "LINE",
//       "OP NO",
//       "WORK DETAIL",
//       "FREQUENCY",
//       "MEASUREMENT",
//       "STANDARD VALUE",
//       "LATEST ACTUAL VALUE",
//       "LAST COMPLETED DATE",
//       "DAYS OLD" // Add days old column
//     ];
//     setHeader(columns);

//     const buildExcelData = () => {
//       try {
//         const rows = buildExcelRowsFromData(displayData);
//         setBody(rows);
//         setIsExcelDataReady(true);
//       } catch (error) {
//         console.error("Error building Excel data:", error);
//         setIsExcelDataReady(false);
//       }
//     };

//     const timeoutId = setTimeout(buildExcelData, 300);
//     return () => clearTimeout(timeoutId);
//   }, [displayData]);

//   // Helper function to safely extract string value
//   function extractStringValue(value, fallback = "") {
//     if (!value) return fallback;
    
//     if (typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/)) {
//       return fallback;
//     }
    
//     if (typeof value === 'object' && value !== null) {
//       return value.name || value.title || value.description || value.workDetail || 
//              value.workInstruction || value.checkPoint || value.label || 
//              value.text || value.value || fallback;
//     }
    
//     if (typeof value === 'string') {
//       return value;
//     }
    
//     return fallback;
//   }

//   // Function to build Excel rows from data
//   function buildExcelRowsFromData(data) {
//     let index = 1;
//     const rows = [];

//     data.forEach((pending) => {
//       if (!pending.processList) return;

//       pending.processList.forEach((process) => {
//         if (!process.processData || process.processData.length === 0) {
//           rows.push([
//             index++,
//             process.createdAt?.split("T")[0] || "",
//             pending.line || "",
//             process.processNo || "",
//             "No process data available",
//             "",
//             "",
//             "",
//             "",
//             "",
//             "" // Days old
//           ]);
//           return;
//         }

//         process.processData.forEach((dataItem) => {
//           // Use the data directly from the API response
//           const workDetail = dataItem.workDetail || "N/A";
//           const frequency = dataItem.frequency || "N/A";
//           const measurement = dataItem.measurement || "N/A";
//           const standardValue = dataItem.standardValue || "N/A";
//           const latestActualValue = dataItem.latestActualValue || "N/A";
//           const lastCompletedDate = dataItem.lastCompletedDate && dataItem.lastCompletedDate !== "N/A" 
//             ? new Date(dataItem.lastCompletedDate).toISOString().split("T")[0] 
//             : "N/A";
//           const daysOld = dataItem.daysOld || "";
          
//           rows.push([
//             index++,
//             dataItem.entryDates?.[0]?.split("T")[0] || "",
//             pending.line || "",
//             process.processNo || "",
//             workDetail,
//             frequency,
//             measurement,
//             standardValue,
//             latestActualValue,
//             lastCompletedDate,
//             daysOld
//           ]);
//         });
//       });
//     });

//     return rows;
//   }

//   // Excel download function
//   function handleDownloadExcel() {
//     if (body.length === 0) {
//       alert("No data available to export");
//       return;
//     }

//     const currentDate = new Date().toISOString().slice(0, 10);
//     const filterSuffix = ageFilter !== "ALL" ? `-${ageFilter}-days` : "";
    
//     let filterInfo = "";
//     if (filters.line) filterInfo += `-line-${filters.line}`;
//     if (filters.rS) filterInfo += `-rS-${filters.rS}`;
    
//     const filename = `${currentDate}-pending-cards${filterInfo}${filterSuffix}.xlsx`;
    
//     const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Pending Tasks");
//     XLSX.writeFile(workbook, filename);
//   }

//   return (
//     <Fragment>
//       {isLoading ? (
//         <Loading />
//       ) : error ? (
//         <div className="text-center text-danger py-4">Error: {error}</div>
//       ) : (
//         <Fragment>
//           <div className="mx-3 my-2 d-flex align-items-center gap-3">
//             <div>
//               <label className="me-2">
//                 <strong>Filter by Age:</strong>
//               </label>
//               <select
//                 className="form-select-sm"
//                 value={ageFilter}
//                 onChange={(e) => setAgeFilter(e.target.value)}
//               >
//                 <option value="ALL">All</option>
//                 <option value="1-10">1–10 days</option>
//                 <option value="11-20">11–20 days</option>
//                 <option value=">20">More than 20 days</option>
//               </select>
//             </div>
            
//             {/* Age Summary Display */}
//             <div className="text-muted small">
//               <span className="me-3">1-10 days: <strong>{ageSummary["1-10"]}</strong></span>
//               <span className="me-3">11-20 days: <strong>{ageSummary["11-20"]}</strong></span>
//               <span>20+ days: <strong>{ageSummary["20+"]}</strong></span>
//             </div>
//           </div>

//           <div>
//             {isExcelDataReady && body.length > 0 ? (
//               <Button
//                 variant="warning"
//                 style={{ position: "absolute", right: 150 }}
//                 onClick={handleDownloadExcel}
//               >
//                 Download Excel ({body.length} rows)
//               </Button>
//             ) : (
//               <Button
//                 disabled
//                 style={{
//                   position: "absolute",
//                   right: 150,
//                   backgroundColor: "#666",
//                   cursor: "not-allowed",
//                 }}
//               >
//                 {isLoading ? "Loading data..." : 
//                  !isExcelDataReady ? "Preparing Excel data..." : 
//                  "No data to export"}
//               </Button>
//             )}
//           </div>

//           <div className="overflow-auto" style={{ height: "75vh", paddingBottom: "10%" }}>
//             {displayData.length > 0 ? (
//               displayData.map((item) => (
//                 <PendingLine
//                   key={item.line}
//                   line={item.line}
//                   processList={item.processList}
//                   counts={item.counts || { [item.line]: item.processList.length }}
//                 />
//               ))
//             ) : (
//               <div className="text-center w-100 py-4">
//                 {ageFilter !== "ALL" ? 
//                   `No pending tasks found for ${ageFilter} days range.` : 
//                   "No pending tasks available."
//                 }
//               </div>
//             )}
//           </div>
//         </Fragment>
//       )}
//     </Fragment>
//   );
// }


import React, { Fragment, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPendingTasks } from "../../redux/pendingTasks/pendingActions";
import * as XLSX from "xlsx";
import PendingLine from "./PendingLine";
import Loading from "../Loading";
import { Button } from "react-bootstrap";
import axios from "axios";

export default function PendingTask() {
  const dispatch = useDispatch();

  const pendingTasks = useSelector((state) => state.pendingTasks);
  const filters = useSelector((state) => state.filters);

  const [header, setHeader] = useState([]);
  const [body, setBody] = useState([]);
  const [ageFilter, setAgeFilter] = useState("ALL");
  const [ageFilteredData, setAgeFilteredData] = useState(null);
  const [ageFilterLoading, setAgeFilterLoading] = useState(false);
  const [ageSummary, setAgeSummary] = useState({ "1-10": 0, "11-20": 0, "20+": 0 });
  const [isExcelDataReady, setIsExcelDataReady] = useState(false);

  const queryStr =
    `pS=${filters.pS}` +
    (filters.line ? `&line=${filters.line}` : "") +
    (filters.rS ? `&rS=${filters.rS}` : "");

  // Fetch regular pending tasks data (for when ageFilter is "ALL")
  useEffect(() => {
    if (ageFilter === "ALL") {
      dispatch(getPendingTasks(queryStr));
    }
  }, [dispatch, queryStr, ageFilter]);

  // Fetch age summary whenever filters change (including pS, line, rS)
  useEffect(() => {
    const summaryUrl = `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/pendingTasks/by-age?${queryStr}`;
    axios
      .get(summaryUrl)
      .then((res) => {
        if (res.data && res.data.success && res.data.ageSummary) {
          setAgeSummary(res.data.ageSummary);
        }
      })
      .catch((err) => {
        console.error("Age summary fetch error:", err);
        setAgeSummary({ "1-10": 0, "11-20": 0, "20+": 0 });
      });
  }, [queryStr]); // This will update whenever any filter changes

  // Fetch age-filtered data from the new API
  useEffect(() => {
    if (ageFilter !== "ALL") {
      setAgeFilterLoading(true);
      setAgeFilteredData(null);
      
      // Convert filter values to match API expectations
      const ageRangeMap = {
        "1-10": "1-10",
        "11-20": "11-20", 
        ">20": "20+"
      };
      
      const ageRange = ageRangeMap[ageFilter];
      const ageQueryStr = queryStr + (ageRange ? `&ageRange=${ageRange}` : "");
      
      const url = `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/pendingTasks/by-age?${ageQueryStr}`;
      
      axios
        .get(url)
        .then((res) => {
          if (res.data && res.data.success) {
            setAgeFilteredData(res.data);
          } else {
            setAgeFilteredData({ success: true, pendingData: [] });
          }
          setAgeFilterLoading(false);
        })
        .catch((err) => {
          console.error("Age filter API error:", err);
          setAgeFilteredData({ success: true, pendingData: [] });
          setAgeFilterLoading(false);
        });
    }
  }, [ageFilter, queryStr]);

  const { loading, pendingTasksData, error } = pendingTasks;

  // ADD THIS HELPER FUNCTION TO NORMALIZE THE DATA STRUCTURE
  const normalizeData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      ...item,
      processList: item.processList?.map(process => ({
        ...process,
        processData: process.processData?.map(processItem => ({
          ...processItem,
          // Normalize checkItem to always be a string ID
          checkItem: typeof processItem.checkItem === 'object' 
            ? processItem.checkItem._id 
            : processItem.checkItem,
          // Keep itemSpec for backward compatibility, but normalize it too
          itemSpec: typeof processItem.checkItem === 'object' 
            ? processItem.checkItem 
            : processItem.itemSpec
        })) || []
      })) || []
    }));
  };

  // Determine which data to use for display and normalize it
  const displayData = useMemo(() => {
    let rawData;
    if (ageFilter === "ALL") {
      rawData = pendingTasksData?.pendingData || [];
    } else {
      rawData = ageFilteredData?.pendingData || [];
    }
    
    // Normalize the data structure to ensure consistency
    return normalizeData(rawData);
  }, [ageFilter, pendingTasksData, ageFilteredData]);

  // Determine loading state
  const isLoading = ageFilter === "ALL" ? loading : ageFilterLoading;

  // Build Excel data whenever display data changes
  useEffect(() => {
    if (!displayData || displayData.length === 0) {
      setIsExcelDataReady(false);
      setBody([]);
      return;
    }

    setIsExcelDataReady(false);

    const columns = [
      "SL NO",
      "LATEST PLAN DATE", 
      "LINE",
      "OP NO",
      "WORK DETAIL",
      "FREQUENCY",
      "MEASUREMENT",
      "STANDARD VALUE",
      "LATEST ACTUAL VALUE",
      "LAST COMPLETED DATE",
      "DAYS OLD" // Add days old column
    ];
    setHeader(columns);

    const buildExcelData = () => {
      try {
        const rows = buildExcelRowsFromData(displayData);
        setBody(rows);
        setIsExcelDataReady(true);
      } catch (error) {
        console.error("Error building Excel data:", error);
        setIsExcelDataReady(false);
      }
    };

    const timeoutId = setTimeout(buildExcelData, 300);
    return () => clearTimeout(timeoutId);
  }, [displayData]);

  // Helper function to safely extract string value
  function extractStringValue(value, fallback = "") {
    if (!value) return fallback;
    
    if (typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/)) {
      return fallback;
    }
    
    if (typeof value === 'object' && value !== null) {
      return value.name || value.title || value.description || value.workDetail || 
             value.workInstruction || value.checkPoint || value.label || 
             value.text || value.value || fallback;
    }
    
    if (typeof value === 'string') {
      return value;
    }
    
    return fallback;
  }

  // Function to build Excel rows from data
  // function buildExcelRowsFromData(data) {
  //   let index = 1;
  //   const rows = [];

  //   data.forEach((pending) => {
  //     if (!pending.processList) return;

  //     pending.processList.forEach((process) => {
  //       if (!process.processData || process.processData.length === 0) {
  //         rows.push([
  //           index++,
  //           process.createdAt?.split("T")[0] || "",
  //           pending.line || "",
  //           process.processNo || "",
  //           "No process data available",
  //           "",
  //           "",
  //           "",
  //           "",
  //           "",
  //           "" // Days old
  //         ]);
  //         return;
  //       }

  //       process.processData.forEach((dataItem) => {
  //         // Use the data directly from the API response
  //         const workDetail = dataItem.workDetail || "N/A";
  //         const frequency = dataItem.frequency || "N/A";
  //         const measurement = dataItem.measurement || "N/A";
  //         const standardValue = dataItem.standardValue || "N/A";
  //         const latestActualValue = dataItem.latestActualValue || "N/A";
  //         const lastCompletedDate = dataItem.lastCompletedDate && dataItem.lastCompletedDate !== "N/A" 
  //           ? new Date(dataItem.lastCompletedDate).toISOString().split("T")[0] 
  //           : "N/A";
  //         const daysOld = dataItem.daysOld || "";
          
  //         rows.push([
  //           index++,
  //           dataItem.entryDates?.[0]?.split("T")[0] || "",
  //           pending.line || "",
  //           process.processNo || "",
  //           workDetail,
  //           frequency,
  //           measurement,
  //           standardValue,
  //           latestActualValue,
  //           lastCompletedDate,
  //           daysOld
  //         ]);
  //       });
  //     });
  //   });

  //   return rows;
  // }

function buildExcelRowsFromData(data) {
  let index = 1;
  const rows = [];

  data.forEach((pending) => {
    if (!pending.processList) return;

    pending.processList.forEach((process) => {
      if (!process.processData || process.processData.length === 0) {
        rows.push([
          index++,
          process.createdAt?.split("T")[0] || "",
          pending.line || "",
          process.processNo || "",
          "No process data available",
          "",
          "",
          "",
          "",
          "",
          "" // Days old
        ]);
        return;
      }

      process.processData.forEach((dataItem) => {
        // Now both APIs return the same flattened structure
        const workDetail = dataItem.workDetail || "N/A";
        const frequency = dataItem.frequency || "N/A";
        const measurement = dataItem.measurement || "N/A";
        const standardValue = dataItem.standardValue || "N/A";
        const latestActualValue = dataItem.latestActualValue || "N/A";
        const daysOld = dataItem.daysOld !== undefined ? dataItem.daysOld : "N/A";
        
        // Handle lastCompletedDate
        let lastCompletedDate = "N/A";
        if (dataItem.lastCompletedDate && dataItem.lastCompletedDate !== "N/A") {
          try {
            lastCompletedDate = new Date(dataItem.lastCompletedDate).toISOString().split("T")[0];
          } catch (error) {
            console.warn("Invalid date format for lastCompletedDate:", dataItem.lastCompletedDate);
            lastCompletedDate = "N/A";
          }
        }
        
        // Use the first entry date or fallback to empty string
        const latestPlanDate = dataItem.entryDates?.[0] 
          ? new Date(dataItem.entryDates[0]).toISOString().split("T")[0] 
          : "";
        
        rows.push([
          index++,
          latestPlanDate,
          pending.line || "",
          process.processNo || "",
          workDetail,
          frequency,
          measurement,
          standardValue,
          latestActualValue,
          lastCompletedDate,
          daysOld
        ]);
      });
    });
  });

  return rows;
}
  // Excel download function
  function handleDownloadExcel() {
    if (body.length === 0) {
      alert("No data available to export");
      return;
    }

    const currentDate = new Date().toISOString().slice(0, 10);
    const filterSuffix = ageFilter !== "ALL" ? `-${ageFilter}-days` : "";
    
    let filterInfo = "";
    if (filters.line) filterInfo += `-line-${filters.line}`;
    if (filters.rS) filterInfo += `-rS-${filters.rS}`;
    
    const filename = `${currentDate}-pending-cards${filterInfo}${filterSuffix}.xlsx`;
    
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pending Tasks");
    XLSX.writeFile(workbook, filename);
  }

  return (
    <Fragment>
      {isLoading ? (
        <Loading />
      ) : error ? (
        <div className="text-center text-danger py-4">Error: {error}</div>
      ) : (
        <Fragment>
          <div className="mx-3 my-2 d-flex align-items-center gap-3">
            <div>
              <label className="me-2">
                <strong>Filter by Age:</strong>
              </label>
              <select
                className="form-select-sm"
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="1-10">1–10 days</option>
                <option value="11-20">11–20 days</option>
                <option value=">20">More than 20 days</option>
              </select>
            </div>
            
            {/* Age Summary Display */}
            <div className="text-muted small">
              <span className="me-3">1-10 days: <strong>{ageSummary["1-10"]}</strong></span>
              <span className="me-3">11-20 days: <strong>{ageSummary["11-20"]}</strong></span>
              <span>20+ days: <strong>{ageSummary["20+"]}</strong></span>
            </div>
          </div>

          <div>
            {isExcelDataReady && body.length > 0 ? (
              <Button
                variant="warning"
                style={{ position: "absolute", right: 150 }}
                onClick={handleDownloadExcel}
              >
                Download Excel ({body.length} rows)
              </Button>
            ) : (
              <Button
                disabled
                style={{
                  position: "absolute",
                  right: 150,
                  backgroundColor: "#666",
                  cursor: "not-allowed",
                }}
              >
                {isLoading ? "Loading data..." : 
                 !isExcelDataReady ? "Preparing Excel data..." : 
                 "No data to export"}
              </Button>
            )}
          </div>

          <div className="overflow-auto" style={{ height: "75vh", paddingBottom: "10%" }}>
            {displayData.length > 0 ? (
              displayData.map((item) => (
                <PendingLine
                  key={item.line}
                  line={item.line}
                  processList={item.processList}
                  counts={item.counts || { [item.line]: item.processList.length }}
                />
              ))
            ) : (
              <div className="text-center w-100 py-4">
                {ageFilter !== "ALL" ? 
                  `No pending tasks found for ${ageFilter} days range.` : 
                  "No pending tasks available."
                }
              </div>
            )}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
}