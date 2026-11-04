import { UTILITY_MASTER_MAP, FACILITY_MASTER_MAP, getActivePlantInfo } from "../config/plantEquipmentMaster";
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
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);
  const location = useLocation();
  const selectLineRef = useRef(null);
  const [cookies] = useCookies(['token', 'userId']);
  const getInitialDate = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlDate = params.get("date");
      const stateDate = window.history.state?.filterDate;
      const targetStr = urlDate || stateDate;
      if (targetStr) {
        const parts = targetStr.split("-");
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          if (!isNaN(d.getTime())) return d;
        }
      }
    } catch (e) {}
    return todayDate;
  };

  const formatDateToYMD = (d) => {
    if (!d || isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [date, setDate] = useState(getInitialDate);
  const [showSearch, setShowSearch] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModals, setShowModals] = useState(false);

  const [relativeUrl, setRelativeUrl] = useState("");

  const isPendingActive = location.pathname.startsWith("/pending");
  const isHomeActive =
    location.pathname === "/" ||
    location.pathname === "/checkList" ||
    location.pathname === "/card";
  const isVerificationActive = location.pathname.startsWith("/verification");
  const isHolidaysActive = location.pathname.startsWith("/holidays");
  const isJudgementActive = location.pathname.startsWith("/judgementHistory");
  const isDashboardActive = location.pathname.startsWith("/overallStatus");

  useEffect(() => {
    // Construct the URL without the host
    const urlWithoutHost = `${location.pathname}`;
    setRelativeUrl(urlWithoutHost);
  }, [location]);

  // Keep window.history.state and URL search params synchronized with active filters
  useEffect(() => {
    const isMainRoute =
      location.pathname === "/" ||
      location.pathname.startsWith("/pending") ||
      location.pathname.startsWith("/allMachine");

    if (isMainRoute) {
      const dateFormatted = formatDateToYMD(date);
      const params = new URLSearchParams(location.search);
      let changed = false;

      if (dateFormatted && params.get("date") !== dateFormatted) {
        params.set("date", dateFormatted);
        changed = true;
      }
      if (filters.pS && params.get("pS") !== filters.pS) {
        params.set("pS", filters.pS);
        changed = true;
      }
      if (filters.line) {
        if (params.get("line") !== filters.line) {
          params.set("line", filters.line);
          changed = true;
        }
      } else if (params.has("line")) {
        params.delete("line");
        changed = true;
      }
      if (!filters.processNo && params.has("processNo")) {
        params.delete("processNo");
        changed = true;
      }
      if (!filters.cardNo && params.has("cardNo")) {
        params.delete("cardNo");
        changed = true;
      }

      const currentState = window.history.state || {};
      if (
        changed ||
        currentState.filterDate !== dateFormatted ||
        currentState.filterLine !== filters.line ||
        currentState.filterPs !== filters.pS
      ) {
        const newUrl = `${location.pathname}?${params.toString()}`;
        window.history.replaceState(
          {
            ...currentState,
            filterDate: dateFormatted,
            filterLine: filters.line,
            filterPs: filters.pS,
          },
          "",
          newUrl
        );
      }
    }
  }, [date, filters.line, filters.pS, filters.processNo, filters.cardNo, location.pathname, location.search]);

  // Handle browser popstate events (device / browser back button "<" and forward button)
  useEffect(() => {
    const handlePopState = (e) => {
      const params = new URLSearchParams(window.location.search);
      const state = e.state || {};

      // 1. Restore Date from URL search params or history state
      const dateStr = params.get("date") || state.filterDate;
      if (dateStr) {
        const parts = dateStr.split("-");
        if (parts.length === 3) {
          const newDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          if (!isNaN(newDate.getTime()) && formatDateToYMD(newDate) !== formatDateToYMD(date)) {
            setDate(newDate);
          }
        }
      }

      // 2. Restore Line
      const lineVal = params.has("line") ? params.get("line") : state.filterLine;
      if (lineVal !== undefined && lineVal !== filters.line) {
        dispatch(filterMainLine(lineVal || null));
      }

      // 3. Restore Department
      const psVal = params.has("pS") ? params.get("pS") : state.filterPs;
      if (psVal && psVal !== filters.pS) {
        dispatch(filterDept(psVal));
      }

      // 4. Restore or clear Process / Card
      const procVal = params.get("processNo") || "";
      if (procVal !== filters.processNo) {
        dispatch(filterProcessNo(procVal));
      }
      const cardVal = params.get("cardNo") || "";
      if (cardVal !== filters.cardNo) {
        dispatch(filterCardNo(cardVal));
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [date, filters.line, filters.pS, filters.processNo, filters.cardNo, dispatch]);

  // Synchronize on route / searchParam transitions
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const state = window.history.state || {};

    const dateStr = params.get("date") || (location.pathname === "/" || location.pathname.startsWith("/pending") ? state.filterDate : null);
    if (dateStr) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const newDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (!isNaN(newDate.getTime()) && formatDateToYMD(newDate) !== formatDateToYMD(date)) {
          setDate(newDate);
        }
      }
    }

    const urlPs = params.get("pS");
    if (urlPs && urlPs !== filters.pS) {
      dispatch(filterDept(urlPs));
    }
    const urlLine = params.get("line");
    if (urlLine !== null && urlLine !== filters.line) {
      dispatch(filterMainLine(urlLine));
    }

    const urlProcess = params.get("processNo");
    if (urlProcess !== null && urlProcess !== filters.processNo) {
      dispatch(filterProcessNo(urlProcess));
    } else if (location.pathname === "/" && !params.has("processNo") && filters.processNo !== "") {
      // Clear processNo when returning to home without processNo
      dispatch(filterProcessNo(""));
    }

    const urlCard = params.get("cardNo");
    if (urlCard !== null && urlCard !== filters.cardNo) {
      dispatch(filterCardNo(urlCard));
    } else if (location.pathname === "/" && !params.has("cardNo") && filters.cardNo !== "") {
      dispatch(filterCardNo(""));
    }
  }, [location.pathname, location.search, dispatch]);


  const auth = useSelector((state) => state.auth);
  // const [header, setHeader] = useState([])
  // const [body, setBody] = useState([])



  const level = auth.user ? auth.user.level : 0;
  // const { loading, pendingTasksData } = pendingTasks;
  // const [pendingTasksData, setPendingTasksData] = useState([])
  const { machineData } = useSelector((state) => state.machines);

  const { isUtility, isFacility, isUtilityOrFacility, masterMap } = getActivePlantInfo();

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

  const getInitialLines = () => {
    if (masterMap) {
      return new Set(Object.keys(masterMap));
    }
    return new Set();
  };

  const allDiscoveredLinesRef = useRef(getInitialLines());
  const prevDeptRef = useRef(filters.pS);

  // If department changes, reset discovered lines so new department lines are captured
  if (prevDeptRef.current !== filters.pS) {
    prevDeptRef.current = filters.pS;
    allDiscoveredLinesRef.current = getInitialLines();
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

  let lineOptions = [];
  if (isUtilityOrFacility) {
    const linesSet = new Set(masterMap ? Object.keys(masterMap) : []);
    allDiscoveredLinesRef.current.forEach((lineName) => linesSet.add(lineName));
    if (machineData && machineData.machineData) {
      machineData.machineData.forEach((element) => {
        if (element && element.line) linesSet.add(element.line);
      });
    }
    lineOptions = [
      {
        value: null,
        label: isUtility ? "All Plants" : "All Areas",
      },
      ...Array.from(linesSet)
        .sort()
        .map((lineName) => ({
          value: lineName,
          label: lineName,
        })),
    ];
  } else {
    lineOptions = [{ value: null, label: "All Lines" }];
    sortedGroupNames.forEach((groupName) => {
      lineOptions.push({
        value: groupName,
        label: groupName,
      });
    });
  }

  const selectedMainLine = filters.mainLine ?? null;
  let subLineOptions = [];

  if (isUtilityOrFacility && masterMap) {
    const rawMachines = machineData?.machineData || [];
    if (selectedMainLine) {
      const matchLine = rawMachines.find((m) => m.line === selectedMainLine);
      const equipmentSet = new Set(matchLine?.processNos || []);
      if (masterMap[selectedMainLine]) {
        masterMap[selectedMainLine].forEach((eq) => equipmentSet.add(eq));
      }
      subLineOptions = [
        {
          value: null,
          label: `All ${selectedMainLine} ${isUtility ? "Equipment" : "Sub Areas"}`,
        },
        ...Array.from(equipmentSet).sort().map((proc) => ({
          value: proc,
          label: proc,
        })),
      ];
    } else {
      const allLines = Array.from(allDiscoveredLinesRef.current).sort();
      const groupedEquipment = allLines.map((lineName) => {
        const matchLine = rawMachines.find((m) => m.line === lineName);
        const eqSet = new Set(matchLine?.processNos || []);
        if (masterMap[lineName]) {
          masterMap[lineName].forEach((eq) => eqSet.add(eq));
        }
        return {
          label: lineName,
          options: Array.from(eqSet).sort().map((proc) => ({
            value: proc,
            label: proc,
          })),
        };
      }).filter((g) => g.options.length > 0);

      subLineOptions = [
        {
          value: null,
          label: isUtility ? "All Equipment" : "All Sub Areas",
        },
        ...groupedEquipment,
      ];
    }
  } else if (selectedMainLine && groupedLines[selectedMainLine]) {
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
  const deptOptions = isUtilityOrFacility
    ? [
        { value: "P", label: "Maint Dept" },
        { value: "S", label: "Service Dept" },
      ]
    : [
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
    if (isUtilityOrFacility) {
      dispatch(filterProcessNo(""));
    }
  };

  const selectSubLineHandler = (e) => {
    if (isUtilityOrFacility) {
      dispatch(filterProcessNo(e ? (e.value || "") : ""));
      dispatch(filterSubLine(e ? e.value : null));
    } else {
      dispatch(filterSubLine(e ? e.value : null));
    }
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
  if (isUtilityOrFacility) {
    if (filters.processNo) {
      selectedSubLineOption = { value: filters.processNo, label: filters.processNo };
    } else {
      selectedSubLineOption = {
        value: null,
        label: selectedMainLine
          ? `All ${selectedMainLine} ${isUtility ? "Equipment" : "Sub Areas"}`
          : (isUtility ? "All Equipment" : "All Sub Areas"),
      };
    }
  } else if (filters.subLine) {
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
              variant={isHomeActive ? "primary" : "outline-primary"}
              className={`d-flex align-items-center gap-1.5 px-3 shadow-sm ${
                isHomeActive ? "bg-blue text-white" : ""
              }`}
              style={{
                height: "38px",
                borderRadius: "6px",
                fontWeight: isHomeActive ? 600 : 500,
                background: isHomeActive ? "#0d6efd" : "#ffffff",
                borderColor: isHomeActive ? "#0d6efd" : "#bfdbfe",
                color: isHomeActive ? "#ffffff" : "#1d4ed8",
                transition: "all 0.2s ease",
              }}
              title="Home"
            >
              <i className="bi bi-house-door-fill"></i>
              <span>Home</span>
            </Button>
          </Link>

          {/* Date Picker (React Date Picker) */}
          <div
            className="d-flex align-items-center bg-white border rounded px-2 position-relative"
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
              placeholder={isUtility ? "Select Plant" : isFacility ? "Select Area" : "Main Line"}
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
              placeholder={isUtility ? "Select Equipment" : isFacility ? "Select Sub Area" : "Sub Line"}
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

          {/* TBM Dashboard Button beside Search */}
          <Link to="/overallStatus" style={{ textDecoration: "none" }}>
            <Button
              variant={isDashboardActive ? "primary" : "outline-primary"}
              className="d-flex align-items-center gap-2 px-3 shadow-sm fw-semibold"
              style={{
                height: "38px",
                borderRadius: "6px",
                background: isDashboardActive ? "#1d4ed8" : "#eff6ff",
                borderColor: isDashboardActive ? "#1d4ed8" : "#bfdbfe",
                color: isDashboardActive ? "#ffffff" : "#1d4ed8",
                fontSize: "0.88rem",
                letterSpacing: "0.2px",
                transition: "all 0.2s ease",
              }}
              title="TBM Overall Status Dashboard"
            >
              <i
                className={`bi bi-speedometer2 fs-6 ${
                  isDashboardActive ? "text-white" : "text-primary"
                }`}
              ></i>
              <span>TBM Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Row 2: Action Toolbar & Secondary Navigation */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 border-top mt-2">
          {/* Left Actions */}
          <div className="d-flex align-items-center flex-wrap gap-2">
            {/* Monthly Report */}
            {date && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="btn btn-sm d-flex align-items-center gap-2 px-3 py-1 rounded-pill shadow-sm"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  background: "#ffffff",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                title="Monthly Report"
              >
                <i className="bi bi-graph-up text-primary"></i>
                <span>Monthly Report</span>
              </button>
            )}

            {/* Pending Items - Highlighted with Mild Teal theme when active */}
            <Link to="/pendingTasks" style={{ textDecoration: "none" }}>
              <button
                type="button"
                className="btn btn-sm d-flex align-items-center gap-2 px-3 py-1 rounded-pill shadow-sm"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: isPendingActive ? 600 : 500,
                  background: isPendingActive
                    ? "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)"
                    : "#ffffff",
                  color: isPendingActive ? "#ffffff" : "#475569",
                  border: isPendingActive
                    ? "1px solid #0f766e"
                    : "1px solid #cbd5e1",
                  boxShadow: isPendingActive
                    ? "0 3px 10px rgba(13, 148, 136, 0.35)"
                    : "0 1px 2px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                title="Pending Items"
              >
                <i
                  className="bi bi-clock-history"
                  style={{
                    color: isPendingActive ? "#ffffff" : "#0d9488",
                    fontSize: "0.95rem",
                  }}
                ></i>
                <span>Pending Items</span>
              </button>
            </Link>

            {/* TL/GL Verification */}
            {level >= 20 && (
              <Link to="/verification" style={{ textDecoration: "none" }}>
                <button
                  type="button"
                  onClick={() => setShowModals(true)}
                  className="btn btn-sm d-flex align-items-center gap-2 px-3 py-1 rounded-pill shadow-sm position-relative"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: isVerificationActive ? 600 : 500,
                    background: isVerificationActive
                      ? "linear-gradient(135deg, #15803d 0%, #16a34a 100%)"
                      : "#ffffff",
                    color: isVerificationActive ? "#ffffff" : "#475569",
                    border: isVerificationActive
                      ? "1px solid #15803d"
                      : "1px solid #cbd5e1",
                    boxShadow: isVerificationActive
                      ? "0 3px 10px rgba(22, 163, 74, 0.35)"
                      : "0 1px 2px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                  title="TL/GL Verification"
                >
                  <i
                    className={`bi bi-calendar-check ${
                      isVerificationActive ? "text-white" : "text-success"
                    }`}
                  ></i>
                  <span>TL/GL Verification</span>
                  <span
                    style={{
                      background: "#ef4444",
                      borderRadius: "50%",
                      width: "8px",
                      height: "8px",
                      display: "inline-block",
                      border: isVerificationActive ? "1.5px solid #ffffff" : "none",
                    }}
                  ></span>
                </button>
              </Link>
            )}

            {/* Holiday List */}
            {level >= 100 && (
              <Link to="/holidays" style={{ textDecoration: "none" }}>
                <button
                  type="button"
                  className="btn btn-sm d-flex align-items-center gap-2 px-3 py-1 rounded-pill shadow-sm"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: isHolidaysActive ? 600 : 500,
                    background: isHolidaysActive
                      ? "linear-gradient(135deg, #be123c 0%, #e11d48 100%)"
                      : "#ffffff",
                    color: isHolidaysActive ? "#ffffff" : "#475569",
                    border: isHolidaysActive
                      ? "1px solid #be123c"
                      : "1px solid #cbd5e1",
                    boxShadow: isHolidaysActive
                      ? "0 3px 10px rgba(225, 29, 72, 0.35)"
                      : "0 1px 2px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                  title="Holiday List"
                >
                  <i
                    className={`bi bi-sunset ${
                      isHolidaysActive ? "text-white" : "text-danger"
                    }`}
                  ></i>
                  <span>Holiday List</span>
                </button>
              </Link>
            )}
          </div>

          {/* Right Action: Judgement History (no whiteout on hover) */}
          <div>
            <Link to="/judgementHistory" style={{ textDecoration: "none" }}>
              <button
                type="button"
                className="btn btn-sm d-flex align-items-center gap-2 px-3 py-1 rounded-pill shadow-sm fw-semibold"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: isJudgementActive ? 600 : 500,
                  background: isJudgementActive
                    ? "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)"
                    : "#ffffff",
                  color: isJudgementActive ? "#ffffff" : "#1d4ed8",
                  border: isJudgementActive
                    ? "1px solid #1d4ed8"
                    : "1px solid #bfdbfe",
                  boxShadow: isJudgementActive
                    ? "0 3px 10px rgba(37, 99, 235, 0.35)"
                    : "0 1px 2px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                title="Judgement History"
              >
                <i
                  className={`bi bi-card-list ${
                    isJudgementActive ? "text-white" : "text-primary"
                  }`}
                ></i>
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
