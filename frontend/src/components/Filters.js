import React, { Fragment, useState, useEffect, useRef } from "react";
import DatePicker from "react-date-picker";
import { useDispatch, useSelector } from "react-redux";
import {
  filterDate,
  filterDept,
  filterLine,
  filterMainLine,
  filterSubLine,
  filterCheck,
  filterGroup,
  filterProcessNo,
  filterCardNo
} from "../redux/filter/filterActions";
import Select from "react-select";
import { Button, Modal } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import Search_Modal from "./Search_Modal";
import SlideInNotification from "./common/Slicein";
import { useCookies } from "react-cookie";
import MultiLevelXAxisBarChart from "../BarChart";
import Verification from "./common/verification";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { downloadExcel } from "react-export-table-to-excel";
import { getPendingTasks } from "../redux/pendingTasks/pendingActions";
import axios from "axios";
import { useLocation } from "react-router-dom";

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    height: "38px",
    minHeight: "38px",
    borderRadius: "6px",
    borderColor: state.isFocused ? "#0d6efd" : "#ced4da",
    boxShadow: state.isFocused ? "0 0 0 1px #0d6efd" : "none",
    fontSize: "0.88rem",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    "&:hover": {
      borderColor: "#0d6efd",
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: "38px",
    padding: "0 8px",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#1e293b",
    fontWeight: 500,
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#64748b",
    fontSize: "0.85rem",
  }),
  input: (provided) => ({
    ...provided,
    margin: "0px",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    padding: "4px 8px",
    color: state.isFocused ? "#0d6efd" : "#94a3b8",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    borderRadius: "6px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
    overflow: "hidden",
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: "0.86rem",
    backgroundColor: state.isSelected
      ? "#0d6efd"
      : state.isFocused
      ? "#eff6ff"
      : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#1e293b",
    cursor: "pointer",
  }),
};

const todayDate = new Date(Date.now());


//getting week no
// Date.prototype.getWeek = function() {
//   var dt = new Date(this.getFullYear(), 0, 1);
//   return Math.ceil(((this - dt) / 86400000 + dt.getDay() + 1) / 7);
// };

// end week no

