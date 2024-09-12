import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import TrendGraph from "./TrendGraph";
import DatePicker from "react-date-picker";
import "./trend.css";

function TrendGraphModal({ showModal, setShowModal, id, mspecs }) {
  const handleClose = () => {
    // setIsOpen(false)
    setShowModal(false);
  };


  let info = {};

  const [data, setData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [searchParams] = useSearchParams();
  for (const e of searchParams.entries()) {
    let [f, v] = e;
    info[f] = v;
  }

  // const { line, processNo } = info;

  // const users = useSelector((state) => state.users);

  // begining of Month
  var beginingDate = new Date(Date.now());
  beginingDate.setDate(-30);



  //from date
  const [fromDate, setFromDate] = useState(beginingDate);


  const [toDate, setToDate] = useState(new Date(Date.now()));

  const [selectedId, setSelectedId] = useState("");
  // const user = users.loading
  //   ? null
  //   : users.users.success
  //   ? users.users.user._id
  //   : null;

  var dataList = [];
  var labelsList = [];

  useEffect(() => {
    if (fromDate && toDate && selectedId) {

      axios
        .get(
          `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/find/${id}/fromDate/${fromDate}/toDate/${toDate}`
        )
        .then((result) => {
          // result.data.dailyStatus.forEach((item) => {
          //   labelsList.push(item.entryFor);
          // if (parseFloat(item.value) === NaN) {
          //   dataList.push(0);
          // } else {

          // dataList.push(parseFloat(item.value));
          // }
          // });
          setData(result?.data?.dailyStatus);
          setLabels(labelsList);
        })
        .catch((err) => {

        });
    }

  }, [fromDate, toDate, selectedId]);



  // Handler for select change


  useEffect(() => {
    if (mspecs.length) {
      setSelectedId(mspecs[0]?._id)
    }

  }, [mspecs])



  return (
    <Modal
      show={showModal}
      onHide={handleClose}
      dialogClassName="my-modal"
      // contentClassName="modal-height"
      style={{ height: "100% !important" }}

    >
      <Modal.Header closeButton>
        <Modal.Title>Trend Graphs</Modal.Title>
      </Modal.Header>
      <Modal.Body >
        <TrendGraph data={data} labels={labels} setToDate={setToDate} toDate={toDate} setFromDate={setFromDate} fromDate={fromDate} setSelectedId={setSelectedId} selectedId={selectedId} mspecs={mspecs} />
      </Modal.Body>

    </Modal>
  );
}

export default TrendGraphModal;
