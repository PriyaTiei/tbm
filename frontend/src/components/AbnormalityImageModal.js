// import React from "react";
// import Modal from "react-bootstrap/Modal";
// import "./raiseCard.css";
// import "./trend.css";

// function ModalForm({ showModal, setShowModal, image }) {
//   const handleClose = () => {
//     setShowModal(false);
//   };


//   return (
//     <Modal
//       show={showModal}
//       onHide={handleClose}
//       dialogClassName="my-modal"
//       contentClassName="modal-height"
//     >
//       <Modal.Header closeButton>
//         <Modal.Title>Abnormality Image</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <div
//           style={{ height: "100%", width: "100%" }}
//           className="d-flex justify-content-center align-item-center"
//         >
//           <img
//             src={`http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/assets/abnormalityImage/${image}`}
//             alt="Photo Not loaded"
//             style={{ maxHeight: "65vh", maxWidth: "auto" }}
//           />
//         </div>
//       </Modal.Body>
//       {/* <Modal.Footer></Modal.Footer> */}
//     </Modal>
//   );
// }

// export default ModalForm;


// import React from "react";
// import Modal from "react-bootstrap/Modal";
// import "./raiseCard.css";
// import "./trend.css";

// function ModalForm({ showModal, setShowModal, beforeImage, afterImage }) {
//   const handleClose = () => {
//     setShowModal(false);
//   };

//   const baseUrl = `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/assets/abnormalityImage/`;
//   console.log("Before Image:", beforeImage);
//   console.log("After Image:", afterImage);
//   console.log("Full URL Before:", `${baseUrl}${beforeImage}`);
//   console.log("Full URL After:", `${baseUrl}${afterImage}`);

//   return (
//     <Modal
//       show={showModal}
//       onHide={handleClose}
//       dialogClassName="my-modal"
//       contentClassName="modal-height"
//       size="lg"
//     >
//       <Modal.Header closeButton>
//         <Modal.Title>Abnormality Images</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <div
//           style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}
//         >
//           <div style={{ textAlign: "center" }}>
//             <h5>Before</h5>
//             <img
//               src={`${baseUrl}${beforeImage}`}
//               alt="Before"
//               style={{ maxHeight: "60vh", maxWidth: "100%", margin: "0 10px" }}
//             />
//           </div>
//           <div style={{ textAlign: "center" }}>
//             <h5>After</h5>
//             <img
//               src={`${baseUrl}${afterImage}`}
//               alt="After"
//               style={{ maxHeight: "60vh", maxWidth: "100%", margin: "0 10px" }}
//             />
//           </div>
//         </div>
//       </Modal.Body>
//     </Modal>
//   );
// }

// export default ModalForm;


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
              style={{ maxWidth: "100%", maxHeight: "60vh" }}
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
              style={{ maxWidth: "100%", maxHeight: "60vh" }}
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
