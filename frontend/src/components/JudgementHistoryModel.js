import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import TrendGraph from "./TrendGraph";
import DatePicker from "react-date-picker";
import "./trend.css";
import CardStatusGraph from "./CardStatusBar";

function JudgementHistoryModel({ showModal, setShowModal, checkItem }) {
    const [cardList, setCardList] = useState([])

  const handleClose = () => {
    // setIsOpen(false)
    setShowModal(false);
  };

  const filterHandler = (e) => {
    
  };

  const deptHandler = ()=>{
    
  }

  useEffect(() => {
    axios.get(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/dailyStatusByCheckItem?checkItem=${checkItem}`)
      .then((result) => {
        if (result.data.success) {
            setCardList(result.data.dailyStatusAll)
        }
      })
      .catch((err) => {
        // console.log("error ", err);
        // toast.error(`Data could not be saved , ${err.message}`);
      });

  }, [])
  
  const list = cardList.map((item) => {
    console.log(item);

    return (
        <tr>
        <td>{item.entryFor}</td>
        <td>{item.result}</td>
        <td>{item.value}</td>
        <td>{item.remarks}</td>
        <td>{item.checkedBy}</td>
        <td>{new Date(item.checkedAt).toLocaleTimeString()}</td>
        <td>{item.tl?"":"Not"} Verified</td>
        <td>{item.gl?"":"Not"} Verified</td>
      </tr>
    );
  });


  return (
    <Modal
      show={showModal}
      onHide={handleClose}
      dialogClassName="my-modal"
      contentClassName="modal-height"
     
    >
      <Modal.Header closeButton>
        <Modal.Title>Judgement History</Modal.Title>
      </Modal.Header>
      <Modal.Body >
      <table className="m-3   table table-bordered table-sm table-hover text-dark ">
          {/* <table className="m-5 border border-black-50 text-light"> */}
          <thead>
            <tr>
              <th>Entry Date</th>
              <th>Result</th>
              <th>Value</th>
              <th>Remarks</th>
              <th>Checked By</th>
              <th>Checked At</th>
              <th>Team Lead</th>
              <th>Group Lead</th>
            </tr>

          </thead>

          <tbody>{list}</tbody>
        </table>
      </Modal.Body>
    </Modal>
  );
}

export default JudgementHistoryModel