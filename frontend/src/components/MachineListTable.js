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

//   const fetchCheckList = async (queryParams) => {
//     try {
//       // Build query string to match the exact format: spaces as %20
//       const queryString = Object.keys(queryParams)
//         .map(key => {
//           const value = queryParams[key];
//           // Encode spaces as %20 to match the working URL format
//           const encodedValue = encodeURIComponent(value).replace(/%20/g, '%20');
//           return `${key}=${encodedValue}`;
//         })
//         .join('&');

//       const url = `http://localhost:5050/checkList?${queryString}`;
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
//         config: error.config
//       });
//       return [];
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

//               if (line === "Main 2-1") {
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

//     machineData.forEach((item) => {
//       (item.processNos || []).forEach((processNo) => {
//         const totalCount = item.counts?.[processNo] || 0;

//         for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
//           const key = `${processNo}-${pageNum}`;
//           const details = detailedItems?.[item.line]?.[key] || [];

//           if (details.length === 0) {
//             worksheet.addRow([
//               item.line, processNo, pageNum,
//               "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"
//             ]);
//           } else {
//             details.forEach((detail) => {
//               worksheet.addRow([
//                 item.line, processNo, pageNum,
//                 detail?.cardNo ?? "-", detail?.model ?? "-", detail?.d?.[0] !== 9999 ? detail.d[0] : "-",
//                 detail?.line ?? "-", detail?.model ?? "-", detail?.processNo ?? "-",
//                 detail?.workDetail ?? "-", detail?.cycle ?? "-", detail?.workTime ?? "-",
//                 detail?.wHr ?? "-", detail?.methodWssNo ?? "-", detail?.criterion ?? "-"
//               ]);
//             });
//           }
//         }
//       });
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
//                 .filter((processNo) => {
//                   // Filter by process number if filter is provided
//                   if (!processNoFilter.trim()) return true;
                  
//                   const filterValue = processNoFilter.toLowerCase().replace(/\s+/g, '');
//                   const processValue = processNo.toLowerCase().replace(/\s+/g, '');
                  
//                   if (exactMatch) {
//                     // Exact match - must be exactly the same
//                     return processValue === filterValue;
//                   } else {
//                     // Partial match - contains the filter value
//                     return processValue.includes(filterValue);
//                   }
//                 })
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

function MachineListTable({ machineData, dailyStatusActions }) {
  const [detailedItems, setDetailedItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [processNoFilter, setProcessNoFilter] = useState("");
  const [exactMatch, setExactMatch] = useState(false);

  const fetchHeadCheckList = async (queryParams) => {
    try {
      console.log("API Request URL:", 'http://localhost:5051/head/headCheckList');
      console.log("Query Parameters:", queryParams);

      const response = await axios.get('http://localhost:5051/head/headCheckList', {
        params: queryParams,
        timeout: 10000
      });

      console.log("API Response:", response.data);
      return response.data.headCheckList || [];
    } catch (error) {
      console.error("API Error Details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      return [];
    }
  };

  const fetchCheckList = async (queryParams) => {
    try {
      // Build query string to match the exact format: spaces as %20
      const queryString = Object.keys(queryParams)
        .map(key => {
          const value = queryParams[key];
          // Encode spaces as %20 to match the working URL format
          const encodedValue = encodeURIComponent(value).replace(/%20/g, '%20');
          return `${key}=${encodedValue}`;
        })
        .join('&');

      const url = `http://localhost:5050/checkList?${queryString}`;
      console.log("API Request URL:", url);

      const response = await axios.get(url, {
        timeout: 10000
      });

      console.log("API Response:", response.data);
      return response.data || [];
    } catch (error) {
      console.error("API Error Details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
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
        const line = item.line.trim();
        console.log("Processing line:", line);

        results[line] = results[line] || {};

        for (const processNo of item.processNos || []) {
          const totalCount = item.counts?.[processNo] || 0;

          for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
            try {
              const key = `${processNo}-${pageNum}`;

              if (line === "Main 2-1") {
                console.log("Using alternative API for line:", line);

                const queryParams = {
                  line: ` ${line}`,  // Add space prefix to match the working URL
                  processNo: ` ${processNo.trim()}`  // Add space prefix to match the working URL
                };

                const checklist = await fetchCheckList(queryParams);
                console.log(`Fetched data for ${line} - ${key}:`, checklist);

                if (checklist && checklist.length > 0) {
                  results[line][key] = checklist;
                  console.log(`Stored data for ${line} - ${key}:`, results[line][key]);
                }
              } else {
                console.log("Using primary API for line:", line);

                // Ensure the date is defined and passed correctly
                const date = item.date || new Date().toISOString().split('T')[0]; // Fallback to today's date if undefined
                const queryParams = {
                  date: date,
                  shift: 'S',
                  line: line,
                  processNo: processNo.trim(),
                  page: pageNum.toString()
                };

                const checklist = await fetchHeadCheckList(queryParams);
                console.log(`Fetched data for ${line} - ${key}:`, checklist);

                if (checklist && checklist.length > 0) {
                  results[line][key] = checklist;
                  console.log(`Stored data for ${line} - ${key}:`, results[line][key]);
                }
              }
            } catch (error) {
              console.error("Failed to fetch detail for", line, processNo, pageNum, error);
            }
          }
        }
      }

      setDetailedItems(results);
      console.log("Final results object:", results);
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
            const key = `${processNo}-${pageNum}`;
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
            {machineData.map((item, index) =>
              (item.processNos || [])
                .filter((processNo) => isProcessNoFiltered(processNo))
                .flatMap((processNo) => {
                const totalCount = item.counts?.[processNo] || 0;
                const rows = [];
                for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
                  const key = `${processNo}-${pageNum}`;
                  const details = detailedItems?.[item.line]?.[key] || [];
                  console.log(`Rendering details for ${item.line} - ${key}:`, details);

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
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

export default MachineListTable;