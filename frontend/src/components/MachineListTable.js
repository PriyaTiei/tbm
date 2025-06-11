// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";
// import React, { useEffect, useState } from "react";
// import axios from "axios";

// function MachineListTable({ machineData, dailyStatusActions }) {
//   const [detailedItems, setDetailedItems] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [processNoFilter, setProcessNoFilter] = useState("");
//   const [exactMatch, setExactMatch] = useState(false);

//   const fetchHeadCheckList = async (queryParams) => {
//     try {
//       console.log("API Request URL:", 'http://localhost:5051/head/headCheckList');
//       console.log("Query Parameters:", queryParams);

//       const response = await axios.get('http://localhost:5051/head/headCheckList', {
//         params: queryParams,
//         timeout: 10000
//       });

//       console.log("API Response:", response.data);
//       return response.data.headCheckList || [];
//     } catch (error) {
//       console.error("API Error Details:", {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status,
//         config: error.config
//       });
//       return [];
//     }
//   };

//   // const fetchCheckList = async (queryParams) => {
//   //   try {
//   //     // Build query string to match the exact format: spaces as %20
//   //     const queryString = Object.keys(queryParams)
//   //       .map(key => {
//   //         const value = queryParams[key];
//   //         // Encode spaces as %20 to match the working URL format
//   //         const encodedValue = encodeURIComponent(value).replace(/%20/g, '%20');
//   //         return `${key}=${encodedValue}`;
//   //       })
//   //       .join('&');

//   //     const url = `http://localhost:5050/checkList?${queryString}`;
//   //     console.log("API Request URL:", url);

//   //     const response = await axios.get(url, {
//   //       timeout: 10000
//   //     });

//   //     console.log("API Response:", response.data);
//   //     return response.data || [];
//   //   } catch (error) {
//   //     console.error("API Error Details:", {
//   //       message: error.message,
//   //       response: error.response?.data,
//   //       status: error.response?.status,
//   //       config: error.config
//   //     });
//   //     return [];
//   //   }
//   // };

//   // Helper function to check if a processNo matches the current filter
  
  
  
//   const fetchCheckList = async (queryParams) => {
//     try {
//       // Validate that queryParams is provided
//       if (!queryParams || Object.keys(queryParams).length === 0) {
//         console.error("No query parameters provided");
//         return [];
//       }

//       // Build query string with proper encoding
//       const queryString = Object.keys(queryParams)
//         .map(key => {
//           const value = queryParams[key];
//           // Handle encoding - spaces become %20, preserve other special characters as needed
//           const encodedValue = encodeURIComponent(value);
//           return `${key}=${encodedValue}`;
//         })
//         .join('&');

//       const url = `http://localhost:5051/head/headCheckList?${queryString}`;
//       console.log("API Request URL:", url);

//       const response = await axios.get(url, {
//         timeout: 10000
//       });

//       console.log("API Response:", response.data);
//       return response.data || [];
//     } catch (error) {
//       console.error("API Error Details:", {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status,
//         config: error.config,
//         url: error.config?.url
//       });
//       return [];
//     }
//   };

// // Example usage:
// // fetchCheckList({ d: 3, w: 2, m: 6, y: 2025, pS: 'S', line: 'Main 1-2', processNo: 'Mk 1-2', page: 1 });
// // fetchCheckList({ d: 5, w: 3, m: 8, y: 2024, pS: 'A', line: 'Line 2-3', processNo: 'Pr 3-4', page: 2 });
  
  
//   const isProcessNoFiltered = (processNo) => {
//     if (!processNoFilter.trim()) return true;
    
//     const filterValue = processNoFilter.toLowerCase().replace(/\s+/g, '');
//     const processValue = processNo.toLowerCase().replace(/\s+/g, '');
    
//     if (exactMatch) {
//       // Exact match - must be exactly the same
//       return processValue === filterValue;
//     } else {
//       // Partial match - contains the filter value
//       return processValue.includes(filterValue);
//     }
//   };

