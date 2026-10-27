import React, { useEffect, useState } from "react";
import { getAbnormality } from "../redux/abnormality/abnormalityActions";
import { useDispatch, useSelector } from "react-redux";
import AbnormilityDoc from "./AbnormalityDoc";
import DatePicker from "react-date-picker";
import GraphAbnormality from "./GraphAbnormality";
import Select from "react-select";
import * as XLSX from 'xlsx';
import "./SummaryAbnormality.css";

function SummaryAbnormality() {
  const [showGraph, setShowGraph] = useState(true);

  // beginning of Month (30 days ago)
  const getInitialFromDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  };

  const [fromDate, setFromDate] = useState(getInitialFromDate);
  const fromDt = fromDate.getDate();
  const fromMonth = fromDate.getMonth() + 1;
  const fromYear = fromDate.getFullYear();
  const fromDateSt = `${fromYear}-${fromMonth}-${fromDt}`;

  const [toDate, setToDate] = useState(new Date(Date.now()));
  const toNextDate = new Date(toDate);
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
    if (value !== "") {
      if (queryStr === "") {
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
    : abnormalities.abnormalities?.success
      ? abnormalities.abnormalities.abnormalities
      : [];

  const list = abnormalityList.map((item) => (
    <AbnormilityDoc
      key={item._id}
      item={item}
      fromDateSt={fromDateSt}
      toDateSt={toDateSt}
    />
  ));

  let total = 0;
  let complete = 0;
  let inprogress = 0;
  let pending = 0;
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
    const { name, value } = e.target;
    setFilterObject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const deptOptions = [
    { value: "", label: "All Dept" },
    { value: "S", label: "Production" },
    { value: "P", label: "Maintenance" },
  ];

  const deptHandler = (e) => {
    const val = e ? e.value : "";
    setFilterObject((prev) => ({
      ...prev,
      pS: val,
    }));
  };

  const options = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "inprogress", label: "Inprogress" },
    { value: "complete", label: "Complete" },
  ];

  const statusHandler = (e) => {
    const val = e ? e.value : "";
    setFilterObject((prev) => ({
      ...prev,
      status: val,
    }));
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

  const customFilterSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "28px",
      height: "28px",
      fontSize: "11px",
      borderRadius: "6px",
      borderColor: "#cbd5e1",
      minWidth: "90px",
      backgroundColor: "#ffffff",
      boxShadow: "none"
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 6px"
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: "2px"
    }),
    menu: (base) => ({
      ...base,
      fontSize: "12px",
      zIndex: 9999
    })
  };

  const downloadExcel = () => {
    if (abnormalityList.length === 0) {
      alert("No data to export");
      return;
    }

    const excelData = abnormalityList.map((item, index) => ({
      'S.No': index + 1,
      'Entry Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
      'Department': item.pS === 'S' ? 'Production' : item.pS === 'P' ? 'Maintenance' : item.pS || '',
      'Line': item.line || '',
      'Process No': item.processNo || '',
      'Item': item.workDetail,
      'Abnormality': item.abnormality || '',
      'Countermeasure': item.countermeasure || '',
      'Spare': item.spare || '',
      'PIC': item.pic || '',
      'Target Date': item.targetDate ? new Date(item.targetDate).toLocaleDateString() : '',
      'Status': item.status || ''
    }));

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
    const ws = XLSX.utils.json_to_sheet(finalData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Abnormalities");

    const colWidths = [
      { wch: 8 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 }
    ];
    ws['!cols'] = colWidths;

    const filename = `Abnormalities_${fromDateSt}_to_${toDateSt}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-3 abnormality-container">
      {/* Header Banner */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 bg-white border rounded-4 shadow-sm mb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 d-inline-flex align-items-center justify-content-center">
            <i className="bi bi-exclamation-octagon-fill fs-5"></i>
          </div>
          <div>
            <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              Summary of Abnormality
              <span className="badge bg-light text-primary border rounded-pill fs-6 fw-normal">
                {total}
              </span>
            </h5>
            <small className="text-muted">Track, review countermeasures, and update abnormalities</small>
          </div>
          <button
            className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1 ms-2"
            onClick={() => setShowGraph(!showGraph)}
          >
            <i className={`bi ${showGraph ? 'bi-eye-slash' : 'bi-bar-chart'}`}></i>
            <span>{showGraph ? "Hide Graph" : "Show Graph"}</span>
          </button>
        </div>

        {/* Date Range Picker Controls */}
        <div className="d-flex flex-wrap align-items-center gap-2 bg-light border rounded-pill px-3 py-1 shadow-sm abnormality-date-range">
          <span className="text-muted small fw-semibold">From</span>
          <DatePicker
            format="dd/MM/yyyy"
            value={fromDate}
            onChange={setFromDate}
            clearIcon={null}
          />
          <span className="text-muted small fw-semibold ms-2">To</span>
          <DatePicker
            format="dd/MM/yyyy"
            value={toDate}
            onChange={setToDate}
            clearIcon={null}
          />
        </div>
      </div>

      {/* Chart and Action Controls Bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div>
          {showGraph && <GraphAbnormality labels={labels} data={data} />}
        </div>
        <div className="d-flex align-items-center gap-2 ms-auto mt-auto mb-2">
          <button
            className="btn btn-sm btn-success rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
            onClick={downloadExcel}
            disabled={abnormalityList.length === 0}
          >
            <i className="bi bi-file-earmark-excel-fill"></i>
            <span>Download Excel</span>
          </button>
          <button
            className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
            onClick={clearFilterHandler}
          >
            <i className="bi bi-arrow-counterclockwise"></i>
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Abnormality Records Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="abnormality-scroll-wrapper">
          <table className="table abnormality-table table-hover align-middle mb-0">
            <thead>
              {/* Header Titles Row */}
              <tr className="header-title-row">
                <th scope="col" style={{ minWidth: "95px" }}>Entry Date</th>
                <th scope="col" style={{ minWidth: "95px" }}>Card Date</th>
                <th scope="col" style={{ width: "90px" }}>Dept</th>
                <th scope="col" style={{ minWidth: "90px" }}>Line</th>
                <th scope="col" style={{ minWidth: "70px" }}>OP</th>
                <th scope="col" style={{ minWidth: "150px" }}>Item</th>
                <th scope="col" style={{ minWidth: "180px" }}>Abnormality</th>
                <th scope="col" style={{ minWidth: "180px" }}>Countermeasure</th>
                <th scope="col" style={{ minWidth: "85px" }}>Spare</th>
                <th scope="col" style={{ minWidth: "85px" }}>PIC</th>
                <th scope="col" style={{ minWidth: "95px" }}>Target</th>
                <th scope="col" style={{ minWidth: "120px", textAlign: "center" }}>Status</th>
                <th scope="col" style={{ minWidth: "220px", textAlign: "center" }}>Actions</th>
              </tr>
              {/* Filter inputs row */}
              <tr className="header-filter-row">
                <th>
                  <input
                    type="text"
                    name="entryDate"
                    placeholder="Filter date"
                    onChange={filterHandler}
                    value={filterObject.entryDate}
                    className="abnormality-filter-input"
                  />
                </th>
                <th></th>
                <th>
                  <Select
                    options={deptOptions}
                    menuPlacement="bottom"
                    onChange={deptHandler}
                    placeholder="All"
                    isClearable={false}
                    styles={customFilterSelectStyles}
                  />
                </th>
                <th>
                  <input
                    type="text"
                    name="line"
                    placeholder="Line"
                    onChange={filterHandler}
                    value={filterObject.line}
                    className="abnormality-filter-input"
                  />
                </th>
                <th>
                  <input
                    type="text"
                    name="processNo"
                    placeholder="OP"
                    onChange={filterHandler}
                    value={filterObject.processNo}
                    className="abnormality-filter-input"
                  />
                </th>
                <th>
                  <input
                    type="text"
                    name="item"
                    placeholder="Filter item"
                    onChange={filterHandler}
                    value={filterObject.item}
                    className="abnormality-filter-input"
                  />
                </th>
                <th>
                  <input
                    type="text"
                    name="abnormality"
                    placeholder="Filter abnormality"
                    onChange={filterHandler}
                    value={filterObject.abnormality}
                    className="abnormality-filter-input"
                  />
                </th>
                <th>
                  <input
                    type="text"
                    name="countermeasure"
                    placeholder="Filter countermeasure"
                    onChange={filterHandler}
                    value={filterObject.countermeasure}
                    className="abnormality-filter-input"
                  />
                </th>
                <th>
                  <input
                    type="text"
                    name="spare"
                    placeholder="Spare"
                    onChange={filterHandler}
                    value={filterObject.spare}
                    className="abnormality-filter-input"
                  />
                </th>
                <th>
                  <input
                    type="text"
                    name="pic"
                    placeholder="PIC"
                    onChange={filterHandler}
                    value={filterObject.pic}
                    className="abnormality-filter-input"
                  />
                </th>
                <th>
                  <input
                    type="text"
                    name="target"
                    placeholder="Target"
                    onChange={filterHandler}
                    value={filterObject.target}
                    className="abnormality-filter-input"
                  />
                </th>
                <th>
                  <Select
                    options={options}
                    menuPlacement="bottom"
                    onChange={statusHandler}
                    placeholder="Status"
                    isClearable={false}
                    styles={customFilterSelectStyles}
                  />
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.length > 0 ? (
                list
              ) : (
                <tr>
                  <td colSpan={13} className="text-center py-5">
                    <div className="py-4">
                      <div className="d-inline-flex align-items-center justify-content-center bg-light text-muted rounded-circle mb-3" style={{ width: 56, height: 56 }}>
                        <i className="bi bi-shield-check fs-2"></i>
                      </div>
                      <h6 className="fw-bold text-dark mb-1">No Abnormalities Found</h6>
                      <p className="text-muted small mb-0">No records match the current filter criteria and date range.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SummaryAbnormality;
