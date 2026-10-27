import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { getAbnormality } from "../redux/abnormality/abnormalityActions";
import AbnormalityRecordUpdate from "./AbnormalityRecordUpdate";
import RaiseCardModal from "./RaiseCardModal";
import AbnormalityImageModal from "./AbnormalityImageModal";

function AbnormilityDoc({ item, fromDateSt, toDateSt }) {
  const {
    createdAt,
    line,
    processNo,
    checkItem,
    abnormality,
    countermeasure,
    spare,
    pic,
    targetDate,
    status,
    beforeImage,
    afterImage,
    _id,
    pS
  } = item;

  const workDetail = checkItem ? checkItem.workDetail : "";

  const [showModal, setShowModal] = useState(false);
  const [showModalRaiseCard, setShowModalRaiseCard] = useState(false);
  const [showModalImage, setShowModalImage] = useState(false);

  const auth = useSelector((state) => state.auth);
  const level = auth.user ? auth.user.level : 0;
  const [beforeImageUrl, setBeforeImageUrl] = useState(null);
  const [afterImageUrl, setAfterImageUrl] = useState(null);

  useEffect(() => {
    if (beforeImage) {
      if (beforeImage instanceof File) {
        setBeforeImageUrl(URL.createObjectURL(beforeImage));
      } else if (typeof beforeImage === "string") {
        setBeforeImageUrl(`http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/assets/abnormalityImage/${beforeImage}`);
      } else {
        setBeforeImageUrl(null);
      }

      if (afterImage instanceof File) {
        setAfterImageUrl(URL.createObjectURL(afterImage));
      } else if (typeof afterImage === "string") {
        setAfterImageUrl(`http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/assets/abnormalityImage/${afterImage}`);
      } else {
        setAfterImageUrl(null);
      }
    } else {
      setBeforeImageUrl(null);
      setAfterImageUrl(null);
    }

    return () => {
      if (beforeImageUrl) URL.revokeObjectURL(beforeImageUrl);
      if (afterImageUrl) URL.revokeObjectURL(afterImageUrl);
    };
  }, [beforeImage, afterImage]);

  const dispatch = useDispatch();
  const deleteItem = (itemId) => {
    axios
      .delete(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/abnormality/update/${itemId}`
      )
      .then(() => {
        dispatch(getAbnormality(fromDateSt, toDateSt));
      })
      .catch((err) => {
        console.error("Delete failed:", err);
      });
  };

  const deleteConfirmation = () => {
    if (window.confirm("Are you sure you want to Delete this abnormality item?")) {
      deleteItem(_id);
    }
  };

  const renderStatusBadge = (st) => {
    const s = String(st || "").toLowerCase();
    if (s === "complete") {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1">
          <i className="bi bi-check-circle-fill"></i> COMPLETE
        </span>
      );
    }
    if (s === "inprogress") {
      return (
        <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1">
          <i className="bi bi-gear-wide-connected"></i> IN PROGRESS
        </span>
      );
    }
    return (
      <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1">
        <i className="bi bi-hourglass-split"></i> PENDING
      </span>
    );
  };

  return (
    <tr className="align-middle">
      <td className="font-monospace text-secondary" style={{ fontSize: "11px", whiteSpace: "nowrap" }}>
        {createdAt ? createdAt.slice(0, 10) : "-"}
      </td>
      <td className="font-monospace text-muted" style={{ fontSize: "11px", whiteSpace: "nowrap" }}>
        {item.cardCreatedDate ? item.cardCreatedDate.slice(0, 10) : "-"}
      </td>
      <td>
        <span className="badge bg-light text-secondary border">
          {pS === "P" ? "Maint." : pS === "S" ? "Prod." : "--"}
        </span>
      </td>
      <td className="fw-semibold text-dark">{line}</td>
      <td>
        <span className="badge bg-light text-dark border font-monospace">{processNo}</span>
      </td>
      <td className="fw-medium text-dark" style={{ minWidth: "140px" }}>{workDetail}</td>
      <td style={{ minWidth: "160px", wordBreak: "break-word" }}>{abnormality}</td>
      <td style={{ minWidth: "160px", wordBreak: "break-word" }}>{countermeasure}</td>
      <td style={{ whiteSpace: "nowrap" }}>{spare || "--"}</td>
      <td style={{ whiteSpace: "nowrap" }}>{pic || "--"}</td>
      <td className="font-monospace text-secondary" style={{ fontSize: "11px", whiteSpace: "nowrap" }}>
        {targetDate ? targetDate.slice(0, 10) : "--"}
      </td>
      <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
        {renderStatusBadge(status)}
      </td>
      <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
        <div className="d-inline-flex align-items-center gap-1">
          <button
            className="btn btn-sm btn-outline-primary rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1 shadow-sm"
            style={{ fontSize: "11px", fontWeight: "600" }}
            onClick={() => setShowModalImage(true)}
            title="View Images"
          >
            <i className="bi bi-image"></i>
            <span>Images</span>
          </button>

          {level >= 20 && (
            <button
              className="btn btn-sm btn-outline-warning text-dark rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1 shadow-sm"
              style={{ fontSize: "11px", fontWeight: "600" }}
              title="Update Abnormality"
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-pencil-square"></i>
              <span>Update</span>
            </button>
          )}

          {level >= 40 && (
            <button
              className="btn btn-sm btn-outline-danger rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1 shadow-sm"
              style={{ fontSize: "11px", fontWeight: "600" }}
              onClick={deleteConfirmation}
              title="Delete Entry"
            >
              <i className="bi bi-trash3"></i>
              <span>Delete</span>
            </button>
          )}

          {level >= 100 && (
            <button
              className="btn btn-sm btn-warning text-dark rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1 shadow-sm"
              style={{ fontSize: "11px", fontWeight: "600" }}
              title="Raise Card"
              onClick={() => setShowModalRaiseCard(true)}
            >
              <i className="bi bi-files"></i>
              <span>Raise</span>
            </button>
          )}
        </div>
      </td>

      {showModal && (
        <AbnormalityRecordUpdate
          showModal={showModal}
          setShowModal={setShowModal}
          id={_id}
          checkItem={checkItem?._id}
          line={line}
          processNo={processNo}
          workDetail={workDetail}
          abnormality={abnormality}
          countermeasure={countermeasure}
          spare={spare}
          pic={pic}
          targetDate={targetDate}
          status={status}
          fromDateSt={fromDateSt}
          toDateSt={toDateSt}
          beforeImage={beforeImage}
          afterImage={afterImage}
        />
      )}

      {showModalRaiseCard && (
        <RaiseCardModal
          showModal={showModalRaiseCard}
          setShowModal={setShowModalRaiseCard}
          id={_id}
          checkItem={checkItem?._id}
          line={line}
          processNo={processNo}
          workDetail={workDetail}
          abnormality={abnormality}
          countermeasure={countermeasure}
          spare={spare}
          pic={pic}
          targetDate={targetDate}
          status={status}
          beforeImage={beforeImage}
          afterImage={afterImage}
          pS={pS}
          abnormalityId={item._id}
        />
      )}

      {showModalImage && (
        <AbnormalityImageModal
          showModal={showModalImage}
          setShowModal={setShowModalImage}
          beforeImageUrl={beforeImageUrl}
          afterImageUrl={afterImageUrl}
        />
      )}
    </tr>
  );
}

export default AbnormilityDoc;
