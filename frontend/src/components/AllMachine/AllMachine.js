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

// export default function AllMachine() {
//   const dispatch = useDispatch();
//   const machines = useSelector((state) => state.machines);
//   const filters = useSelector((state) => state.filters);
  
//   // View state
//   const [viewMode, setViewMode] = useState("card"); // "card" or "table"
  
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
//     if (!machineData.success || !machineData.machineData) return [];
    
//     return machineData.machineData.map(item => ({
//       line: item.line,
//       processNos: item.processList ? item.processList.map(p => p.processNo) : [],
//       counts: item.counts || {},
//       date: new Date().toISOString().split('T')[0] // Current date fallback
//     }));
//   };

//   useEffect(() => {
//     if (viewMode === "table" && machineData.success) {
//       const fetchAllDetails = async () => {
//         const tableData = convertToTableFormat();
//         if (!Array.isArray(tableData)) return;

//         setTableLoading(true);
//         const results = {};

//         for (const item of tableData) {
//           let storageLine = item.line.trim();
//           if (storageLine.startsWith(" ")) {
//             storageLine = storageLine.substring(1);
//           }
          
//           results[storageLine] = results[storageLine] || {};

//           for (const processNo of item.processNos || []) {
//             const totalCount = item.counts?.[processNo] || 0;

//             for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
//               try {
//                 const normalizedProcessNo = processNo.trim();
//                 let keyProcessNo;
//                 if (storageLine === "Main 2-1" || storageLine === "Main 1-2") {
//                   keyProcessNo = ` ${normalizedProcessNo}`;
//                 } else {
//                   keyProcessNo = normalizedProcessNo;
//                 }
                
//                 const key = `${keyProcessNo}-${pageNum}`;

//                 let queryParams;
//                 const date = item.date || new Date().toISOString().split('T')[0];
                
//                 if (storageLine === "Main 2-1" || storageLine === "Main 1-2") {
//                   queryParams = {
//                     date: date,
//                     shift: 'S',
//                     line: ` ${storageLine}`,
//                     processNo: ` ${normalizedProcessNo}`,
//                     page: pageNum.toString()
//                   };
//                 } else {
//                   queryParams = {
//                     date: date,
//                     shift: 'S',
//                     line: storageLine,
//                     processNo: normalizedProcessNo,
//                     page: pageNum.toString()
//                   };
//                 }

//                 const checklist = await fetchCheckList(queryParams);
//                 if (checklist && checklist.length > 0) {
//                   results[storageLine][key] = checklist;
//                 }
//               } catch (error) {
//                 console.error("Failed to fetch detail for", storageLine, processNo, pageNum, error);
//               }
//             }
//           }
//         }

//         setDetailedItems(results);
//         setTableLoading(false);
//       };

//       fetchAllDetails();
//     }
//   }, [viewMode, machineData]);

//   const exportToExcel = async () => {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Machine Data");

//     worksheet.addRow([
//       "Line", "Process No", "Page", "Card No.", "Model", 
//       "Day", "Line/Group", "Machine No.", "Station/Process", "Work Detail",
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

//   // Render Card View
//   const renderCardView = () => (
//     <div className="overflow-auto" style={{height:"85vh", paddingBottom: "10%"}}>
//       {machineData.success
//         ? machineData.machineData.map((item, i) => (
//             <Fragment key={item.line}>
//               <h3 className="mx-3 p-1 bg-info text-center">
//                 {`${item.line} - ${Object.values(item.counts).reduce((acc, curr) => acc + curr, 0)}`}
//               </h3>
//               <div className="d-flex flex-wrap">
//                 {item.processList ? item.processList.map((processItem) => (
//                   <Fragment key={processItem.processNo}>
//                     <Link
//                       to={`/allMachine/cardDetails/`}
//                       style={{ textDecoration: "none" }}
//                     >
//                       <div
//                         className={`card mx-3 mb-3 ${styles.bg} ${styles.translate}`}
//                         style={{
//                           width: "8vmax",
//                           background: "rgba(76,74,75)",
//                           color: "white",
//                         }}
//                         onClick={() => handleCardClick(processItem.processData)}
//                       >
//                         <div className="card-header">
//                           <h6 className="text-center">{processItem.processNo}</h6>
//                         </div>
//                         <div className="m-auto">
//                           <i
//                             className="bi bi-file-easel-fill"
//                             style={{ fontSize: "3rem", color: "white" }}
//                           ></i>
//                         </div>
//                         <div className="text-center">
//                           Total {processItem.processData.length}
//                         </div>
//                         <div style={{ height: 10 }}></div>
//                       </div>
//                     </Link>
//                   </Fragment>
//                 )) : <Loading/>}
//               </div>
//             </Fragment>
//           ))
//         : null}
//     </div>
//   );

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

