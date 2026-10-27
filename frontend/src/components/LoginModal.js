import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify"; 
import { login } from "../redux/auth/AuthSlice";

function LoginModal({ showModal, setShowModal }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [, setCookie] = useCookies(["token", "userId"]);
  const dispatch = useDispatch();

  const handleClose = () => {
    setErrorMsg("");
    setShowModal(false);
  };

  const formHandler = (e) => {
    e.preventDefault();
    if (!userName.trim() || !password.trim()) {
      setErrorMsg("Please enter both User Name and Password");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    axios
      .post(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/user/login`,
        { name: userName.trim(), password }
      )
      .then((result) => {
        setLoading(false);
        if (result.data.success) {
          setCookie("token", result.data.token);
          setCookie("userId", result.data.user._id);
          dispatch(
            login({
              user: result.data.user,
              token: result.data.token,
            })
          );
          toast.success("Successfully logged in");
          setShowModal(false);
        } else {
          setErrorMsg(result.data.message || "Enter correct User Name & Password");
        }
      })
      .catch((err) => {
        setLoading(false);
        const msg =
          err.response?.data?.message || "Invalid credentials. Please try again.";
        setErrorMsg(msg);
        toast.error("Enter correct User Name & Password"); 
      });
  };

  const plantName = process.env.REACT_APP_PLANT || "GD";

  return (
    <Modal
      show={showModal}
      onHide={handleClose}
      centered
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* Modern Gradient Banner Header */}
      <div
        className="p-4 text-center position-relative text-white"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        }}
      >
        <button
          type="button"
          className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
          onClick={handleClose}
          aria-label="Close"
        ></button>
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
          style={{
            width: "52px",
            height: "52px",
            background: "rgba(59, 130, 246, 0.2)",
            border: "1px solid rgba(59, 130, 246, 0.4)",
          }}
        >
          <i className="bi bi-shield-lock-fill text-primary fs-3"></i>
        </div>
        <h5 className="fw-bold m-0" style={{ letterSpacing: "0.5px" }}>
          {plantName}_TBM Sign In
        </h5>
        <small className="text-white-50">
          Enter credentials to manage check items & approvals
        </small>
      </div>

      <Modal.Body className="p-4 bg-light">
        {errorMsg && (
          <Alert variant="danger" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-exclamation-circle-fill fs-6"></i>
            <span>{errorMsg}</span>
          </Alert>
        )}

        <Form onSubmit={formHandler}>
          <Form.Group className="mb-3" controlId="userName">
            <Form.Label className="small fw-semibold text-secondary mb-1">
              User Name
            </Form.Label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-person"></i>
              </span>
              <Form.Control
                autoComplete="username"
                type="text"
                placeholder="Enter user name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="border-start-0 ps-0 shadow-none"
                style={{ fontSize: "0.92rem", height: "42px" }}
                required
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-4" controlId="password">
            <Form.Label className="small fw-semibold text-secondary mb-1">
              Password
            </Form.Label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-lock"></i>
              </span>
              <Form.Control
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-start-0 border-end-0 ps-0 shadow-none"
                style={{ fontSize: "0.92rem", height: "42px" }}
                required
              />
              <button
                type="button"
                className="input-group-text bg-white border-start-0 text-muted"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer" }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>
          </Form.Group>

          <Button
            type="submit"
            disabled={loading}
            className="w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold shadow-sm rounded-3"
            style={{
              background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)",
              border: "none",
              height: "44px",
              fontSize: "0.95rem",
            }}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Sign In</span>
              </>
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default LoginModal;
