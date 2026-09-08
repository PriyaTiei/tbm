// // import React, { Fragment, useEffect } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import { getAllMachines } from "../../redux/machine/machineActions";

// // import AllMachineLine from "./AllMachineLine";
// // import Loading from "../Loading";


// // export default function AllMachine() {
// //   const dispatch = useDispatch();
// //   const machines = useSelector((state) => state.machines); 
 
// //   const filters = useSelector((state) => state.filters);
  
  

// //   let lineStr = filters.line === null ? '' : `&line=${filters.line}`
// //   let rSStr = filters.rS === null ? '' : `&rS=${filters.rS}`

// //   let queryStr = `&pS=${filters.pS}` + lineStr + rSStr;

// //   useEffect(() => {
// //     dispatch(getAllMachines(queryStr)); 
// //   }, [dispatch , filters , queryStr]);

// //   const { loading, machineData } = machines;  
  
// //   return (
// //     <Fragment>
// //       {loading ? (
// //         <Loading />
// //       ) : (
// //         <Fragment >
// //          <div className="overflow-auto" style={{height:"85vh", paddingBottom: "10%"}}>
// //           {machineData.success
// //             ? machineData.machineData.map((item, i) => {
// //                 return (
// //                   <AllMachineLine                    
// //                     line={item.line}
// //                     processList={item.processList}
// //                     counts={item.counts}
// //                     key={item.line} 
// //                   />
// //                 );
// //               })
// //             : null}
// //             </div>
// //         </Fragment>
// //       )}
      
// //     </Fragment>
// //   );
// // }







// import React, { Fragment, useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { getAllMachines } from "../../redux/machine/machineActions";
// import { setProcessData } from '../../redux/processData/processActions';
// import { Link } from "react-router-dom";
// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";
// import axios from "axios";

// import AllMachineLine from "./AllMachineLine";
// import AllMachineCard from "./AllMachineCard";
// import Loading from "../Loading";
// import styles from "../styles/smilecard.module.css";

// // API Configuration
// const getApiBaseUrl = () => {
//   const host = process.env.REACT_APP_HOST || 'localhost';
//   const port = process.env.REACT_APP_PORT || '5051';
  
//   if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
//     return `http://${host}:${port}`;
//   }
  
//   return `${window.location.protocol}//${window.location.hostname}:${port}`;
// };

// const API_BASE_URL = getApiBaseUrl();

// // Date range filter utility functions
// const getWeekOfMonth = (date) => {
//   const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
//   const dayOfMonth = date.getDate();
//   const firstWeekday = firstDay.getDay();
//   return Math.ceil((dayOfMonth + firstWeekday) / 7);
// };

// const generateCardDates = (cardData, yearRange = 2) => {
//   const dates = [];
//   const currentYear = new Date().getFullYear();
//   const startYear = currentYear - yearRange;
//   const endYear = currentYear + yearRange;

//   // Safely extract arrays and ensure they are arrays
//   const years = Array.isArray(cardData.y) ? cardData.y : [];
//   const months = Array.isArray(cardData.m) ? cardData.m : [];
//   const weeks = Array.isArray(cardData.w) ? cardData.w : [];
//   const days = Array.isArray(cardData.d) ? cardData.d : [];

//   // If any required array is empty, return empty dates
//   if (years.length === 0 || months.length === 0 || weeks.length === 0 || days.length === 0) {
//     return dates;
//   }

//   for (let year = startYear; year <= endYear; year++) {
//     // Check if this year should be included
//     const shouldIncludeYear = years.includes(9999) || years.includes(year);
//     if (!shouldIncludeYear) continue;

//     for (let month = 0; month < 12; month++) {
//       // Check if this month should be included (months in data are 1-12, but JS uses 0-11)
//       const shouldIncludeMonth = months.includes(9999) || months.includes(month + 1);
//       if (!shouldIncludeMonth) continue;

//       // Get all days in this month
//       const daysInMonth = new Date(year, month + 1, 0).getDate();
      
//       for (let day = 1; day <= daysInMonth; day++) {
//         const date = new Date(year, month, day);
//         const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
//         const weekOfMonth = getWeekOfMonth(date);

//         // Check if this day of week should be included
//         const shouldIncludeDay = days.includes(9999) || days.includes(dayOfWeek);
//         if (!shouldIncludeDay) continue;

//         // Check if this week should be included
//         const shouldIncludeWeek = weeks.includes(9999) || weeks.includes(weekOfMonth);
//         if (!shouldIncludeWeek) continue;

//         dates.push(new Date(date));
//       }
//     }
//   }

//   return dates;
// };

// const isCardVisibleInDateRange = (cardData, startDate, endDate) => {
//   if (!startDate || !endDate) return true; // No filter applied
  
//   const cardDates = generateCardDates(cardData);
  
//   return cardDates.some(cardDate => 
//     cardDate >= startDate && cardDate <= endDate
//   );
// };

// const filterProcessDataByDateRange = (processData, startDate, endDate) => {
//   if (!startDate || !endDate || !processData) return processData;
  
//   return processData.filter(cardData => 
//     isCardVisibleInDateRange(cardData, startDate, endDate)
//   );
// };

// export default function AllMachine() {
//   const dispatch = useDispatch();
//   const machines = useSelector((state) => state.machines);
//   const filters = useSelector((state) => state.filters);
  
//   // View state
//   const [viewMode, setViewMode] = useState("card"); // "card" or "table"
  
//   // Date range filter states
//   const [dateRangeFilter, setDateRangeFilter] = useState({
//     startDate: "",
//     endDate: "",
//     enabled: false,
//     applied: false // Track if filter has been applied
//   });
  
//   // Table view states
//   const [detailedItems, setDetailedItems] = useState({});
//   const [tableLoading, setTableLoading] = useState(false);
//   const [processNoFilter, setProcessNoFilter] = useState("");
//   const [exactMatch, setExactMatch] = useState(false);