//           {/* Render selected view */}
//           {viewMode === "card" ? renderCardView() : renderTableView()}
//         </Fragment>
//       )}
//     </Fragment>
//   );
// }

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

// // API Configuration - using environment variables
// const getApiBaseUrl = () => {
//   const host = process.env.REACT_APP_HOST || 'localhost';
//   const port = process.env.REACT_APP_PORT || '5051';
  
//   if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
//     return `http://${host}:${port}`;
//   }
  
//   return `${window.location.protocol}//${window.location.hostname}:${port}`;
// };

// const API_BASE_URL = getApiBaseUrl();

// export default function AllMachine() {
//   const dispatch = useDispatch();
//   const machines = useSelector((state) => state.machines);
//   const filters = useSelector((state) => state.filters);
  
//   // View state
//   const [viewMode, setViewMode] = useState("card"); // "card" or "table"
  
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

//   // Card view handlers
//   const handleCardClick = (processData) => {
//     dispatch(setProcessData(processData));
//   };

//   // Table view functions - using the machine detail API endpoint
//   const fetchMachineDetails = async (machineId) => {
//     try {
//       if (!machineId) {
//         console.error("No machine ID provided");
//         return [];
//       }

//       const apiUrl = `${API_BASE_URL}/head/machine/${machineId}`;
//       console.log("Fetching machine details from:", apiUrl);
      
//       const response = await axios.get(apiUrl, {
//         timeout: 10000
//       });

//       console.log("Machine detail response:", response.data);
      
//       // Handle the nested data structure: response.data.data
//       if (response.data && response.data.success && response.data.data) {
//         return [response.data.data]; // Wrap single object in array
//       }
      
//       return [];
//     } catch (error) {
//       console.error("API Error fetching machine details:", error);
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
//     if (!machineData?.success || !machineData?.machineData) return [];
    
//     return machineData.machineData.map(item => ({
//       line: item.line,
//       processList: item.processList || [],
//       processNos: item.processList ? item.processList.map(p => p.processNo) : [],
//       counts: item.counts || {},
//       date: new Date().toISOString().split('T')[0] // Current date fallback
//     }));
//   };

//   useEffect(() => {
//     if (viewMode === "table" && machineData?.success) {
//       const fetchAllDetails = async () => {
//         const tableData = convertToTableFormat();
//         if (!Array.isArray(tableData)) return;

//         setTableLoading(true);
//         const results = {};

//         for (const item of tableData) {
//           let storageLine = item.line?.trim() || '';
//           if (storageLine.startsWith(" ")) {
//             storageLine = storageLine.substring(1);
//           }
          
//           results[storageLine] = results[storageLine] || {};

//           // Get the processList from the original machineData
//           const originalItem = machineData.machineData.find(m => m.line === item.line);
//           if (!originalItem || !originalItem.processList) continue;

//           for (const processItem of originalItem.processList) {
//             try {
//               const processNo = processItem.processNo;
//               const processData = processItem.processData || [];
              
//               // For each item in processData, fetch detailed machine information
//               for (let i = 0; i < processData.length; i++) {
//                 const machineItem = processData[i];
//                 const machineId = machineItem._id || machineItem.id;
                
