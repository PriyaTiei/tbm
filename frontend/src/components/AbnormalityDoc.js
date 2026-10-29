import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAbnormality } from "../redux/abnormality/abnormalityActions";
import { filterDate, filterDept, filterMainLine, filterProcessNo } from "../redux/filter/filterActions";
import AbnormalityRecordUpdate from "./AbnormalityRecordUpdate";
import RaiseCardModal from "./RaiseCardModal";
import AbnormalityImageModal from "./AbnormalityImageModal";

function AbnormilityDoc({ item, fromDateSt, toDateSt }) {
  const navigate = useNavigate();
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

  const workDetail = checkItem ? (checkItem.workDetail || "") : "";

  const [showModal, setShowModal] = useState(false);
  const [showModalRaiseCard, setShowModalRaiseCard] = useState(false);
  const [showModalImage, setShowModalImage] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    } else {
      setBeforeImageUrl(null);
    }

    if (afterImage) {
      if (afterImage instanceof File) {
        setAfterImageUrl(URL.createObjectURL(afterImage));
      } else if (typeof afterImage === "string") {
        setAfterImageUrl(`http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/assets/abnormalityImage/${afterImage}`);
      } else {
        setAfterImageUrl(null);
      }
    } else {
      setAfterImageUrl(null);
    }

    return () => {
      if (beforeImageUrl && typeof beforeImageUrl === "string" && beforeImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(beforeImageUrl);
      }
      if (afterImageUrl && typeof afterImageUrl === "string" && afterImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(afterImageUrl);
      }
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
        console.error("Error deleting abnormality record:", err);
      });
  };

  const deleteConfirmation = () => {
    if (window.confirm("Are you sure you want to Delete this item?")) {
      deleteItem(_id);
    }
  };

  const handleNavigateToHome = () => {
    const cardDateStr = item.cardCreatedDate || createdAt;
    if (!cardDateStr) return;
    const target = new Date(cardDateStr);

    localStorage.setItem("changedDate", target.toISOString());

    dispatch(
      filterDate(
        target.getDay(),
        Math.floor(target.getDate() / 7.1) + 1,
        target.getMonth() + 1,
        target.getFullYear(),
        target.getDate()
      )
    );

    if (pS) {
      dispatch(filterDept(pS));
    }
    if (line) {
      dispatch(filterMainLine(line));
    }
    if (processNo) {
      dispatch(filterProcessNo(processNo));
    }

    navigate("/");
  };

  const cardDateDisplay = item.cardCreatedDate
    ? item.cardCreatedDate.slice(0, 10)
    : createdAt
    ? createdAt.slice(0, 10)
    : "-";

  const isComplete = status === "complete";
  const isInProgress = status === "inprogress";

  return (
    <tr
      style={{
        borderLeft: isComplete
          ? "4px solid #10b981"
          : isInProgress
          ? "4px solid #f59e0b"
          : "4px solid #94a3b8",
        background: isHovered
          ? isComplete
            ? "rgba(16, 185, 129, 0.05)"
            : isInProgress
            ? "rgba(245, 158, 11, 0.05)"
            : "#f8fafc"
          : "#ffffff",
        transition: "background 0.15s ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Issue Reported Date */}
      <td className="align-middle text-nowrap" style={{ fontSize: "0.8rem", color: "#334155" }}>
        {createdAt ? createdAt.slice(0, 10) : "-"}
      </td>

      {/* 2. Card Created Date + Quick Home Button */}
      <td className="align-middle text-nowrap">
        <div className="d-flex align-items-center gap-1.5">
          <span style={{ fontSize: "0.8rem", color: "#334155" }}>{cardDateDisplay}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary p-0 d-inline-flex align-items-center justify-content-center rounded-circle"
            style={{ width: "22px", height: "22px", fontSize: "0.72rem" }}
            title="View checklist card on Home Page"
            onClick={handleNavigateToHome}
          >
            <i className="bi bi-house-door-fill"></i>
          </button>
        </div>
      </td>

      {/* 3. Department Badge */}
      <td className="align-middle text-center">
        {pS === "S" ? (
          <span
            className="badge rounded-pill fw-semibold"
            style={{
              background: "#eff6ff",
              color: "#1d4ed8",
              border: "1px solid #bfdbfe",
              fontSize: "0.72rem",
              padding: "2.5px 8px",
            }}
          >
            Prod.
          </span>
        ) : pS === "P" ? (
          <span
            className="badge rounded-pill fw-semibold"
            style={{
              background: "#f5f3ff",
              color: "#6d28d9",
              border: "1px solid #ddd6fe",
              fontSize: "0.72rem",
              padding: "2.5px 8px",
            }}
          >
            Maint.
          </span>
        ) : (
          <span className="text-muted">-</span>
        )}
      </td>

      {/* 4. Line */}
      <td className="align-middle fw-semibold text-dark text-nowrap" style={{ fontSize: "0.82rem" }}>
        {line || "-"}
      </td>

      {/* 5. Process / OP */}
      <td className="align-middle text-nowrap" style={{ fontSize: "0.82rem" }}>
        {processNo || "-"}
      </td>

      {/* 6. Item / Work Detail */}
      <td className="align-middle" style={{ maxWidth: "200px" }} title={workDetail}>
        <div className="text-truncate">{workDetail || "-"}</div>
      </td>

      {/* 7. Abnormality */}
      <td className="align-middle" style={{ maxWidth: "200px" }} title={abnormality}>
        <div className="text-truncate fw-medium text-danger">{abnormality || "-"}</div>
      </td>

      {/* 8. Countermeasure */}
      <td className="align-middle" style={{ maxWidth: "200px" }} title={countermeasure}>
        <div className="text-truncate text-secondary">{countermeasure || "-"}</div>
      </td>

      {/* 9. Spare */}
      <td className="align-middle text-nowrap" style={{ fontSize: "0.8rem" }}>
        {spare || "-"}
      </td>

      {/* 10. PIC (Person in Charge) */}
      <td className="align-middle text-nowrap fw-medium" style={{ fontSize: "0.8rem" }}>
        {pic || "-"}
      </td>

      {/* 11. Target Date */}
      <td className="align-middle text-nowrap" style={{ fontSize: "0.8rem", color: "#475569" }}>
        {targetDate ? targetDate.slice(0, 10) : "-"}
      </td>

      {/* 12. Status Badge */}
      <td className="align-middle text-center text-nowrap">
        {isComplete ? (
          <span
            className="badge rounded-pill fw-semibold d-inline-flex align-items-center"
            style={{
              background: "#dcfce7",
              color: "#15803d",
              border: "1px solid #86efac",
              fontSize: "0.72rem",
              padding: "3px 8px",
            }}
          >
            <i className="bi bi-check-circle-fill me-1" style={{ fontSize: "0.7rem" }}></i>
            COMPLETE
          </span>
        ) : isInProgress ? (
          <span
            className="badge rounded-pill fw-semibold d-inline-flex align-items-center"
            style={{
              background: "#fef3c7",
              color: "#b45309",
              border: "1px solid #fde68a",
              fontSize: "0.72rem",
              padding: "3px 8px",
            }}
          >
            <i className="bi bi-clock-history me-1" style={{ fontSize: "0.7rem" }}></i>
            IN PROGRESS
          </span>
        ) : (
          <span
            className="badge rounded-pill fw-semibold d-inline-flex align-items-center"
            style={{
              background: "#f1f5f9",
              color: "#475569",
              border: "1px solid #cbd5e1",
              fontSize: "0.72rem",
              padding: "3px 8px",
            }}
          >
            <i className="bi bi-exclamation-circle me-1" style={{ fontSize: "0.7rem" }}></i>
            PENDING
          </span>
        )}
      </td>

      {/* 13. Consolidated Actions Column */}
      <td className="align-middle text-center" style={{ whiteSpace: "nowrap" }}>
        <div className="d-inline-flex align-items-center gap-1.5">
          {/* Images Modal Button */}
          <button
            type="button"
            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center p-0 rounded-circle shadow-sm"
            style={{ width: "28px", height: "28px" }}
            onClick={() => setShowModalImage(true)}
            title="View Images"
          >
            <i className="bi bi-image" style={{ fontSize: "0.85rem" }}></i>
          </button>

          {/* Update Record Button (Level >= 20) */}
          {level >= 20 && (
            <button
              type="button"
              className="btn btn-sm btn-warning d-inline-flex align-items-center justify-content-center p-0 rounded-circle shadow-sm text-dark"
              style={{ width: "28px", height: "28px" }}
              onClick={() => setShowModal(true)}
              title="Update Record / Countermeasure"
            >
              <i className="bi bi-pencil-square" style={{ fontSize: "0.85rem" }}></i>
            </button>
          )}

          {/* Raise Maintenance Card Button (Level >= 100) */}
          {level >= 100 && (
            <button
              type="button"
              className="btn btn-sm btn-info text-white d-inline-flex align-items-center justify-content-center p-0 rounded-circle shadow-sm"
              style={{ width: "28px", height: "28px", background: "#0284c7", borderColor: "#0284c7" }}
              onClick={() => setShowModalRaiseCard(true)}
              title="Raise Card"
            >
              <i className="bi bi-files" style={{ fontSize: "0.85rem" }}></i>
            </button>
          )}

          {/* Delete Record Button (Level >= 40) */}
          {level >= 40 && (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center p-0 rounded-circle shadow-sm"
              style={{ width: "28px", height: "28px" }}
              onClick={deleteConfirmation}
              title="Delete Record"
            >
              <i className="bi bi-trash3" style={{ fontSize: "0.85rem" }}></i>
            </button>
          )}
        </div>
      </td>

      {/* Modals */}
      {showModal && (
        <AbnormalityRecordUpdate
          showModal={showModal}
          setShowModal={setShowModal}
          id={_id}
          checkItem={checkItem ? checkItem._id : null}
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
          checkItem={checkItem ? checkItem._id : null}
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