//   useEffect(() => {
//     const fetchAllDetails = async () => {
//       if (!Array.isArray(machineData)) return;

//       setLoading(true);
//       const results = {};

//       for (const item of machineData) {
//         const line = item.line.trim();
//         console.log("Processing line:", line);

//         results[line] = results[line] || {};

//         for (const processNo of item.processNos || []) {
//           const totalCount = item.counts?.[processNo] || 0;

//           for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
//             try {
//               const key = `${processNo}-${pageNum}`;

//               if (line === "Main 2-1" || line === "Main 1-2") {
//                 console.log("Using alternative API for line:", line);

//                 const queryParams = {
//                   line: ` ${line}`,  // Add space prefix to match the working URL
//                   processNo: ` ${processNo.trim()}`  // Add space prefix to match the working URL
//                 };

//                 const checklist = await fetchCheckList(queryParams);
//                 console.log(`Fetched data for ${line} - ${key}:`, checklist);

//                 if (checklist && checklist.length > 0) {
//                   results[line][key] = checklist;
//                   console.log(`Stored data for ${line} - ${key}:`, results[line][key]);
//                 }
//               } else {
//                 console.log("Using primary API for line:", line);

//                 // Ensure the date is defined and passed correctly
//                 const date = item.date || new Date().toISOString().split('T')[0]; // Fallback to today's date if undefined
//                 const queryParams = {
//                   date: date,
//                   shift: 'S',
//                   line: line,
//                   processNo: processNo.trim(),
//                   page: pageNum.toString()
//                 };

//                 const checklist = await fetchHeadCheckList(queryParams);
//                 console.log(`Fetched data for ${line} - ${key}:`, checklist);

//                 if (checklist && checklist.length > 0) {
//                   results[line][key] = checklist;
//                   console.log(`Stored data for ${line} - ${key}:`, results[line][key]);
//                 }
//               }
//             } catch (error) {
//               console.error("Failed to fetch detail for", line, processNo, pageNum, error);
//             }
//           }
//         }
//       }

//       setDetailedItems(results);
//       console.log("Final results object:", results);
//       setLoading(false);
//     };

//     fetchAllDetails();
//   }, [machineData]);

//   const exportToExcel = async () => {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Machine Data");

//     worksheet.addRow([
//       "Line", "Process No", "Page", "Card No.", "Model", 
//       "Day", "Line/Group", "Machine No.", "Station/Process", "Work Detail",
//       "Cycle", "Work Time", "Work Hours", "Method", "Criterion"
//     ]);

//     // Apply the same filtering logic as the table display
//     machineData.forEach((item) => {
//       (item.processNos || [])
//         .filter((processNo) => isProcessNoFiltered(processNo)) // Apply the same filter
//         .forEach((processNo) => {
//           const totalCount = item.counts?.[processNo] || 0;

//           for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
//             const key = `${processNo}-${pageNum}`;
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

//   if (!Array.isArray(machineData) || machineData.length === 0) {
//     return <div className="p-3">No machine data available.</div>;
//   }

//   if (loading) {
//     return (
//       <div className="p-3">
//         <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//           <span className="ms-2">Loading detailed inspection data...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-3">
//       <div className="d-flex align-items-center gap-3 mb-3">
//         <button className="btn btn-success" onClick={exportToExcel}>
//           📥 Download Excel
//         </button>

//         {/* Process No Filter */}
//         <div className="d-flex align-items-center gap-2">
//           <label htmlFor="processNoFilter" className="form-label mb-0">
//             Filter:
//           </label>
//           <input
//             type="text"
//             id="processNoFilter"
//             className="form-control"
//             placeholder="Enter process number"
//             value={processNoFilter}
//             onChange={(e) => setProcessNoFilter(e.target.value)}
//             style={{ width: "200px" }}
//           />
//           <div className="form-check">
//             <input
//               className="form-check-input"
//               type="checkbox"
//               id="exactMatch"
//               checked={exactMatch}
//               onChange={(e) => setExactMatch(e.target.checked)}
//             />
//             <label className="form-check-label" htmlFor="exactMatch">
//               Exact match
//             </label>
//           </div>
//         </div>
//       </div>

