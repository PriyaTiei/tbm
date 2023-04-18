import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import "./login.css";
import { getLogin } from "../redux/login/loginActions";
import { toast } from "react-toastify";
import { fetchUserSuccess, fetchUserFail } from "../redux/user/userActions";
import { useCookies } from "react-cookie";

function Login() {
  const formHandler = (e) => {
    e.preventDefault();
    axios
      .post(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/user/login`,
        { name: userName, password }
      )
      .then((result) => {
        if (result.data.success) {
          setCookie("token", "test");

          dispatch(getLogin(result.data.user.name, result.data.user.role));
          dispatch(fetchUserSuccess(result.data));
          navigate("/");
        }
      })
      .catch((err) => {
        // console.log("err", err.message);
        toast.show("Enter correct user Name & Password");
        dispatch(fetchUserFail("User cannot be found"));
      });
  };
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies(["token"]);

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="d-flex flex-column justify-content-ceter align-items-center mt-4">
      {/* <Link to="/">
        <button className="btn btn-secondary my-3 inline ">
          Go to Home Screen
        </button>
      </Link> */}
      <div className="loginContent">
        <h4 className="p-3 text-center text-white">Login</h4>

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

          <button className="btn btn-secondary" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
