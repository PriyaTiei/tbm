import React, { Fragment, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Col, Row, Image, Nav } from "react-bootstrap";
import { Link } from 'react-router-dom'
import { getLogout } from "../redux/login/loginActions";
import { fetchUserRequest } from "../redux/user/userActions";
import axios from "axios";
import LoginModal from "./LoginModal";
import { navBarSlice } from "../redux/navbarSlice";

export default function Title() {
  const [showModal, setShowModal] = useState(false);
  const logins = useSelector((state) => state.logins);
  const dispatch = useDispatch();
  const logout = () => {
    axios
      .get(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/user/logout`
      )
      .then((result) => {
        dispatch(getLogout());
        dispatch(fetchUserRequest());
      })
      .catch((err) => {
        console.log("error", err);
      });
  };
  
  const handleMenuClick = () => {
    dispatch(navBarSlice.actions.toggleVisible());
  };
  return (
    <Fragment>
      <Row className="align-items-center bg-black m-0  py-1 px-1">
      <Col xs={1} className="px-1">
      <Nav className="justify-content-end">
        <Nav.Link onClick={handleMenuClick}>
        <i className="bi bi-list" style={{ fontSize: "30px", color: "white" }}></i>
        </Nav.Link>
      </Nav> 
        </Col>
        <Col xs={2} className="px-1">
          <Link to="/">
            <Image width={"120"} src="logo.png" alt="TIEI_LOGO" fluid />
          </Link>
        </Col>

        <Col
          className="text-center text-light flex-grow-1"
          style={{ fontFamily: "verdana" }}
        >
          <h3>TBM / Autonomous Maintenance</h3>
        </Col>

        <Col xs={2} className="d-flex align-items-center justify-content-end">
          {logins.login ? (
            <Button variant="danger"   onClick={() => logout()}>
              Logout
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="bg-green px-1 mx-1"
              onClick={() => setShowModal(true)}
            >
              Login
            </Button>
          )}

          <div className="text-center text-light mx-1 px-1 p-1 bg-secondary rounded">
            <div className="h6">
              <span className="h5">
                <i className="bi bi-person"></i>:
              </span>
              <span className="h6 px-1">
                {logins.login ? logins.name : "Guest"}
              </span>
            </div>
          </div>
        </Col>
      </Row>

      {showModal && (
        <LoginModal showModal={showModal} setShowModal={setShowModal} />
      )}
    </Fragment>
  );
}