//       <div className="container-fluid border rounded p-3" style={{ backgroundColor: "#f8f9fa" }}>
//         <div className="table-responsive" style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto", overflowX: "auto" }}>
//         <table className="table table-bordered table-striped table-hover">
//           <thead className="table-primary" style={{ position: "sticky", top: 0, backgroundColor: "#cfe2ff" }}>
//             <tr>
//               <th>Line</th>
//               <th>Process No</th>
//               <th>Page</th>
//               <th>Card No.</th>
//               <th>Model</th>
//               <th>Day</th>
//               <th>Line/Group</th>
//               <th>Machine No.</th>
//               <th>Station/Process</th>
//               <th>Work Detail</th>
//               <th>Cycle</th>
//               <th>Work Time</th>
//               <th>Work Hours</th>
//               <th>Method</th>
//               <th>Criterion</th>
//             </tr>
//           </thead>
//           <tbody>
//             {machineData.map((item, index) =>
//               (item.processNos || [])
//                 .filter((processNo) => isProcessNoFiltered(processNo))
//                 .flatMap((processNo) => {
//                 const totalCount = item.counts?.[processNo] || 0;
//                 const rows = [];
//                 for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
//                   const key = `${processNo}-${pageNum}`;
//                   const details = detailedItems?.[item.line]?.[key] || [];
//                   console.log(`Rendering details for ${item.line} - ${key}:`, details);

//                   if (details.length === 0) {
//                     rows.push(
//                       <tr key={`${item.line}-${key}-${index}`}>
//                         <td>{item.line}</td>
//                         <td>{processNo}</td>
//                         <td>{pageNum}</td>
//                         <td colSpan={12} className="text-muted">No inspection data available</td>
//                       </tr>
//                     );
//                   } else {
//                     details.forEach((detail, i) => {
//                       rows.push(
//                         <tr key={`${item.line}-${key}-${index}-${i}`}>
//                           <td>{item.line}</td>
//                           <td>{processNo}</td>
//                           <td>{pageNum}</td>
//                           <td>{detail?.cardNo ?? "-"}</td>
//                           <td>{detail?.model ?? "-"}</td>
//                           <td>{detail?.d?.[0] !== 9999 ? detail.d[0] : "-"}</td>
//                           <td>{detail?.line ?? "-"}</td>
//                           <td>{detail?.model ?? "-"}</td>
//                           <td>{detail?.processNo ?? "-"}</td>
//                           <td>{detail?.workDetail ?? "-"}</td>
//                           <td>{detail?.cycle ?? "-"}</td>
//                           <td>{detail?.workTime ?? "-"}</td>
//                           <td>{detail?.wHr ?? "-"}</td>
//                           <td>{detail?.methodWssNo ?? "-"}</td>
//                           <td>{detail?.criterion ?? "-"}</td>
//                         </tr>
//                       );
//                     });
//                   }
//                 }
//                 return rows;
//               })
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//     </div>
//   );
// }

// export default MachineListTable;

// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";
// import React, { useEffect, useState } from "react";
// import axios from "axios";

// function MachineListTable({ machineData, dailyStatusActions }) {
//   const [detailedItems, setDetailedItems] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [processNoFilter, setProcessNoFilter] = useState("");
//   const [exactMatch, setExactMatch] = useState(false);

//   // Unified function for fetching checklist data
//   const fetchCheckList = async (queryParams) => {
//     try {
//       // Validate that queryParams is provided
//       if (!queryParams || Object.keys(queryParams).length === 0) {
//         console.error("No query parameters provided");
//         return [];
//       }

