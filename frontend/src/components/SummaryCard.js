// import React, { useEffect, useState } from "react";
// import { getCards } from "../redux/card/cardActions";
// import { useDispatch, useSelector } from "react-redux";
// import CardDoc from "./CardDoc";
// import DatePicker from "react-date-picker";
// import GraphCard from "./GraphCard";
// import Select from "react-select";

// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";

// function SummaryCard() {
//   const [showGraph, setShowGraph] = useState(true);

//   // beginning of Month
//   var beginingDate = new Date(Date.now());
//   beginingDate.setDate(beginingDate.getDate() - 30); // fix to subtract 30 days

//   // from date
//   const [fromDate, setFromDate] = useState(beginingDate);
//   const fromDt = fromDate.getDate();
//   const fromMonth = fromDate.getMonth() + 1;
//   const fromYear = fromDate.getFullYear();
//   const fromDateSt = `${fromYear}-${fromMonth}-${fromDt}`;

//   // to next date
//   const [toDate, setToDate] = useState(new Date(Date.now()));
//   var toNextDate = new Date(toDate);
//   toNextDate.setDate(toNextDate.getDate() + 1);
//   const toDt = toNextDate.getDate();
//   const toMonth = toNextDate.getMonth() + 1;
//   const toYear = toNextDate.getFullYear();
//   const toDateSt = `${toYear}-${toMonth}-${toDt}`;

//   // Add judgement filter to filterObject
//   const [filterObject, setFilterObject] = useState({
//     entryDate: "",
//     pS: "",
//     line: "",
//     processNo: "",
//     item: "",
//     abnormality: "",
//     cardType: "",
//     status: "",
//     judgement: "", // added here
//   });

//   const dispatch = useDispatch();

//   let queryStr = "";

//   for (let key in filterObject) {
//     let value = filterObject[key];
//     if (value !== "") {
//       if (queryStr === "") {
//         queryStr = `${key}=${value}`;
//       } else {
//         queryStr = `${queryStr}&${key}=${value}`;
//       }
//     }
//   }

//   useEffect(() => {
//     dispatch(getCards(fromDateSt, toDateSt, queryStr));
//   }, [fromDate, toDate, filterObject]);

//   const cards = useSelector((state) => state.cards);
//   // const userDepartments = useSelector((state) => state.auth.departments);
//   const cardList = cards.loading
//     ? []
//     : cards.cards.success
//     ? cards.cards.cards
//     : [];

//   const list = cardList.map((item) => {
//     return (
//       <CardDoc
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
//   if (cardList.length > 0) {
//     total = cardList.length;
//     cardList.forEach((item) => {
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

//   const cardTypeOptions = [
//     { value: "red", label: "RED" },
//     { value: "white", label: "WHITE" },
//   ];

//   const cardTypeHandler = (e) => {
//     setFilterObject((filterObject) => {
//       filterObject["cardType"] = e.value;
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

//   // New Judgement options - customize values/labels as needed
//   const judgementFilter = [
//     { value: "OK", label: "OK" },
//     { value: "NG", label: "NG" },
//   ];

//   // Judgement filter handler
//   const setJudgementFilter = (e) => {
//     setFilterObject((filterObject) => {
//       filterObject["judgement"] = e.value;
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
//       cardType: "",
//       status: "",
//       judgement: "", // reset judgement filter
//     });
//   };

//   // Download to Excel
//   const handleDownloadExcel = async () => {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Card Summary");

//     // Add header row
//     worksheet.columns = [
//       { header: "ID", key: "_id", width: 25 },
//       { header: "Entry Date", key: "entryDate", width: 15 },
//       { header: "Department", key: "pS", width: 15 },
//       { header: "Line", key: "line", width: 10 },
//       { header: "Process No", key: "processNo", width: 15 },
//       { header: "Item", key: "item", width: 20 },
//       { header: "Abnormality", key: "abnormality", width: 30 },
//       { header: "Card Type", key: "cardType", width: 15 },
//       { header: "Status", key: "status", width: 15 },
//       { header: "Judgement", key: "judgement", width: 15 }, // added judgement in excel export
//     ];

