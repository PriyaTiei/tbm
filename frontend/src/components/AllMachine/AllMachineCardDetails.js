import React, { useState, useEffect } from "react";
import styles from "../styles/smilecard.module.css";
import { useSelector } from "react-redux"; 

export default function AllMachineSmileCardDetails({ list   }) { 

  const users = useSelector((state) => state.users);  

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

       
      </div>

       
    </div>
  );
}
 