//       console.log("API Request URL:", 'http://localhost:5051/head/headCheckList');
//       console.log("Query Parameters:", queryParams);

//       const response = await axios.get('http://localhost:5051/head/headCheckList', {
//         params: queryParams,
//         timeout: 10000
//       });

//       console.log("API Response:", response.data);
      
//       // Handle both response formats - return the checklist array
//       return response.data.headCheckList || response.data || [];
//     } catch (error) {
//       console.error("API Error Details:", {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status,
//         config: error.config,
//         url: error.config?.url
//       });
//       return [];
//     }
//   };

//   // Helper function to check if a processNo matches the current filter
//   const isProcessNoFiltered = (processNo) => {
//     if (!processNoFilter.trim()) return true;
    
//     const filterValue = processNoFilter.toLowerCase().replace(/\s+/g, '');
//     const processValue = processNo.toLowerCase().replace(/\s+/g, '');
    
//     if (exactMatch) {
//       // Exact match - must be exactly the same
//       return processValue === filterValue;
//     } else {
//       // Partial match - contains the filter value
//       return processValue.includes(filterValue);
//     }
//   };

//   useEffect(() => {
//     const fetchAllDetails = async () => {
//       if (!Array.isArray(machineData)) return;

//       setLoading(true);
//       const results = {};

//       for (const item of machineData) {
//         const line = item.line.trim();
//         console.log("Processing line:", line);

//         results[line] = results[line] || {};

//         for (const processNo of item.processNos || []) {
//           const totalCount = item.counts?.[processNo] || 0;

//           for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
//             try {
//               const key = `${processNo}-${pageNum}`;

//               let queryParams;

//               if (line === "Main 2-1" || line === "Main 1-2") {
//                 console.log("Using specific parameters for line:", line);
//                 queryParams = {
//                   line: ` ${line}`,  // Add space prefix to match the working URL
//                   processNo: ` ${processNo.trim()}`  // Add space prefix to match the working URL
//                 };
//               } else {
//                 console.log("Using standard parameters for line:", line);
//                 // Ensure the date is defined and passed correctly
//                 const date = item.date || new Date().toISOString().split('T')[0]; // Fallback to today's date if undefined
//                 queryParams = {
//                   date: date,
//                   shift: 'S',
//                   line: line,
//                   processNo: processNo.trim(),
//                   page: pageNum.toString()
//                 };
//               }

//               const checklist = await fetchCheckList(queryParams);
//               console.log(`Fetched data for ${line} - ${key}:`, checklist);

//               if (checklist && checklist.length > 0) {
//                 results[line][key] = checklist;
//                 console.log(`Stored data for ${line} - ${key}:`, results[line][key]);
//               }
//             } catch (error) {
//               console.error("Failed to fetch detail for", line, processNo, pageNum, error);
//             }
//           }
//         }
//       }

//       setDetailedItems(results);
//       console.log("Final results object:", results);
//       setLoading(false);
//     };

//     fetchAllDetails();
//   }, [machineData]);

//   const exportToExcel = async () => {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Machine Data");

//     worksheet.addRow([
//       "Line", "Process No", "Page", "Card No.", "Model", 
//       "Day", "Line/Group", "Machine No.", "Station/Process", "Work Detail",
//       "Cycle", "Work Time", "Work Hours", "Method", "Criterion"
//     ]);

//     // Apply the same filtering logic as the table display
//     machineData.forEach((item) => {
//       (item.processNos || [])
//         .filter((processNo) => isProcessNoFiltered(processNo)) // Apply the same filter
//         .forEach((processNo) => {
//           const totalCount = item.counts?.[processNo] || 0;

//           for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
//             const key = `${processNo}-${pageNum}`;
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

//   if (!Array.isArray(machineData) || machineData.length === 0) {
//     return <div className="p-3">No machine data available.</div>;
//   }

