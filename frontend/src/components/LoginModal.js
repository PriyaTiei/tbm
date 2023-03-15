import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { getLogin } from "../redux/login/loginActions";
import { useAlert } from "react-alert";
import { fetchUserSuccess, fetchUserFail } from "../redux/user/userActions";
import "./login.css";

// const host = "localhost";
const host= "10.82.126.73";
const port = 5051;

function LoginModal({ showModal, setShowModal }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [cookies, setCookie] = useCookies(["token"]);
  const dispatch = useDispatch();
  const alert = useAlert();

  const handleClose = () => {
    setShowModal(false);
  };

  const formHandler = (e) => {
    e.preventDefault();
    axios
      .post(`http://${host}:${port}/user/login`, { name: userName, password })
      .then((result) => {
    
        if (result.data.success) {
      
          setCookie("token", "test");
        
          dispatch(getLogin(result.data.user.name, result.data.user.role));
          dispatch(fetchUserSuccess(result.data));
          setShowModal(false);
          // navigate("/");
        }
      })
      .catch((err) => {
        // console.log("err", err.message);
        alert.show("Enter correct user Name & Password");
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
          {/* <h4 className=" text-center text-white">Login</h4> */}

          <form className="form-group loginForm" onSubmit={formHandler}>
            <label htmlFor="userName" className="form-text text-dark">
              User Name
            </label>
            <input
              id="userName"
              autoComplete="on"
              className="form-control mb-2"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <label htmlFor="password" className=" form-text text-dark">
              Password
            </label>
            <input
              id="password"
              autoComplete="on"
              className="form-control mb-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-primary" type="submit" onClick={formHandler}>
          Login
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default LoginModal;
