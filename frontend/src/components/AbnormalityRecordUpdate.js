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
  } = props;

  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const user = auth.user._id;

  // State management
  const [abnormalityM, setAbnormalityM] = useState(abnormality || "");
  const [countermeasureM, setCountermeasureM] = useState(countermeasure || "");
  const [targetM, setTargetM] = useState(targetDate || "");
  const [picM, setPicM] = useState(pic || "");
  const [spareM, setSpareM] = useState(spare || "");
  const [statusM, setStatusM] = useState(status || "");
  
  // Simplified image state
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClose = () => {
    // Reset form state when closing
    setAbnormalityM(abnormality || "");
    setCountermeasureM(countermeasure || "");
    setTargetM(targetDate || "");
    setPicM(pic || "");
    setSpareM(spare || "");
    setStatusM(status || "");
    setBeforeImage(null);
    setAfterImage(null);
    setShowModal(false);
  };

  const options = [
    { value: "pending", label: "Pending" },
    { value: "inprogress", label: "Inprogress" },
    { value: "complete", label: "Complete" },
  ];

  // const formHandler = async (e) => {
  //   e.preventDefault();
  //   setIsUploading(true);

  //   try {
  //     // 1. Update the abnormality data first
  //     const updateRes = await axios.put(
  //       `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/abnormality/update/${id}`,
  //       {
  //         _id: id,
  //         line,
  //         processNo,
  //         user,
  //         checkItem,
  //         abnormality: abnormalityM,
  //         countermeasure: countermeasureM,
  //         targetDate: targetM,
  //         pic: picM,
  //         spare: spareM,
  //         status: statusM,
  //       }
  //     );

  //     console.log("Data update successful:", updateRes.data);

  //     // 2. Upload images if selected
  //     if (beforeImage || afterImage) {
  //       try {
  //         const formData = new FormData();
  //         formData.append("_id", id);
          
  //         if (beforeImage) {
  //           console.log("Appending before image:", beforeImage.name);
  //           formData.append("beforeImage", beforeImage); // Back to original field name
  //         }
  //         if (afterImage) {
  //           console.log("Appending after image:", afterImage.name);
  //           formData.append("afterImage", afterImage); // Back to original field name
  //         }

  //         // Log FormData contents for debugging
  //         for (let pair of formData.entries()) {    
  //           console.log(pair[0] + ": " + pair[1]);
  //         }

  //         const imageResponse = await axios.post(
  //           `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/abnormality/uploadImage`,
  //           formData,
  //           {
  //             headers: {
  //               "Content-Type": "multipart/form-data",
  //             },
  //           }
  //         );

  //         console.log("Image upload successful:", imageResponse.data);
  //         toast.success("Updated successfully with images");
  //       } catch (imgErr) {
  //         console.error("Image Upload Failed:", imgErr);
  //         console.error("Image Upload Error Response:", imgErr.response?.data);
  //         toast.error(`Data updated, but image upload failed: ${imgErr.response?.data?.message || imgErr.message}`);
  //       }
  //     } else {
  //       toast.success("Updated successfully");
  //     }

  //     // Don't close modal immediately, let user see the success
  //     setTimeout(() => {
  //       setShowModal(false);
  //       dispatch(getAbnormality(fromDateSt, toDateSt));
  //     }, 1500);
  //   } catch (err) {
  //     console.error("Update Error:", err);
  //     console.error("Update Error Response:", err.response?.data);
  //     toast.error(`Update Failed: ${err.response?.data?.message || err.message}`);
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };



  // const formHandler = async (e) => {
  //   e.preventDefault();
  //   setIsUploading(true);

  //   try {
  //     let beforeImageFilename = null;
  //     let afterImageFilename = null;

  //     // 1. Upload images FIRST if selected
  //     if (beforeImage || afterImage) {
  //       const formData = new FormData();
  //       formData.append("_id", id);
        
  //       if (beforeImage) {
  //         formData.append("beforeImage", beforeImage);
  //       }
  //       if (afterImage) {
  //         formData.append("afterImage", afterImage);
  //       }

  //       const imageResponse = await axios.post(
  //         `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/abnormality/uploadImage`,
  //         formData,
  //         {
  //           headers: { "Content-Type": "multipart/form-data" }
  //         }
  //       );

  //       // Extract filenames
  //       if (imageResponse.data.files.beforeImage) {
  //         beforeImageFilename = imageResponse.data.files.beforeImage.filename;
  //       }
  //       if (imageResponse.data.files.afterImage) {
  //         afterImageFilename = imageResponse.data.files.afterImage.filename;
  //       }
  //     }

  //     // 2. Then update with image filenames
  //     const updateData = {
  //       _id: id,
  //       line,
  //       processNo,
  //       user,
  //       checkItem,
  //       abnormality: abnormalityM,
  //       countermeasure: countermeasureM,
  //       targetDate: targetM,
  //       pic: picM,
  //       spare: spareM,
  //       status: statusM,
  //     };

  //     // Add image filenames to update if they were uploaded
  //     if (beforeImageFilename) {
  //       updateData.beforeImage = beforeImageFilename;
  //     }
  //     if (afterImageFilename) {
  //       updateData.afterImage = afterImageFilename;
  //     }

  //     const updateRes = await axios.put(
  //       `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/abnormality/update/${id}`,
  //       updateData
  //     );

  //     toast.success("Updated successfully with images");
  //     setTimeout(() => {
  //       setShowModal(false);
  //       dispatch(getAbnormality(fromDateSt, toDateSt));
  //     }, 1500);

  //   } catch (err) {
  //     console.error("Update Error:", err);
  //     toast.error(`Update Failed: ${err.response?.data?.message || err.message}`);
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };



  const formHandler = async (e) => {
  e.preventDefault();
  setIsUploading(true);

  try {
    let beforeImageFilename = null;
    let afterImageFilename = null;

    // 1. Upload images FIRST if selected
    if (beforeImage || afterImage) {
      const formData = new FormData();
      formData.append("_id", id);
      
      if (beforeImage) {
        formData.append("beforeImage", beforeImage);
      }
      if (afterImage) {
        formData.append("afterImage", afterImage);
      }

      const imageResponse = await axios.post(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/abnormality/uploadImage`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      // Extract filenames
      if (imageResponse.data.files.beforeImage) {
        beforeImageFilename = imageResponse.data.files.beforeImage.filename;
      }
      if (imageResponse.data.files.afterImage) {
        afterImageFilename = imageResponse.data.files.afterImage.filename;
      }
    }

    // 2. Prepare update data - base fields
    const updateData = {
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
    };

    // 3. ✅ ONLY add image fields if new images were uploaded
    if (beforeImageFilename) {
      updateData.beforeImage = beforeImageFilename;
    }
    if (afterImageFilename) {
      updateData.afterImage = afterImageFilename;
    }
    
    // ✅ Don't add null/undefined image fields - this preserves existing images

    const updateRes = await axios.put(
      `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/abnormality/update/${id}`,
      updateData
    );

    toast.success("Updated successfully");
    setTimeout(() => {
      setShowModal(false);
      dispatch(getAbnormality(fromDateSt, toDateSt));
    }, 1500);

  } catch (err) {
    console.error("Update Error:", err);
    toast.error(`Update Failed: ${err.response?.data?.message || err.message}`);
  } finally {
    setIsUploading(false);
  }
};
  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Update Abnormality</Modal.Title>
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
            <div className="mb-3">
              <label htmlFor="ab">Abnormality Details</label>
              <textarea
                className="form-control"
                id="ab"
                value={abnormalityM}
                onChange={(e) => setAbnormalityM(e.target.value)}
                placeholder="Entry to be Compulsory for saving the record"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="ac">Countermeasure</label>
              <textarea
                className="form-control"
                id="ac"
                value={countermeasureM}
                onChange={(e) => setCountermeasureM(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="spares">Spare Required</label>
              <input
                className="form-control"
                type="text"
                id="spares"
                value={spareM}
                onChange={(e) => setSpareM(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-between my-3">
              <div className="me-3 d-flex flex-column">
                <label className="me-1" htmlFor="pic">
                  PIC
                </label>
                <input
                  className="form-control"
                  type="text"
                  id="pic"
                  value={picM}
                  onChange={(e) => setPicM(e.target.value)}
                />
              </div>
              <div className="mx-3 d-flex flex-column">
                <label className="me-1" htmlFor="target">
                  Target Date
                </label>
                <input
                  className="form-control"
                  type="date"
                  id="target"
                  value={targetM}
                  onChange={(e) => setTargetM(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <Select
                options={options}
                value={options.find(option => option.value === statusM)}
                menuPlacement="top"
                onChange={(selectedOption) => setStatusM(selectedOption.value)}
              />
            </div>

            {/* <div className="mb-3">
              <label className="form-label">Before Image</label>
              <input
                className="form-control"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  console.log("Before image selected:", file);
                  setBeforeImage(file);
                }}
              />
              {beforeImage && (
                <small className="text-success">Selected: {beforeImage.name}</small>
              )}
            </div> */}

            <div className="mb-3">
              <label className="form-label">After Image</label>
              <input
                className="form-control"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  console.log("After image selected:", file);
                  setAfterImage(file);
                }}
              />
              {afterImage && (
                <small className="text-success">Selected: {afterImage.name}</small>
              )}
            </div>

            <div className="d-flex justify-content-end">
              <Button 
                variant="secondary" 
                onClick={handleClose} 
                className="me-2"
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={isUploading}
              >
                {isUploading ? "Updating..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default ModalForm;

