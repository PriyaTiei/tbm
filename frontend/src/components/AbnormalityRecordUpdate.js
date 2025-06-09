import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";

import Select from "react-select";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getAbnormality } from "../redux/abnormality/abnormalityActions";
import { toast } from "react-toastify";

function ModalForm(props) {
  const {
    showModal,
    setShowModal,
    id,
    line,
    processNo,
    checkItem,
    workDetail,
    abnormality,
    countermeasure,
    targetDate,
    pic,
    spare,
    status,
    fromDateSt,
    toDateSt,
    image,
    
  } = props;
 
  const dispatch = useDispatch();
  const handleClose = () => {
    setShowModal(false);
  };

  const [selectedFile, setSelectedFile] = useState("");
  const [imageM, setImageM] = useState(image);
  const [beforeImage, setBeforeImage] = useState("");
  const [afterImage, setAfterImage] = useState("");

  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);


  const handleBeforeFileChange = (e) => {
    setBeforeFile(e.target.files[0]);
  };

  const handleAfterFileChange = (e) => {
    setAfterFile(e.target.files[0]);
  };


  const auth = useSelector((state) => state.auth);

  const user = auth.user._id

  const [abnormalityM, setAbnormalityM] = useState(abnormality);
  const [countermeasureM, setCountermeasureM] = useState(countermeasure);
  const [targetM, setTargetM] = useState(targetDate);
  const [picM, setPicM] = useState(pic);
  const [spareM, setSpareM] = useState(spare);
  const [statusM, setStatusM] = useState(status);

  const options = [
    { value: "pending", label: "Pending" },
    { value: "inprogress", label: "Inprogress" },
    { value: "complete", label: "Complete" },
  ];
  const uploadBeforeAfterImages = async (e) => {
    e.preventDefault();
    try {
      if (beforeFile) {
        const formDataBefore = new FormData();
        formDataBefore.append("image", beforeFile);
        const beforeRes = await axios.post(
          `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/abnormality/uploadImage`,
          formDataBefore,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setBeforeImage(beforeRes.data.file.filename);
      }

      if (afterFile) {
        const formDataAfter = new FormData();
        formDataAfter.append("image", afterFile);
        const afterRes = await axios.post(
          `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/abnormality/uploadImage`,
          formDataAfter,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setAfterImage(afterRes.data.file.filename);
      }

      toast.success("Before & After images uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload Before/After images");
    }
  };

  // const uploadImage = (e) => {
  //   e.preventDefault();
  //   const formData = new FormData();
  //   // formData.append("_id", _id);
  //   formData.append("image", selectedFile);

  //   axios
  //     .post(
  //       `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/abnormality/uploadImage`,
  //       formData,
  //       {
  //         headers: { "Content-Type": "Multipart/form-data" },
  //       }
  //     )
  //     .then((result) => {
  //       setImageM(result.data.file.filename);
  //       if (result.data.success) {
  //         toast.success(
  //           `Image uploaded successfully, Name of file ${result.data.file.filename}`
  //         );
  //       }
  //     })
  //     .catch((err) => {
        
  //       toast.error(
  //         `Failed to upload Image, choose correct Image file with file extension .png/.jpg`
  //       );
  //     });
  // };


const formHandler = async (e) => {
  e.preventDefault();

  try {
    // 1. Update the abnormality data (without images)
    const updateRes = await axios.put(
      `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/abnormality/update/${id}`,
      {
        _id: id,
        line,
        processNo,
        user,
        checkItem,
        abnormality: abnormalityM,
        countermeasure: countermeasureM,
        targetDate: targetM,
        pic: picM,
        spare: spareM,
        status: statusM,
      }
    );
    console.log("🧾 imageM state:", imageM);

    try {
      // 2. If images are selected, upload them separately
      if (imageM?.before || imageM?.after) {
        const formData = new FormData();
        formData.append("_id", id);
        if (imageM.before) formData.append("beforeImage", imageM.before);
        if (imageM.after) formData.append("afterImage", imageM.after);

        await axios.post(
          `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/abnormality/uploadImage`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }
    } catch (imgErr) {
      console.error("Image Upload Failed:", imgErr);
      toast.warn("Data updated, but image upload failed");
    }

    toast.success("Updated successfully");
    setShowModal(false);
    dispatch(getAbnormality(fromDateSt, toDateSt));
  } catch (err) {
    console.error("Update Error:", err);
    toast.error("Update Failed");
  }
};

  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Update Abnormility</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <div className="d-flex flex m-3">
            <span className="mx-3">
              Line : <span className="h6">{line}</span>
            </span>
            <span className="mx-3">
              OP No : <span className="h6">{processNo}</span>
            </span>
            <span className="mx-3">
              Inspection Item : <span className="h6">{workDetail}</span>
            </span>
          </div>
          <form onSubmit={formHandler} className="form-group mx-3">
            <label htmlFor="ab">Abnormility Details</label>
            <textarea
              className="form-control"
              type="text"
              id="ab"
              value={abnormalityM !== null ? abnormalityM : ""}
              onChange={(e) => setAbnormalityM(e.target.value)}
              placeholder="Entry to be Compulsory for saving the record"
            />
            <label htmlFor="ac">Countermeasure</label>
            <textarea
              className="form-control"
              type="text"
              id="ac"
              value={countermeasureM !== null ? countermeasureM : ""}
              onChange={(e) => setCountermeasureM(e.target.value)}
            />

            <label htmlFor="spares">Spare Required</label>
            <input
              className="form-control"
              type="text"
              id="spares"
              value={spareM !== null ? spareM : ""}
              onChange={(e) => setSpareM(e.target.value)}
            />
            <div className="d-flex justify-content-betweem my-2">
              <div className="me-3 d-flex flex-column">
                <label className="me-1" htmlFor="pic">
                  PIC
                </label>
                <input
                  type="text"
                  id="pic"
                  value={picM !== null ? picM : ""}
                  onChange={(e) => setPicM(e.target.value)}
                />
              </div>
              <div className="mx-3 d-flex flex-column">
                <label className="me-1" htmlFor="target">
                  Target Date
                </label>
                <input
                  type="date"
                  id="target"
                  value={targetM !== null ? targetM : ""}
                  onChange={(e) => setTargetM(e.target.value)}
                />
              </div>
            </div>
            <div className="d-flex flex-column">
              <label htmlFor="status" className="me-2">
                Status
              </label>
              <Select
                className="d-inline"
                options={options}
                defaultValue={{ value: `${status}`, label: `${status}` }}
                menuPlacement="top"
                onChange={(e) => setStatusM(e.value)}
              />
            </div>

            {/* <div className="d-flex justify-content-between mt-2">
              <div className="secondCol ms-0">
                <div className="form-group">
                  <input
                    type="file"
                    id="uploadImage"
                    className="form-control"
                    onChange={selectedFileHandler}
                  />
                </div>
              </div>
              <button
                className="btn btn-outline-primary me-1 "
                onClick={uploadImage}
              >
                Save_Image
              </button>
            </div>
            <div className="my-2">
              <input
                className="form-control"
                value={imageM}
                onChange={(e) => setImageM(e.target.value)}
                placeholder="Image Name"
                disabled
              />
            </div> */}
            <div className="mt-3">
              <label className="form-label">Before Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageM((prev) => ({ ...prev, before: e.target.files[0] }))
                }
              />
              <label className="form-label">After Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageM((prev) => ({ ...prev, after: e.target.files[0] }))
                }
              />
              <button className="btn btn-outline-primary" onClick={uploadBeforeAfterImages}>
                Upload Images
              </button>
            </div>

            {/* </div> */}
          </form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" type="submit" onClick={formHandler}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalForm;
