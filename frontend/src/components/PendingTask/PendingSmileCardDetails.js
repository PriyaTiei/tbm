import React, { useState, useEffect } from "react";
import styles from "../styles/smilecard.module.css";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify"; 
import moment from "moment"

export default function PendingSmileCardDetails({ list  ,   entryFor}) { 

  const users = useSelector((state) => state.users); 

  const entryForStr = moment(entryFor).format('YYYY-M-DD');  

  let {
    cardNo,
    // d,
    line,
    model,
    processNo,
    cycle,
    workOnePoint,
    workDetail,
    tool,
    criterion, 
    images,
    _id,
    pS, 
    value,
  } = list;
  const [okNg, setOkNg] = useState("decisionPending");
  const [valueM, setValueM] = useState(value);
  const [remarks , setRemarks] = useState(null) 

  const dailyEntry = (e) => {
    if (users.users.length === 0) {
      toast.warning("Login required");
    } else {
      let data = {
        checkItem: _id,
        result: okNg === "OK" ? "OK" : okNg === "NG" ? "NG" : "not judge",
        value: valueM,
        user: users.users.user._id, 
        entryFor : entryForStr,
        pS,
        remarks
      };

      if (okNg === "OK" || okNg === "NG") {
        axios
          .post(
            `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/entry`,
            data
          )
          .then((result) => {
            if (result.data.success) {
              toast.success("saved data");
            }
          })
          .catch((err) => {
            // console.log("error ", err);
            toast.error(`Data could not be saved , ${err.message}`);
          });
      } else {
        toast.warning("Please judge OK or NG");
      }
    }
  };

  return (
    <div style={{ height: "65vh" }}>
      <div className="d-sm-flex flex-wrap">
        <div
          className={`${styles.brA} ${styles.center} col-sm-3 align-self-stretch bg-warning `}
        >
          <h3 className={`${styles.scTh}`}>
            {" "}
            {pS === "P" ? "TBM Card" : "Smile Card"}
          </h3>
        </div>

        <div className={`col-md-2 col-sm-3  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>Matrix Card No</h6>
          </div>
          <div className={styles.brT}>
            <p className={`${styles.scTd}`}>{}</p>
          </div>
        </div>

        <div className={`col-md-2 col-sm-3  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>Legend No</h6>
          </div>
          <div className={styles.brT}>
            <p className={`${styles.scTd}`}>{cardNo }</p>
          </div>
        </div>

        {/* <div className={`col-md-1 col-sm-3  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>Day</h6>
          </div>
          <div className={styles.brT}>
            <p className={`${styles.scTd}`}>
              {d[0] === 9999 ? "All days" : d[0]}
            </p>
          </div>
        </div> */}

        <div className={`col-md-2 col-sm-2  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>Line</h6>
          </div>
          <div className={styles.brT}>
            <p className={`${styles.scTd}`}>{line}</p>
          </div>
        </div>

        <div className={`col-md-2 col-sm-3  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>Machine no</h6>
          </div>
          <div className={styles.brT}>
            <p className={`${styles.scTd}`}>{model}</p>
          </div>
        </div>

        <div className={`col-md-1 col-sm-2  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>OP no</h6>
          </div>
          <div className={styles.brT}>
            <p className={`${styles.scTd}`}>{processNo}</p>
          </div>
        </div>

        <div className={`col-md-2 col-sm-3  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>Inspection Item</h6>
          </div>
          <div className={styles.brT}>
            <p className={`${styles.scTd}`}>{workDetail}</p>
          </div>
        </div>

        <div className={`col-md-1 col-sm-2  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>Frequency</h6>
          </div>
          <div className={styles.brT}>
            <p className={`${styles.scTd}`}>{cycle}</p>
          </div>
        </div>

        <div className={`col-md-4 col-sm-6  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>Area to inspect</h6>
          </div>
          <div className={styles.brT}>
            <p className={`${styles.scTd}`}>{workOnePoint}</p>
          </div>
        </div>

        <div className={`col-md-2 col-sm-3  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>Inspection Method</h6>
          </div>
          <div className={`${styles.brT} align-self-stretch`}>
            <p className={`${styles.scTd}`}>{tool}</p>
          </div>
        </div>

        <div className={`col-md-2 col-sm-3  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>Criteria</h6>
          </div>
          <div className={styles.brT}>
            <p className={`${styles.scTd}`}>{criterion}</p>
          </div>
        </div>
      </div>

      <div className="d-sm-flex   " style={{ height: "55vh" }}>
        <div className="col-sm-8">
          <img
            src={
              images[0] === null || images[0] === undefined
                ? "/noImageAdded.png"
                : `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/assets/images/${images[0]}`
            }
            alt="Details_Photo"
            style={{ width: "auto", height: "50vh" }}
          ></img>
          <div>{images[0]}</div>
        </div>

        <div className="col-sm-4 bg-secondary">
          <div className="d-flex ">
            <img
              src={`../../${okNg}.png`}
              alt="Not Evaluated"
              style={{ width: "17vw", height: "17vw" }}
            ></img>
            <div
              style={{ width: "18vw" }}
              className="d-flex flex-column justify-content"
            >
               
              <input
                type="text"
                placeholder="Enter actual value"
                value={valueM}
                onChange={(e) => setValueM(e.target.value)}
              ></input>
              <br></br>
              <textarea
                type="text"
                placeholder="Enter Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              ></textarea>
              <br></br>
              <button
                className="btn btn-success mb-2"
                onClick={() => setOkNg("OK")}
              >
                <i className="bi bi-circle"></i>
              </button>
              <button className="btn btn-danger " onClick={() => setOkNg("NG")}>
                <i className="bi bi-x-lg"></i>
              </button>
              <br></br>
              <button
                className="btn  btn-primary"
                style={{ width: "100%" }}
                onClick={dailyEntry}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

       
    </div>
  );
}
 
