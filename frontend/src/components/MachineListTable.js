// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";
// import React, { useEffect, useState } from "react";
// import axios from "axios"; // Make sure axios is installed: npm install axios

// function MachineListTable({ machineData, dailyStatusActions }) {
//   const [detailedItems, setDetailedItems] = useState({});
//   const [loading, setLoading] = useState(false);

//   // Function to call your backend API
//   const fetchHeadCheckList = async (queryParams) => {
//     try {
//       console.log("API Request URL:", 'http://localhost:5051/head/headCheckList');
//       console.log("Query Parameters:", queryParams);
      
//       const response = await axios.get('http://localhost:5051/head/headCheckList', {
//         params: queryParams,
//         // Add timeout and better error handling
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

//   useEffect(() => {
//     const fetchAllDetails = async () => {
//       if (!Array.isArray(machineData)) return;

//       setLoading(true);
//       const results = {};

//       for (const item of machineData) {
//         const line = item.line;
//         results[line] = results[line] || {};

//         for (const processNo of item.processNos || []) {
//           const totalCount = item.counts?.[processNo] || 0;

//           // For each page (1 to totalCount)
//           for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
//             // Extract date components from item.date (assuming format YYYY-MM-DD or similar)
//             const date = new Date(item.date);
//             const day = date.getDate();
//             const month = date.getMonth() + 1; // JavaScript months are 0-indexed
//             const year = date.getFullYear();
//             const week = Math.ceil(day / 7); // Simple week calculation

//             // Try different parameter formats - the API might expect different names
//             // const queryParams = {
//             //   // Option 1: Current format
//             //   d: day.toString(),
//             //   w: week.toString(),
//             //   m: month.toString(),
//             //   y: year.toString(),
//             //   pS: 'S',
//             //   line: line.trim(),
//             //   processNo: processNo.trim(),
//             //   page: pageNum.toString()
//             // };

//             // Alternative formats to try if the above doesn't work:
//             // Option 2: Different parameter names
//             // const queryParams = {
//             //   day: day.toString(),
//             //   week: week.toString(),
//             //   month: month.toString(),
//             //   year: year.toString(),
//             //   shift: 'S',
//             //   line: line.trim(),
//             //   processNo: processNo.trim(),
//             //   page: pageNum.toString()
//             // };

//             // Option 3: Date as single parameter
//             const queryParams = {
//               date: item.date,
//               shift: 'S',
//               line: line.trim(),
//               processNo: processNo.trim(),
//               page: pageNum.toString()
//             };

//             try {
//               const checklist = await fetchHeadCheckList(queryParams);
//               const key = `${processNo}-${pageNum}`;
              
//               if (checklist && checklist.length > 0) {
//                 results[line][key] = checklist;
//                 console.log(`Successfully fetched data for ${line}-${key}:`, checklist);
//               } else {
//                 console.log(`No data returned for ${line}-${key}`);
//               }
//             } catch (error) {
//               console.error("Failed to fetch detail for", line, processNo, pageNum, error);
//             }
//           }
//         }
//       }

//       setDetailedItems(results);
//       setLoading(false);
//     };

//     fetchAllDetails();
//   }, [machineData]);

//   const exportToExcel = async () => {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Machine Data");

//     worksheet.addRow([
//       "Line", "Process No", "Page", "Matrix Card No.", "Ledger No.",
//       "Day", "Line/Group", "Machine No.", "Station / Line", "Inspection Item",
//       "Frequency", "Area to Inspect", "Time", "Inspection Method", "Standard Value"
//     ]);

//     machineData.forEach((item) => {
//       (item.processNos || []).forEach((processNo) => {
//         const totalCount = item.counts?.[processNo] || 0;

//         // Create a row for each page (1 to totalCount)
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
//                 detail?.matrixCardNo ?? "-", detail?.ledgerNo ?? "-", detail?.day ?? "-",
//                 detail?.lineGroup ?? "-", detail?.machineNo ?? "-", detail?.station ?? "-",
//                 detail?.inspectionItem ?? "-", detail?.frequency ?? "-", detail?.area ?? "-",
//                 detail?.time ?? "-", detail?.method ?? "-", detail?.standard ?? "-"
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
//       <button className="btn btn-success mb-3" onClick={exportToExcel}>
//         📥 Download Excel
//       </button>

//       <div
//         className="table-responsive"
//         style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}
//       >
//         <table className="table table-bordered table-striped table-hover">
//           <thead
//             className="table-primary"
//             style={{
//               position: "sticky",
//               top: 0,
//               backgroundColor: "#cfe2ff",
//             }}
//           >
//             <tr>
//               <th>Line</th>
//               <th>Process No</th>
//               <th>Page</th>
//               <th>Matrix Card No.</th>
//               <th>Ledger No.</th>
//               <th>Day</th>
//               <th>Line/Group</th>
//               <th>Machine No.</th>
//               <th>Station / Line</th>
//               <th>Inspection Item</th>
//               <th>Frequency</th>
//               <th>Area to Inspect</th>
//               <th>Time</th>
//               <th>Inspection Method</th>
//               <th>Standard Value</th>
//             </tr>
//           </thead>
//           <tbody>
//             {machineData.map((item, index) =>
//               (item.processNos || []).flatMap((processNo) => {
//                 const totalCount = item.counts?.[processNo] || 0;