//   let lineStr = filters.line === null ? '' : `&line=${filters.line}`;
//   let rSStr = filters.rS === null ? '' : `&rS=${filters.rS}`;
//   let queryStr = `&pS=${filters.pS}` + lineStr + rSStr;

//   useEffect(() => {
//     dispatch(getAllMachines(queryStr));
//   }, [dispatch, filters, queryStr]);

//   const { loading, machineData } = machines;

//   // Date range filter handlers
//   const handleDateRangeChange = (field, value) => {
//     setDateRangeFilter(prev => ({
//       ...prev,
//       [field]: value,
//       applied: false // Reset applied status when dates change
//     }));
//   };

//   const toggleDateRangeFilter = () => {
//     setDateRangeFilter(prev => ({
//       ...prev,
//       enabled: !prev.enabled,
//       applied: false // Reset applied status when toggling
//     }));
//   };

//   const applyDateRangeFilter = () => {
//     if (dateRangeFilter.startDate && dateRangeFilter.endDate) {
//       setDateRangeFilter(prev => ({
//         ...prev,
//         applied: true
//       }));
//     }
//   };

//   const clearDateRangeFilter = () => {
//     setDateRangeFilter({
//       startDate: "",
//       endDate: "",
//       enabled: false,
//       applied: false
//     });
//   };

//   // Apply date range filter to machine data
//   const getFilteredMachineData = () => {
//     if (!machineData.success || !dateRangeFilter.enabled || !dateRangeFilter.applied || !dateRangeFilter.startDate || !dateRangeFilter.endDate) {
//       return machineData;
//     }

//     const startDate = new Date(dateRangeFilter.startDate);
//     const endDate = new Date(dateRangeFilter.endDate);
//     // Set end date to end of day
//     endDate.setHours(23, 59, 59, 999);

//     const filteredMachineData = machineData.machineData.map(item => {
//       if (!item.processList) return item;

//       const filteredProcessList = item.processList.map(processItem => {
//         const filteredProcessData = filterProcessDataByDateRange(
//           processItem.processData, 
//           startDate, 
//           endDate
//         );

//         return {
//           ...processItem,
//           processData: filteredProcessData
//         };
//       }).filter(processItem => processItem.processData.length > 0); // Remove processes with no cards

//       // Recalculate counts based on filtered data
//       const newCounts = {};
//       filteredProcessList.forEach(processItem => {
//         newCounts[processItem.processNo] = processItem.processData.length;
//       });

//       return {
//         ...item,
//         processList: filteredProcessList,
//         counts: newCounts
//       };
//     }).filter(item => item.processList.length > 0); // Remove lines with no processes

//     return {
//       ...machineData,
//       machineData: filteredMachineData
//     };
//   };

//   // Card view handlers
//   const handleCardClick = (processData) => {
//     dispatch(setProcessData(processData));
//   };

//   // Table view functions
//   const fetchCheckList = async (queryParams) => {
//     try {
//       if (!queryParams || Object.keys(queryParams).length === 0) {
//         console.error("No query parameters provided");
//         return [];
//       }

//       const apiUrl = `${API_BASE_URL}/head/headCheckList`;
//       const response = await axios.get(apiUrl, {
//         params: queryParams,
//         timeout: 10000
//       });

//       let result;
//       if (response.data && response.data.headCheckList) {
//         result = response.data.headCheckList;
//       } else if (Array.isArray(response.data)) {
//         result = response.data;
//       } else {
//         result = [];
//       }
      
//       return result;
//     } catch (error) {
//       console.error("API Error:", error);
//       return [];
//     }
//   };

//   const isProcessNoFiltered = (processNo) => {
//     if (!processNoFilter.trim()) return true;
    
//     const filterValue = processNoFilter.toLowerCase().replace(/\s+/g, '');
//     const processValue = processNo.toLowerCase().replace(/\s+/g, '');
    
//     if (exactMatch) {
//       return processValue === filterValue;
//     } else {
//       return processValue.includes(filterValue);
//     }
//   };

//   // Convert machineData to table format
//   const convertToTableFormat = () => {
//     const filteredData = getFilteredMachineData();
//     if (!filteredData.success || !filteredData.machineData) return [];
    
//     return filteredData.machineData.map(item => ({
//       line: item.line,
//       processNos: item.processList ? item.processList.map(p => p.processNo) : [],
//       counts: item.counts || {},
//       date: new Date().toISOString().split('T')[0] // Current date fallback
//     }));
//   };

//   useEffect(() => {
//     if (viewMode === "table") {
//       const filteredData = getFilteredMachineData();
//       if (filteredData.success) {
//         const fetchAllDetails = async () => {
//           const tableData = convertToTableFormat();
//           if (!Array.isArray(tableData)) return;

//           setTableLoading(true);
//           const results = {};

//           for (const item of tableData) {
//             let storageLine = item.line.trim();
//             if (storageLine.startsWith(" ")) {
//               storageLine = storageLine.substring(1);
//             }
            
//             results[storageLine] = results[storageLine] || {};

//             for (const processNo of item.processNos || []) {
//               const totalCount = item.counts?.[processNo] || 0;

//               for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
//                 try {
//                   const normalizedProcessNo = processNo.trim();
//                   let keyProcessNo;
//                   if (storageLine === "Main 2-1" || storageLine === "Main 1-2") {
//                     keyProcessNo = ` ${normalizedProcessNo}`;
//                   } else {
//                     keyProcessNo = normalizedProcessNo;
//                   }
                  
//                   const key = `${keyProcessNo}-${pageNum}`;

//                   let queryParams;
//                   const date = item.date || new Date().toISOString().split('T')[0];
                  
//                   if (storageLine === "Main 2-1" || storageLine === "Main 1-2") {
//                     queryParams = {
//                       date: date,
//                       shift: 'S',
//                       line: ` ${storageLine}`,
//                       processNo: ` ${normalizedProcessNo}`,
//                       page: pageNum.toString()
//                     };
//                   } else {
//                     queryParams = {
//                       date: date,
//                       shift: 'S',
//                       line: storageLine,
//                       processNo: normalizedProcessNo,
//                       page: pageNum.toString()
//                     };
//                   }

