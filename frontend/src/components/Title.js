import React, { Fragment, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Col, Row, Image, Nav, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";  
import axios from "axios";
import LoginModal from "./LoginModal";
import { navBarSlice } from "../redux/navbarSlice";
import { getTitle, getSection } from "../services/title";
import { useCookies } from "react-cookie";
import { logout } from "../redux/auth/AuthSlice";

export default function Title() {
  const location = useLocation();
  const [, , removeCookie] = useCookies(['token', 'userId']);
  const [showModal, setShowModal] = useState(false);
  const filters = useSelector((state) => state.filters);
  const auth = useSelector((state) => state.auth);
  const level = auth.user ? auth.user.level : 0;
  const dispatch = useDispatch();

  const handleLogout = () => {
    axios
      .get(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/user/logout`
      )
      .then(() => {
        dispatch(logout());
        removeCookie("token"); 
        removeCookie("userId"); 
      })
      .catch(() => {
        dispatch(logout());
        removeCookie("token");
        removeCookie("userId");
      });
  };

  const handleMenuClick = () => {
    dispatch(navBarSlice.actions.toggleVisible());
  };

  const handleHistoryBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  const title = getTitle(location.pathname);
  const section = getSection(filters.pS); // Always "TBM" for consistent GD_TBM header
  const plantName = process.env.REACT_APP_PLANT || "GD";

  return (
    <Fragment>
      <Row className="align-items-center bg-black m-0 py-2 px-3 border-bottom border-secondary border-opacity-25">
        <Col xs="auto" className="d-flex align-items-center ps-0">
          <Nav className="me-2">
            <Nav.Link
              onClick={handleMenuClick}
              className="p-1 text-light d-flex align-items-center"
              style={{ cursor: "pointer" }}
              title="Toggle Menu"
            >
              <i className="bi bi-list" style={{ fontSize: "28px" }}></i>
            </Nav.Link>
          </Nav>

          {location.pathname !== "/" && (
            <Button
              variant="outline-light"
              size="sm"
              className="d-flex align-items-center gap-1 me-2 px-2 py-1 rounded"
              style={{
                fontSize: "0.82rem",
                borderColor: "rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.08)"
              }}
              onClick={handleHistoryBack}
              title="Back (Browser History)"
            >
              <i className="bi bi-arrow-left"></i>
              <span className="d-none d-sm-inline">Back</span>
            </Button>
          )}

          <Link to="/" className="d-flex align-items-center">
            <Image width="115" src="logo.png" alt="TIEI_LOGO" fluid />
          </Link>
        </Col>

        <Col className="text-center text-light flex-grow-1 px-2">
          <h3
            className="m-0 fw-bold"
            style={{
              fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
              letterSpacing: "0.5px",
              fontSize: "1.45rem",
              color: "#f8fafc"
            }}
          >
            {`${plantName}_${section} - ${title || "Home"}`}
          </h3>
        </Col>

        <Col xs="auto" className="d-flex align-items-center justify-content-end pe-0">
          {auth.isAuthenticated ? (
            <div className="d-flex align-items-center gap-2">
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="user-info-tooltip">
                    {auth.user?.name || "User"}
                    {level >= 100
                      ? " (Admin)"
                      : level >= 20
                      ? " (Team Leader)"
                      : " (Operator)"}
                  </Tooltip>
                }
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle text-light shadow-sm"
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "rgba(255, 255, 255, 0.12)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    cursor: "pointer",
                  }}
                >
                  <i className="bi bi-person-fill fs-5"></i>
                </div>
              </OverlayTrigger>

              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="signout-tooltip">Sign Out</Tooltip>}
              >
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm"
                  onClick={handleLogout}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderColor: "#ef4444",
                    color: "#fca5a5",
                  }}
                  aria-label="Sign Out"
                >
                  <i className="bi bi-box-arrow-right fs-6"></i>
                </Button>
              </OverlayTrigger>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="guest-tooltip">Guest (Not signed in)</Tooltip>}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle text-white-50"
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    cursor: "pointer",
                  }}
                >
                  <i className="bi bi-person fs-5"></i>
                </div>
              </OverlayTrigger>

              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="signin-tooltip">Sign In</Tooltip>}
              >
                <Button
                  variant="success"
                  size="sm"
                  className="rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm"
                  onClick={() => setShowModal(true)}
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "#16a34a",
                    borderColor: "#16a34a",
                  }}
                  aria-label="Sign In"
                >
                  <i className="bi bi-box-arrow-in-right fs-6"></i>
                </Button>
              </OverlayTrigger>
            </div>
          )}
        </Col>
      </Row>

      {showModal && (
        <LoginModal showModal={showModal} setShowModal={setShowModal} />
      )}
    </Fragment>
  );
}