//                 // Create rows for each page (1 to totalCount)
//                 const rows = [];
//                 for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
//                   const key = `${processNo}-${pageNum}`;
//                   const details = detailedItems?.[item.line]?.[key] || [];

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
//                           <td>{detail?.matrixCardNo ?? "-"}</td>
//                           <td>{detail?.ledgerNo ?? "-"}</td>
//                           <td>{detail?.day ?? "-"}</td>
//                           <td>{detail?.lineGroup ?? "-"}</td>
//                           <td>{detail?.machineNo ?? "-"}</td>
//                           <td>{detail?.station ?? "-"}</td>
//                           <td>{detail?.inspectionItem ?? "-"}</td>
//                           <td>{detail?.frequency ?? "-"}</td>
//                           <td>{detail?.area ?? "-"}</td>
//                           <td>{detail?.time ?? "-"}</td>
//                           <td>{detail?.method ?? "-"}</td>
//                           <td>{detail?.standard ?? "-"}</td>
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
      const url = new URL('http://localhost:5050/checkList');
      Object.keys(queryParams).forEach(key => {
        url.searchParams.append(key, queryParams[key]);
      });

      console.log("API Request URL:", url.toString());

      const response = await axios.get(url.toString(), {
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

              if (line === "Main 1-2 - 2") {
                console.log("Using alternative API for line:", line);

                const queryParams = {
                  line: "Main 1-2",
                  processNo: processNo.trim()
                };

                const checklist = await fetchCheckList(queryParams);

                if (checklist && checklist.length > 0) {
                  results[line][key] = checklist;
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

                if (checklist && checklist.length > 0) {
                  results[line][key] = checklist;
                }
              }
            } catch (error) {
              console.error("Failed to fetch detail for", line, processNo, pageNum, error);
            }
          }
        }
      }

      setDetailedItems(results);
      setLoading(false);
    };

    fetchAllDetails();
  }, [machineData]);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Machine Data");

    worksheet.addRow([
      "Line", "Process No", "Page", "Matrix Card No.", "Ledger No.",
      "Day", "Line/Group", "Machine No.", "Station / Line", "Inspection Item",
      "Frequency", "Area to Inspect", "Time", "Inspection Method", "Standard Value"
    ]);

    machineData.forEach((item) => {
      (item.processNos || []).forEach((processNo) => {
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
                detail?.matrixCardNo ?? "-", detail?.ledgerNo ?? "-", detail?.day ?? "-",
                detail?.lineGroup ?? "-", detail?.machineNo ?? "-", detail?.station ?? "-",
                detail?.inspectionItem ?? "-", detail?.frequency ?? "-", detail?.area ?? "-",
                detail?.time ?? "-", detail?.method ?? "-", detail?.standard ?? "-"
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
      <button className="btn btn-success mb-3" onClick={exportToExcel}>
        📥 Download Excel
      </button>

      <div className="table-responsive" style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}>
        <table className="table table-bordered table-striped table-hover">
          <thead className="table-primary" style={{ position: "sticky", top: 0, backgroundColor: "#cfe2ff" }}>
            <tr>
              <th>Line</th>
              <th>Process No</th>
              <th>Page</th>
              <th>Matrix Card No.</th>
              <th>Ledger No.</th>
              <th>Day</th>
              <th>Line/Group</th>
              <th>Machine No.</th>
              <th>Station / Line</th>
              <th>Inspection Item</th>
              <th>Frequency</th>
              <th>Area to Inspect</th>
              <th>Time</th>
              <th>Inspection Method</th>
              <th>Standard Value</th>
            </tr>
          </thead>
          <tbody>
            {machineData.map((item, index) =>
              (item.processNos || []).flatMap((processNo) => {
                const totalCount = item.counts?.[processNo] || 0;
                const rows = [];
                for (let pageNum = 1; pageNum <= totalCount; pageNum++) {
                  const key = `${processNo}-${pageNum}`;
                  const details = detailedItems?.[item.line]?.[key] || [];

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
                          <td>{detail?.matrixCardNo ?? "-"}</td>
                          <td>{detail?.ledgerNo ?? "-"}</td>
                          <td>{detail?.day ?? "-"}</td>
                          <td>{detail?.lineGroup ?? "-"}</td>
                          <td>{detail?.machineNo ?? "-"}</td>
                          <td>{detail?.station ?? "-"}</td>
                          <td>{detail?.inspectionItem ?? "-"}</td>
                          <td>{detail?.frequency ?? "-"}</td>
                          <td>{detail?.area ?? "-"}</td>
                          <td>{detail?.time ?? "-"}</td>
                          <td>{detail?.method ?? "-"}</td>
                          <td>{detail?.standard ?? "-"}</td>
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
  );
}

export default MachineListTable;