//                   const checklist = await fetchCheckList(queryParams);
//                   if (checklist && checklist.length > 0) {
//                     results[storageLine][key] = checklist;
//                   }
//                 } catch (error) {
//                   console.error("Failed to fetch detail for", storageLine, processNo, pageNum, error);
//                 }
//               }
//             }
//           }

//           setDetailedItems(results);
//           setTableLoading(false);
//         };

//         fetchAllDetails();
//       }
//     }
//   }, [viewMode, dateRangeFilter.applied, machineData]);

//   const exportToExcel = async () => {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Machine Data");

//     worksheet.addRow([
//       "Line", "Process No", "Page", "Card No.", "Model", 
//       "Day","Week", "Line/Group", "Machine No.", "Station/Process", "Work Detail",
//       "Cycle", "Work Time", "Work Hours", "Method", "Criterion"
//     ]);

//     const tableData = convertToTableFormat();
    
//     tableData.forEach((item) => {
//       (item.processNos || [])
//         .filter((processNo) => isProcessNoFiltered(processNo))
//         .forEach((processNo) => {
//           const totalCount = item.counts?.[processNo] || 0;

//           for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
//             const normalizedProcessNo = processNo.trim();
//             let keyProcessNo;
//             if (item.line === "Main 2-1" || item.line === "Main 1-2") {
//               keyProcessNo = ` ${normalizedProcessNo}`;
//             } else {
//               keyProcessNo = normalizedProcessNo;
//             }
            
//             const key = `${keyProcessNo}-${pageNum}`;
//             const details = detailedItems?.[item.line]?.[key] || [];

//             if (details.length === 0) {
//               worksheet.addRow([
//                 item.line, processNo, pageNum,
//                 "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"
//               ]);
//             } else {
//               details.forEach((detail) => {
//                 worksheet.addRow([
//                   item.line, processNo, pageNum,
//                   detail?.cardNo ?? "-", detail?.model ?? "-", detail?.d?.[0] !== 9999 ? detail.d[0] : "-",
//                   detail?.w?.[0] !== 9999 ? detail.w[0] : "-",
//                   detail?.line ?? "-", detail?.model ?? "-", detail?.processNo ?? "-",
//                   detail?.workDetail ?? "-", detail?.cycle ?? "-", detail?.workTime ?? "-",
//                   detail?.wHr ?? "-", detail?.methodWssNo ?? "-", detail?.criterion ?? "-"
//                 ]);
//               });
//             }
//           }
//         });
//     });

//     const buffer = await workbook.xlsx.writeBuffer();
//     const blob = new Blob([buffer], { type: "application/octet-stream" });
//     saveAs(blob, "MachineData.xlsx");
//   };

//   // Render Date Range Filter
//   const renderDateRangeFilter = () => (
//     <div className="card mb-3">
//       <div className="card-header d-flex justify-content-between align-items-center">
//         <h6 className="mb-0">
//           <i className="bi bi-calendar-range me-2"></i>
//           Date Range Filter
//         </h6>
//         <div className="form-check form-switch">
//           <input
//             className="form-check-input"
//             type="checkbox"
//             id="enableDateFilter"
//             checked={dateRangeFilter.enabled}
//             onChange={toggleDateRangeFilter}
//           />
//           <label className="form-check-label" htmlFor="enableDateFilter">
//             Enable
//           </label>
//         </div>
//       </div>
//       {dateRangeFilter.enabled && (
//         <div className="card-body">
//           <div className="row align-items-end">
//             <div className="col-md-3">
//               <label htmlFor="startDate" className="form-label">Start Date</label>
//               <input
//                 type="date"
//                 id="startDate"
//                 className="form-control"
//                 value={dateRangeFilter.startDate}
//                 onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
//               />
//             </div>
//             <div className="col-md-3">
//               <label htmlFor="endDate" className="form-label">End Date</label>
//               <input
//                 type="date"
//                 id="endDate"
//                 className="form-control"
//                 value={dateRangeFilter.endDate}
//                 onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
//               />
//             </div>
//             <div className="col-md-6">
//               <div className="d-flex gap-2">
//                 <button
//                   type="button"
//                   className="btn btn-primary"
//                   onClick={applyDateRangeFilter}
//                   disabled={!dateRangeFilter.startDate || !dateRangeFilter.endDate}
//                 >
//                   <i className="bi bi-funnel me-1"></i>
//                   Apply Filter
//                 </button>
//                 <button
//                   type="button"
//                   className="btn btn-outline-secondary"
//                   onClick={clearDateRangeFilter}
//                 >
//                   <i className="bi bi-x-circle me-1"></i>
//                   Clear Filter
//                 </button>
//               </div>
//             </div>
//           </div>
//           {dateRangeFilter.applied && dateRangeFilter.startDate && dateRangeFilter.endDate && (
//             <div className="mt-3">
//               <div className="alert alert-info mb-0" role="alert">
//                 <i className="bi bi-info-circle me-2"></i>
//                 <strong>Active Filter:</strong> Showing cards that should appear between{' '}
//                 <strong>{new Date(dateRangeFilter.startDate).toLocaleDateString()}</strong> and{' '}
//                 <strong>{new Date(dateRangeFilter.endDate).toLocaleDateString()}</strong>
//               </div>
//             </div>
//           )}
//           {dateRangeFilter.enabled && !dateRangeFilter.applied && dateRangeFilter.startDate && dateRangeFilter.endDate && (
//             <div className="mt-3">
//               <div className="alert alert-warning mb-0" role="alert">
//                 <i className="bi bi-exclamation-triangle me-2"></i>
//                 Date range selected but not applied. Click <strong>"Apply Filter"</strong> to filter the results.
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );

//   // Render Card View
//   const renderCardView = () => {
//     const filteredData = getFilteredMachineData();
    
//     return (
//       <div className="overflow-auto" style={{height:"85vh", paddingBottom: "10%"}}>
//         {filteredData.success
//           ? filteredData.machineData.map((item, i) => (
//               <Fragment key={item.line}>
//                 <h3 className="mx-3 p-1 bg-info text-center">
//                   {`${item.line} - ${Object.values(item.counts).reduce((acc, curr) => acc + curr, 0)}`}
//                 </h3>
//                 <div className="d-flex flex-wrap">
//                   {item.processList ? item.processList.map((processItem) => (
//                     <Fragment key={processItem.processNo}>
//                       <Link
//                         to={`/allMachine/cardDetails/`}
//                         style={{ textDecoration: "none" }}
//                       >
//                         <div
//                           className={`card mx-3 mb-3 ${styles.bg} ${styles.translate}`}
//                           style={{
//                             width: "8vmax",
//                             background: "rgba(76,74,75)",
//                             color: "white",
//                           }}
//                           onClick={() => handleCardClick(processItem.processData)}
//                         >
//                           <div className="card-header">
//                             <h6 className="text-center">{processItem.processNo}</h6>
//                           </div>
//                           <div className="m-auto">
//                             <i
//                               className="bi bi-file-easel-fill"
//                               style={{ fontSize: "3rem", color: "white" }}
//                             ></i>
//                           </div>
//                           <div className="text-center">
//                             Total {processItem.processData.length}
//                           </div>
//                           <div style={{ height: 10 }}></div>
//                         </div>
//                       </Link>
//                     </Fragment>
//                   )) : <Loading/>}
//                 </div>
//               </Fragment>
//             ))
//           : null}
//       </div>
//     );
//   };

//   // Render Table View
//   const renderTableView = () => {
//     const tableData = convertToTableFormat();
    
//     if (tableLoading) {
//       return (
//         <div className="p-3">
//           <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
//             <div className="spinner-border text-primary" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//             <span className="ms-2">Loading detailed inspection data...</span>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div className="p-3">
//         <div className="d-flex align-items-center gap-3 mb-3">
//           <button className="btn btn-success" onClick={exportToExcel}>
//             📥 Download Excel
//           </button>

//           <div className="d-flex align-items-center gap-2">
//             <label htmlFor="processNoFilter" className="form-label mb-0">
//               Filter:
//             </label>
//             <input
//               type="text"
//               id="processNoFilter"
//               className="form-control"
//               placeholder="Enter process number"
//               value={processNoFilter}
//               onChange={(e) => setProcessNoFilter(e.target.value)}
//               style={{ width: "200px" }}
//             />
//             <div className="form-check">
//               <input
//                 className="form-check-input"
//                 type="checkbox"
//                 id="exactMatch"
//                 checked={exactMatch}
//                 onChange={(e) => setExactMatch(e.target.checked)}
//               />
//               <label className="form-check-label" htmlFor="exactMatch">
//                 Exact match
//               </label>
//             </div>
//           </div>
//         </div>

//         <div className="container-fluid border rounded p-3" style={{ backgroundColor: "#f8f9fa" }}>
//           <div className="table-responsive" style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto", overflowX: "auto" }}>
//             <table className="table table-bordered table-striped table-hover">
//               <thead className="table-primary" style={{ position: "sticky", top: 0, backgroundColor: "#cfe2ff" }}>
//                 <tr>
//                   <th>Line</th>
//                   <th>Process No</th>
//                   <th>Page</th>
//                   <th>Card No.</th>
//                   <th>Model</th>
//                   <th>Day</th>
//                   <th>Week</th>
//                   <th>Line/Group</th>
//                   <th>Machine No.</th>
//                   <th>Station/Process</th>
//                   <th>Work Detail</th>
//                   <th>Cycle</th>
//                   <th>Work Time</th>
//                   <th>Work Hours</th>
//                   <th>Method</th>
//                   <th>Criterion</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {tableData.map((item, index) => {
//                   let storageLine = item.line.trim();
//                   if (storageLine.startsWith(" ")) {
//                     storageLine = storageLine.substring(1);
//                   }
                  
//                   return (item.processNos || [])
//                     .filter((processNo) => isProcessNoFiltered(processNo))
//                     .flatMap((processNo) => {
//                       const totalCount = item.counts?.[processNo] || 0;
//                       const rows = [];
//                       for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
//                         const normalizedProcessNo = processNo.trim();
//                         let keyProcessNo;
//                         if (storageLine === "Main 2-1" || storageLine === "Main 1-2") {
//                           keyProcessNo = ` ${normalizedProcessNo}`;
//                         } else {
//                           keyProcessNo = normalizedProcessNo;
//                         }
                        
//                         const key = `${keyProcessNo}-${pageNum}`;
//                         const details = detailedItems?.[storageLine]?.[key] || [];

