import React from "react";
import Modal from "react-bootstrap/Modal";
import JudgementHistoryData from "./JudgementHistoryData";

function JudgementHistoryModel({ showModal, setShowModal, checkItem }) {
  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <Modal
      show={showModal}
      onHide={handleClose}
      dialogClassName="my-modal"
      contentClassName="modal-height"
      size="xl"
    >
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold fs-6">Judgement History</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-2">
        <JudgementHistoryData checkItem={checkItem} />
      </Modal.Body>
    </Modal>
  );
}

export default JudgementHistoryModel;