function Filters() {
  const selectLineRef = useRef(null);
  const [cookies] = useCookies(['token', 'userId']);
  const [date, setDate] = useState(todayDate);
  const [showSearch, setShowSearch] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showModals, setShowModals] = useState(false)

  const [relativeUrl, setRelativeUrl] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Construct the URL without the host
    const urlWithoutHost = `${location.pathname}`;
    setRelativeUrl(urlWithoutHost);

  }, [location]);


  useEffect(() => {
    if (relativeUrl == "/checkList" && "changedDate" in localStorage) {
      const dateString = localStorage.getItem("changedDate");
      const date = new Date(dateString);

      // Set a specific time if needed
      date.setHours(12, 22, 49);

      // Store the Date object, not a string
      setDate(date);
      localStorage.removeItem("changedDate")
    }
  }, [relativeUrl]);

  useEffect(() => {
    console.log(date)
  }, [date])


  const auth = useSelector((state) => state.auth);
  // const [header, setHeader] = useState([])
  // const [body, setBody] = useState([])



  const level = auth.user ? auth.user.level : 0;
  // const { loading, pendingTasksData } = pendingTasks;
  // const [pendingTasksData, setPendingTasksData] = useState([])
  const filters = useSelector((state) => state.filters);
  const { machineData } = useSelector((state) => state.machines);

  const getLineGroup = (line) => {
    if (!line) return "Other Lines";
    const lower = String(line).toLowerCase();
    if (lower.includes("assembly")) return "Assembly";
    if (
      lower.includes("block") ||
      lower.includes("crank") ||
      lower.includes("head") ||
      lower.includes("cam")
    ) {
      return "Machining";
    }
    return "Other Lines";
  };

  const allDiscoveredLinesRef = useRef(new Set());
  const prevDeptRef = useRef(filters.pS);

  // If department changes, reset discovered lines so new department lines are captured
  if (prevDeptRef.current !== filters.pS) {
    prevDeptRef.current = filters.pS;
    allDiscoveredLinesRef.current.clear();
  }

  if (machineData && machineData.machineData != undefined) {
    machineData.machineData.forEach((element) => {
      if (!element || !element.line) return;
      allDiscoveredLinesRef.current.add(element.line);
    });
  }

  const groupedLines = {};
  const uniqueGroups = new Set();
  const allSubLines = new Set();

  allDiscoveredLinesRef.current.forEach((lineName) => {
    const group = getLineGroup(lineName);
    uniqueGroups.add(group);
    if (!groupedLines[group]) {
      groupedLines[group] = new Set();
    }
    groupedLines[group].add(lineName);
    allSubLines.add(lineName);
  });

  const preferredOrder = ["Assembly", "Machining"];
  const otherGroups = Array.from(uniqueGroups).filter(
    (g) => !preferredOrder.includes(g)
  );
  const sortedGroupNames = [
    ...preferredOrder.filter((g) => uniqueGroups.has(g)),
    ...otherGroups,
  ];

  const lineOptions = [{ value: null, label: "All Lines" }];
  sortedGroupNames.forEach((groupName) => {
    lineOptions.push({
      value: groupName,
      label: groupName,
    });
  });

  const selectedMainLine = filters.mainLine ?? null;
  let subLineOptions = [];

  if (selectedMainLine && groupedLines[selectedMainLine]) {
    subLineOptions = [
      { value: null, label: `All ${selectedMainLine} Sub-lines` },
      ...Array.from(groupedLines[selectedMainLine]).sort().map((subLine) => ({
        value: subLine,
        label: subLine,
      })),
    ];
  } else {
    const groupedCategoryOptions = sortedGroupNames
      .map((groupName) => ({
        label: groupName,
        options: Array.from(groupedLines[groupName] || [])
          .sort()
          .map((subLine) => ({
            value: subLine,
            label: subLine,
          })),
      }))
      .filter((group) => group.options.length > 0);

    subLineOptions = [
      { value: null, label: "All Sub-lines" },
      ...groupedCategoryOptions,
    ];
  }

  // const totalCount = machines.loading
  //   ? { totalCountBlock: 0, totalCountCrank: 0, totalCountHead: 0 }
  //   : machines.machineData.success
  //   ? machines.machineData.totalCount
  //   : { totalCountBlock: 0, totalCountCrank: 0, totalCountHead: 0 };

  // const { totalCountBlock, totalCountCrank, totalCountHead } = totalCount;

  const dispatch = useDispatch();

  // useEffect(() => {
  //   axios.get(
  //     `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/reports/tbmFrequency`)
  //     .then((result) => {
  //       if (result.data.success) {
  //         setPendingTasksData(result.data?.frequencyTasks)
  //         // setCardList(result.data.dailyStatusAll)
  //       }
  //     })
  //     .catch((err) => {
  //       // console.log("error ", err);
  //       // toast.error(`Data could not be saved , ${err.message}`);
  //     });

  // }, [])

  // useEffect(() => {
  //   if (pendingTasksData.length) {


  //     const newHeader = ["SL NO", "OP NO", "WORK DETAIL", "LAST_COMPLETED", "FREQUENCY"];
  //     setHeader(newHeader);



  //     const newBody = pendingTasksData.map((task, index) => [
  //       index + 1, // SL NO

  //       task.top.opNo, // OP NO
  //       task.top.workDetail,
  //       task.top.entryFor && task.top.entryFor[task.top.entryFor.length - 1],
  //       task.top.frequency// WORK DETAIL


  //     ]);


  //     setBody(newBody);

  //   }
  // }, [pendingTasksData]);
  // useEffect(() => {
  //   if (level >= 100) {
  //     setShowModals(true)
  //   }
  // }, [level])
  // const filters = useSelector((state) => state.filters);
  // let queryStr = `d=${filters.d}&m=${filters.m}&y=${filters.y}&pS=${filters.pS}`;
  const deptOptions = [
    { value: "S", label: "Production Dept" },
    { value: "P", label: "Maint Dept" },
  ];

  const checkOptions = [
    { value: null, label: "All Check" },
    { value: "S", label: "Stop Check" },
    { value: "R", label: "Run Check" },
  ];
  const groupOptions = [
    { value: null, label: "All Group" },
    { value: "white", label: "White Group" },
    { value: "yellow", label: "Yellow Group" },
  ];

  // const lineOptions = [
  //   { value: null, label: "All Lines" },
  //   { value: "Head", label: "Head" },
  //   { value: "Block", label: "Block" },
  //   { value: "Crank", label: "Crank" },
  //   {
  //     value: "Assembly (Head Sub-assembly)",
  //     label: "Assembly (Head Sub-assembly)",
  //   },
  //   {
  //     value: "Assembly (Block Sub-assembly)",
  //     label: "Assembly (Block Sub-assembly)",
  //   },
  //   { value: "Assembly (MK-1)", label: "Assembly (MK-1)" },
  // ];

  useEffect(() => {

    dispatch(
      filterDate(
        date.getDay(),
        Math.floor(date.getDate() / 7.1) + 1,
        date.getMonth() + 1,
        date.getFullYear(),
        date.getDate()
      )
    );
  }, [dispatch, date]);

  const selectDeptHandler = (e) => {
    dispatch(filterDept(e.value));
  };

  const selectLineHandler = (e) => {
    dispatch(filterMainLine(e ? e.value : null));
  };

  const selectSubLineHandler = (e) => {
    dispatch(filterSubLine(e ? e.value : null));
  };

  const selectCheckHandler = (e) => {
    dispatch(filterCheck(e.value));
  };

  const selectGroupHandler = (e) => {
    dispatch(filterGroup(e.value));
  };


  // function handleDownloadExcel() {
  //   const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
  //   const fileName = `${today}-pending-from-month`;

  //   downloadExcel({
  //     fileName: fileName,
  //     sheet: "pending-cards",
  //     tablePayload: {
  //       header: header,
  //       body: body,
  //     },
  //   });
  // }
  const colorSearchButton = (filters.processNo == "" && filters.cardNo == "") ? "btn-primary" : "btn-warning"
  const clearSearchHandler = (e) => {
    dispatch(filterProcessNo(""));
    dispatch(filterCardNo(""));
  }

  const selectedMainLineOption =
    lineOptions.find((opt) => opt.value === selectedMainLine) || lineOptions[0];

  let selectedSubLineOption = null;
  if (filters.subLine) {
    selectedSubLineOption = { value: filters.subLine, label: filters.subLine };
  } else {
    selectedSubLineOption = {
      value: null,
      label: selectedMainLine ? `All ${selectedMainLine} Sub-lines` : "All Sub-lines",
    };
  }

  return (
    <Fragment>
      {/* Structured Modern Filter Toolbar */}
      <div className="bg-white p-2 rounded shadow-sm border my-2 mx-1">
        {/* Row 1: Primary Navigation, Date & Line Selection Filters */}
        <div className="d-flex align-items-center flex-wrap gap-2">
          {/* Home Button */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <Button
              className="d-flex align-items-center gap-1.5 px-3 shadow-sm bg-blue"
              style={{ height: "38px", borderRadius: "6px", fontWeight: 500 }}
              title="Home"
            >
              <i className="bi bi-house-door-fill"></i>
              <span>Home</span>
            </Button>
          </Link>

          {/* Date Picker (React Date Picker) */}
          <div
            className="d-flex align-items-center bg-white border rounded px-2"
            style={{
              height: "38px",
              borderColor: "#ced4da",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <DatePicker
              value={date}
              format="dd/MM/yyyy"
              onChange={setDate}
              clearIcon={null}
            />
          </div>

          {/* Department Select */}
          <div style={{ minWidth: "160px" }}>
            <Select
              options={deptOptions}
              value={deptOptions.find((opt) => opt.value === filters.pS) || deptOptions[0]}
              onChange={selectDeptHandler}
              styles={customSelectStyles}
              isSearchable={false}
            />
          </div>

          {/* Main Line Select */}
          <div style={{ minWidth: "150px" }}>
            <Select
              ref={selectLineRef}
              options={lineOptions}
              value={selectedMainLineOption}
              onChange={selectLineHandler}
              styles={customSelectStyles}
              placeholder="Main Line"
              isSearchable={true}
            />
          </div>

          {/* Sub Line Select */}
          <div style={{ minWidth: "165px" }}>
            <Select
              options={subLineOptions}
              value={selectedSubLineOption}
              onChange={selectSubLineHandler}
              styles={customSelectStyles}
              placeholder="Sub Line"
              isSearchable={true}
            />
          </div>

          {/* Check Type Select */}
          <div style={{ minWidth: "120px" }}>
            <Select
              options={checkOptions}
              value={checkOptions.find((opt) => opt.value === filters.rS) || checkOptions[0]}
              onChange={selectCheckHandler}
              styles={customSelectStyles}
              isSearchable={false}
            />
          </div>

          {/* Group Select */}
          <div style={{ minWidth: "120px" }}>
            <Select
              options={groupOptions}
              value={groupOptions.find((opt) => opt.value === filters.group) || groupOptions[0]}
              onChange={selectGroupHandler}
              styles={customSelectStyles}
              isSearchable={false}
            />
          </div>

          {/* Search / Clear Search */}
          {filters.processNo === "" && filters.cardNo === "" ? (
            <Button
              className={`d-flex align-items-center gap-1.5 px-3 shadow-sm ${colorSearchButton}`}
              style={{ height: "38px", borderRadius: "6px", fontWeight: 500 }}
              onClick={() => setShowSearch(true)}
            >
              <i className="bi bi-search"></i>
              <span>Search</span>
            </Button>
          ) : (
            <Button
              className={`d-flex align-items-center gap-1.5 px-3 shadow-sm ${colorSearchButton}`}
              style={{ height: "38px", borderRadius: "6px", fontWeight: 500 }}
              onClick={() => clearSearchHandler()}
            >
              <i className="bi bi-x-circle"></i>
              <span>Clear Search</span>
            </Button>
          )}
        </div>

        {/* Row 2: Action Toolbar & TBM Dashboard Navigation */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 border-top mt-2">
          {/* Left Actions: TBM Dashboard & Quick Metrics */}
          <div className="d-flex align-items-center flex-wrap gap-2">
            {/* Prominent TBM Dashboard Button */}
            <Link to="/overallStatus" style={{ textDecoration: "none" }}>
              <Button
                variant="primary"
                className="d-flex align-items-center gap-2 px-3 py-1 shadow-sm fw-bold"
                style={{
                  background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.88rem",
                  letterSpacing: "0.2px",
                }}
                title="TBM Overall Status Dashboard"
              >
                <i className="bi bi-speedometer2 text-warning fs-5"></i>
                <span>TBM Dashboard</span>
              </Button>
            </Link>

            {/* Monthly Report */}
            {date && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowModal(true)}
                className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill shadow-sm border"
                style={{ fontSize: "0.85rem", fontWeight: 500 }}
                title="Monthly Report"
              >
                <i className="bi bi-graph-up text-primary"></i>
                <span>Monthly Report</span>
              </Button>
            )}

            {/* Pending Items */}
            <Link to="/pendingTasks" style={{ textDecoration: "none" }}>
              <Button
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill shadow-sm border"
                style={{ fontSize: "0.85rem", fontWeight: 500 }}
                title="Pending Items"
              >
                <i className="bi bi-hourglass-split text-warning"></i>
                <span>Pending Items</span>
              </Button>
            </Link>

            {/* TL/GL Verification */}
            {level >= 20 && (
              <Link to="/verification" style={{ textDecoration: "none" }}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowModals(true)}
                  className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill shadow-sm border position-relative"
                  style={{ fontSize: "0.85rem", fontWeight: 500 }}
                  title="TL/GL Verification"
                >
                  <i className="bi bi-calendar-check text-success"></i>
                  <span>TL/GL Verification</span>
                  <span
                    style={{
                      background: "#ef4444",
                      borderRadius: "50%",
                      width: "8px",
                      height: "8px",
                      display: "inline-block",
                    }}
                  ></span>
                </Button>
              </Link>
            )}

            {/* Holiday List */}
            {level >= 100 && (
              <Link to="/holidays" style={{ textDecoration: "none" }}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill shadow-sm border"
                  style={{ fontSize: "0.85rem", fontWeight: 500 }}
                  title="Holiday List"
                >
                  <i className="bi bi-sunset text-danger"></i>
                  <span>Holiday List</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Right Action: Judgement History (no whiteout on hover) */}
          <div>
            <Link to="/judgementHistory" style={{ textDecoration: "none" }}>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2 px-3 py-1 rounded-pill shadow-sm fw-semibold"
                style={{ fontSize: "0.85rem" }}
                title="Judgement History"
              >
                <i className="bi bi-card-list"></i>
                <span>Judgement History</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
      <MultiLevelXAxisBarChart showModal={showModal} setShowModal={setShowModal} chkDate={date} />
      {/* <Verification showModals={showModals} setShowModals={setShowModals} /> */}
      <Search_Modal showModal={showSearch} setShowModal={setShowSearch} />
    </Fragment>
  );
}

export default Filters;