//                 if (machineId) {
//                   const key = `${processNo}-${i + 1}`;
//                   const details = await fetchMachineDetails(machineId);
                  
//                   if (details && details.length > 0) {
//                     results[storageLine][key] = details;
//                     console.log(`✅ Fetched details for ${storageLine} - ${key}:`, details.length, "items");
//                   } else {
//                     // If no details from API, use the existing processData item
//                     results[storageLine][key] = [machineItem];
//                     console.log(`📋 Using existing data for ${storageLine} - ${key}`);
//                   }
//                 } else {
//                   // Fallback to existing data if no ID available
//                   const key = `${processNo}-${i + 1}`;
//                   results[storageLine][key] = [machineItem];
//                 }
//               }
//             } catch (error) {
//               console.error("Failed to fetch detail for", storageLine, processItem.processNo, error);
//             }
//           }
//         }

//         setDetailedItems(results);
//         setTableLoading(false);
//       };

//       fetchAllDetails();
//     }
//   }, [viewMode, machineData]);

//   const exportToExcel = async () => {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Machine Data");

//     worksheet.addRow([
//       "Line", "Process No", "Page", "Card No.", "Model", 
//       "Day", "Line/Group", "Machine No.", "Station/Process", "Work Detail",
//       "Cycle", "Work Time", "Work Hours", "Method", "Criterion", "Created At"
//     ]);

//     const tableData = convertToTableFormat();
    
//     tableData.forEach((item) => {
//       (item.processList || [])
//         .filter((processItem) => isProcessNoFiltered(processItem.processNo))
//         .forEach((processItem) => {
//           const processNo = processItem.processNo;
//           const processData = processItem.processData || [];

//           processData.forEach((machineItem, index) => {
//             const key = `${processNo}-${index + 1}`;
//             const details = detailedItems?.[item.line]?.[key] || [];

//             if (details.length === 0) {
//               worksheet.addRow([
//                 item.line, processNo, index + 1,
//                 "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"
//               ]);
//             } else {
//               details.forEach((detail) => {
//                 const createdAt = detail?.createdAt ? new Date(detail.createdAt).toLocaleString() : "-";
//                 worksheet.addRow([
//                   item.line, processNo, index + 1,
//                   detail?.cardNo ?? "-", 
//                   detail?.model ?? "-", 
//                   detail?.d && Array.isArray(detail.d) && detail.d[0] !== 9999 ? detail.d[0] : "-",
//                   detail?.line ?? "-", 
//                   detail?.model ?? "-", 
//                   detail?.processNo ?? "-",
//                   detail?.workDetail ?? "-", 
//                   detail?.cycle ?? "-", 
//                   detail?.workTime ?? "-",
//                   detail?.wHr ?? "-", 
//                   detail?.methodWssNo ?? "-", 
//                   detail?.criterion ?? "-",
//                   createdAt
//                 ]);
//               });
//             }
//           });
//         });
//     });

//     const buffer = await workbook.xlsx.writeBuffer();
//     const blob = new Blob([buffer], { type: "application/octet-stream" });
//     saveAs(blob, "MachineData.xlsx");
//   };

