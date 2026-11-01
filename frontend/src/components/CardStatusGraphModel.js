import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import TrendGraph from "./TrendGraph";
import DatePicker from "react-date-picker";
import "./trend.css";
import CardStatusGraph from "./CardStatusBar";

function CardStatusGraphModel({ showModal, setShowModal, line }) {
  const handleClose = () => {
    setShowModal(false);
  };

  const filters = useSelector((state) => state.filters);

  let info = {};

  const [data, setData] = useState({});
  const [searchParams] = useSearchParams();
  for (const e of searchParams.entries()) {
    let [f, v] = e;
    info[f] = v;
  }

  // 30 days ago
  const getInitialFromDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  };

  const [fromDate, setFromDate] = useState(getInitialFromDate);
  const [toDate, setToDate] = useState(new Date(Date.now()));

  const formatDateToYYYYMMDD = (d) => {
    if (!d) return "";
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return "";
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    if (!fromDate || !toDate) return;
    axios
      .post(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/getGraphData`,
        {
          line: line,
          startDate: formatDateToYYYYMMDD(fromDate),
          endDate: formatDateToYYYYMMDD(toDate),
          pS: filters.pS || "S",
        }
      )
      .then((result) => {
        setData(result.data?.totalData || {});
      })
      .catch((err) => {
        console.log("error : ", err);
      });
  }, [fromDate, toDate, line, filters.pS]);

  return (
    <Modal
      show={showModal}
      onHide={handleClose}
      dialogClassName="my-modal"
      contentClassName="modal-height"
    >
      <Modal.Header closeButton>
        <Modal.Title>Line Status Graphs</Modal.Title>
      </Modal.Header>
      <Modal.Body >
        <CardStatusGraph unFilteredData={data} />
      </Modal.Body>
      <Modal.Footer>
        <div className="ms-4 my-2 ">
          <span>From</span>
          <DatePicker
          format="dd/MM/yyyy"
            value={fromDate}
            onChange={setFromDate}
            clearIcon={null}
          />
          <span className="ms-3">To</span>
          <DatePicker format="dd/MM/yyyy" value={toDate} onChange={setToDate} clearIcon={null} />
        </div>

        {/* <Button variant="primary" type="submit" onClick={formHandler}>
          Submit
  </Button> */}
      </Modal.Footer>
    </Modal>
  );
}

export default CardStatusGraphModel