//     // Add data rows
//     cardList.forEach((item) => {
//       worksheet.addRow({
//         _id: item._id,
//         entryDate: item.entryDate
//           ? new Date(item.entryDate).toLocaleDateString()
//           : "",
//         pS: item.pS,
//         line: item.line,
//         processNo: item.processNo,
//         item: item.item,
//         abnormality: item.abnormality,
//         cardType: item.cardType,
//         status: item.status,
//         judgement: item.judgement || "", // handle judgement field in data
//       });
//     });

//     // Create and save file
//     const buffer = await workbook.xlsx.writeBuffer();
//     const blob = new Blob([buffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     });
//     saveAs(blob, "CardSummary.xlsx");
//   };

//   return (
//   <div>
//     <div className="d-flex align-items-center bg-info">
//       <h3 className="mx-3 text-center">Summary of Cards</h3>
//       {showGraph ? (
//         <button
//           className="btn btn-outline-primary"
//           onClick={() => setShowGraph(false)}
//         >
//           Hide Graph
//         </button>
//       ) : (
//         <button
//           className="btn btn-outline-primary"
//           onClick={() => setShowGraph(true)}
//         >
//           Show Graph
//         </button>
//       )}
//       <div className="ms-auto me-3 d-flex align-items-center">
//         <span className="me-2">From</span>
//         <DatePicker
//           format="dd/MM/yyyy"
//           value={fromDate}
//           onChange={setFromDate}
//           clearIcon={null}
//         />
//         <span className="ms-3 me-2">To</span>
//         <DatePicker
//           format="dd/MM/yyyy"
//           value={toDate}
//           onChange={setToDate}
//           clearIcon={null}
//         />
//       </div>
//     </div>

//     <div className="d-flex justify-content-end mt-2 me-4">
//       <button
//         className="btn btn-primary me-2"
//         style={{ height: "40px" }}
//         onClick={clearFilterHandler}
//       >
//         Clear Filters
//       </button>
//       <button
//         className="btn btn-success"
//         style={{ height: "40px" }}
//         onClick={handleDownloadExcel}
//       >
//         Download Excel
//       </button>
//     </div>

//     <div
//       className="overflow-auto"
//       style={{ height: "65vh", width: "97vw", paddingBottom: "10%" }}
//     >
//       <table className="m-3 table table-bordered table-sm table-hover text-dark">
//         <thead>
//           <tr>
//             <th>Entry_Date</th>
//             <th>Dept.</th>
//             <th>Line</th>
//             <th>OP</th>
//             <th>Item</th>
//             <th>Abnormality</th>
//             <th>Card Type</th>
//             <th>Status</th>
//             <th>Judgement</th>
//             <th style={{ minWidth: "100px" }}>Image</th>
//             <th style={{ minWidth: "100px" }}>Measurement</th>
//             <th style={{ minWidth: "100px" }}>Standard Value</th>
//             <th style={{ minWidth: "100px" }}>Actual Value</th>
//             <th style={{ minWidth: "100px" }}>Delete</th>
//             <th style={{ minWidth: "100px" }}>Update</th>
//             <th></th>
//           </tr>
//           <tr>
//             <td>{/* Optional: Date filter */}</td>
//             <td>
//               <Select
//                 className="d-inline"
//                 options={deptOptions}
//                 onChange={deptHandler}
//               />
//             </td>
//             <td>
//               <input
//                 type="text"
//                 name="line"
//                 onChange={filterHandler}
//                 value={filterObject["line"]}
//                 className="w-100"
//               />
//             </td>
//             <td>
//               <input
//                 type="text"
//                 name="processNo"
//                 onChange={filterHandler}
//                 value={filterObject["processNo"]}
//                 className="w-100"
//               />
//             </td>
//             <td>
//               <input
//                 type="text"
//                 name="item"
//                 onChange={filterHandler}
//                 value={filterObject["item"]}
//                 className="w-100"
//               />
//             </td>
//             <td>
//               <input
//                 type="text"
//                 name="abnormality"
//                 onChange={filterHandler}
//                 value={filterObject["abnormality"]}
//                 className="w-100"
//               />
//             </td>
//             <td>
//               <Select
//                 className="d-inline"
//                 options={cardTypeOptions}
//                 onChange={cardTypeHandler}
//               />
//             </td>
//             <td>
//               <Select
//                 className="d-inline"
//                 options={options}
//                 onChange={statusHandler}
//               />
//             </td>
//             <td>
//               <Select
//                 options={[
//                   { value: "All", label: "All" },
//                   { value: "OK", label: "OK" },
//                   { value: "NG", label: "NG" },
//                 ]}
//                 defaultValue={{ value: "All", label: "All" }}
//                 onChange={(selected) => setJudgementFilter(selected.value)}
//               />
//             </td>
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//           </tr>
//         </thead>
//         <tbody>
//           {list
//             .filter((item) =>
//               judgementFilter === "All"
//                 ? true
//                 : item.judgement === judgementFilter
//             )
//             .map((item, index) => (
//               <tr key={index}>
//                 <td>{item.entryDate}</td>
//                 <td>{item.dept}</td>
//                 <td>{item.line}</td>
//                 <td>{item.processNo}</td>
//                 <td>{item.item}</td>
//                 <td>{item.abnormality}</td>
//                 <td>{item.cardType}</td>
//                 <td>{item.status}</td>
//                 <td>{item.judgement}</td>
//                 <td>{/* Image */}</td>
//                 <td>{item.measurement}</td>
//                 <td>{item.standardValue}</td>
//                 <td>{item.actualValue}</td>
//                 <td>{/* Delete Button */}</td>
//                 <td>{/* Update Button */}</td>
//                 <td></td>
//               </tr>
//             ))}
//         </tbody>
//       </table>
//     </div>
//   </div>
// );


