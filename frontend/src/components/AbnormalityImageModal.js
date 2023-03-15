import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";

import Select from "react-select";
import axios from "axios";
import { useSelector } from "react-redux";
import { useAlert } from "react-alert";
import "./raiseCard.css";
import "./trend.css";

// const host = "localhost";
const host ="10.82.126.73"
const port = 5051;

function ModalForm({ showModal, setShowModal, image }) {
  const handleClose = () => {
    setShowModal(false);
  };
  console.log("image : ", image);

  return (
    <Modal
      show={showModal}
      onHide={handleClose}
      dialogClassName="my-modal"
      contentClassName="modal-height"
    >
      <Modal.Header closeButton>
        <Modal.Title>Abnormality Image</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div  style={{ height: "80vh", width:"80vw"}} className="d-flex justify-content-center align-item-center" >
          <img
            src={`http://${host}:${port}/assets/abnormalityImage/${image}`}
            alt="Photo Not loaded"
            style={{ height: "65vh", width:"auto"}}
          />
        </div>
      </Modal.Body>
      {/* <Modal.Footer></Modal.Footer> */}
    </Modal>
  );
}

export default ModalForm;