//   if (loading) {
//     return (
//       <div className="p-3">
//         <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//           <span className="ms-2">Loading detailed inspection data...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-3">
//       <div className="d-flex align-items-center gap-3 mb-3">
//         <button className="btn btn-success" onClick={exportToExcel}>
//           📥 Download Excel
//         </button>

//         {/* Process No Filter */}
//         <div className="d-flex align-items-center gap-2">
//           <label htmlFor="processNoFilter" className="form-label mb-0">
//             Filter:
//           </label>
//           <input
//             type="text"
//             id="processNoFilter"
//             className="form-control"
//             placeholder="Enter process number"
//             value={processNoFilter}
//             onChange={(e) => setProcessNoFilter(e.target.value)}
//             style={{ width: "200px" }}
//           />
//           <div className="form-check">
//             <input
//               className="form-check-input"
//               type="checkbox"
//               id="exactMatch"
//               checked={exactMatch}
//               onChange={(e) => setExactMatch(e.target.checked)}
//             />
//             <label className="form-check-label" htmlFor="exactMatch">
//               Exact match
//             </label>
//           </div>
//         </div>
//       </div>

//       <div className="container-fluid border rounded p-3" style={{ backgroundColor: "#f8f9fa" }}>
//         <div className="table-responsive" style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto", overflowX: "auto" }}>
//         <table className="table table-bordered table-striped table-hover">
//           <thead className="table-primary" style={{ position: "sticky", top: 0, backgroundColor: "#cfe2ff" }}>
//             <tr>
//               <th>Line</th>
//               <th>Process No</th>
//               <th>Page</th>
//               <th>Card No.</th>
//               <th>Model</th>
//               <th>Day</th>
//               <th>Line/Group</th>
//               <th>Machine No.</th>
//               <th>Station/Process</th>
//               <th>Work Detail</th>
//               <th>Cycle</th>
//               <th>Work Time</th>
//               <th>Work Hours</th>
//               <th>Method</th>
//               <th>Criterion</th>
//             </tr>
//           </thead>
//           <tbody>
//             {machineData.map((item, index) =>
//               (item.processNos || [])
//                 .filter((processNo) => isProcessNoFiltered(processNo))
//                 .flatMap((processNo) => {
//                 const totalCount = item.counts?.[processNo] || 0;
//                 const rows = [];
//                 for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
//                   const key = `${processNo}-${pageNum}`;
//                   const details = detailedItems?.[item.line]?.[key] || [];
//                   console.log(`Rendering details for ${item.line} - ${key}:`, details);

//                   if (details.length === 0) {
//                     rows.push(
//                       <tr key={`${item.line}-${key}-${index}`}>
//                         <td>{item.line}</td>
//                         <td>{processNo}</td>
//                         <td>{pageNum}</td>
//                         <td colSpan={12} className="text-muted">No inspection data available</td>
//                       </tr>
//                     );
//                   } else {
//                     details.forEach((detail, i) => {
//                       rows.push(
//                         <tr key={`${item.line}-${key}-${index}-${i}`}>
//                           <td>{item.line}</td>
//                           <td>{processNo}</td>
//                           <td>{pageNum}</td>
//                           <td>{detail?.cardNo ?? "-"}</td>
//                           <td>{detail?.model ?? "-"}</td>
//                           <td>{detail?.d?.[0] !== 9999 ? detail.d[0] : "-"}</td>
//                           <td>{detail?.line ?? "-"}</td>
//                           <td>{detail?.model ?? "-"}</td>
//                           <td>{detail?.processNo ?? "-"}</td>
//                           <td>{detail?.workDetail ?? "-"}</td>
//                           <td>{detail?.cycle ?? "-"}</td>
//                           <td>{detail?.workTime ?? "-"}</td>
//                           <td>{detail?.wHr ?? "-"}</td>
//                           <td>{detail?.methodWssNo ?? "-"}</td>
//                           <td>{detail?.criterion ?? "-"}</td>
//                         </tr>
//                       );
//                     });
//                   }
//                 }
//                 return rows;
//               })
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//     </div>
//   );
// }

