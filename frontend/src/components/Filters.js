import React, { Fragment, useState, useEffect } from "react";
import DatePicker from "react-date-picker";
import { useDispatch, useSelector } from "react-redux";
import { filterDate, filterDept } from "../redux/filter/filterActions";
import Select from "react-select";
import { Button } from "react-bootstrap";
// import { getMachines } from "../redux/machine/machineActions";
import { Link } from "react-router-dom";

const todayDate = new Date(Date.now());

//getting week no
// Date.prototype.getWeek = function() {
//   var dt = new Date(this.getFullYear(), 0, 1);
//   return Math.ceil(((this - dt) / 86400000 + dt.getDay() + 1) / 7);
// };

// end week no

function Filters() {
  const [date, setDate] = useState(todayDate);
  const logins = useSelector((state) => state.logins);
  const machines = useSelector((state) => state.machines);

  const users = useSelector((state) => state.users);
  const level =
    users.loading === false
      ? users.users.success === true
        ? users.users.user.level
        : 0
      : 0;


  const totalCount = machines.loading
    ? { totalCountBlock: 0, totalCountCrank: 0, totalCountHead: 0 }
    : machines.machineData.success
    ? machines.machineData.totalCount
    : { totalCountBlock: 0, totalCountCrank: 0, totalCountHead: 0 };

  const { totalCountBlock, totalCountCrank, totalCountHead } = totalCount;

  const dispatch = useDispatch();
  // const filters = useSelector((state) => state.filters);
  // let queryStr = `d=${filters.d}&m=${filters.m}&y=${filters.y}&pS=${filters.pS}`;
  const options = [
    { value: "S", label: "Production Dept" },
    { value: "P", label: "Maint Dept" },
  ];

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
    // dispatch(getMachines(queryStr));
  }, [date]);

  const selectHandler = (e) => {
    dispatch(filterDept(e.value));
  };

  return (
    <Fragment>
      <div className="d-flex flex-wrap">
        <DatePicker
          value={date}
          onChange={setDate}
          clearIcon={null}
          className="mx-3"
        />
        <Select
          options={options}
          onChange={selectHandler}
          className="mx-3"
          defaultValue={{ value: "S", label: "Production Dept" }}
        />
        {/* {logins.login ? (
          <Button
            className="mx-3 bg-red"
            onClick={() => {
              logout();
            }}
          >
            Logout
          </Button>
        ) : (
          <Link to="/login">
            <Button className="mx-3 bg-green">Login</Button>
          </Link>
        )} */}

        <Link to="/">
          <Button className="mx-3">
            <i className="bi bi-house px-1"></i>
            Home
          </Button>
        </Link>

        {level >= 10 && (
          <Link to="/summaryAbnormality">
            <Button className="mx-3">
              <i className="bi bi-stack-overflow px-1"></i>Abnormality Summary
            </Button>
          </Link>
        )}
        {level >= 10 && (
          <Link to="/summaryCards">
            <Button className="mx-3">
              <i className="bi bi-stack-overflow px-1"></i>Cards Summary
            </Button>
          </Link>
        )}
        {level >= 100 && (
          <Link to="/addCheckItems">
            <Button className="mx-3">
              <i className="bi bi-plus-square"></i> CheckItems
            </Button>
          </Link>
        )}

        <div className="m-auto p-1 bg-info text-light border rounded-2 d-flex flex-row justify-content-center">
          <div className="align-self-center">
            <span className="h6 text-center">Total Check</span>
          </div>
          <div className="align-self-center text-dark">
            <span className="m-1">Block : {totalCountBlock}</span>
            <span className="m-1">
              <span className="text-light">| </span>Crank : {totalCountCrank}
            </span>
            <span className="m-1">
              <span className="text-light">| </span>Head : {totalCountHead}
            </span>
          </div>
        </div>
      </div>
      <hr></hr>
    </Fragment>
  );
}

export default Filters;
