// import React, { useEffect, useState } from "react";
// import { getAbnormality } from "../redux/abnormality/abnormalityActions";
// import { useDispatch, useSelector } from "react-redux";
// import AbnormilityDoc from "./AbnormalityDoc";
// import DatePicker from "react-date-picker";
// import GraphAbnormality from "./GraphAbnormality";
// import Select from "react-select";

// function SummaryAbnormality() {
//   const [showGraph, setShowGraph] = useState(true);

//   // begining of Month
//   var beginingDate = new Date(Date.now());
//   beginingDate.setDate(-30);
//   //from date
//   const [fromDate, setFromDate] = useState(beginingDate);
//   const fromDt = fromDate.getDate();
//   const fromMonth = fromDate.getMonth() + 1;
//   const fromYear = fromDate.getFullYear();
//   const fromDateSt = `${fromYear}-${fromMonth}-${fromDt}`;

//   //to next date
//   const [toDate, setToDate] = useState(new Date(Date.now()));
//   var toNextDate = new Date(toDate);
//   toNextDate.setDate(toNextDate.getDate() + 1);
//   const toDt = toNextDate.getDate();
//   const toMonth = toNextDate.getMonth() + 1;
//   const toYear = toNextDate.getFullYear();
//   const toDateSt = `${toYear}-${toMonth}-${toDt}`;
//   const [filterObject, setFilterObject] = useState({
//     entryDate: "",
//     pS: "",
//     line: "",
//     processNo: "",
//     item: "",
//     abnormality: "",
//     countermeasure: "",
//     spare: "",
//     pic: "",
//     target: "",
//     status: "",
//   });

//   const dispatch = useDispatch();
//   let queryStr = "";
//   for (let key in filterObject) {
//     let value = filterObject[key];

//     if (value != "") {
//       if (queryStr == "") {
//         queryStr = `${key}=${value}`;
//       } else {
//         queryStr = `${queryStr}&${key}=${value}`;
//       }
//     }
//   }

//   useEffect(() => {
//     dispatch(getAbnormality(fromDateSt, toDateSt, queryStr));
//   }, [dispatch, fromDate, toDate, filterObject]);


//   const abnormalities = useSelector((state) => state.abnormalities);
//   const abnormalityList = abnormalities.loading
//     ? []
//     : abnormalities.abnormalities.success
//     ? abnormalities.abnormalities.abnormalities
//     : [];

//   const list = abnormalityList.map((item) => {
//     return (
//       <AbnormilityDoc
//         key={item._id}
//         item={item}
//         fromDateSt={fromDateSt}
//         toDateSt={toDateSt}
//       />
//     );
//   });

//   var total = 0;
//   var complete = 0;
//   var inprogress = 0;
//   var pending = 0;
//   if (abnormalityList.length > 0) {
//     total = abnormalityList.length;
//     abnormalityList.forEach((item) => {
//       if (item.status === "complete") {
//         complete += 1;
//       }
//       if (item.status === "pending") {
//         pending += 1;
//       }
//       if (item.status === "inprogress") {
//         inprogress += 1;
//       }
//     });
//   }

//   const labels = ["Total", "Complete", "Pending", "Inprogress"];
//   const data = [total, complete, pending, inprogress];


//   const filterHandler = (e) => {
//     setFilterObject((filterObject) => {
//       filterObject[e.target.name] = e.target.value;
//       return {
//         ...filterObject,
//       };
//     });
//   };

//   const deptOptions = [
//     { value: "S", label: "Production." },
//     { value: "P", label: "Maintenance" },
//   ];

//   const deptHandler = (e) => {
//     setFilterObject((filterObject) => {
//       filterObject["pS"] = e.value;
//       return {
//         ...filterObject,
//       };
//     });
//   };

//   const options = [
//     { value: "pending", label: "Pending" },
//     { value: "inprogress", label: "Inprogress" },
//     { value: "complete", label: "Complete" },
//   ];

//   const statusHandler = (e) => {
//     setFilterObject((filterObject) => {
//       filterObject["status"] = e.value;
//       return {
//         ...filterObject,
//       };
//     });
//   };

