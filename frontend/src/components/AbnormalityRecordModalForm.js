
import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import Select from "react-select";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function ModalForm({ showModal, setShowModal, workDetail, itemId, mspecs }) {
  const handleClose = () => {
    setShowModal(false);
  };
  const { pS } = useSelector((state) => state.filters);
  const [selectedFile, setSelectedFile] = useState("");
  const [beforeImage, setImage] = useState("");

  const selectedFileHandler = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  let info = {};
  const [searchParams] = useSearchParams();
  for (const e of searchParams.entries()) {
    let [f, v] = e;
    info[f] = v;
  }
  const { line, processNo } = info;
  const auth = useSelector((state) => state.auth);
  const user = auth.loading === false ? auth.user?._id : null;
  const [abnormality, setAbnormality] = useState("");
  const [countermeasure, setCountermeasure] = useState("");
  const [target, setTarget] = useState("");
  const [pic, setPic] = useState("");
  const [spare, setSpare] = useState("");
  const [status, setStatus] = useState("pending");

  const options = [
    { value: "pending", label: "Pending" },
    { value: "inprogress", label: "Inprogress" },
    { value: "complete", label: "Complete" },
  ];

  const uploadImage = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.warn("Please select an image file first");
      return;
    }
    const formData = new FormData();
    formData.append("beforeImage", selectedFile);
    axios
      .post(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/abnormality/uploadImage`,
        formData,
        {
          headers: { "Content-Type": "Multipart/form-data" },
        }
      )
      .then((result) => {
        setImage(result.data.file.filename);
        if (result.data.success) {
          toast.success(`Image uploaded: ${result.data.file.filename}`);
        }
      })
      .catch((err) => {
        console.error("error uploading image", err);
        toast.error("Failed to upload image. Please choose .png or .jpg file.");
      });
  };

  const formHandler = (e) => {
    e.preventDefault();
    if (!abnormality || abnormality.trim() === "") {
      toast.error("Please fill in Abnormality Details");
      return;
    }
    axios
      .post(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/abnormality/create`,
        {
          checkItem: itemId,
          abnormality,
          countermeasure,
          targetDate: target,
          pic,
          user,
          line,
          processNo,
          spare,
          status,
          beforeImage,
          pS,
          m_spec: mspecs,
        }
      )
      .then(() => {
        toast.success("Abnormality Recorded Successfully");
        setShowModal(false);
      })
      .catch(() => {
        toast.error("Please fill in Abnormality Details");
      });
  };

  return (
    <Modal show={showModal} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <Modal.Title className="fw-bold d-flex align-items-center gap-2" style={{ fontSize: "1.15rem", color: "#1e293b" }}>
          <i className="bi bi-exclamation-triangle-fill text-warning"></i>
          Record Abnormality
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3 px-4">
        {/* Context Info Pills */}
        <div className="d-flex flex-wrap gap-2 mb-3 p-2.5 rounded-3 border" style={{ background: "#f8fafc" }}>
          <span className="badge rounded-pill bg-white text-dark border px-2.5 py-1.5 fw-medium">
            Line: <strong className="text-primary">{line || "-"}</strong>
          </span>
          <span className="badge rounded-pill bg-white text-dark border px-2.5 py-1.5 fw-medium">
            OP No: <strong className="text-primary">{processNo || "-"}</strong>
          </span>
          <span className="badge rounded-pill bg-white text-dark border px-2.5 py-1.5 fw-medium text-truncate" style={{ maxWidth: "350px" }} title={workDetail}>
            Item: <strong className="text-dark">{workDetail || "-"}</strong>
          </span>
        </div>

        <form onSubmit={formHandler}>
          {/* Abnormality Details (Compulsory) */}
          <div className="mb-3">
            <label htmlFor="ab" className="form-label fw-semibold" style={{ fontSize: "0.88rem" }}>
              <span className="text-danger me-1">*</span>Abnormality Details:
            </label>
            <textarea
              className="form-control"
              rows={3}
              id="ab"
              value={abnormality}
              onChange={(e) => setAbnormality(e.target.value)}
              placeholder="Describe the issue / defect observed (Required)"
              required
              style={{ fontSize: "0.88rem", borderRadius: "8px" }}
            />
          </div>

          {/* Countermeasure */}
          <div className="mb-3">
            <label htmlFor="ac" className="form-label fw-semibold" style={{ fontSize: "0.88rem" }}>
              Immediate Countermeasure / Action:
            </label>
            <textarea
              className="form-control"
              rows={2}
              id="ac"
              value={countermeasure}
              onChange={(e) => setCountermeasure(e.target.value)}
              placeholder="Action taken or suggested to mitigate the issue"
              style={{ fontSize: "0.88rem", borderRadius: "8px" }}
            />
          </div>

          {/* Spare Required */}
          <div className="mb-3">
            <label htmlFor="spares" className="form-label fw-semibold" style={{ fontSize: "0.88rem" }}>
              Spare Required:
            </label>
            <input
              className="form-control"
              type="text"
              id="spares"
              value={spare}
              onChange={(e) => setSpare(e.target.value)}
              placeholder="e.g. Claw, Seal, Sensor (or leave blank)"
              style={{ fontSize: "0.88rem", borderRadius: "8px" }}
            />
          </div>

          {/* Row: PIC & Target Date */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label htmlFor="pic" className="form-label fw-semibold" style={{ fontSize: "0.88rem" }}>
                PIC (Person In Charge):
              </label>
              <input
                className="form-control"
                type="text"
                id="pic"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                placeholder="Name of assigned technician / engineer"
                style={{ fontSize: "0.88rem", borderRadius: "8px" }}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="target" className="form-label fw-semibold d-flex align-items-center gap-1.5" style={{ fontSize: "0.88rem" }}>
                <i className="bi bi-calendar-event text-primary"></i>
                Target Date:
              </label>
              <input
                className="form-control"
                type="date"
                id="target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                style={{ fontSize: "0.88rem", borderRadius: "8px" }}
              />
            </div>
          </div>

          {/* Status Selection */}
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: "0.88rem" }}>
              Status:
            </label>
            <Select
              options={options}
              defaultValue={{ value: "pending", label: "Pending" }}
              menuPlacement="top"
              onChange={(e) => setStatus(e ? e.value : "pending")}
              styles={{
                control: (provided) => ({
                  ...provided,
                  borderRadius: "8px",
                  fontSize: "0.88rem",
                }),
              }}
            />
          </div>

          {/* Photo Upload */}
          <div className="p-2.5 rounded-3 border mb-2" style={{ background: "#f8fafc" }}>
            <label className="form-label fw-semibold small mb-2 d-flex align-items-center gap-1.5">
              <i className="bi bi-camera-fill text-secondary"></i>
              Attach Defect Photo (Before Image):
            </label>
            <div className="d-flex gap-2">
              <input
                type="file"
                id="uploadImage"
                className="form-control form-control-sm"
                accept="image/*"
                onChange={selectedFileHandler}
                style={{ borderRadius: "6px" }}
              />
              <button
                type="button"
                className="btn btn-sm btn-outline-primary text-nowrap px-3 fw-semibold"
                onClick={uploadImage}
                style={{ borderRadius: "6px" }}
              >
                Upload Photo
              </button>
            </div>
            {beforeImage && (
              <small className="text-success d-block mt-1 fw-semibold">
                <i className="bi bi-check-circle-fill me-1"></i> Uploaded: {beforeImage}
              </small>
            )}
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
        <Button variant="secondary" size="sm" onClick={handleClose} style={{ borderRadius: "6px" }}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={formHandler} className="fw-semibold px-4" style={{ borderRadius: "6px" }}>
          Submit Abnormality
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalForm;