// export default MachineListTable;



import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import React, { useEffect, useState } from "react";
import axios from "axios";

// API Configuration - automatically detects environment
const getApiBaseUrl = () => {
  // Check if we're in development (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5051';
  }
  
  // For production, use the same host as the current page
  // This assumes your API is served from the same domain
  return `${window.location.protocol}//${window.location.hostname}:5051`;
  
  // Alternative options:
  // 1. Use environment variable if available
  // return process.env.REACT_APP_API_BASE_URL || 'http://localhost:5051';
  
  // 2. Use a specific production URL
  // return 'http://your-production-server:5051';
  
  // 3. Use relative URLs (if API is on same server)
  // return '';
};

const API_BASE_URL = getApiBaseUrl();

function MachineListTable({ machineData, dailyStatusActions }) {
  const [detailedItems, setDetailedItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [processNoFilter, setProcessNoFilter] = useState("");
  const [exactMatch, setExactMatch] = useState(false);

  // Unified function for fetching checklist data
  const fetchCheckList = async (queryParams) => {
    try {
      // Validate that queryParams is provided
      if (!queryParams || Object.keys(queryParams).length === 0) {
        console.error("No query parameters provided");
        return [];
      }

      const apiUrl = `${API_BASE_URL}/head/headCheckList`;
      console.log("API Request URL:", apiUrl);
      console.log("Query Parameters:", queryParams);

      const response = await axios.get(apiUrl, {
        params: queryParams,
        timeout: 10000
      });

      console.log("Full API Response:", response.data);
      console.log("Response type:", typeof response.data);
      console.log("Is response.data an array?", Array.isArray(response.data));
      console.log("Response keys:", response.data ? Object.keys(response.data) : 'null response');
      
      // Handle both response formats - return the checklist array
      let result;
      if (response.data && response.data.headCheckList) {
        result = response.data.headCheckList;
        console.log("Using headCheckList property:", result.length, "items");
      } else if (Array.isArray(response.data)) {
        result = response.data;
        console.log("Using direct array response:", result.length, "items");
      } else if (response.data) {
        // Maybe the data is nested differently, let's check
        console.log("Unknown response structure, trying to find array data...");
        console.log("Full response.data:", JSON.stringify(response.data, null, 2));
        result = [];
      } else {
        result = [];
        console.log("No valid data found, returning empty array");
      }
      
      return result;
    } catch (error) {
      console.error("API Error Details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
        url: error.config?.url
      });
      return [];
    }
  };

  // Helper function to check if a processNo matches the current filter
  const isProcessNoFiltered = (processNo) => {
    if (!processNoFilter.trim()) return true;
    
    const filterValue = processNoFilter.toLowerCase().replace(/\s+/g, '');
    const processValue = processNo.toLowerCase().replace(/\s+/g, '');
    
    if (exactMatch) {
      // Exact match - must be exactly the same
      return processValue === filterValue;
    } else {
      // Partial match - contains the filter value
      return processValue.includes(filterValue);
    }
  };

  useEffect(() => {
    const fetchAllDetails = async () => {
      if (!Array.isArray(machineData)) return;

      setLoading(true);
      const results = {};

      for (const item of machineData) {
        // Normalize line name for consistent storage
        let storageLine = item.line.trim();
        // Remove any leading spaces for consistent storage key
        if (storageLine.startsWith(" ")) {
          storageLine = storageLine.substring(1);
        }
        
        console.log("Processing line:", item.line, "-> Storage key:", storageLine);

        results[storageLine] = results[storageLine] || {};

        for (const processNo of item.processNos || []) {
          const totalCount = item.counts?.[processNo] || 0;

          for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
            try {
              // Create consistent key for storage and retrieval
              const normalizedProcessNo = processNo.trim();
              let keyProcessNo;
              if (storageLine === "Main 2-1" || storageLine === "Main 1-2") {
                keyProcessNo = ` ${normalizedProcessNo}`; // Store with space prefix for Main lines
              } else {
                keyProcessNo = normalizedProcessNo; // Store without space for other lines
              }
              
              const key = `${keyProcessNo}-${pageNum}`;
              console.log(`Creating storage key for ${storageLine}: "${key}"`);

              let queryParams;
              
              // Use consistent parameter format for all lines
              const date = item.date || new Date().toISOString().split('T')[0]; // Fallback to today's date if undefined
              
              if (storageLine === "Main 2-1" || storageLine === "Main 1-2") {
                console.log("Using parameters for Main line:", storageLine);
                queryParams = {
                  date: date,
                  shift: 'S',
                  line: ` ${storageLine}`,  // Keep space prefix if needed for Main lines
                  processNo: ` ${normalizedProcessNo}`,  // Keep space prefix if needed for Main lines
                  page: pageNum.toString()
                };
              } else {
                console.log("Using standard parameters for line:", storageLine);
                queryParams = {
                  date: date,
                  shift: 'S',
                  line: storageLine,
                  processNo: normalizedProcessNo,
                  page: pageNum.toString()
                };
              }
              
              console.log(`Query params for ${storageLine}:`, queryParams);

              const checklist = await fetchCheckList(queryParams);
              console.log(`Raw API response for ${storageLine} - ${key}:`, checklist);
              console.log(`Is array? ${Array.isArray(checklist)}, Length: ${checklist?.length}`);

              if (checklist && checklist.length > 0) {
                results[storageLine][key] = checklist;
                console.log(`✅ Successfully stored data for ${storageLine} - ${key}:`, checklist.length, "items");
                console.log(`First item sample:`, checklist[0]);
              } else {
                console.log(`❌ No data received for ${storageLine} - ${key}, checklist:`, checklist);
                console.log(`Query params used:`, queryParams);
              }
            } catch (error) {
              console.error("Failed to fetch detail for", storageLine, processNo, pageNum, error);
            }
          }
        }
      }

      setDetailedItems(results);
      console.log("📊 Final results summary:");
      Object.keys(results).forEach(line => {
        const lineData = results[line];
        const totalItems = Object.keys(lineData).reduce((sum, key) => {
          return sum + (lineData[key]?.length || 0);
        }, 0);
        console.log(`  ${line}: ${Object.keys(lineData).length} keys, ${totalItems} total items`);
        console.log(`    Keys: [${Object.keys(lineData).map(k => `"${k}"`).join(', ')}]`);
      });
      setLoading(false);
    };

    fetchAllDetails();
  }, [machineData]);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Machine Data");

    worksheet.addRow([
      "Line", "Process No", "Page", "Card No.", "Model", 
      "Day", "Line/Group", "Machine No.", "Station/Process", "Work Detail",
      "Cycle", "Work Time", "Work Hours", "Method", "Criterion"
    ]);

    // Apply the same filtering logic as the table display
    machineData.forEach((item) => {
      (item.processNos || [])
        .filter((processNo) => isProcessNoFiltered(processNo)) // Apply the same filter
        .forEach((processNo) => {
          const totalCount = item.counts?.[processNo] || 0;

          for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
            // Use consistent key generation - same logic as storage
            const normalizedProcessNo = processNo.trim();
            let keyProcessNo;
            if (item.line === "Main 2-1" || item.line === "Main 1-2") {
              keyProcessNo = ` ${normalizedProcessNo}`; // Use space prefix for Main lines
            } else {
              keyProcessNo = normalizedProcessNo; // No space for other lines
            }
            
            const key = `${keyProcessNo}-${pageNum}`;
            console.log(`Excel export - looking for key: "${key}" in line: "${item.line}"`);
            const details = detailedItems?.[item.line]?.[key] || [];

            if (details.length === 0) {
              worksheet.addRow([
                item.line, processNo, pageNum,
                "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"
              ]);
            } else {
              details.forEach((detail) => {
                worksheet.addRow([
                  item.line, processNo, pageNum,
                  detail?.cardNo ?? "-", detail?.model ?? "-", detail?.d?.[0] !== 9999 ? detail.d[0] : "-",
                  detail?.line ?? "-", detail?.model ?? "-", detail?.processNo ?? "-",
                  detail?.workDetail ?? "-", detail?.cycle ?? "-", detail?.workTime ?? "-",
                  detail?.wHr ?? "-", detail?.methodWssNo ?? "-", detail?.criterion ?? "-"
                ]);
              });
            }
          }
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "MachineData.xlsx");
  };

  if (!Array.isArray(machineData) || machineData.length === 0) {
    return <div className="p-3">No machine data available.</div>;
  }

  if (loading) {
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
      <div className="d-flex align-items-center gap-3 mb-3">
        <button className="btn btn-success" onClick={exportToExcel}>
          📥 Download Excel
        </button>

        {/* Process No Filter */}
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
              {machineData.map((item, index) => {
                // Normalize line name for consistent lookup - same logic as storage
                let storageLine = item.line.trim();
                if (storageLine.startsWith(" ")) {
                  storageLine = storageLine.substring(1);
                }
                
                return (item.processNos || [])
                  .filter((processNo) => isProcessNoFiltered(processNo))
                  .flatMap((processNo) => {
                    const totalCount = item.counts?.[processNo] || 0;
                    const rows = [];
                    for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
                      // Use consistent key generation - same logic as storage
                      const normalizedProcessNo = processNo.trim();
                      let keyProcessNo;
                      if (storageLine === "Main 2-1" || storageLine === "Main 1-2") {
                        keyProcessNo = ` ${normalizedProcessNo}`; // Use space prefix for Main lines
                      } else {
                        keyProcessNo = normalizedProcessNo; // No space for other lines
                      }
                      
                      const key = `${keyProcessNo}-${pageNum}`;
                      const details = detailedItems?.[storageLine]?.[key] || [];
                      console.log(`Table render - Original Line: "${item.line}", Storage Line: "${storageLine}", ProcessNo: "${processNo}", Key: "${key}"`);
                      console.log(`Available keys for ${storageLine}:`, Object.keys(detailedItems?.[storageLine] || {}));
                      console.log(`Details found for key "${key}":`, details.length, "items");

                      if (details.length === 0) {
                        rows.push(
                          <tr key={`${item.line}-${key}-${index}`}>
                            <td>{item.line}</td>
                            <td>{processNo}</td>
                            <td>{pageNum}</td>
                            <td colSpan={12} className="text-muted">No inspection data available</td>
                          </tr>
                        );
                      } else {
                        details.forEach((detail, i) => {
                          rows.push(
                            <tr key={`${item.line}-${key}-${index}-${i}`}>
                              <td>{item.line}</td>
                              <td>{processNo}</td>
                              <td>{pageNum}</td>
                              <td>{detail?.cardNo ?? "-"}</td>
                              <td>{detail?.model ?? "-"}</td>
                              <td>{detail?.d?.[0] !== 9999 ? detail.d[0] : "-"}</td>
                              <td>{detail?.line ?? "-"}</td>
                              <td>{detail?.model ?? "-"}</td>
                              <td>{detail?.processNo ?? "-"}</td>
                              <td>{detail?.workDetail ?? "-"}</td>
                              <td>{detail?.cycle ?? "-"}</td>
                              <td>{detail?.workTime ?? "-"}</td>
                              <td>{detail?.wHr ?? "-"}</td>
                              <td>{detail?.methodWssNo ?? "-"}</td>
                              <td>{detail?.criterion ?? "-"}</td>
                            </tr>
                          );
                        });
                      }
                    }
                    return rows;
                  });
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MachineListTable;