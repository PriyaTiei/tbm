import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { navBarSlice } from "../redux/navbarSlice";
import { Button, Offcanvas } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";
import { logout } from "../redux/auth/AuthSlice";
import LoginModal from "./LoginModal";

const sidebarStyle = {
  width: "100vw",
  background: "#f8f9fa",
  height: "100vh",
  position: "fixed",
  top: "0",
  left: "0",
  zIndex: "999",
  overflowY: "auto",
};

export function AppSidebar({ children }) {
  const { visible } = useSelector((state) => state.navBar);
  const dispatch = useDispatch();
  const [, , removeCookie] = useCookies(["token", "userId"]);
  const [showModal, setShowModal] = useState(false);

  const auth = useSelector((state) => state.auth);
  const level = auth.user ? auth.user.level : 0;

  const handleClose = () => {
    dispatch(navBarSlice.actions.setVisible(false));
  };

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

  return (
    <>
      <Offcanvas
        show={visible}
        onHide={handleClose}
        placement="start"
        style={{ width: "295px", borderRight: "1px solid #e2e8f0" }}
      >
        <Offcanvas.Header
          closeButton
          style={{ borderBottom: "1px solid #e2e8f0", padding: "12px 16px" }}
        >
          <h5 className="m-0 fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
            Menu
          </h5>
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column p-2 px-3" style={{ background: "#ffffff" }}>
          {/* Section 1: Dashboard */}
          <div
            className="text-uppercase text-muted fw-bold px-1 mb-1 mt-1"
            style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
          >
            Dashboard
          </div>
          <Link
            to="/overallStatus"
            onClick={handleClose}
            className="text-decoration-none d-flex align-items-center gap-3 p-2 px-3 mb-2 rounded-3 border text-dark shadow-sm"
            style={{
              background: "linear-gradient(135deg, #f0f7ff 0%, #e0effe 100%)",
              borderColor: "#bfdbfe",
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center bg-primary text-white rounded-2 shadow-sm"
              style={{ width: "36px", height: "36px", flexShrink: 0 }}
            >
              <i className="bi bi-speedometer2 fs-5 text-warning"></i>
            </div>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className="fw-bold text-primary" style={{ fontSize: "0.9rem" }}>
                TBM Overall Status
              </div>
              <small className="text-muted d-block" style={{ fontSize: "0.72rem" }}>
                Progress tracker
              </small>
            </div>
            <i className="bi bi-chevron-right text-muted small"></i>
          </Link>

          {/* Section 2: Abnormalities & Analytics */}
          <div
            className="text-uppercase text-muted fw-bold px-1 mb-1 mt-2"
            style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
          >
            Analytics & Issues
          </div>
          {level >= 0 && (
            <Link
              to="/summaryAbnormality"
              onClick={handleClose}
              className="text-decoration-none d-flex align-items-center gap-3 p-2 px-3 mb-1.5 rounded-3 border text-dark"
              style={{
                background: "#f8fafc",
                borderColor: "#e2e8f0",
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center bg-info bg-opacity-10 text-info rounded-2"
                style={{ width: "36px", height: "36px", flexShrink: 0 }}
              >
                <i className="bi bi-people-fill fs-5"></i>
              </div>
              <div className="flex-grow-1 fw-semibold text-secondary" style={{ fontSize: "0.88rem" }}>
                Abnormalities by member
              </div>
              <i className="bi bi-chevron-right text-muted small"></i>
            </Link>
          )}

          {level >= 0 && (
            <Link
              to="/summaryCards"
              onClick={handleClose}
              className="text-decoration-none d-flex align-items-center gap-3 p-2 px-3 mb-2 rounded-3 border text-dark"
              style={{
                background: "#f8fafc",
                borderColor: "#e2e8f0",
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-2"
                style={{ width: "36px", height: "36px", flexShrink: 0 }}
              >
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
              </div>
              <div className="flex-grow-1 fw-semibold text-secondary" style={{ fontSize: "0.88rem" }}>
                Actual Abnormalities
              </div>
              <i className="bi bi-chevron-right text-muted small"></i>
            </Link>
          )}

          {/* Section 3: CheckItems Management */}
          <div
            className="text-uppercase text-muted fw-bold px-1 mb-1 mt-2"
            style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
          >
            CheckItems Management
          </div>

          {level >= 20 && (
            <Link
              to="/addCheckItems"
              onClick={handleClose}
              className="text-decoration-none d-flex align-items-center gap-3 p-2 px-3 mb-1.5 rounded-3 border text-dark"
              style={{
                background: "#f8fafc",
                borderColor: "#e2e8f0",
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-2"
                style={{ width: "36px", height: "36px", flexShrink: 0 }}
              >
                <i className="bi bi-plus-circle-fill fs-5"></i>
              </div>
              <div className="flex-grow-1 fw-semibold text-secondary" style={{ fontSize: "0.88rem" }}>
                Add CheckItems
              </div>
              <i className="bi bi-chevron-right text-muted small"></i>
            </Link>
          )}

          <Link
            to="/allMachine"
            onClick={handleClose}
            className="text-decoration-none d-flex align-items-center gap-3 p-2 px-3 mb-1.5 rounded-3 border text-dark"
            style={{
              background: "#f8fafc",
              borderColor: "#e2e8f0",
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-2"
              style={{ width: "36px", height: "36px", flexShrink: 0 }}
            >
              <i className="bi bi-card-checklist fs-5"></i>
            </div>
            <div className="flex-grow-1 fw-semibold text-secondary" style={{ fontSize: "0.88rem" }}>
              All CheckItems
            </div>
            <i className="bi bi-chevron-right text-muted small"></i>
          </Link>

          <Link
            to="/delMachine"
            onClick={handleClose}
            className="text-decoration-none d-flex align-items-center gap-3 p-2 px-3 mb-2 rounded-3 border text-dark"
            style={{
              background: "#f8fafc",
              borderColor: "#e2e8f0",
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center bg-secondary bg-opacity-10 text-secondary rounded-2"
              style={{ width: "36px", height: "36px", flexShrink: 0 }}
            >
              <i className="bi bi-trash3-fill fs-5"></i>
            </div>
            <div className="flex-grow-1 fw-semibold text-secondary" style={{ fontSize: "0.88rem" }}>
              Deleted CheckItems
            </div>
            <i className="bi bi-chevron-right text-muted small"></i>
          </Link>

          {/* User Profile Card & Sign In / Sign Out */}
          <div
            className="p-2.5 border-top mt-auto rounded-3"
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div
                  className="fw-bold text-dark text-truncate"
                  style={{ maxWidth: "140px", fontSize: "0.88rem" }}
                >
                  {auth.isAuthenticated ? auth.user?.name : "Guest"}
                </div>
                <small className="text-muted d-block" style={{ fontSize: "0.72rem" }}>
                  {auth.isAuthenticated
                    ? level >= 100
                      ? "Admin"
                      : level >= 20
                      ? "Team Leader"
                      : "Operator"
                    : "Not signed in"}
                </small>
              </div>

              {auth.isAuthenticated ? (
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="rounded-pill px-2.5 py-1 d-flex align-items-center gap-1"
                  onClick={() => {
                    handleClose();
                    handleLogout();
                  }}
                  style={{ fontSize: "0.78rem", fontWeight: 500 }}
                  title="Sign Out"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Sign Out</span>
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="sm"
                  className="rounded-pill px-2.5 py-1 d-flex align-items-center gap-1"
                  onClick={() => {
                    handleClose();
                    setShowModal(true);
                  }}
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    background: "#16a34a",
                    borderColor: "#16a34a",
                  }}
                  title="Sign In"
                >
                  <i className="bi bi-box-arrow-in-right"></i>
                  <span>Sign In</span>
                </Button>
              )}
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {showModal && (
        <LoginModal showModal={showModal} setShowModal={setShowModal} />
      )}

      <div style={sidebarStyle}>{children}</div>
    </>
  );
}