//   const entryDateHandler = (date) => {
//     setFilterObject((filterObject) => {
//       filterObject["entryDate"] = date;
//       return {
//         ...filterObject,
//       };
//     });
//   };

//   const targetHandler = (date) => {
//     setFilterObject((filterObject) => {
//       filterObject["target"] = date;
//       return {
//         ...filterObject,
//       };
//     });
//   };
//   const clearFilterHandler = () => {
//     setFilterObject({
//       entryDate: "",
//       pS: "",
//       line: "",
//       processNo: "",
//       item: "",
//       abnormality: "",
//       countermeasure: "",
//       spare: "",
//       pic: "",
//       target: "",
//       status: "",
//     });
//   };
//   return (
//     <div>
//       <div className="d-flex align-items-center bg-info ">
//         <h3 className="mx-3  text-center ">Summary of Abnormality </h3>
//         {showGraph ? (
//           <button
//             className="btn btn-outline-primary"
//             onClick={() => setShowGraph(false)}
//           >
//             Hide Graph
//           </button>
//         ) : (
//           <button
//             className="btn btn-outline-primary"
//             onClick={() => setShowGraph(true)}
//           >
//             Show Graph
//           </button>
//         )}


//         <div className="ms-auto me-3">
//           <span>From</span>
//           <DatePicker
//             format="dd/MM/yyyy"
//             value={fromDate}
//             onChange={setFromDate}
//             clearIcon={null}
//           />
//           <span className="ms-3">To</span>
//           <DatePicker format="dd/MM/yyyy" value={toDate} onChange={setToDate} clearIcon={null} />
//         </div>
//       </div>

//           <div className="d-flex justify-content-between " >
//       {showGraph ? <GraphAbnormality labels={labels} data={data} /> : null}
//       <button
//           className="btn btn-primary d-block mx-5 d-inline-block "
//           style={{"height":"40px", "marginBottom":"16px", "marginTop":"auto" , "marginLeft":"auto", "marginRight":"16px" }}
//           onClick={clearFilterHandler}
//         > Clear Filters
//         </button>
//         </div>

//       <div className="overflow-auto " style={{ height: "65vh", width: "97vw", paddingBottom: "10%" }}>


//         <table className="m-3   table table-bordered table-sm table-hover text-dark ">
//           {/* <table className="m-5 border border-black-50 text-light"> */}
//           <thead>
//             <tr>
//               <th>Entry Date</th>
//               <th>Dept.</th>
//               <th>Line</th>
//               <th>OP</th>
//               <th>Item</th>
//               <th>Abnormality</th>
//               <th>Countermeasure</th>
//               <th>Spare</th>
//               <th>PIC</th>
//               <th>Target</th>
//               <th>Status</th>
//               <th></th>
//               <th></th>
//               <th></th>
//               <th></th>
//             </tr>
//             <tr>
//               <td>
//                 {/* <DatePicker
//                   value={filterObject.entryDate}
//                   onChange={entryDateHandler}
//                   clearIcon={null}
//                   // className="px-3"
//                 /> */}
//               </td>

//               <td>
//                 <Select
//                   className="d-inline"
//                   options={deptOptions}
//                   // defaultValue={{ value: "", label: "" }}
//                   menuPlacement="bottom"
//                   onChange={deptHandler}
//                 />
//               </td>

//               <td>
//                 <input
//                   type="text"
//                   name="line"
//                   onChange={filterHandler}
//                   value={filterObject["line"]}
//                   className="w-100"
//                 />
//               </td>

//               <td>
//                 <input
//                   type="text"
//                   name="processNo"
//                   onChange={filterHandler}
//                   value={filterObject["processNo"]}
//                   className="w-100"
//                 />
//               </td>

//               <td>
//                 <input
//                   type="text"
//                   name="item"
//                   onChange={filterHandler}
//                   value={filterObject["item"]}
//                   className="w-100"
//                 />
//               </td>

