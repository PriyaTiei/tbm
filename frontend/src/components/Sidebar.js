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
  const plantName = process.env.REACT_APP_PLANT || "GD";

  const handleClose = () => {
    dispatch(navBarSlice.actions.setVisible(false));
  };

  const handleHistoryBack = () => {
    handleClose();
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
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
        style={{ width: "330px", borderRight: "1px solid #e2e8f0" }}
      >
        <Offcanvas.Header
          closeButton
          style={{ borderBottom: "1px solid #e2e8f0", padding: "16px 20px" }}
        >
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 bg-primary text-white shadow-sm"
              style={{ width: "36px", height: "36px" }}
            >
              <i className="bi bi-grid-fill fs-5"></i>
            </div>
            <div>
              <h5 className="m-0 fw-bold text-dark" style={{ fontSize: "1.08rem" }}>
                Navigation
              </h5>
              <small className="text-muted fw-semibold" style={{ fontSize: "0.78rem" }}>
                {plantName}_TBM System
              </small>
            </div>
          </div>
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column p-3" style={{ background: "#ffffff" }}>
          {/* Top Quick Action: Windows/Browser History Back Button */}
          <button
            type="button"
            className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2 mb-3"
            style={{
              borderRadius: "8px",
              fontSize: "0.88rem",
              fontWeight: 500,
              borderColor: "#cbd5e1",
              color: "#475569",
              background: "#f8fafc",
            }}
            onClick={handleHistoryBack}
            title="Back to previous page"
          >
            <i className="bi bi-arrow-left"></i>
            <span>Back to Previous Page</span>
          </button>

          {/* Section 1: Dashboard */}
          <div
            className="text-uppercase text-muted fw-bold px-1 mb-2"
            style={{ fontSize: "0.72rem", letterSpacing: "0.5px" }}
          >
            Dashboard & Monitoring
          </div>
          <Link
            to="/overallStatus"
            onClick={handleClose}
            className="text-decoration-none d-flex align-items-center p-2 mb-3 rounded border text-dark"
            style={{
              background: "linear-gradient(135deg, #f0f7ff 0%, #e0effe 100%)",
              borderColor: "#bfdbfe",
              transition: "transform 0.15s ease",
            }}
          >
            <div
              className="rounded-2 p-2 bg-primary text-white me-3 d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: "36px", height: "36px" }}
            >
              <i className="bi bi-speedometer2 fs-5 text-warning"></i>
            </div>
            <div className="flex-grow-1">
              <div className="fw-bold text-primary" style={{ fontSize: "0.92rem" }}>
                TBM Overall Status
              </div>
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                Comprehensive progress tracker
              </small>
            </div>
            <span className="badge bg-primary text-white ms-2">Live</span>
          </Link>

          {/* Section 2: Abnormalities & Analytics */}
          <div
            className="text-uppercase text-muted fw-bold px-1 mb-2 mt-1"
            style={{ fontSize: "0.72rem", letterSpacing: "0.5px" }}
          >
            Analytics & Issues
          </div>
          {level >= 0 && (
            <Link
              to="/summaryAbnormality"
              onClick={handleClose}
              className="text-decoration-none d-flex align-items-center p-2 mb-2 rounded border text-dark"
              style={{
                background: "#f8fafc",
                borderColor: "#e2e8f0",
                transition: "background 0.15s ease",
              }}
            >
              <div
                className="rounded-2 p-2 bg-info bg-opacity-10 text-info me-3 d-flex align-items-center justify-content-center"
                style={{ width: "36px", height: "36px" }}
              >
                <i className="bi bi-people-fill fs-5"></i>
              </div>
              <div className="fw-semibold text-secondary" style={{ fontSize: "0.9rem" }}>
                Abnormalities by member
              </div>
              <i className="bi bi-chevron-right text-muted ms-auto small"></i>
            </Link>
          )}

          {level >= 0 && (
            <Link
              to="/summaryCards"
              onClick={handleClose}
              className="text-decoration-none d-flex align-items-center p-2 mb-3 rounded border text-dark"
              style={{
                background: "#f8fafc",
                borderColor: "#e2e8f0",
                transition: "background 0.15s ease",
              }}
            >
              <div
                className="rounded-2 p-2 bg-danger bg-opacity-10 text-danger me-3 d-flex align-items-center justify-content-center"
                style={{ width: "36px", height: "36px" }}
              >
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
              </div>
              <div className="fw-semibold text-secondary" style={{ fontSize: "0.9rem" }}>
                Actual Abnormalities
              </div>
              <i className="bi bi-chevron-right text-muted ms-auto small"></i>
            </Link>
          )}

          {/* Section 3: CheckItems Management */}
          <div
            className="text-uppercase text-muted fw-bold px-1 mb-2 mt-1"
            style={{ fontSize: "0.72rem", letterSpacing: "0.5px" }}
          >
            CheckItems Management
          </div>

          {level >= 20 && (
            <Link
              to="/addCheckItems"
              onClick={handleClose}
              className="text-decoration-none d-flex align-items-center p-2 mb-2 rounded border text-dark"
              style={{
                background: "#f8fafc",
                borderColor: "#e2e8f0",
                transition: "background 0.15s ease",
              }}
            >
              <div
                className="rounded-2 p-2 bg-success bg-opacity-10 text-success me-3 d-flex align-items-center justify-content-center"
                style={{ width: "36px", height: "36px" }}
              >
                <i className="bi bi-plus-circle-fill fs-5"></i>
              </div>
              <div className="fw-semibold text-secondary" style={{ fontSize: "0.9rem" }}>
                Add CheckItems
              </div>
              <i className="bi bi-chevron-right text-muted ms-auto small"></i>
            </Link>
          )}

          <Link
            to="/allMachine"
            onClick={handleClose}
            className="text-decoration-none d-flex align-items-center p-2 mb-2 rounded border text-dark"
            style={{
              background: "#f8fafc",
              borderColor: "#e2e8f0",
              transition: "background 0.15s ease",
            }}
          >
            <div
              className="rounded-2 p-2 bg-primary bg-opacity-10 text-primary me-3 d-flex align-items-center justify-content-center"
              style={{ width: "36px", height: "36px" }}
            >
              <i className="bi bi-card-checklist fs-5"></i>
            </div>
            <div className="fw-semibold text-secondary" style={{ fontSize: "0.9rem" }}>
              All CheckItems
            </div>
            <i className="bi bi-chevron-right text-muted ms-auto small"></i>
          </Link>

          <Link
            to="/delMachine"
            onClick={handleClose}
            className="text-decoration-none d-flex align-items-center p-2 mb-2 rounded border text-dark"
            style={{
              background: "#f8fafc",
              borderColor: "#e2e8f0",
              transition: "background 0.15s ease",
            }}
          >
            <div
              className="rounded-2 p-2 bg-secondary bg-opacity-10 text-secondary me-3 d-flex align-items-center justify-content-center"
              style={{ width: "36px", height: "36px" }}
            >
              <i className="bi bi-trash3-fill fs-5"></i>
            </div>
            <div className="fw-semibold text-secondary" style={{ fontSize: "0.9rem" }}>
              Deleted CheckItems
            </div>
            <i className="bi bi-chevron-right text-muted ms-auto small"></i>
          </Link>

          {/* User Profile Card & Sign In / Sign Out */}
          <div
            className="p-3 border-top mt-auto rounded-3"
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              marginTop: "auto",
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle bg-primary bg-opacity-15 text-primary d-flex align-items-center justify-content-center fw-bold shadow-sm"
                  style={{ width: "38px", height: "38px", fontSize: "0.95rem" }}
                >
                  {auth.isAuthenticated && auth.user?.name ? (
                    auth.user.name.charAt(0).toUpperCase()
                  ) : (
                    <i className="bi bi-person"></i>
                  )}
                </div>
                <div>
                  <div
                    className="fw-bold text-dark text-truncate"
                    style={{ maxWidth: "120px", fontSize: "0.88rem" }}
                  >
                    {auth.isAuthenticated ? auth.user?.name : "Guest"}
                  </div>
                  <small className="text-muted d-block" style={{ fontSize: "0.72rem" }}>
                    {auth.isAuthenticated
                      ? level >= 100
                        ? "Admin / Manager"
                        : level >= 20
                        ? "Team Leader"
                        : "Operator"
                      : "Not signed in"}
                  </small>
                </div>
              </div>

              {auth.isAuthenticated ? (
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                  onClick={() => {
                    handleClose();
                    handleLogout();
                  }}
                  style={{ fontSize: "0.8rem", fontWeight: 500 }}
                  title="Sign Out"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Sign Out</span>
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="sm"
                  className="rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                  onClick={() => {
                    handleClose();
                    setShowModal(true);
                  }}
                  style={{
                    fontSize: "0.8rem",
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
