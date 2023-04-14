import React, { Fragment, useState, useEffect } from "react";
import DatePicker from "react-date-picker";
import { useDispatch, useSelector } from "react-redux";
import { filterDate, filterDept } from "../redux/filter/filterActions";
import Select from "react-select";
import { Button, Row, Col, Container } from "react-bootstrap";
// import { getMachines } from "../redux/machine/machineActions";
import { Link  } from "react-router-dom";

const todayDate = new Date(Date.now());

//getting week no
// Date.prototype.getWeek = function() {
//   var dt = new Date(this.getFullYear(), 0, 1);
//   return Math.ceil(((this - dt) / 86400000 + dt.getDay() + 1) / 7);
// };

// end week no



function Filters() {

 
  const [date, setDate] = useState(todayDate);
  // const logins = useSelector((state) => state.logins);
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
  }, [dispatch,date]);

  const selectHandler = (e) => {
    dispatch(filterDept(e.value));
  };

  return (
    <Fragment>
      <hr></hr>
      <div className="d-flex justify-content-between">
        <div className="d-flex">
        
          <DatePicker
            value={date}
            onChange={setDate}
            clearIcon={null}
            className="px-3"
          />
          <Select
            options={options}
            onChange={selectHandler}
            className="mx-3 secondary"
            defaultValue={{ value: "S", label: "Production Dept" }}
          />
        </div>

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
        <Link to='/'>
         <Button
              variant="secondary"
              className="mx-3 bg-green px-3"
               
            >
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
        </Container>

        <Link to="/pendingTasks">
          <Button variant="secondary" className="mx-3">
            <i className="bi bi-card-checklist px-1"></i>
            Pending Tasks
          </Button>
        </Link>
      </div>
      <hr></hr>
    </Fragment>
  );
}

export default Filters;