//   // Render Card View
//   const renderCardView = () => (
//     <div className="overflow-auto" style={{height:"85vh", paddingBottom: "10%"}}>
//       {machineData?.success
//         ? machineData.machineData.map((item, i) => (
//             <Fragment key={item.line}>
//               <h3 className="mx-3 p-1 bg-info text-center">
//                 {`${item.line} - ${Object.values(item.counts || {}).reduce((acc, curr) => acc + curr, 0)}`}
//               </h3>
//               <div className="d-flex flex-wrap">
//                 {item.processList ? item.processList.map((processItem) => (
//                   <Fragment key={processItem.processNo}>
//                     <Link
//                       to={`/allMachine/cardDetails/`}
//                       style={{ textDecoration: "none" }}
//                     >
//                       <div
//                         className={`card mx-3 mb-3 ${styles.bg} ${styles.translate}`}
//                         style={{
//                           width: "8vmax",
//                           background: "rgba(76,74,75)",
//                           color: "white",
//                         }}
//                         onClick={() => handleCardClick(processItem.processData)}
//                       >
//                         <div className="card-header">
//                           <h6 className="text-center">{processItem.processNo}</h6>
//                         </div>
//                         <div className="m-auto">
//                           <i
//                             className="bi bi-file-easel-fill"
//                             style={{ fontSize: "3rem", color: "white" }}
//                           ></i>
//                         </div>
//                         <div className="text-center">
//                           Total {processItem.processData?.length || 0}
//                         </div>
//                         <div style={{ height: 10 }}></div>
//                       </div>
//                     </Link>
//                   </Fragment>
//                 )) : <Loading/>}
//               </div>
//             </Fragment>
//           ))
//         : null}
//     </div>
//   );

//   // Render Table View
//   const renderTableView = () => {
//     const tableData = convertToTableFormat();
    
//     // Debug logs to help identify issues
//     console.log("Table Data:", tableData);
//     console.log("Detailed Items:", detailedItems);
//     console.log("Machine Data:", machineData);
    
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
//                   <th>Line/Group</th>
//                   <th>Machine No.</th>
//                   <th>Station/Process</th>
//                   <th>Work Detail</th>
//                   <th>Cycle</th>
//                   <th>Work Time</th>
//                   <th>Work Hours</th>
//                   <th>Method</th>
//                   <th>Criterion</th>
//                   {/* <th>Created At</th> */}
//                 </tr>
//               </thead>
//               <tbody>
//                 {tableData.map((item, index) => {
//                   let storageLine = item.line?.trim() || '';
//                   if (storageLine.startsWith(" ")) {
//                     storageLine = storageLine.substring(1);
//                   }
                  
//                   return (item.processList || [])
//                     .filter((processItem) => isProcessNoFiltered(processItem.processNo))
//                     .flatMap((processItem) => {
//                       const processNo = processItem.processNo;
//                       const processData = processItem.processData || [];
//                       const rows = [];
                      
//                       processData.forEach((machineItem, i) => {
//                         const key = `${processNo}-${i + 1}`;
//                         const details = detailedItems?.[storageLine]?.[key] || [];

//                         if (details.length === 0) {
//                           rows.push(
//                             <tr key={`${item.line}-${key}-${index}`}>
//                               <td>{item.line}</td>
//                               <td>{processNo}</td>
//                               <td>{i + 1}</td>
//                               <td colSpan={13} className="text-muted">No detailed data available</td>
//                             </tr>
//                           );
//                         } else {
//                           details.forEach((detail, detailIndex) => {
//                             // Add null checks and safe array access
//                             const safeDetail = detail || {};
//                             const createdAt = safeDetail.createdAt ? new Date(safeDetail.createdAt).toLocaleString() : "-";
                            
//                             // Debug log to see what data we have
//                             console.log(`Rendering row for ${item.line}-${processNo}-${i+1}:`, safeDetail);
                            
//                             rows.push(
//                               <tr key={`${item.line}-${key}-${index}-${detailIndex}`}>
//                                 <td>{item.line}</td>
//                                 <td>{processNo}</td>
//                                 <td>{i + 1}</td>
//                                 <td>{safeDetail.cardNo ?? "-"}</td>
//                                 <td>{safeDetail.model ?? "-"}</td>
//                                 <td>{safeDetail.d && Array.isArray(safeDetail.d) && safeDetail.d[0] !== 9999 ? safeDetail.d[0] : "-"}</td>
//                                 <td>{safeDetail.line ?? "-"}</td>
//                                 <td>{safeDetail.model ?? "-"}</td>
//                                 <td>{safeDetail.processNo ?? "-"}</td>
//                                 <td>{safeDetail.workDetail ?? "-"}</td>
//                                 <td>{safeDetail.cycle ?? "-"}</td>
//                                 <td>{safeDetail.workTime ?? "-"}</td>
//                                 <td>{safeDetail.wHr ?? "-"}</td>
//                                 <td>{safeDetail.methodWssNo ?? "-"}</td>
//                                 <td>{safeDetail.criterion ?? "-"}</td>
//                                 {/* <td>{createdAt}</td> */}
//                               </tr>
//                             );
//                           });
//                         }
//                       });
                      
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

