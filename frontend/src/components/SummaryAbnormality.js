import React, { useEffect, useState } from "react";
import { getAbnormality } from "../redux/abnormality/abnormalityActions";
import { useDispatch, useSelector } from "react-redux";
import AbnormilityDoc from "./AbnormalityDoc";
import DatePicker from "react-date-picker";
import GraphAbnormality from "./GraphAbnormality";
import Select from "react-select";
import * as XLSX from "xlsx";

const compactFilterSelect = {
  control: (provided) => ({
    ...provided,
    minHeight: "28px",
    height: "28px",
    fontSize: "0.78rem",
    borderRadius: "6px",
    borderColor: "#cbd5e1",
    boxShadow: "none",
    padding: "0",
    "&:hover": { borderColor: "#94a3b8" },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "0 6px",
    height: "28px",
  }),
  input: (provided) => ({
    ...provided,
    margin: "0px",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (provided) => ({
    ...provided,
    padding: "2px",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    fontSize: "0.78rem",
  }),
  option: (provided, state) => ({
    ...provided,
    padding: "4px 8px",
    fontSize: "0.78rem",
    backgroundColor: state.isSelected ? "#2563eb" : state.isFocused ? "#eff6ff" : "#fff",
    color: state.isSelected ? "#fff" : "#1e293b",
    cursor: "pointer",
  }),
};

function SummaryAbnormality() {
  const [showGraph, setShowGraph] = useState(false);

  // Beginning of Month (30 days ago)
  const beginingDate = new Date(Date.now());
  beginingDate.setDate(beginingDate.getDate() - 30);

  // From date
  const [fromDate, setFromDate] = useState(beginingDate);
  const fromDt = fromDate.getDate();
  const fromMonth = fromDate.getMonth() + 1;
  const fromYear = fromDate.getFullYear();
  const fromDateSt = `${fromYear}-${fromMonth}-${fromDt}`;

  // To next date
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
    setFilterObject((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const deptOptions = [
    { value: "", label: "All Dept" },
    { value: "S", label: "Production" },
    { value: "P", label: "Maintenance" },
  ];

  const deptHandler = (e) => {
    setFilterObject((prev) => ({
      ...prev,
      pS: e ? e.value : "",
    }));
  };

  const options = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "inprogress", label: "Inprogress" },
    { value: "complete", label: "Complete" },
  ];

  const statusHandler = (e) => {
    setFilterObject((prev) => ({
      ...prev,
      status: e ? e.value : "",
    }));
  };

  const handleKpiStatusClick = (targetStatus) => {
    setFilterObject((prev) => ({
      ...prev,
      status: prev.status === targetStatus ? "" : targetStatus,
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

  // Excel download function
  const downloadExcel = () => {
    if (abnormalityList.length === 0) {
      alert("No data to export");
      return;
    }

    const excelData = abnormalityList.map((item, index) => ({
      "S.No": index + 1,
      "Issue Reported Date": item.createdAt
        ? new Date(item.createdAt).toLocaleDateString()
        : "",
      "Card Created Date": item.cardCreatedDate
        ? new Date(item.cardCreatedDate).toLocaleDateString()
        : item.createdAt
        ? new Date(item.createdAt).toLocaleDateString()
        : "",
      Department:
        item.pS === "S" ? "Production" : item.pS === "P" ? "Maintenance" : item.pS || "",
      Line: item.line || "",
      "Process No": item.processNo || "",
      Item: item.workDetail || "",
      Abnormality: item.abnormality || "",
      Countermeasure: item.countermeasure || "",
      Spare: item.spare || "",
      PIC: item.pic || "",
      "Target Date": item.targetDate
        ? new Date(item.targetDate).toLocaleDateString()
        : item.target
        ? new Date(item.target).toLocaleDateString()
        : "",
      Status: item.status || "",
    }));

    const summaryData = [
      { "S.No": "SUMMARY", "Issue Reported Date": "", "Card Created Date": "", Department: "", Line: "", "Process No": "", Item: "", Abnormality: "", Countermeasure: "", Spare: "", PIC: "", "Target Date": "", Status: "" },
      { "S.No": "Total Records", "Issue Reported Date": total, "Card Created Date": "", Department: "", Line: "", "Process No": "", Item: "", Abnormality: "", Countermeasure: "", Spare: "", PIC: "", "Target Date": "", Status: "" },
      { "S.No": "Complete", "Issue Reported Date": complete, "Card Created Date": "", Department: "", Line: "", "Process No": "", Item: "", Abnormality: "", Countermeasure: "", Spare: "", PIC: "", "Target Date": "", Status: "" },
      { "S.No": "Pending", "Issue Reported Date": pending, "Card Created Date": "", Department: "", Line: "", "Process No": "", Item: "", Abnormality: "", Countermeasure: "", Spare: "", PIC: "", "Target Date": "", Status: "" },
      { "S.No": "In Progress", "Issue Reported Date": inprogress, "Card Created Date": "", Department: "", Line: "", "Process No": "", Item: "", Abnormality: "", Countermeasure: "", Spare: "", PIC: "", "Target Date": "", Status: "" },
      { "S.No": "", "Issue Reported Date": "", "Card Created Date": "", Department: "", Line: "", "Process No": "", Item: "", Abnormality: "", Countermeasure: "", Spare: "", PIC: "", "Target Date": "", Status: "" },
      { "S.No": "ABNORMALITY RECORDS", "Issue Reported Date": "", "Card Created Date": "", Department: "", Line: "", "Process No": "", Item: "", Abnormality: "", Countermeasure: "", Spare: "", PIC: "", "Target Date": "", Status: "" }
    ];

    const finalData = [...summaryData, ...excelData];
    const ws = XLSX.utils.json_to_sheet(finalData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Abnormalities");

    const colWidths = [
      { wch: 8 },
      { wch: 18 },
      { wch: 16 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 18 },
      { wch: 22 },
      { wch: 22 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 }
    ];
    ws["!cols"] = colWidths;

    const filename = `Abnormalities_${fromDate.toISOString().split("T")[0]}_to_${toDate.toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const list = abnormalityList.map((item, index) => {
    return (
      <AbnormilityDoc
        key={item._id}
        index={index + 1}
        item={item}
        fromDateSt={fromDateSt}
        toDateSt={toDateSt}
      />
    );
  });

  return (
    <div className="px-3 py-2">
      {/* 1. Header Toolbar & Date Range Controls */}
      <div
        className="card border-0 shadow-sm rounded-4 mb-3"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
        }}
      >
        <div className="card-body p-3 px-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            {/* Title & Description */}
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
                <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2" style={{ letterSpacing: "0.2px" }}>
                  <span>Summary of Abnormality</span>
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
                    {total} Total
                  </span>
                </h5>
                <small className="text-muted d-block mt-0.5" style={{ fontSize: "0.82rem" }}>
                  Monitor machine defects, assign countermeasures, and track resolution target dates
                </small>
              </div>
            </div>

            {/* Action Buttons: Toggle Graph, Excel, Date Range */}
            <div className="d-flex align-items-center flex-wrap gap-2">
              {/* Date Range Picker */}
              <div
                className="d-flex align-items-center gap-1.5 rounded-pill px-3 py-1 shadow-sm"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <i className="bi bi-calendar3 text-primary me-1" style={{ fontSize: "0.85rem" }}></i>
                <span className="text-secondary small fw-semibold">From:</span>
                <DatePicker
                  format="dd/MM/yyyy"
                  value={fromDate}
                  onChange={setFromDate}
                  clearIcon={null}
                />
                <span className="text-secondary small fw-semibold ms-2">To:</span>
                <DatePicker
                  format="dd/MM/yyyy"
                  value={toDate}
                  onChange={setToDate}
                  clearIcon={null}
                />
              </div>

              {/* Toggle Graph */}
              <button
                className="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
                style={{
                  border: "1px solid #cbd5e1",
                  background: showGraph ? "#eff6ff" : "#ffffff",
                  color: showGraph ? "#1d4ed8" : "#475569",
                  borderColor: showGraph ? "#93c5fd" : "#cbd5e1",
                  fontSize: "0.82rem",
                }}
                onClick={() => setShowGraph(!showGraph)}
                title="Toggle Abnormality Status Chart"
              >
                <i className={`bi ${showGraph ? "bi-eye-slash-fill" : "bi-bar-chart-fill"}`}></i>
                <span>{showGraph ? "Hide Graph" : "Show Graph"}</span>
              </button>

              {/* Download Excel */}
              <button
                className="btn btn-sm btn-success rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
                style={{
                  background: "#16a34a",
                  borderColor: "#16a34a",
                  fontSize: "0.82rem",
                }}
                onClick={downloadExcel}
                disabled={abnormalityList.length === 0}
                title="Export filtered records to Excel"
              >
                <i className="bi bi-file-earmark-excel-fill"></i>
                <span>Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive KPI Summary Cards Bar */}
      <div className="row g-2 mb-3">
        {/* KPI 1: Total Abnormalities */}
        <div className="col-6 col-md-3">
          <div
            className={`card border-0 shadow-sm rounded-3 p-2.5 px-3 h-100 ${
              filterObject.status === "" ? "border-primary" : ""
            }`}
            style={{
              background: filterObject.status === "" ? "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" : "#ffffff",
              border: filterObject.status === "" ? "1.5px solid #3b82f6" : "1px solid #e2e8f0",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onClick={() => handleKpiStatusClick("")}
            title="Click to view all records"
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-secondary fw-semibold d-block" style={{ fontSize: "0.74rem" }}>
                  TOTAL ABNORMALITIES
                </small>
                <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.45rem" }}>
                  {total}
                </h4>
              </div>
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: "36px", height: "36px", background: "rgba(37, 99, 235, 0.1)", color: "#2563eb" }}
              >
                <i className="bi bi-collection-fill fs-6"></i>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 2: Pending Action */}
        <div className="col-6 col-md-3">
          <div
            className={`card border-0 shadow-sm rounded-3 p-2.5 px-3 h-100`}
            style={{
              background: filterObject.status === "pending" ? "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)" : "#ffffff",
              border: filterObject.status === "pending" ? "1.5px solid #f59e0b" : "1px solid #e2e8f0",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onClick={() => handleKpiStatusClick("pending")}
            title="Click to filter Pending items"
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-secondary fw-semibold d-block" style={{ fontSize: "0.74rem" }}>
                  PENDING ACTION
                </small>
                <h4 className="fw-bold mb-0 text-warning" style={{ fontSize: "1.45rem", color: "#d97706" }}>
                  {pending}
                </h4>
              </div>
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: "36px", height: "36px", background: "#fef3c7", color: "#d97706" }}
              >
                <i className="bi bi-clock-history fs-6"></i>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 3: In Progress */}
        <div className="col-6 col-md-3">
          <div
            className={`card border-0 shadow-sm rounded-3 p-2.5 px-3 h-100`}
            style={{
              background: filterObject.status === "inprogress" ? "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)" : "#ffffff",
              border: filterObject.status === "inprogress" ? "1.5px solid #0284c7" : "1px solid #e2e8f0",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onClick={() => handleKpiStatusClick("inprogress")}
            title="Click to filter In Progress items"
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-secondary fw-semibold d-block" style={{ fontSize: "0.74rem" }}>
                  IN PROGRESS
                </small>
                <h4 className="fw-bold mb-0" style={{ fontSize: "1.45rem", color: "#0284c7" }}>
                  {inprogress}
                </h4>
              </div>
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: "36px", height: "36px", background: "#e0f2fe", color: "#0284c7" }}
              >
                <i className="bi bi-gear-wide-connected fs-6"></i>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 4: Complete */}
        <div className="col-6 col-md-3">
          <div
            className={`card border-0 shadow-sm rounded-3 p-2.5 px-3 h-100`}
            style={{
              background: filterObject.status === "complete" ? "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)" : "#ffffff",
              border: filterObject.status === "complete" ? "1.5px solid #16a34a" : "1px solid #e2e8f0",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onClick={() => handleKpiStatusClick("complete")}
            title="Click to filter Completed items"
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-secondary fw-semibold d-block" style={{ fontSize: "0.74rem" }}>
                  RESOLVED & COMPLETE
                </small>
                <h4 className="fw-bold mb-0 text-success" style={{ fontSize: "1.45rem" }}>
                  {complete}
                </h4>
              </div>
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: "36px", height: "36px", background: "#dcfce7", color: "#16a34a" }}
              >
                <i className="bi bi-check2-circle fs-6"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Graph Display */}
      {showGraph && (
        <div className="mb-3">
          <GraphAbnormality labels={labels} data={data} />
        </div>
      )}

      {/* 3. Modern High-Density Table Card */}
      <div
        className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          className="overflow-auto"
          style={{ maxHeight: "65vh", width: "100%", paddingBottom: "16px" }}
        >
          <table
            className="table table-hover align-middle mb-0"
            style={{ fontSize: "0.82rem", minWidth: "1480px" }}
          >
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              {/* Header Titles */}
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ width: "45px", textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "#475569", padding: "10px 4px" }}>
                  #
                </th>
                <th style={{ minWidth: "110px", fontSize: "0.75rem", fontWeight: 700, color: "#475569", padding: "10px 8px" }}>
                  Reported Date
                </th>
                <th style={{ minWidth: "135px", fontSize: "0.75rem", fontWeight: 700, color: "#475569", padding: "10px 8px" }}>
                  Card Date
                </th>
                <th style={{ minWidth: "90px", textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "#475569", padding: "10px 8px" }}>
                  Dept.
                </th>
                <th style={{ minWidth: "95px", fontSize: "0.75rem", fontWeight: 700, color: "#475569", padding: "10px 8px" }}>
                  Line
                </th>
                <th style={{ minWidth: "85px", fontSize: "0.75rem", fontWeight: 700, color: "#475569", padding: "10px 8px" }}>
                  Station
                </th>
                <th style={{ minWidth: "165px", fontSize: "0.75rem", fontWeight: 700, color: "#475569", padding: "10px 8px" }}>
                  Inspection Item
                </th>
                <th style={{ minWidth: "210px", fontSize: "0.75rem", fontWeight: 700, color: "#475569", padding: "10px 8px" }}>
                  Abnormality / Defect
                </th>
                <th style={{ minWidth: "180px", fontSize: "0.75rem", fontWeight: 700, color: "#475569", padding: "10px 8px" }}>
                  Countermeasure
                </th>
                <th style={{ minWidth: "90px", fontSize: "0.75rem", fontWeight: 700, color: "#475569", padding: "10px 8px" }}>
                  Spare
                </th>
                <th style={{ minWidth: "95px", fontSize: "0.75rem", fontWeight: 700, color: "#475569", padding: "10px 8px" }}>
                  PIC
                </th>
                <th style={{ minWidth: "115px", fontSize: "0.75rem", fontWeight: 700, color: "#475569", padding: "10px 8px" }}>
                  Target Date
                </th>
                <th style={{ minWidth: "120px", textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "#475569", padding: "10px 8px" }}>
                  Status
                </th>
                <th style={{ minWidth: "185px", textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "#475569", padding: "10px 8px" }}>
                  Actions
                </th>
              </tr>

              {/* Sub-header: Live Filter Row */}
              <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #cbd5e1" }}>
                <td style={{ padding: "4px 2px", textAlign: "center" }}>
                  <i className="bi bi-funnel text-secondary" style={{ fontSize: "0.78rem" }}></i>
                </td>
                <td style={{ padding: "4px 6px" }}></td>
                <td style={{ padding: "4px 6px" }}></td>
                <td style={{ padding: "4px 6px" }}>
                  <Select
                    options={deptOptions}
                    value={deptOptions.find((o) => o.value === filterObject.pS) || deptOptions[0]}
                    menuPlacement="bottom"
                    onChange={deptHandler}
                    styles={compactFilterSelect}
                    isSearchable={false}
                  />
                </td>
                <td style={{ padding: "4px 6px" }}>
                  <input
                    type="text"
                    name="line"
                    placeholder="Line..."
                    onChange={filterHandler}
                    value={filterObject.line}
                    className="form-control form-control-sm"
                    style={{ height: "28px", fontSize: "0.78rem", borderRadius: "6px" }}
                  />
                </td>
                <td style={{ padding: "4px 6px" }}>
                  <input
                    type="text"
                    name="processNo"
                    placeholder="OP..."
                    onChange={filterHandler}
                    value={filterObject.processNo}
                    className="form-control form-control-sm"
                    style={{ height: "28px", fontSize: "0.78rem", borderRadius: "6px" }}
                  />
                </td>
                <td style={{ padding: "4px 6px" }}>
                  <input
                    type="text"
                    name="item"
                    placeholder="Search Item..."
                    onChange={filterHandler}
                    value={filterObject.item}
                    className="form-control form-control-sm"
                    style={{ height: "28px", fontSize: "0.78rem", borderRadius: "6px" }}
                  />
                </td>
                <td style={{ padding: "4px 6px" }}>
                  <input
                    type="text"
                    name="abnormality"
                    placeholder="Search Defect..."
                    onChange={filterHandler}
                    value={filterObject.abnormality}
                    className="form-control form-control-sm"
                    style={{ height: "28px", fontSize: "0.78rem", borderRadius: "6px" }}
                  />
                </td>
                <td style={{ padding: "4px 6px" }}>
                  <input
                    type="text"
                    name="countermeasure"
                    placeholder="Countermeasure..."
                    onChange={filterHandler}
                    value={filterObject.countermeasure}
                    className="form-control form-control-sm"
                    style={{ height: "28px", fontSize: "0.78rem", borderRadius: "6px" }}
                  />
                </td>
                <td style={{ padding: "4px 6px" }}>
                  <input
                    type="text"
                    name="spare"
                    placeholder="Spare..."
                    onChange={filterHandler}
                    value={filterObject.spare}
                    className="form-control form-control-sm"
                    style={{ height: "28px", fontSize: "0.78rem", borderRadius: "6px" }}
                  />
                </td>
                <td style={{ padding: "4px 6px" }}>
                  <input
                    type="text"
                    name="pic"
                    placeholder="PIC..."
                    onChange={filterHandler}
                    value={filterObject.pic}
                    className="form-control form-control-sm"
                    style={{ height: "28px", fontSize: "0.78rem", borderRadius: "6px" }}
                  />
                </td>
                <td style={{ padding: "4px 6px" }}></td>
                <td style={{ padding: "4px 6px" }}>
                  <Select
                    options={options}
                    value={options.find((o) => o.value === filterObject.status) || options[0]}
                    menuPlacement="bottom"
                    onChange={statusHandler}
                    styles={compactFilterSelect}
                    isSearchable={false}
                  />
                </td>
                <td style={{ padding: "4px 6px", textAlign: "center" }}>
                  <button
                    className="btn btn-sm btn-outline-secondary p-0 px-2.5 d-inline-flex align-items-center gap-1 shadow-xs"
                    style={{ height: "28px", fontSize: "0.74rem", borderRadius: "6px", fontWeight: 500 }}
                    onClick={clearFilterHandler}
                    title="Reset all column filters"
                  >
                    <i className="bi bi-arrow-counterclockwise"></i>
                    <span>Reset</span>
                  </button>
                </td>
              </tr>
            </thead>
            <tbody>
              {list && list.length > 0 ? (
                list
              ) : (
                <tr>
                  <td colSpan={14} className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary opacity-50"></i>
                    <div className="fw-semibold">No abnormality records found</div>
                    <small className="text-muted">Try adjusting the date range or filter criteria above</small>
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
