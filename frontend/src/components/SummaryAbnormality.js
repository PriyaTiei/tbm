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
      'Entry Date': item.entryDate ? new Date(item.entryDate).toLocaleDateString() : '',
      'Department': item.pS === 'S' ? 'Production' : item.pS === 'P' ? 'Maintenance' : item.pS || '',
      'Line': item.line || '',
      'Process No': item.processNo || '',
      'Item': item.item || '',
      'Abnormality': item.abnormality || '',
      'Countermeasure': item.countermeasure || '',
      'Spare': item.spare || '',
      'PIC': item.pic || '',
      'Target Date': item.target ? new Date(item.target).toLocaleDateString() : '',
      'Status': item.status || ''
    }));

    // Add summary data at the top
    const summaryData = [
      { 'S.No': 'SUMMARY', 'Entry Date': '', 'Department': '', 'Line': '', 'Process No': '', 'Item': '', 'Abnormality': '', 'Countermeasure': '', 'Spare': '', 'PIC': '', 'Target Date': '', 'Status': '' },
      { 'S.No': 'Total Records', 'Entry Date': total, 'Department': '', 'Line': '', 'Process No': '', 'Item': '', 'Abnormality': '', 'Countermeasure': '', 'Spare': '', 'PIC': '', 'Target Date': '', 'Status': '' },
      { 'S.No': 'Complete', 'Entry Date': complete, 'Department': '', 'Line': '', 'Process No': '', 'Item': '', 'Abnormality': '', 'Countermeasure': '', 'Spare': '', 'PIC': '', 'Target Date': '', 'Status': '' },
      { 'S.No': 'Pending', 'Entry Date': pending, 'Department': '', 'Line': '', 'Process No': '', 'Item': '', 'Abnormality': '', 'Countermeasure': '', 'Spare': '', 'PIC': '', 'Target Date': '', 'Status': '' },
      { 'S.No': 'In Progress', 'Entry Date': inprogress, 'Department': '', 'Line': '', 'Process No': '', 'Item': '', 'Abnormality': '', 'Countermeasure': '', 'Spare': '', 'PIC': '', 'Target Date': '', 'Status': '' },
      { 'S.No': '', 'Entry Date': '', 'Department': '', 'Line': '', 'Process No': '', 'Item': '', 'Abnormality': '', 'Countermeasure': '', 'Spare': '', 'PIC': '', 'Target Date': '', 'Status': '' },
      { 'S.No': 'ABNORMALITY RECORDS', 'Entry Date': '', 'Department': '', 'Line': '', 'Process No': '', 'Item': '', 'Abnormality': '', 'Countermeasure': '', 'Spare': '', 'PIC': '', 'Target Date': '', 'Status': '' }
    ];

    const finalData = [...summaryData, ...excelData];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(finalData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Abnormalities");

    // Auto-width columns
    const colWidths = [
      { wch: 8 }, // S.No
      { wch: 12 }, // Entry Date
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
    <div>
      <div className="d-flex align-items-center bg-info ">
        <h3 className="mx-3  text-center ">Summary of Abnormality </h3>
        {showGraph ? (
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowGraph(false)}
          >
            Hide Graph
          </button>
        ) : (
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowGraph(true)}
          >
            Show Graph
          </button>
        )}

   
        <div className="ms-auto me-3">
          <span>From</span>
          <DatePicker
            format="dd/MM/yyyy"
            value={fromDate}
            onChange={setFromDate}
            clearIcon={null}
          />
          <span className="ms-3">To</span>
          <DatePicker format="dd/MM/yyyy" value={toDate} onChange={setToDate} clearIcon={null} />
        </div>
      </div>

      <div className="d-flex justify-content-between " >
        {showGraph ? <GraphAbnormality labels={labels} data={data} /> : null}
        <div className="d-flex gap-2" style={{"marginBottom":"16px", "marginTop":"auto" , "marginLeft":"auto", "marginRight":"16px" }}>
          <button
            className="btn btn-success"
            style={{"height":"40px"}}
            onClick={downloadExcel}
            disabled={abnormalityList.length === 0}
          >
            📊 Download Excel
          </button>
          <button
            className="btn btn-primary"
            style={{"height":"40px"}}
            onClick={clearFilterHandler}
          > 
            Clear Filters
          </button>
        </div>
      </div>

      <div className="overflow-auto " style={{ height: "65vh", width: "97vw", paddingBottom: "10%" }}>
      
         
        <table className="m-3   table table-bordered table-sm table-hover text-dark ">
          {/* <table className="m-5 border border-black-50 text-light"> */}
          <thead>
            <tr>
              <th>Entry Date</th>
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

              <td>
                <Select
                  className="d-inline"
                  options={deptOptions}
                  // defaultValue={{ value: "", label: "" }}
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