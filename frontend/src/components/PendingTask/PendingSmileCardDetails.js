import React, { useState, useEffect } from "react";
import styles from "../styles/smilecard.module.css";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment"
import TrendGraphModal from "./../TrendGraphModal";

export default function PendingSmileCardDetails({ list, entryFor, checkItems }) {

  const auth = useSelector((state) => state.auth);
  const [image, setImage] = useState(null);
  const [mspecs, setMspecs] = useState([])



  const entryForStr = moment(entryFor).format('YYYY-M-DD').replace(/\b0/g, '');



  let { cardNo,
    d,
    line,
    model,
    processNo,
    cycle,
    workDetail,
    tool,
    criterion,
    images,
    _id,
    pS,
    dailyStatus,
    value,
    methodWssNo,
    rS,
    workManpower,
    areaToInspect,
    workTime,
    m_spec,
  } = list;

  useEffect(() => {
    setMspecs(m_spec)
  }, [list])


  const [okNg, setOkNg] = useState("decisionPending");
  const [valueM, setValueM] = useState(value);
  const [remarks, setRemarks] = useState(null)
  const [parts, setParts] = useState([]);
  var bgColor = rS == "R" ? "red" : "green";

  const handleChange = (id, e) => {

    let msp = [...mspecs];
    msp[id].m_value = e.target.value;
    setMspecs(msp);

  };

  useEffect(() => {
    if (images !== null) {
      setImage(images[0]);
    }
  }, []);

  const [showModal, setShowModal] = useState(false);

  const validateInputs = () => {
    console.log(mspecs)
    return mspecs.every(spec => 'm_value' in spec && spec.m_value !== '');

  };

  const dailyEntry = (e) => {
    if (!auth.isAuthenticated) {
      toast.warning("Login required");
    } else {
      if (validateInputs()) {
        let data = {
          checkItem: _id,
          result: okNg === "OK" ? "OK" : okNg === "NG" ? "NG" : "not judge",
          value: valueM,
          user: auth.user._id,
          entryFor: entryForStr,
          pS,
          line,
          remarks,
          m_specs: mspecs
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

              toast.error(`Data could not be saved , ${err.message}`);
            });
        } else {
          toast.warning("Please judge OK or NG");
        }
      } else {
        toast.error('Please fill actual values. Values cannot be empty.');
      }
    }

  };



  const removePart = (indexToRemove) => {
    setParts(parts.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div style={{ height: "65vh", paddingBottom: "10%" }} className="overflow-auto">
      <div className="d-sm-flex flex-wrap">
        <div
          className={`${styles.brA} ${styles.center} col-sm-3 align-self-stretch `}
          style={{ backgroundColor: `${bgColor}` }}
        >
          <h6 className={`${styles.scTh} h2`}>
            {pS === "P" ? "TBM Card" : `Smile Card `}
            <spam className={"h3"}> - {rS === "R" ? "RMI" : "OM"}</spam>
          </h6>
        </div>

        <div className={`col-md-2 col-sm-3  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}> {pS == "S" ? "Matrix Card No." : "Control No"}</h6>
          </div>
          <div className={styles.brT}>
            <h6 className={`${styles.scTd}`}>{cardNo}</h6>
          </div>
        </div>

        <div className={`col-md-2 col-sm-3  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}> {pS == "S" ? "Ledger No." : "WSS No."}</h6>
          </div>
          <div className={styles.brT}>
            <h6 className={`${styles.scTd}`}>{methodWssNo}</h6>
          </div>
        </div>

        <div className={`col-md-1 col-sm-3  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>Day</h6>
          </div>
          <div className={styles.brT}>
            <h6 className={`${styles.scTd}`}>
              {d[0] === 9999 ? "All days" : d[0]}
            </h6>
          </div>
        </div>

        <div className={`col-md-2 col-sm-2  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>{pS == "S" ? "Line/Group" : "Line"}</h6>
          </div>
          <div className={styles.brT}>
            <h6 className={`${styles.scTd}`}>{line}</h6>
          </div>
        </div>

        <div className={`col-md-2 col-sm-3  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>Machine no</h6>
          </div>
          <div className={styles.brT}>
            <h6 className={`${styles.scTd}`}>{model}</h6>
          </div>
        </div>

        <div className={`col-md-1 col-sm-2  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}> {pS == "S" ? "Station / Line" : "OP no"} </h6>
          </div>
          <div className={styles.brT}>
            <h6 className={`${styles.scTd}`}>{processNo}</h6>
          </div>
        </div>

        <div className={`col-md-3 col-sm-4  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>{pS == "S" ? "Inspection Item" : "Work Detail"} </h6>
          </div>
          <div className={styles.brT}>
            <h6 className={`${styles.scTd}`}>{workDetail}</h6>
          </div>
        </div>

        <div className={`col-md-1 col-sm-2  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>Frequency</h6>
          </div>
          <div className={styles.brT}>
            <h6 className={`${styles.scTd}`}>{cycle}</h6>
          </div>
        </div>

        <div className={`col-md-2 col-sm-2  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>{pS == "S" ? "Area to inspect" : "No. of members"}</h6>
          </div>
          <div className={styles.brT}>
            <h6 className={`${styles.scTd}`}>{workManpower}</h6>
          </div>
        </div>
        <div className={`col-md-1 col-sm-1  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>{pS == "S" ? "Time" : "Total Manhours"}</h6>
          </div>
          <div className={styles.brT}>
            <h6 className={`${styles.scTd}`}>{workTime}</h6>
          </div>
        </div>

        <div className={`col-md-2 col-sm-3  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>{pS == "S" ? "Inspection Method" : "Tools"}</h6>
          </div>
          <div className={`${styles.brT} align-self-stretch`}>
            <h6 className={`${styles.scTd}`}>{tool}</h6>
          </div>
        </div>

        <div className={`col-md-2 col-sm-3  align-self-stretch  ${styles.brA}`}>
          <div>
            <h6 className={`${styles.scTh}`}>Standard Value</h6>
          </div>
          <div className={styles.brT}>
            <h6 className={`${styles.scTd}`}>{mspecs?.map((spec) => spec.m_criteria).join(", ")}</h6>
          </div>
        </div>
      </div>

      <div className="d-sm-flex   " style={{ height: "55vh" }}>
        <div className="col-sm-7 ">
          <img
            src={
              image === null || image === undefined
                ? "/noImageAdded.png"
                : `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/assets/images/${image}`
            }
            alt="Details_Photo"
            style={{ width: image === null || image === undefined ? "20vW" : "58.33vw", height: "auto" }}
          ></img>
          <div>{image}</div>
        </div>

        <div className="col-sm-5 bg-secondary">
          <div className="d-flex ">
            <div className="d-flex flex-column">
              <button
                className="btn btn-primary mr-1"
                onClick={() => setShowModal(true)}
              >
                <i className="bi bi-graph-up-arrow h4"> Graph</i>
              </button>
              <img
                src={`../../${okNg}.png`}
                alt="Not Evaluated"
                style={{ width: "17vw", height: "17vw" }}
              ></img>
            </div>
            <div
              style={{ width: "24.5vw" }}
              className="d-flex flex-column justify-content "
            >
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="text-center text-light mx-3">Judgement</h6>
              </div>
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>

                  {mspecs?.map((spec, index) => (
                    <div key={spec._id} style={{ display: 'flex' }}>
                      <label
                        htmlFor={spec.m_lable}
                        style={{ color: 'white' }}
                        title={spec.m_criteria}
                      >
                        {spec.m_lable} ({spec.m_unit}):
                      </label>

                      <input
                        type="number"
                        id={spec.m_lable}
                        name={spec.m_lable}
                        value={spec.m_value}
                        onChange={(e) => handleChange(index, e)}
                        placeholder={`Enter ${spec.m_lable} in ${spec.m_unit}`}
                        style={{ minWidth: '50px', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                </div>
                {/* <input
                  className="bg-light my-1"
                  type="text"
                  placeholder="Enter actual value"
                  value={valueM}
                  onChange={handleChange}
                  style={{width: "100%"}}
                ></input> */}
                <div className="mt-2">
                  {parts.map((part, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: "#f0f0f0", // Change this to your desired background color
                        padding: "5px 10px",
                        margin: "5px",
                        borderRadius: "5px",
                        display: "inline-flex",
                        alignItems: "center",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      {part}
                      <button
                        onClick={() => removePart(index)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#888",
                          fontWeight: "bold",
                          marginLeft: "10px",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <textarea
                type="text"
                className="bg-light my-1"
                placeholder="Enter Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              ></textarea>

              <button
                className="btn btn-success  my-1"
                onClick={() => setOkNg("OK")}
              >
                <i className="bi bi-circle"></i>
              </button>
              <button
                className="btn btn-danger  my-1 "
                onClick={() => setOkNg("NG")}
              >
                <i className="bi bi-x-lg"></i>
              </button>

              <button
                className="btn  btn-primary  my-1"
                style={{ width: "100%" }}
                onClick={dailyEntry}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* // trend graph in modal */}
      {showModal ? (
        <TrendGraphModal
          showModal={showModal}
          setShowModal={setShowModal}
          id={_id}
          mspecs={mspecs}
        // checkItem={checkItem._id}
        // line={line}
        // processNo={processNo}
        // workDetail={checkItem.workDetail}
        // abnormality={abnormality}
        // cardType={cardType}
        // // countermeasure={countermeasure}
        // // spare={spare}
        // // pic={pic}
        // // targetDate={targetDate}
        // status={status}
        // fromDateSt={fromDateSt}
        //  toDateSt={toDateSt}
        />
      ) : null}
    </div>
  );
}

