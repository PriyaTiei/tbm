import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { getLogin } from "../redux/login/loginActions";
import { toast } from "react-toastify";
import { fetchUserSuccess, fetchUserFail } from "../redux/user/userActions";

function LoginModal({ showModal, setShowModal }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [cookies, setCookie] = useCookies(['token', 'role', 'name', 'userId']);
  const dispatch = useDispatch();

  const handleClose = () => {
    setShowModal(false);
  };

  const formHandler = (e) => {
    e.preventDefault();
    axios
      .post(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/user/login`,
        { name: userName, password }
      )
      .then((result) => {
        if (result.data.success) {
          setCookie("token", result.data.token);
          setCookie("role", result.data.user.role);
          setCookie("name", result.data.user.name);
          setCookie("userId", result.data.user._id);
          dispatch(
            getLogin(
              result.data.user.name,
              result.data.user.role,
              result.data.token
            )
          );
          dispatch(fetchUserSuccess(result.data));
          setShowModal(false);
        }
      })
      .catch((err) => {
        toast.error("Enter correct user Name & Password");
        dispatch(fetchUserFail("User cannot be found"));
      });
  };
  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="loginContent">
          <Form onSubmit={formHandler}>
            <Form.Group controlId="userName">
              <Form.Label>User Name</Form.Label>
              <Form.Control
                autoComplete="on"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                autoComplete="on"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
          </Form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={formHandler}>
          Login
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LoginModal;
