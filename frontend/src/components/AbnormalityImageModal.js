import React from "react";
import { Modal } from "react-bootstrap";

function AbnormalityImageModal({ showModal, setShowModal, beforeImageUrl, afterImageUrl }) {
  const handleClose = () => setShowModal(false);

  return (
    <Modal show={showModal} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Abnormality Images</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ display: "flex", justifyContent: "space-around", gap: "1rem" }}>
        {beforeImageUrl ? (
          <div style={{ textAlign: "center" }}>
            <p><strong>Before</strong></p>
            <img
              src={beforeImageUrl}
              alt="Before Abnormality"
              style={{ maxWidth: "100%", maxHeight: "200vh" }}
            />
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <p><strong>Before</strong></p>
            <p>No image available</p>
          </div>
        )}

        {afterImageUrl ? (
          <div style={{ textAlign: "center" }}>
            <p><strong>After</strong></p>
            <img
              src={afterImageUrl}
              alt="After Abnormality"
              style={{ maxWidth: "100%", maxHeight: "200vh" }}
            />
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <p><strong>After</strong></p>
            <p>No image available</p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default AbnormalityImageModal;
