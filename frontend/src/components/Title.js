import React, { Fragment , useState} from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "react-bootstrap";
import { getLogout } from "../redux/login/loginActions";
import { fetchUserRequest } from "../redux/user/userActions";
import axios from "axios";
import LoginModal from "./LoginModal";

// const host = "localhost";
const host= "10.82.126.73";
const port = 5051;

function Title() {
  const [showModal, setShowModal] = useState(false)
  const logins = useSelector((state) => state.logins);
  const dispatch = useDispatch();
  const logout = () => {
    axios
      .get(`http://${host}:${port}/user/logout`)
      .then((result) => {
      
        dispatch(getLogout());
        dispatch(fetchUserRequest());
      })
      .catch((err) => {
        console.log("error", err);
      });
  };
  return (
    <Fragment>
      <div className="d-flex align-items-center bg-primary mb-2">
        <div className="bg-primary  p-1 ">
          <img src="TIEI-India.jpg" alt="TIEI_LOGO"></img>
        </div>

        <div
          className="  text-center   text-light p-1  flex-grow-1"
          style={{ fontFamily: "verdana" }}
        >
          <h1>TBM / Autonomous Maintenance </h1>
        </div>
        {/* //login  */}
        <div>
          {logins.login ? (
            <Button
              className="mx-3 bg-red"
              onClick={() => {
                logout();
              }}
            >
              Logout
            </Button>
          ) : (
            <Button className="mx-3 bg-green btn-primary" onClick={()=>setShowModal(true)}>Login</Button>
          )}
        </div>
        {/* end login */}
        <div className=" text-center   text-light p-1 bg-primary ">
          <div className="h5">
            <span className="h5">
              <i className="bi bi-person"></i> :{" "}
            </span>
            <span className="h6 px-2">
              {logins.login ? logins.name : "Guest"}
            </span>
          </div>
        </div>
      </div>
      {showModal?<LoginModal showModal={showModal} setShowModal={setShowModal} />:null}
    </Fragment>
  );
}

export default Title;
