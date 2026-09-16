import React, { Fragment, useState, useEffect, useRef } from "react";
import DatePicker from "react-date-picker";
import { useDispatch, useSelector } from "react-redux";
import {
  filterDate,
  filterDept,
  filterLine,
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

  var lineOptions = [{ value: null, label: "All Lines" }];
  const { machineData } = useSelector((state) => state.machines);
  if (machineData && machineData.machineData != undefined) {
    const groupedMap = {};
    machineData.machineData.forEach((element) => {
      if (!element || !element.line) return;
      const group = getLineGroup(element.line);
      if (!groupedMap[group]) {
        groupedMap[group] = [];
      }
      groupedMap[group].push({ value: element.line, label: element.line });
    });

    const preferredOrder = ["Assembly", "Machining"];
    const otherGroups = Object.keys(groupedMap).filter(
      (g) => !preferredOrder.includes(g)
    );
    const sortedGroupNames = [
      ...preferredOrder.filter((g) => groupedMap[g]),
      ...otherGroups,
    ];

    sortedGroupNames.forEach((groupName) => {
      lineOptions.push({
        label: groupName,
        options: groupedMap[groupName],
      });
    });
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
    dispatch(filterLine(e.value));
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
  const filters = useSelector((state) => state.filters);
  const colorSearchButton = (filters.processNo == "" && filters.cardNo == "") ? "btn-primary" : "btn-warning"
  const clearSearchHandler = (e) => {
    dispatch(filterProcessNo(""));
    dispatch(filterCardNo(""));
  }

  return (
    <Fragment>
      <hr className="my-2"></hr>
      <div className="d-flex justify-content-between">
        <div className="d-flex">
          <DatePicker
            value={date}
            format="dd/MM/yyyy"
            onChange={setDate}
            clearIcon={null}
            className="px-3"
          />
        </div>
        {/* {
          cookies.userId ? (<>
            <SlideInNotification message={
              "An error occurred. Please try again."
            }
              duration={5000}
              type={"info"} handleDownloadExcel={handleDownloadExcel} />  </>) : (<></>)
        } */}
        <Link to="/">
          <Button className="mx-1 bg-blue px-3 py-3">
            <i className="bi bi-house"></i> Home
          </Button>
        </Link>

        {/* <Link to="/teamleader">
          <Button variant="secondary" className="mx-3 bg-green px-3">
            Team Leader
          </Button>
        </Link> */}

        {/* 
        <Container className="mx-3 px-3" style={{ maxWidth: "30vw" }}>
          <Row className="bg-info text-light border rounded-2 d-flex align-items-center justify-content-center">
            <Col xs={12} md={6} className="text-center">
              <h6 className="my-2">Total Check</h6>
            </Col>
            <Col xs={12} md={6} className="text-center">
              <h6 className="my-2">
                Block: {totalCountBlock} | Crank: {totalCountCrank} | Head:{" "}
                {totalCountHead}
              </h6>
            </Col>
          </Row>
        </Container> */}

        <Select
          options={deptOptions}
          onChange={selectDeptHandler}
          className="mx-1 secondary"
          defaultValue={{ value: "S", label: "Production Dept" }}
          isSearchable={false}
        />

        <Select
          ref={selectLineRef}
          options={lineOptions}
          onChange={selectLineHandler}
          className="mx-1 secondary"
          defaultValue={lineOptions[0]}
          isSearchable={true}
        />

        <Select
          options={checkOptions}
          onChange={selectCheckHandler}
          className="mx-1 secondary"
          defaultValue={checkOptions[0]}
          isSearchable={false}
        />
        <Select
          options={groupOptions}
          onChange={selectGroupHandler}
          className="mx-1 secondary"
          defaultValue={groupOptions[0]}
          isSearchable={false}
        />
        {(filters.processNo == "" && filters.cardNo == "") ? <Button className={`mx-1 ${colorSearchButton}`} onClick={() => setShowSearch(true)}>
          <i className="bi bi-search px-1"></i>
          Search
        </Button> :
          <Button className={`mx-1 ${colorSearchButton}`} onClick={() => clearSearchHandler()}>
            <i className="bi bi-search px-1"></i>
            Clear Search
          </Button>}
        {date ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Button
            className=""
            onClick={() => setShowModal(true)}
            style={{ background: "transparent", color: "#000" }}
          >
            <i className="bi bi-graph-up bi-2x"></i>
          </Button>
          <div
            style={{
              marginTop: '4px',
              fontSize: '0.8rem',
              color: '#000',
              textAlign: 'center',
            }}
          >
            Monthly Report
          </div>
        </div> : null}

        {level >= 100 ? (
          <Link to="/holidays" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Button style={{ background: "transparent", color: "#000" }}>
                <i className="bi bi-sunset bi-2x"></i>
              </Button>
              <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#000', textAlign: 'center' }}>
                Holiday List
              </div>
            </div>
          </Link>
        ) : null}

        {level >= 20 ? (
          <Link to="/verification" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <Button onClick={() => setShowModals(true)} style={{ background: "transparent", color: "#000" }}>
                <i className="bi bi-calendar-check bi-2x"></i>
                <span style={{
                  background: "red",
                  borderRadius: "50%",
                  width: "10px",
                  height: "10px",
                  position: "absolute",
                  top: "3px",      
                  right: "12px", 
                }}></span>
              </Button>
              <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#000', textAlign: 'center' }}>
                TL/GL Verification
              </div>
            </div>
          </Link>
        ) : null}

        <Link to="/pendingTasks" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '20px' }}>
            <Button style={{ background: "transparent", color: "#000" }}>
              <i className="bi bi-hourglass-split"></i>
            </Button>
            <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#000', textAlign: 'center' }}>
              Pending Items
            </div>
          </div>
        </Link>


        <Link to="/judgementHistory">
          <Button color="blue" className="mx-1">
            <i className="bi bi-card-list px-1"></i>
            Judgement History
          </Button>
        </Link>
      </div>
      <hr className="my-2"></hr>
      <MultiLevelXAxisBarChart showModal={showModal} setShowModal={setShowModal} chkDate={date} />
      {/* <Verification showModals={showModals} setShowModals={setShowModals} /> */}
      <Search_Modal showModal={showSearch} setShowModal={setShowSearch} />
    </Fragment>
  );
}

export default Filters;