// API Configuration - using environment variables
const getApiBaseUrl = () => {
  const host = process.env.REACT_APP_HOST || 'localhost';
  const port = process.env.REACT_APP_PORT || '5051';
  
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `http://${host}:${port}`;
  }
  
  return `${window.location.protocol}//${window.location.hostname}:${port}`;
};

const API_BASE_URL = getApiBaseUrl();

// Date Range Filtering Logic
const generateCardScheduleDates = (cardRules, startDate, endDate) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Normalize the rules
  const year = cardRules.year === 9999 ? null : cardRules.year;
  const month = cardRules.month === 9999 ? null : cardRules.month;
  const week = cardRules.week === 9999 ? null : cardRules.week;
  const day = cardRules.day === 9999 ? null : cardRules.day;
  
  // Generate dates for the range
  const current = new Date(start);
  while (current <= end) {
    let shouldInclude = true;
    
    // Check year rule
    if (year !== null && current.getFullYear() !== year) {
      shouldInclude = false;
    }
    
    // Check month rule (1-12)
    if (month !== null && (current.getMonth() + 1) !== month) {
      shouldInclude = false;
    }
    
    // Check day of week rule (0=Sunday, 1=Monday, ..., 6=Saturday)
    if (day !== null && current.getDay() !== day) {
      shouldInclude = false;
    }
    
    // Check week of month rule (1-5)
    if (week !== null) {
      const weekOfMonth = Math.ceil(current.getDate() / 7);
      if (weekOfMonth !== week) {
        shouldInclude = false;
      }
    }
    
    if (shouldInclude) {
      dates.push(new Date(current));
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

const shouldShowCardInDateRange = (card, startDate, endDate) => {
  // If no date range is selected, show all cards (preserve existing functionality)
  if (!startDate || !endDate) {
    return true;
  }
  
  // Extract scheduling rules from card data
  // This assumes the card has properties like year, month, week, day
  // You may need to adjust these property names based on your actual data structure
  const cardRules = {
    year: card.year || 9999,
    month: card.month || 9999,
    week: card.week || 9999,
    day: card.day || 9999
  };
  
  // Generate all dates when this card should appear
  const scheduledDates = generateCardScheduleDates(cardRules, startDate, endDate);
  
  // If any scheduled date falls within the range, show the card
  return scheduledDates.length > 0;
};

export default function AllMachine() {
  const dispatch = useDispatch();
  const machines = useSelector((state) => state.machines);
  const filters = useSelector((state) => state.filters);
  
  // View state
  const [viewMode, setViewMode] = useState("card"); // "card" or "table"
  
  // Table view states
  const [detailedItems, setDetailedItems] = useState({});
  const [tableLoading, setTableLoading] = useState(false);
  const [processNoFilter, setProcessNoFilter] = useState("");
  const [exactMatch, setExactMatch] = useState(false);

  // NEW: Date range filtering states
  const [dateRangeFilter, setDateRangeFilter] = useState({
    enabled: false,
    startDate: "",
    endDate: ""
  });

  let lineStr = filters.line === null ? '' : `&line=${filters.line}`;
  let rSStr = filters.rS === null ? '' : `&rS=${filters.rS}`;
  let queryStr = `&pS=${filters.pS}` + lineStr + rSStr;

  useEffect(() => {
    dispatch(getAllMachines(queryStr));
  }, [dispatch, filters, queryStr]);

  const { loading, machineData } = machines;

  // Card view handlers
  const handleCardClick = (processData) => {
    dispatch(setProcessData(processData));
  };

  // NEW: Date range filter handlers
  const handleDateRangeToggle = () => {
    setDateRangeFilter(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  const handleDateRangeChange = (field, value) => {
    setDateRangeFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Table view functions - using the machine detail API endpoint
  const fetchMachineDetails = async (machineId) => {
    try {
      if (!machineId) {
        console.error("No machine ID provided");
        return [];
      }

      const apiUrl = `${API_BASE_URL}/head/machine/${machineId}`;
      console.log("Fetching machine details from:", apiUrl);
      
      const response = await axios.get(apiUrl, {
        timeout: 10000
      });

      console.log("Machine detail response:", response.data);
      
      // Handle the nested data structure: response.data.data
      if (response.data && response.data.success && response.data.data) {
        return [response.data.data]; // Wrap single object in array
      }
      
      return [];
    } catch (error) {
      console.error("API Error fetching machine details:", error);
      return [];
    }
  };

  const isProcessNoFiltered = (processNo) => {
    if (!processNoFilter.trim()) return true;
    
    const filterValue = processNoFilter.toLowerCase().replace(/\s+/g, '');
    const processValue = processNo.toLowerCase().replace(/\s+/g, '');
    
    if (exactMatch) {
      return processValue === filterValue;
    } else {
      return processValue.includes(filterValue);
    }
  };

  // NEW: Filter function for date range
  const isCardVisibleInDateRange = (processItem) => {
    // If date range filtering is disabled, show all cards
    if (!dateRangeFilter.enabled || !dateRangeFilter.startDate || !dateRangeFilter.endDate) {
      return true;
    }

    // Check each card in the process data
    if (!processItem.processData || !Array.isArray(processItem.processData)) {
      return true; // Show if no process data
    }

    // If ANY card in the process should be visible, show the entire process
    return processItem.processData.some(card => 
      shouldShowCardInDateRange(card, dateRangeFilter.startDate, dateRangeFilter.endDate)
    );
  };

  // Convert machineData to table format
  const convertToTableFormat = () => {
    if (!machineData?.success || !machineData?.machineData) return [];
    
    return machineData.machineData.map(item => ({
      line: item.line,
      processList: item.processList || [],
      processNos: item.processList ? item.processList.map(p => p.processNo) : [],
      counts: item.counts || {},
      date: new Date().toISOString().split('T')[0] // Current date fallback
    }));
  };

  useEffect(() => {
    if (viewMode === "table" && machineData?.success) {
      const fetchAllDetails = async () => {
        const tableData = convertToTableFormat();
        if (!Array.isArray(tableData)) return;

        setTableLoading(true);
        const results = {};

        for (const item of tableData) {
          let storageLine = item.line?.trim() || '';
          if (storageLine.startsWith(" ")) {
            storageLine = storageLine.substring(1);
          }
          
          results[storageLine] = results[storageLine] || {};

          // Get the processList from the original machineData
          const originalItem = machineData.machineData.find(m => m.line === item.line);
          if (!originalItem || !originalItem.processList) continue;

          for (const processItem of originalItem.processList) {
            try {
              const processNo = processItem.processNo;
              const processData = processItem.processData || [];
              
              // For each item in processData, fetch detailed machine information
              for (let i = 0; i < processData.length; i++) {
                const machineItem = processData[i];
                const machineId = machineItem._id || machineItem.id;
                
                if (machineId) {
                  const key = `${processNo}-${i + 1}`;
                  const details = await fetchMachineDetails(machineId);
                  
                  if (details && details.length > 0) {
                    results[storageLine][key] = details;
                    console.log(`✅ Fetched details for ${storageLine} - ${key}:`, details.length, "items");
                  } else {
                    // If no details from API, use the existing processData item
                    results[storageLine][key] = [machineItem];
                    console.log(`📋 Using existing data for ${storageLine} - ${key}`);
                  }
                } else {
                  // Fallback to existing data if no ID available
                  const key = `${processNo}-${i + 1}`;
                  results[storageLine][key] = [machineItem];
                }
              }
            } catch (error) {
              console.error("Failed to fetch detail for", storageLine, processItem.processNo, error);
            }
          }
        }

        setDetailedItems(results);
        setTableLoading(false);
      };

      fetchAllDetails();
    }
  }, [viewMode, machineData]);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Machine Data");

    worksheet.addRow([
      "Line", "Process No", "Page", "Card No.", "Model", 
      "Day", "Line/Group", "Machine No.", "Station/Process", "Work Detail",
      "Cycle", "Work Time", "Work Hours", "Method", "Criterion", "Created At"
    ]);

    const tableData = convertToTableFormat();
    
    tableData.forEach((item) => {
      (item.processList || [])
        .filter((processItem) => isProcessNoFiltered(processItem.processNo))
        .filter((processItem) => isCardVisibleInDateRange(processItem)) // NEW: Date range filter
        .forEach((processItem) => {
          const processNo = processItem.processNo;
          const processData = processItem.processData || [];

          processData.forEach((machineItem, index) => {
            const key = `${processNo}-${index + 1}`;
            const details = detailedItems?.[item.line]?.[key] || [];

            if (details.length === 0) {
              worksheet.addRow([
                item.line, processNo, index + 1,
                "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"
              ]);
            } else {
              details.forEach((detail) => {
                const createdAt = detail?.createdAt ? new Date(detail.createdAt).toLocaleString() : "-";
                worksheet.addRow([
                  item.line, processNo, index + 1,
                  detail?.cardNo ?? "-", 
                  detail?.model ?? "-", 
                  detail?.d && Array.isArray(detail.d) && detail.d[0] !== 9999 ? detail.d[0] : "-",
                  detail?.line ?? "-", 
                  detail?.model ?? "-", 
                  detail?.processNo ?? "-",
                  detail?.workDetail ?? "-", 
                  detail?.cycle ?? "-", 
                  detail?.workTime ?? "-",
                  detail?.wHr ?? "-", 
                  detail?.methodWssNo ?? "-", 
                  detail?.criterion ?? "-",
                  createdAt
                ]);
              });
            }
          });
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "MachineData.xlsx");
  };

  // Render Card View
  const renderCardView = () => (
    <div className="overflow-auto" style={{height:"85vh", paddingBottom: "10%"}}>
      {machineData?.success
        ? machineData.machineData.map((item, i) => (
            <Fragment key={item.line}>
              <h3 className="mx-3 p-1 bg-info text-center">
                {`${item.line} - ${Object.values(item.counts || {}).reduce((acc, curr) => acc + curr, 0)}`}
              </h3>
              <div className="d-flex flex-wrap">
                {item.processList ? item.processList
                  .filter((processItem) => isCardVisibleInDateRange(processItem)) // NEW: Date range filter
                  .map((processItem) => (
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
                          Total {processItem.processData?.length || 0}
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

  // Render Table View
  const renderTableView = () => {
    const tableData = convertToTableFormat();
    
    // Debug logs to help identify issues
    console.log("Table Data:", tableData);
    console.log("Detailed Items:", detailedItems);
    console.log("Machine Data:", machineData);
    
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

    return (
      <div className="p-3">
        <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
          <button className="btn btn-success" onClick={exportToExcel}>
            📥 Download Excel
          </button>

          {/* Existing Process Number Filter */}
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

          {/* NEW: Date Range Filter */}
          <div className="d-flex align-items-center gap-2 border-start ps-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="enableDateRange"
                checked={dateRangeFilter.enabled}
                onChange={handleDateRangeToggle}
              />
              <label className="form-check-label" htmlFor="enableDateRange">
                Date Range Filter
              </label>
            </div>
            {dateRangeFilter.enabled && (
              <>
                <input
                  type="date"
                  className="form-control"
                  value={dateRangeFilter.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  style={{ width: "150px" }}
                />
                <span>to</span>
                <input
                  type="date"
                  className="form-control"
                  value={dateRangeFilter.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  style={{ width: "150px" }}
                />
              </>
            )}
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
                {tableData.map((item, index) => {
                  let storageLine = item.line?.trim() || '';
                  if (storageLine.startsWith(" ")) {
                    storageLine = storageLine.substring(1);
                  }
                  
                  return (item.processList || [])
                    .filter((processItem) => isProcessNoFiltered(processItem.processNo))
                    .filter((processItem) => isCardVisibleInDateRange(processItem)) // NEW: Date range filter
                    .flatMap((processItem) => {
                      const processNo = processItem.processNo;
                      const processData = processItem.processData || [];
                      const rows = [];
                      
                      processData.forEach((machineItem, i) => {
                        const key = `${processNo}-${i + 1}`;
                        const details = detailedItems?.[storageLine]?.[key] || [];

                        if (details.length === 0) {
                          rows.push(
                            <tr key={`${item.line}-${key}-${index}`}>
                              <td>{item.line}</td>
                              <td>{processNo}</td>
                              <td>{i + 1}</td>
                              <td colSpan={12} className="text-muted">No detailed data available</td>
                            </tr>
                          );
                        } else {
                          details.forEach((detail, detailIndex) => {
                            // Add null checks and safe array access
                            const safeDetail = detail || {};
                            const createdAt = safeDetail.createdAt ? new Date(safeDetail.createdAt).toLocaleString() : "-";
                            
                            // Debug log to see what data we have
                            console.log(`Rendering row for ${item.line}-${processNo}-${i+1}:`, safeDetail);
                            
                            rows.push(
                              <tr key={`${item.line}-${key}-${index}-${detailIndex}`}>
                                <td>{item.line}</td>
                                <td>{processNo}</td>
                                <td>{i + 1}</td>
                                <td>{safeDetail.cardNo ?? "-"}</td>
                                <td>{safeDetail.model ?? "-"}</td>
                                <td>{safeDetail.d && Array.isArray(safeDetail.d) && safeDetail.d[0] !== 9999 ? safeDetail.d[0] : "-"}</td>
                                <td>{safeDetail.line ?? "-"}</td>
                                <td>{safeDetail.model ?? "-"}</td>
                                <td>{safeDetail.processNo ?? "-"}</td>
                                <td>{safeDetail.workDetail ?? "-"}</td>
                                <td>{safeDetail.cycle ?? "-"}</td>
                                <td>{safeDetail.workTime ?? "-"}</td>
                                <td>{safeDetail.wHr ?? "-"}</td>
                                <td>{safeDetail.methodWssNo ?? "-"}</td>
                                <td>{safeDetail.criterion ?? "-"}</td>
                              </tr>
                            );
                          });
                        }
                      });
                      
                      return rows;
                    });
                })}
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
            <div className="d-flex align-items-center gap-3">
              {/* NEW: Date Range Filter for Card View */}
              {viewMode === "card" && (
                <div className="d-flex align-items-center gap-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="enableDateRangeCard"
                      checked={dateRangeFilter.enabled}
                      onChange={handleDateRangeToggle}
                    />
                    <label className="form-check-label" htmlFor="enableDateRangeCard">
                      📅 Date Filter
                    </label>
                  </div>
                  {dateRangeFilter.enabled && (
                    <>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={dateRangeFilter.startDate}
                        onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                        style={{ width: "140px" }}
                      />
                      <span className="text-muted">to</span>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={dateRangeFilter.endDate}
                        onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                        style={{ width: "140px" }}
                      />
                    </>
                  )}
                </div>
              )}
              
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
          </div>

          {/* Render selected view */}
          {viewMode === "card" ? renderCardView() : renderTableView()}
        </Fragment>
      )}
    </Fragment>
  );
}