// }

// export default SummaryCard;





import React, { useEffect, useState } from "react";
import { getCards } from "../redux/card/cardActions";
import { useDispatch, useSelector } from "react-redux";
import CardDoc from "./CardDoc";
import DatePicker from "react-date-picker";
import GraphCard from "./GraphCard";
import Select from "react-select";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

function SummaryCard() {
  const [showGraph, setShowGraph] = useState(true);

  // beginning of Month
  var beginingDate = new Date(Date.now());
  beginingDate.setDate(beginingDate.getDate() - 30);

  // from date
  const [fromDate, setFromDate] = useState(beginingDate);
  const fromDt = fromDate.getDate();
  const fromMonth = fromDate.getMonth() + 1;
  const fromYear = fromDate.getFullYear();
  const fromDateSt = `${fromYear}-${fromMonth.toString().padStart(2, '0')}-${fromDt.toString().padStart(2, '0')}`;

  // to next date
  const [toDate, setToDate] = useState(new Date(Date.now()));
  var toNextDate = new Date(toDate);
  toNextDate.setDate(toNextDate.getDate() + 1);
  const toDt = toNextDate.getDate();
  const toMonth = toNextDate.getMonth() + 1;
  const toYear = toNextDate.getFullYear();
  const toDateSt = `${toYear}-${toMonth.toString().padStart(2, '0')}-${toDt.toString().padStart(2, '0')}`;

  // Add judgement filter to filterObject
  const [filterObject, setFilterObject] = useState({
    entryDate: "",
    pS: "",
    line: "",
    processNo: "",
    item: "",
    abnormality: "",
    cardType: "",
    status: "",
    judgement: "",
  });

  // Add judgement filter state
  const [judgementFilter, setJudgementFilterState] = useState("All");

  const dispatch = useDispatch();

  let queryStr = "";

  for (let key in filterObject) {
    let value = filterObject[key];
    if (value !== "") {
      if (queryStr === "") {
        queryStr = `${key}=${value}`;
      } else {
        queryStr = `${queryStr}&${key}=${value}`;
      }
    }
  }

  useEffect(() => {
    console.log("Dispatching getCards with:", { fromDateSt, toDateSt, queryStr });
    dispatch(getCards(fromDateSt, toDateSt, queryStr));
  }, [fromDate, toDate, filterObject, dispatch, fromDateSt, toDateSt, queryStr]);

  const cards = useSelector((state) => state.cards);
  console.log("Cards from Redux:", cards); // Debug log

  const cardList = cards.loading
    ? []
    : cards.cards?.success
    ? cards.cards.cards
    : [];

  console.log("Processed cardList:", cardList); // Debug log

  const list = cardList.map((item) => {
    return (
      <CardDoc
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
  if (cardList.length > 0) {
    total = cardList.length;
    cardList.forEach((item) => {
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
    setFilterObject((prevFilterObject) => ({
      ...prevFilterObject,
      [e.target.name]: e.target.value,
    }));
  };

  const deptOptions = [
    { value: "", label: "All Departments" },
    { value: "S", label: "Production." },
    { value: "P", label: "Maintenance" },
  ];

  const deptHandler = (e) => {
    setFilterObject((prevFilterObject) => ({
      ...prevFilterObject,
      pS: e ? e.value : "",
    }));
  };

  const cardTypeOptions = [
    { value: "", label: "All Types" },
    { value: "red", label: "RED" },
    { value: "white", label: "WHITE" },
  ];

  const cardTypeHandler = (e) => {
    setFilterObject((prevFilterObject) => ({
      ...prevFilterObject,
      cardType: e ? e.value : "",
    }));
  };

  const options = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "inprogress", label: "Inprogress" },
    { value: "complete", label: "Complete" },
  ];

  const statusHandler = (e) => {
    setFilterObject((prevFilterObject) => ({
      ...prevFilterObject,
      status: e ? e.value : "",
    }));
  };

  const entryDateHandler = (date) => {
    setFilterObject((prevFilterObject) => ({
      ...prevFilterObject,
      entryDate: date,
    }));
  };

  const targetHandler = (date) => {
    setFilterObject((prevFilterObject) => ({
      ...prevFilterObject,
      target: date,
    }));
  };

  const judgementOptions = [
    { value: "All", label: "All" },
    { value: "OK", label: "OK" },
    { value: "NG", label: "NG" },
  ];

  // Fixed judgement filter handler
  const setJudgementFilter = (e) => {
    setJudgementFilterState(e ? e.value : "All");
  };

  const clearFilterHandler = () => {
    setFilterObject({
      entryDate: "",
      pS: "",
      line: "",
      processNo: "",
      item: "",
      abnormality: "",
      cardType: "",
      status: "",
      judgement: "",
    });
    setJudgementFilterState("All");
  };

  // Download to Excel
  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Card Summary");

    worksheet.columns = [
      { header: "ID", key: "_id", width: 25 },
      { header: "Entry Date", key: "entryDate", width: 15 },
      { header: "Department", key: "pS", width: 15 },
      { header: "Line", key: "line", width: 10 },
      { header: "Process No", key: "processNo", width: 15 },
      { header: "Item", key: "item", width: 20 },
      { header: "Abnormality", key: "abnormality", width: 30 },
      { header: "Card Type", key: "cardType", width: 15 },
      { header: "Status", key: "status", width: 15 },
      // { header: "Judgement", key: "judgement", width: 15 },
    ];

    cardList.forEach((item) => {
      worksheet.addRow({
        _id: item._id,
        entryDate: item.entryDate
          ? new Date(item.entryDate).toLocaleDateString()
          : "",
        pS: item.pS,
        line: item.line,
        processNo: item.processNo,
        item: item.item,
        abnormality: item.abnormality,
        cardType: item.cardType,
        status: item.status,
        // judgement: item.judgement || "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "CardSummary.xlsx");
  };

  // Filter the cardList based on judgement filter
  const filteredCardList = cardList.filter((item) => {
    if (judgementFilter === "All") return true;
    return item.judgement === judgementFilter;
  });

  console.log("Filtered cardList:", filteredCardList); // Debug log

  return (
    <div>
      <div className="d-flex align-items-center bg-info">
        <h3 className="mx-3 text-center">Summary of Cards</h3>
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
        <div className="ms-auto me-3 d-flex align-items-center">
          <span className="me-2">From</span>
          <DatePicker
            format="dd/MM/yyyy"
            value={fromDate}
            onChange={setFromDate}
            clearIcon={null}
          />
          <span className="ms-3 me-2">To</span>
          <DatePicker
            format="dd/MM/yyyy"
            value={toDate}
            onChange={setToDate}
            clearIcon={null}
          />
        </div>
      </div>

      {showGraph && (
        <GraphCard labels={labels} data={data} />
      )}

      <div className="d-flex justify-content-end mt-2 me-4">
        <button
          className="btn btn-primary me-2"
          style={{ height: "40px" }}
          onClick={clearFilterHandler}
        >
          Clear Filters
        </button>
        <button
          className="btn btn-success"
          style={{ height: "40px" }}
          onClick={handleDownloadExcel}
        >
          Download Excel
        </button>
      </div>

      <div className="mt-2 mb-2">
        <p>Total Cards: {cardList.length} | Filtered Cards: {filteredCardList.length}</p>
      </div>

      <div
        className="overflow-auto"
        style={{ height: "65vh", width: "97vw", paddingBottom: "10%" }}
      >
        <table className="m-3 table table-bordered table-sm table-hover text-dark">
          <thead>
            <tr>
              <th>Entry_Date</th>
              <th>Dept.</th>
              <th>Line</th>
              <th>OP</th>
              <th>Item</th>
              <th>Abnormality</th>
              <th>Card Type</th>
              <th>Status</th>
              {/* <th>Judgement</th> */}
              <th style={{ minWidth: "100px" }}>Image</th>
              <th style={{ minWidth: "100px" }}>Measurement</th>
              <th style={{ minWidth: "100px" }}>Standard Value</th>
              <th style={{ minWidth: "100px" }}>Actual Value</th>
              <th style={{ minWidth: "100px" }}>Delete</th>
              <th style={{ minWidth: "100px" }}>Update</th>
              <th></th>
            </tr>
            <tr>
              <td>
                <DatePicker
                  format="dd/MM/yyyy"
                  value={filterObject.entryDate}
                  onChange={entryDateHandler}
                  clearIcon={null}
                />
              </td>
              <td>
                <Select
                  className="d-inline"
                  options={deptOptions}
                  onChange={deptHandler}
                  isClearable
                  placeholder="Select Dept"
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
                <Select
                  className="d-inline"
                  options={cardTypeOptions}
                  onChange={cardTypeHandler}
                  isClearable
                  placeholder="Select Type"
                />
              </td>
              <td>
                <Select
                  className="d-inline"
                  options={options}
                  onChange={statusHandler}
                  isClearable
                  placeholder="Select Status"
                />
              </td>
              {/* <td>
                <Select
                  options={judgementOptions}
                  defaultValue={{ value: "All", label: "All" }}
                  onChange={setJudgementFilter}
                  isClearable
                />
              </td> */}
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {cards.loading ? (
              <tr>
                <td colSpan="16" className="text-center">Loading...</td>
              </tr>
            ) : cards.error ? (
              <tr>
                <td colSpan="16" className="text-center text-danger">
                  Error: {cards.error}
                </td>
              </tr>
            ) : filteredCardList.length === 0 ? (
              <tr>
                <td colSpan="16" className="text-center">No cards found</td>
              </tr>
            ) : (
              filteredCardList.map((item, index) => (
                <tr key={item._id || index}>
                  <td>{item.entryDate ? new Date(item.entryDate).toLocaleDateString() : ''}</td>
                  <td>{item.pS}</td>
                  <td>{item.line}</td>
                  <td>{item.processNo}</td>
                  <td>{item.item}</td>
                  <td>{item.abnormality}</td>
                  <td>{item.cardType}</td>
                  <td>{item.status}</td>
                  <td>{item.judgement}</td>
                  <td>{/* Image */}</td>
                  <td>{item.measurement}</td>
                  <td>{item.standardValue}</td>
                  <td>{item.actualValue}</td>
                  <td>{/* Delete Button */}</td>
                  <td>{/* Update Button */}</td>
                  <td></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SummaryCard;