//                         if (details.length === 0) {
//                           rows.push(
//                             <tr key={`${item.line}-${key}-${index}`}>
//                               <td>{item.line}</td>
//                               <td>{processNo}</td>
//                               <td>{pageNum}</td>
//                               <td colSpan={12} className="text-muted">No inspection data available</td>
//                             </tr>
//                           );
//                         } else {
//                           details.forEach((detail, i) => {
//                             rows.push(
//                               <tr key={`${item.line}-${key}-${index}-${i}`}>
//                                 <td>{item.line}</td>
//                                 <td>{processNo}</td>
//                                 <td>{pageNum}</td>
//                                 <td>{detail?.cardNo ?? "-"}</td>
//                                 <td>{detail?.model ?? "-"}</td>
//                                 <td>{detail?.d?.[0] !== 9999 ? detail.d[0] : "-"}</td>
//                                 <td>{detail?.w?.[0] !== 9999 ? detail.w[0] : "-"}</td>
//                                 <td>{detail?.line ?? "-"}</td>
//                                 <td>{detail?.model ?? "-"}</td>
//                                 <td>{detail?.processNo ?? "-"}</td>
//                                 <td>{detail?.workDetail ?? "-"}</td>
//                                 <td>{detail?.cycle ?? "-"}</td>
//                                 <td>{detail?.workTime ?? "-"}</td>
//                                 <td>{detail?.wHr ?? "-"}</td>
//                                 <td>{detail?.methodWssNo ?? "-"}</td>
//                                 <td>{detail?.criterion ?? "-"}</td>
//                               </tr>
//                             );
//                           });
//                         }
//                       }
//                       return rows;
//                     });
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <Fragment>
//       {loading ? (
//         <Loading />
//       ) : (
//         <Fragment>
//           {/* View Toggle Controls */}
//           <div className="d-flex justify-content-between align-items-center mx-3 mb-3">
//             <h2>Machine List</h2>
//             <div className="btn-group" role="group" aria-label="View toggle">
//               <button
//                 type="button"
//                 className={`btn ${viewMode === "card" ? "btn-primary" : "btn-outline-primary"}`}
//                 onClick={() => setViewMode("card")}
//               >
//                 <i className="bi bi-grid-3x3-gap-fill me-2"></i>
//                 Card View
//               </button>
//               <button
//                 type="button"
//                 className={`btn ${viewMode === "table" ? "btn-primary" : "btn-outline-primary"}`}
//                 onClick={() => setViewMode("table")}
//               >
//                 <i className="bi bi-table me-2"></i>
//                 Table View
//               </button>
//             </div>
//           </div>

//           {/* Date Range Filter */}
//           <div className="mx-3">
//             {renderDateRangeFilter()}
//           </div>

//           {/* Render selected view */}
//           {viewMode === "card" ? renderCardView() : renderTableView()}
//         </Fragment>
//       )}
//     </Fragment>
//   );
// }












import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllMachines } from "../../redux/machine/machineActions";
import { setProcessData } from '../../redux/processData/processActions';
import { Link } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import axios from "axios";

import AllMachineLine from "./AllMachineLine";
import AllMachineCard from "./AllMachineCard";
import Loading from "../Loading";
import styles from "../styles/smilecard.module.css";

// API Configuration
const getApiBaseUrl = () => {
  const host = process.env.REACT_APP_HOST || 'localhost';
  const port = process.env.REACT_APP_PORT || '5051';
  
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `http://${host}:${port}`;
  }
  
  return `${window.location.protocol}//${window.location.hostname}:${port}`;
};

const API_BASE_URL = getApiBaseUrl();

// Date range filter utility functions
const getWeekOfMonth = (date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  const firstWeekday = firstDay.getDay();
  return Math.ceil((dayOfMonth + firstWeekday) / 7);
};

const generateCardDates = (cardData, yearRange = 2) => {
  const dates = [];
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - yearRange;
  const endYear = currentYear + yearRange;

  // Safely extract arrays and ensure they are arrays
  const years = Array.isArray(cardData.y) ? cardData.y : [];
  const months = Array.isArray(cardData.m) ? cardData.m : [];
  const weeks = Array.isArray(cardData.w) ? cardData.w : [];
  const days = Array.isArray(cardData.d) ? cardData.d : [];

  // If any required array is empty, return empty dates
  if (years.length === 0 || months.length === 0 || weeks.length === 0 || days.length === 0) {
    return dates;
  }

  for (let year = startYear; year <= endYear; year++) {
    // Check if this year should be included
    const shouldIncludeYear = years.includes(9999) || years.includes(year);
    if (!shouldIncludeYear) continue;

    for (let month = 0; month < 12; month++) {
      // Check if this month should be included (months in data are 1-12, but JS uses 0-11)
      const shouldIncludeMonth = months.includes(9999) || months.includes(month + 1);
      if (!shouldIncludeMonth) continue;

      // Get all days in this month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const weekOfMonth = getWeekOfMonth(date);

        // Check if this day of week should be included
        const shouldIncludeDay = days.includes(9999) || days.includes(dayOfWeek);
        if (!shouldIncludeDay) continue;

        // Check if this week should be included
        const shouldIncludeWeek = weeks.includes(9999) || weeks.includes(weekOfMonth);
        if (!shouldIncludeWeek) continue;

        dates.push(new Date(date));
      }
    }
  }

  return dates;
};

const isCardVisibleInDateRange = (cardData, startDate, endDate) => {
  if (!startDate || !endDate) return true; // No filter applied
  
  const cardDates = generateCardDates(cardData);
  
  return cardDates.some(cardDate => 
    cardDate >= startDate && cardDate <= endDate
  );
};

const filterProcessDataByDateRange = (processData, startDate, endDate) => {
  if (!startDate || !endDate || !processData) return processData;
  
  return processData.filter(cardData => 
    isCardVisibleInDateRange(cardData, startDate, endDate)
  );
};