//               <td>
//                 <input
//                   type="text"
//                   name="abnormality"
//                   onChange={filterHandler}
//                   value={filterObject["abnormality"]}
//                   className="w-100"
//                 />
//               </td>

//               <td>
//                 <input
//                   type="text"
//                   name="countermeasure"
//                   onChange={filterHandler}
//                   value={filterObject["countermeasure"]}
//                   className="w-100"
//                 />
//               </td>

//               <td>
//                 <input
//                   type="text"
//                   name="spare"
//                   onChange={filterHandler}
//                   value={filterObject["spare"]}
//                   className="w-100"
//                 />
//               </td>

//               <td>
//                 <input
//                   type="text"
//                   name="pic"
//                   onChange={filterHandler}
//                   value={filterObject["pic"]}
//                   className="w-100"
//                 />
//               </td>

//               <td>
//                 {/* <DatePicker
//                   value={filterObject.target}
//                   onChange={targetHandler}
//                   clearIcon={null}
//                   // className="px-3"
//                 /> */}
//               </td>

//               <td>
//                 <Select
//                   className="d-inline"
//                   options={options}
//                   // defaultValue={{ value: "pending", label: "Pending" }}
//                   menuPlacement="bottom"
//                   onChange={statusHandler}
//                 />
//               </td>

//               <td></td>
//               <td></td>
//               <td></td>
//             </tr>
//           </thead>

//           <tbody>{list}</tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default SummaryAbnormality;


import React, { useEffect, useState } from "react";
import { getAbnormality } from "../redux/abnormality/abnormalityActions";
import { useDispatch, useSelector } from "react-redux";
import AbnormilityDoc from "./AbnormalityDoc";
import DatePicker from "react-date-picker";
import GraphAbnormality from "./GraphAbnormality";
import Select from "react-select";
import * as XLSX from 'xlsx';

function SummaryAbnormality() {
  const [showGraph, setShowGraph] = useState(true);

  // begining of Month
  var beginingDate = new Date(Date.now());
  beginingDate.setDate(-30);
  //from date
  const [fromDate, setFromDate] = useState(beginingDate);
  const fromDt = fromDate.getDate();
  const fromMonth = fromDate.getMonth() + 1;
  const fromYear = fromDate.getFullYear();
  const fromDateSt = `${fromYear}-${fromMonth}-${fromDt}`;

  //to next date
  const [toDate, setToDate] = useState(new Date(Date.now()));
  var toNextDate = new Date(toDate);
  toNextDate.setDate(toNextDate.getDate() + 1);
  const toDt = toNextDate.getDate();
  const toMonth = toNextDate.getMonth() + 1;
  const toYear = toNextDate.getFullYear();
  const toDateSt = `${toYear}-${toMonth}-${toDt}`;
  const [filterObject, setFilterObject] = useState({
    entryDate: "",
    pS: "",
    line: "",
    processNo: "",
    item: "",
    abnormality: "",
    countermeasure: "",
    spare: "",
    pic: "",
    target: "",
    status: "",
  });

  const dispatch = useDispatch();
  let queryStr = "";
  for (let key in filterObject) {
    let value = filterObject[key];

    if (value != "") {
      if (queryStr == "") {
        queryStr = `${key}=${value}`;
      } else {
        queryStr = `${queryStr}&${key}=${value}`;
      }
    }
  }

  useEffect(() => {
    dispatch(getAbnormality(fromDateSt, toDateSt, queryStr));
  }, [dispatch, fromDate, toDate, filterObject]);


  const abnormalities = useSelector((state) => state.abnormalities);
  const abnormalityList = abnormalities.loading
    ? []
    : abnormalities.abnormalities.success
      ? abnormalities.abnormalities.abnormalities
      : [];

  const list = abnormalityList.map((item) => {
    return (
      <AbnormilityDoc
        key={item._id}
        item={item}
        fromDateSt={fromDateSt}
        toDateSt={toDateSt}
      />
    );
  });

  var total = 0;
  var complete = 0;
  var inprogress = 0;
  var pending = 0;
  if (abnormalityList.length > 0) {
    total = abnormalityList.length;
    abnormalityList.forEach((item) => {
      if (item.status === "complete") {
        complete += 1;
      }
      if (item.status === "pending") {
        pending += 1;
      }
      if (item.status === "inprogress") {
        inprogress += 1;
      }
    });
  }

  const labels = ["Total", "Complete", "Pending", "Inprogress"];
  const data = [total, complete, pending, inprogress];


  const filterHandler = (e) => {
    setFilterObject((filterObject) => {
      filterObject[e.target.name] = e.target.value;
      return {
        ...filterObject,
      };
    });
  };

  const deptOptions = [
    { value: "S", label: "Production." },
    { value: "P", label: "Maintenance" },
  ];

  const deptHandler = (e) => {
    setFilterObject((filterObject) => {
      filterObject["pS"] = e.value;
      return {
        ...filterObject,
      };
    });
  };

  const options = [
    { value: "pending", label: "Pending" },
    { value: "inprogress", label: "Inprogress" },
    { value: "complete", label: "Complete" },
  ];

  const statusHandler = (e) => {
    setFilterObject((filterObject) => {
      filterObject["status"] = e.value;
      return {
        ...filterObject,
      };
    });
  };

  const entryDateHandler = (date) => {
    setFilterObject((filterObject) => {
      filterObject["entryDate"] = date;
      return {
        ...filterObject,
      };
    });
  };

  const targetHandler = (date) => {
    setFilterObject((filterObject) => {
      filterObject["target"] = date;
      return {
        ...filterObject,
      };
    });
  };

  const clearFilterHandler = () => {
    setFilterObject({
      entryDate: "",
      pS: "",
      line: "",
      processNo: "",
      item: "",
      abnormality: "",
      countermeasure: "",
      spare: "",
      pic: "",
      target: "",
      status: "",
    });
  };

  // Excel download function
  const downloadExcel = () => {
    if (abnormalityList.length === 0) {
      alert("No data to export");
      return;
    }

    // Prepare data for Excel
    const excelData = abnormalityList.map((item, index) => ({
      'S.No': index + 1,
      'Issue Reported Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
      'Card Created Date': item.cardCreatedDate ? new Date(item.cardCreatedDate).toLocaleDateString() : (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''),
      'Department': item.pS === 'S' ? 'Production' : item.pS === 'P' ? 'Maintenance' : item.pS || '',
      'Line': item.line || '',
      'Process No': item.processNo || '',
      'Item': item.workDetail,
      'Abnormality': item.abnormality || '',
      'Countermeasure': item.countermeasure || '',
      'Spare': item.spare || '',
      'PIC': item.pic || '',
      'Target Date': item.target ? new Date(item.target).toLocaleDateString() : '',
      'Status': item.status || ''
    }));

    // Add summary data at the top
    const summaryData = [
      { 'S.No': 'SUMMARY', 'Issue Reported Date': '', 'Card Created Date': '', 'Department': '', 'Line': '', 'Process No': '', 'Item': '', 'Abnormality': '', 'Countermeasure': '', 'Spare': '', 'PIC': '', 'Target Date': '', 'Status': '' },
      { 'S.No': 'Total Records', 'Issue Reported Date': total, 'Card Created Date': '', 'Department': '', 'Line': '', 'Process No': '', 'Item': '', 'Abnormality': '', 'Countermeasure': '', 'Spare': '', 'PIC': '', 'Target Date': '', 'Status': '' },
      { 'S.No': 'Complete', 'Issue Reported Date': complete, 'Card Created Date': '', 'Department': '', 'Line': '', 'Process No': '', 'Item': '', 'Abnormality': '', 'Countermeasure': '', 'Spare': '', 'PIC': '', 'Target Date': '', 'Status': '' },
      { 'S.No': 'Pending', 'Issue Reported Date': pending, 'Card Created Date': '', 'Department': '', 'Line': '', 'Process No': '', 'Item': '', 'Abnormality': '', 'Countermeasure': '', 'Spare': '', 'PIC': '', 'Target Date': '', 'Status': '' },
      { 'S.No': 'In Progress', 'Issue Reported Date': inprogress, 'Card Created Date': '', 'Department': '', 'Line': '', 'Process No': '', 'Item': '', 'Abnormality': '', 'Countermeasure': '', 'Spare': '', 'PIC': '', 'Target Date': '', 'Status': '' },
      { 'S.No': '', 'Issue Reported Date': '', 'Card Created Date': '', 'Department': '', 'Line': '', 'Process No': '', 'Item': '', 'Abnormality': '', 'Countermeasure': '', 'Spare': '', 'PIC': '', 'Target Date': '', 'Status': '' },
      { 'S.No': 'ABNORMALITY RECORDS', 'Issue Reported Date': '', 'Card Created Date': '', 'Department': '', 'Line': '', 'Process No': '', 'Item': '', 'Abnormality': '', 'Countermeasure': '', 'Spare': '', 'PIC': '', 'Target Date': '', 'Status': '' }
    ];

    const finalData = [...summaryData, ...excelData];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(finalData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Abnormalities");

    // Auto-width columns
    const colWidths = [
      { wch: 8 }, // S.No
      { wch: 18 }, // Issue Reported Date
      { wch: 16 }, // Card Created Date
      { wch: 12 }, // Department
      { wch: 10 }, // Line
      { wch: 12 }, // Process No
      { wch: 15 }, // Item
      { wch: 20 }, // Abnormality
      { wch: 20 }, // Countermeasure
      { wch: 10 }, // Spare
      { wch: 10 }, // PIC
      { wch: 12 }, // Target Date
      { wch: 12 }  // Status
    ];
    ws['!cols'] = colWidths;

    // Generate filename with date range
    const filename = `Abnormalities_${fromDate.toISOString().split('T')[0]}_to_${toDate.toISOString().split('T')[0]}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="px-3 py-2">
      {/* Summary of Abnormality Header Card */}
      <div
        className="card border-0 shadow-sm rounded-4 mb-3"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div className="card-body p-3 px-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            {/* Title, Icon, Badge & Subtitle */}
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 text-primary"
                style={{
                  width: "44px",
                  height: "44px",
                  background: "rgba(37, 99, 235, 0.1)",
                  fontSize: "1.25rem",
                  flexShrink: 0,
                }}
              >
                <i className="bi bi-exclamation-octagon-fill"></i>
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h5 className="mb-0 fw-bold text-dark" style={{ letterSpacing: "0.2px" }}>
                    Summary of Abnormality
                  </h5>
                  <span
                    className="badge rounded-pill fw-semibold"
                    style={{
                      background: "#eff6ff",
                      color: "#2563eb",
                      border: "1px solid #bfdbfe",
                      fontSize: "0.82rem",
                      padding: "3px 10px",
                    }}
                  >
                    {total}
                  </span>
                  <button
                    className="btn btn-sm rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1.5 ms-2"
                    style={{
                      border: "1px solid #cbd5e1",
                      background: "#f8fafc",
                      color: "#334155",
                      fontSize: "0.82rem",
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => setShowGraph(!showGraph)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#eff6ff";
                      e.currentTarget.style.borderColor = "#93c5fd";
                      e.currentTarget.style.color = "#1d4ed8";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.borderColor = "#cbd5e1";
                      e.currentTarget.style.color = "#334155";
                    }}
                  >
                    <i className={`bi ${showGraph ? "bi-eye-slash" : "bi-bar-chart"}`}></i>
                    <span>{showGraph ? "Hide Graph" : "Show Graph"}</span>
                  </button>
                </div>
                <small className="text-muted d-block mt-0.5" style={{ fontSize: "0.82rem" }}>
                  Track, review countermeasures, and update abnormalities
                </small>
              </div>
            </div>

            {/* Date Range Picker Controls */}
            <div
              className="d-flex align-items-center gap-2 rounded-pill px-3 py-1.5 shadow-sm"
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <span className="text-secondary small fw-semibold">From</span>
              <DatePicker
                format="dd/MM/yyyy"
                value={fromDate}
                onChange={setFromDate}
                clearIcon={null}
              />
              <span className="text-secondary small fw-semibold ms-2">To</span>
              <DatePicker
                format="dd/MM/yyyy"
                value={toDate}
                onChange={setToDate}
                clearIcon={null}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Action Controls Bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 px-1">
        <div>
          {showGraph && <GraphAbnormality labels={labels} data={data} />}
        </div>
        <div className="d-flex align-items-center gap-2 ms-auto mt-auto mb-1">
          <button
            className="btn btn-sm btn-success rounded-pill px-3.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
            style={{
              background: "#16a34a",
              borderColor: "#16a34a",
              fontSize: "0.85rem",
            }}
            onClick={downloadExcel}
            disabled={abnormalityList.length === 0}
          >
            <i className="bi bi-file-earmark-excel-fill"></i>
            <span>Download Excel</span>
          </button>
          <button
            className="btn btn-sm rounded-pill px-3.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
            style={{
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#475569",
              fontSize: "0.85rem",
            }}
            onClick={clearFilterHandler}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
              e.currentTarget.style.borderColor = "#94a3b8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.borderColor = "#cbd5e1";
            }}
          >
            <i className="bi bi-arrow-counterclockwise"></i>
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      <div className="overflow-auto " style={{ height: "65vh", width: "97vw", paddingBottom: "10%" }}>


        <table className="m-3   table table-bordered table-sm table-hover text-dark ">
          {/* <table className="m-5 border border-black-50 text-light"> */}
          <thead>
            <tr>
              <th>Issue Reported Date</th>
              <th>Card Created</th>
              <th>Dept.</th>
              <th>Line</th>
              <th>OP</th>
              <th>Item</th>
              <th>Abnormality</th>
              <th>Countermeasure</th>
              <th>Spare</th>
              <th>PIC</th>
              <th>Target</th>
              <th>Status</th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
            <tr>
              <td>
                {/* <DatePicker
                  value={filterObject.entryDate}
                  onChange={entryDateHandler}
                  clearIcon={null}
                  // className="px-3"
                /> */}
              </td>
              <td></td>
              <td>
                <Select
                  className="d-inline"
                  options={deptOptions}
                  menuPlacement="bottom"
                  onChange={deptHandler}
                />
              </td>

              <td>
                <input
                  type="text"
                  name="line"
                  onChange={filterHandler}
                  value={filterObject["line"]}
                  className="w-100"
                />
              </td>

              <td>
                <input
                  type="text"
                  name="processNo"
                  onChange={filterHandler}
                  value={filterObject["processNo"]}
                  className="w-100"
                />
              </td>

              <td>
                <input
                  type="text"
                  name="item"
                  onChange={filterHandler}
                  value={filterObject["item"]}
                  className="w-100"
                />
              </td>

              <td>
                <input
                  type="text"
                  name="abnormality"
                  onChange={filterHandler}
                  value={filterObject["abnormality"]}
                  className="w-100"
                />
              </td>

              <td>
                <input
                  type="text"
                  name="countermeasure"
                  onChange={filterHandler}
                  value={filterObject["countermeasure"]}
                  className="w-100"
                />
              </td>

              <td>
                <input
                  type="text"
                  name="spare"
                  onChange={filterHandler}
                  value={filterObject["spare"]}
                  className="w-100"
                />
              </td>

              <td>
                <input
                  type="text"
                  name="pic"
                  onChange={filterHandler}
                  value={filterObject["pic"]}
                  className="w-100"
                />
              </td>

              <td>
                {/* <DatePicker
                  value={filterObject.target}
                  onChange={targetHandler}
                  clearIcon={null}
                  // className="px-3"
                /> */}
              </td>

              <td>
                <Select
                  className="d-inline"
                  options={options}
                  // defaultValue={{ value: "pending", label: "Pending" }}
                  menuPlacement="bottom"
                  onChange={statusHandler}
                />
              </td>

              <td></td>
              <td></td>
              <td></td>
            </tr>
          </thead>

          <tbody>{list}</tbody>
        </table>
      </div>
    </div>
  );
}

export default SummaryAbnormality;