export default function AllMachine() {
  const dispatch = useDispatch();
  const machines = useSelector((state) => state.machines);
  const filters = useSelector((state) => state.filters);
  
  // View state
  const [viewMode, setViewMode] = useState("card"); // "card" or "table"
  
  // Date range filter states
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: "",
    endDate: "",
    enabled: false,
    applied: false // Track if filter has been applied
  });
  
  // Table view states
  const [detailedItems, setDetailedItems] = useState({});
  const [tableLoading, setTableLoading] = useState(false);
  const [processNoFilter, setProcessNoFilter] = useState("");
  const [exactMatch, setExactMatch] = useState(false);

  let lineStr = filters.line === null ? '' : `&line=${filters.line}`;
  let rSStr = filters.rS === null ? '' : `&rS=${filters.rS}`;
  let queryStr = `&pS=${filters.pS}` + lineStr + rSStr;

  useEffect(() => {
    dispatch(getAllMachines(queryStr));
  }, [dispatch, filters, queryStr]);

  const { loading, machineData } = machines;

  // Date range filter handlers
  const handleDateRangeChange = (field, value) => {
    setDateRangeFilter(prev => ({
      ...prev,
      [field]: value,
      applied: false // Reset applied status when dates change
    }));
  };

  const toggleDateRangeFilter = () => {
    setDateRangeFilter(prev => ({
      ...prev,
      enabled: !prev.enabled,
      applied: false // Reset applied status when toggling
    }));
  };

  const applyDateRangeFilter = () => {
    if (dateRangeFilter.startDate && dateRangeFilter.endDate) {
      setDateRangeFilter(prev => ({
        ...prev,
        applied: true
      }));
    }
  };

  const clearDateRangeFilter = () => {
    setDateRangeFilter({
      startDate: "",
      endDate: "",
      enabled: false,
      applied: false
    });
  };

  // Apply date range filter to machine data
  const getFilteredMachineData = () => {
    if (!machineData.success || !dateRangeFilter.enabled || !dateRangeFilter.applied || !dateRangeFilter.startDate || !dateRangeFilter.endDate) {
      return machineData;
    }

    const startDate = new Date(dateRangeFilter.startDate);
    const endDate = new Date(dateRangeFilter.endDate);
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);

    const filteredMachineData = machineData.machineData.map(item => {
      if (!item.processList) return item;

      const filteredProcessList = item.processList.map(processItem => {
        const filteredProcessData = filterProcessDataByDateRange(
          processItem.processData, 
          startDate, 
          endDate
        );

        return {
          ...processItem,
          processData: filteredProcessData
        };
      }).filter(processItem => processItem.processData.length > 0); // Remove processes with no cards

      // Recalculate counts based on filtered data
      const newCounts = {};
      filteredProcessList.forEach(processItem => {
        newCounts[processItem.processNo] = processItem.processData.length;
      });

      return {
        ...item,
        processList: filteredProcessList,
        counts: newCounts
      };
    }).filter(item => item.processList.length > 0); // Remove lines with no processes

    return {
      ...machineData,
      machineData: filteredMachineData
    };
  };

  // Card view handlers
  const handleCardClick = (processData) => {
    dispatch(setProcessData(processData));
  };

  // Table view functions
  const fetchCheckList = async (queryParams) => {
    try {
      if (!queryParams || Object.keys(queryParams).length === 0) {
        console.error("No query parameters provided");
        return [];
      }

      const apiUrl = `${API_BASE_URL}/head/headCheckList`;
      const response = await axios.get(apiUrl, {
        params: queryParams,
        timeout: 10000
      });

      let result;
      if (response.data && response.data.headCheckList) {
        result = response.data.headCheckList;
      } else if (Array.isArray(response.data)) {
        result = response.data;
      } else {
        result = [];
      }
      
      return result;
    } catch (error) {
      console.error("API Error:", error);
      return [];
    }
  };

  const isProcessNoFiltered = (processNo) => {
    if (!processNoFilter || !processNoFilter.trim()) return true;
    if (processNo == null) return false;
    
    const filterValue = processNoFilter.toLowerCase().replace(/\s+/g, '');
    const processValue = String(processNo).toLowerCase().replace(/\s+/g, '');
    
    if (exactMatch) {
      return processValue === filterValue;
    } else {
      return processValue.includes(filterValue);
    }
  };

  // Convert machineData to table format
  const convertToTableFormat = () => {
    const filteredData = getFilteredMachineData();
    if (!filteredData || !filteredData.success || !Array.isArray(filteredData.machineData)) return [];
    
    return filteredData.machineData.map(item => ({
      line: item.line || "",
      processList: item.processList || [],
      processNos: item.processList ? item.processList.map(p => p.processNo) : [],
      counts: item.counts || {},
      date: new Date().toISOString().split('T')[0]
    }));
  };

  // Safe helper to format day array display
  const formatDayDisplay = (dayArray) => {
    if (!Array.isArray(dayArray) || dayArray.length === 0) return "-";
    if (dayArray.includes(9999)) return "All Days";
    return dayArray.filter(d => d !== 9999).join(", ") || "All Days";
  };

  // Safe helper to format week array display
  const formatWeekDisplay = (weekArray) => {
    if (!Array.isArray(weekArray) || weekArray.length === 0) return "-";
    const validWeeks = weekArray.filter(week => week !== 9999);
    if (validWeeks.length === 0) return "All Weeks";
    return validWeeks.join(", ");
  };

  useEffect(() => {
    if (viewMode === "table") {
      const filteredData = getFilteredMachineData();
      if (filteredData && filteredData.success && Array.isArray(filteredData.machineData)) {
        const tableData = convertToTableFormat();
        
        // Check if card details (workDetail or cardNo) already exist in processData
        const hasCardDetails = tableData.some(item => 
          item.processList.some(p => p.processData && p.processData.length > 0 && (p.processData[0].workDetail || p.processData[0].cardNo))
        );

        if (hasCardDetails) {
          // Data is already loaded from backend aggregation!
          setTableLoading(false);
          return;
        }

        // Fallback: fetch details via API only if not already loaded
        const fetchAllDetails = async () => {
          setTableLoading(true);
          const results = {};

          for (const item of tableData) {
            let storageLine = String(item.line || "").trim();
            if (storageLine.startsWith(" ")) {
              storageLine = storageLine.substring(1);
            }
            
            results[storageLine] = results[storageLine] || {};

            for (const processItem of item.processList || []) {
              const processNo = processItem.processNo;
              const totalCount = item.counts?.[processNo] || (processItem.processData ? processItem.processData.length : 0);

              for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
                try {
                  const normalizedProcessNo = String(processNo || "").trim();
                  const keyProcessNo = (storageLine === "Main 2-1" || storageLine === "Main 1-2")
                    ? ` ${normalizedProcessNo}`
                    : normalizedProcessNo;
                  const key = `${keyProcessNo}-${pageNum}`;

                  const queryParams = {
                    pS: filters?.pS || 'S',
                    line: storageLine,
                    processNo: normalizedProcessNo,
                    page: pageNum.toString()
                  };

                  const checklist = await fetchCheckList(queryParams);
                  if (checklist && checklist.length > 0) {
                    results[storageLine][key] = checklist;
                  }
                } catch (error) {
                  console.error("Failed to fetch detail:", error);
                }
              }
            }
          }

          setDetailedItems(results);
          setTableLoading(false);
        };

        fetchAllDetails();
      }
    }
  }, [viewMode, dateRangeFilter.applied, machineData]);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Machine Data");

    worksheet.addRow([
      "Line", "Process No", "Page", "Card No.", "Model", 
      "Day", "Week", "Line/Group", "Machine No.", "Station/Process", "Work Detail",
      "Cycle", "Work Time", "Work Hours", "Method", "Criterion"
    ]);

    const tableData = convertToTableFormat();
    
    tableData.forEach((item) => {
      const lineName = String(item.line || "").trim();
      const storageLine = lineName.startsWith(" ") ? lineName.substring(1) : lineName;

      (item.processList || []).forEach((processItem) => {
        const processNo = processItem.processNo;
        if (!isProcessNoFiltered(processNo)) return;

        const normalizedProcessNo = String(processNo || "").trim();
        const cards = Array.isArray(processItem.processData) && processItem.processData.length > 0 
          ? processItem.processData 
          : [];

        if (cards.length === 0) {
          worksheet.addRow([
            lineName, normalizedProcessNo, 1,
            "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"
          ]);
        } else {
          cards.forEach((card, idx) => {
            const pageNum = idx + 1;
            const keyProcessNo = (storageLine === "Main 2-1" || storageLine === "Main 1-2") 
              ? ` ${normalizedProcessNo}` 
              : normalizedProcessNo;
            const key = `${keyProcessNo}-${pageNum}`;
            const detailedCard = (detailedItems?.[storageLine]?.[key] && detailedItems[storageLine][key][0]) 
              ? detailedItems[storageLine][key][0] 
              : null;
            
            const detail = (card.workDetail || card.cardNo) ? card : (detailedCard || card);

            worksheet.addRow([
              detail?.line || lineName,
              detail?.processNo || normalizedProcessNo,
              pageNum,
              detail?.cardNo ?? "-", 
              detail?.model ?? "-", 
              formatDayDisplay(detail?.d),
              formatWeekDisplay(detail?.w),
              detail?.line || lineName, 
              detail?.model ?? "-", 
              detail?.processNo || normalizedProcessNo,
              detail?.workDetail ?? "-", 
              detail?.cycle ?? "-", 
              detail?.workTime ?? "-",
              detail?.wHr ?? "-", 
              detail?.methodWssNo ?? "-", 
              detail?.criterion ?? "-"
            ]);
          });
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "MachineData.xlsx");
  };

  // Render Date Range Filter
  const renderDateRangeFilter = () => (
    <div className="card mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="bi bi-calendar-range me-2"></i>
          Date Range Filter
        </h6>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="enableDateFilter"
            checked={dateRangeFilter.enabled}
            onChange={toggleDateRangeFilter}
          />
          <label className="form-check-label" htmlFor="enableDateFilter">
            Enable
          </label>
        </div>
      </div>
      {dateRangeFilter.enabled && (
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-3">
              <label htmlFor="startDate" className="form-label">Start Date</label>
              <input
                type="date"
                id="startDate"
                className="form-control"
                value={dateRangeFilter.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="endDate" className="form-label">End Date</label>
              <input
                type="date"
                id="endDate"
                className="form-control"
                value={dateRangeFilter.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={applyDateRangeFilter}
                  disabled={!dateRangeFilter.startDate || !dateRangeFilter.endDate}
                >
                  <i className="bi bi-funnel me-1"></i>
                  Apply Filter
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={clearDateRangeFilter}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Clear Filter
                </button>
              </div>
            </div>
          </div>
          {dateRangeFilter.applied && dateRangeFilter.startDate && dateRangeFilter.endDate && (
            <div className="mt-3">
              <div className="alert alert-info mb-0" role="alert">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Active Filter:</strong> Showing cards that should appear between{' '}
                <strong>{new Date(dateRangeFilter.startDate).toLocaleDateString()}</strong> and{' '}
                <strong>{new Date(dateRangeFilter.endDate).toLocaleDateString()}</strong>
              </div>
            </div>
          )}
          {dateRangeFilter.enabled && !dateRangeFilter.applied && dateRangeFilter.startDate && dateRangeFilter.endDate && (
            <div className="mt-3">
              <div className="alert alert-warning mb-0" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Date range selected but not applied. Click <strong>"Apply Filter"</strong> to filter the results.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render Card View
  const renderCardView = () => {
    const filteredData = getFilteredMachineData();
    
    return (
      <div className="overflow-auto" style={{height:"85vh", paddingBottom: "10%"}}>
        {filteredData.success
          ? filteredData.machineData.map((item, i) => (
              <Fragment key={item.line}>
                <h3 className="mx-3 p-1 bg-info text-center">
                  {`${item.line} - ${Object.values(item.counts).reduce((acc, curr) => acc + curr, 0)}`}
                </h3>
                <div className="d-flex flex-wrap">
                  {item.processList ? item.processList.map((processItem) => (
                    <Fragment key={processItem.processNo}>
                      <Link
                        to={`/allMachine/cardDetails/`}
                        style={{ textDecoration: "none" }}
                      >
                        <div
                          className={`card mx-3 mb-3 ${styles.bg} ${styles.translate}`}
                          style={{
                            width: "8vmax",
                            background: "rgba(76,74,75)",
                            color: "white",
                          }}
                          onClick={() => handleCardClick(processItem.processData)}
                        >
                          <div className="card-header">
                            <h6 className="text-center">{processItem.processNo}</h6>
                          </div>
                          <div className="m-auto">
                            <i
                              className="bi bi-file-easel-fill"
                              style={{ fontSize: "3rem", color: "white" }}
                            ></i>
                          </div>
                          <div className="text-center">
                            Total {processItem.processData.length}
                          </div>
                          <div style={{ height: 10 }}></div>
                        </div>
                      </Link>
                    </Fragment>
                  )) : <Loading/>}
                </div>
              </Fragment>
            ))
          : null}
      </div>
    );
  };

  // Render Table View
  const renderTableView = () => {
    const tableData = convertToTableFormat();
    
    if (tableLoading) {
      return (
        <div className="p-3">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span className="ms-2">Loading detailed inspection data...</span>
          </div>
        </div>
      );
    }

    const rows = [];

    tableData.forEach((item, lineIndex) => {
      const lineName = String(item.line || "Unknown Line").trim();
      const storageLine = lineName.startsWith(" ") ? lineName.substring(1) : lineName;
      const processList = Array.isArray(item.processList) ? item.processList : [];

      processList.forEach((processItem, processIndex) => {
        const rawProcessNo = processItem.processNo != null ? processItem.processNo : "";
        if (!isProcessNoFiltered(rawProcessNo)) return;

        const processNoStr = String(rawProcessNo).trim();
        const cards = Array.isArray(processItem.processData) && processItem.processData.length > 0 
          ? processItem.processData 
          : [];

        if (cards.length === 0) {
          rows.push(
            <tr key={`empty-${lineIndex}-${processIndex}`}>
              <td>{lineName}</td>
              <td>{processNoStr}</td>
              <td>1</td>
              <td colSpan={13} className="text-muted">No inspection data available</td>
            </tr>
          );
          return;
        }

        cards.forEach((card, cardIndex) => {
          const pageNum = cardIndex + 1;
          const keyProcessNo = (storageLine === "Main 2-1" || storageLine === "Main 1-2")
            ? ` ${processNoStr}`
            : processNoStr;
          const key = `${keyProcessNo}-${pageNum}`;
          const detailedCard = (detailedItems?.[storageLine]?.[key] && detailedItems[storageLine][key][0])
            ? detailedItems[storageLine][key][0]
            : null;

          const detail = (card.workDetail || card.cardNo) ? card : (detailedCard || card);

          rows.push(
            <tr key={`row-${lineIndex}-${processIndex}-${cardIndex}`}>
              <td>{detail?.line || lineName}</td>
              <td>{processNoStr}</td>
              <td>{pageNum}</td>
              <td>{detail?.cardNo ?? "-"}</td>
              <td>{detail?.model ?? "-"}</td>
              <td>{formatDayDisplay(detail?.d)}</td>
              <td>{formatWeekDisplay(detail?.w)}</td>
              <td>{detail?.line || lineName}</td>
              <td>{detail?.model ?? "-"}</td>
              <td>{detail?.processNo || processNoStr}</td>
              <td>{detail?.workDetail ?? "-"}</td>
              <td>{detail?.cycle ?? "-"}</td>
              <td>{detail?.workTime ?? "-"}</td>
              <td>{detail?.wHr ?? "-"}</td>
              <td>{detail?.methodWssNo ?? "-"}</td>
              <td>{detail?.criterion ?? "-"}</td>
            </tr>
          );
        });
      });
    });

    return (
      <div className="p-3">
        <div className="d-flex align-items-center gap-3 mb-3">
          <button className="btn btn-success" onClick={exportToExcel}>
            📥 Download Excel
          </button>

          <div className="d-flex align-items-center gap-2">
            <label htmlFor="processNoFilter" className="form-label mb-0">
              Filter:
            </label>
            <input
              type="text"
              id="processNoFilter"
              className="form-control"
              placeholder="Enter process number"
              value={processNoFilter}
              onChange={(e) => setProcessNoFilter(e.target.value)}
              style={{ width: "200px" }}
            />
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="exactMatch"
                checked={exactMatch}
                onChange={(e) => setExactMatch(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="exactMatch">
                Exact match
              </label>
            </div>
          </div>
        </div>

        <div className="container-fluid border rounded p-3" style={{ backgroundColor: "#f8f9fa" }}>
          <div className="table-responsive" style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto", overflowX: "auto" }}>
            <table className="table table-bordered table-striped table-hover">
              <thead className="table-primary" style={{ position: "sticky", top: 0, backgroundColor: "#cfe2ff" }}>
                <tr>
                  <th>Line</th>
                  <th>Process No</th>
                  <th>Page</th>
                  <th>Card No.</th>
                  <th>Model</th>
                  <th>Day</th>
                  <th>Week</th>
                  <th>Line/Group</th>
                  <th>Machine No.</th>
                  <th>Station/Process</th>
                  <th>Work Detail</th>
                  <th>Cycle</th>
                  <th>Work Time</th>
                  <th>Work Hours</th>
                  <th>Method</th>
                  <th>Criterion</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? rows : (
                  <tr>
                    <td colSpan={16} className="text-center text-muted py-4">
                      No inspection items available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Fragment>
      {loading ? (
        <Loading />
      ) : (
        <Fragment>
          {/* View Toggle Controls */}
          <div className="d-flex justify-content-between align-items-center mx-3 mb-3">
            <h2>Machine List</h2>
            <div className="btn-group" role="group" aria-label="View toggle">
              <button
                type="button"
                className={`btn ${viewMode === "card" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setViewMode("card")}
              >
                <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                Card View
              </button>
              <button
                type="button"
                className={`btn ${viewMode === "table" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setViewMode("table")}
              >
                <i className="bi bi-table me-2"></i>
                Table View
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="mx-3">
            {renderDateRangeFilter()}
          </div>

          {/* Render selected view */}
          {viewMode === "card" ? renderCardView() : renderTableView()}
        </Fragment>
      )}
    </Fragment>
  );
}