import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAbnormality } from "../redux/abnormality/abnormalityActions";
import {
  filterDate,
  filterDept,
  filterMainLine,
  filterProcessNo,
} from "../redux/filter/filterActions";
import AbnormalityRecordUpdate from "./AbnormalityRecordUpdate";
import RaiseCardModal from "./RaiseCardModal";
import AbnormalityImageModal from "./AbnormalityImageModal";

function AbnormilityDoc({ item, index, fromDateSt, toDateSt }) {
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
    pS,
  } = item;

  const workDetail = checkItem ? checkItem.workDetail || "" : "";

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
        setBeforeImageUrl(
          `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/assets/abnormalityImage/${beforeImage}`,
        );
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
        setAfterImageUrl(
          `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/assets/abnormalityImage/${afterImage}`,
        );
      } else {
        setAfterImageUrl(null);
      }
    } else {
      setAfterImageUrl(null);
    }

    return () => {
      if (
        beforeImageUrl &&
        typeof beforeImageUrl === "string" &&
        beforeImageUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(beforeImageUrl);
      }
      if (
        afterImageUrl &&
        typeof afterImageUrl === "string" &&
        afterImageUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(afterImageUrl);
      }
    };
  }, [beforeImage, afterImage]);

  const dispatch = useDispatch();

  const deleteItem = (itemId) => {
    axios
      .delete(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/abnormality/update/${itemId}`,
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
        target.getDate(),
      ),
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return dateStr.slice(0, 10);
    } catch (e) {
      return dateStr;
    }
  };

  const cardDateDisplay = item.cardCreatedDate
    ? formatDate(item.cardCreatedDate)
    : createdAt
      ? formatDate(createdAt)
      : "—";

  const isComplete = status === "complete";
  const isInProgress = status === "inprogress";

  // Check if target date is overdue (in the past and not yet complete)
  const isOverdue =
    targetDate &&
    !isComplete &&
    new Date(targetDate.slice(0, 10)) <
      new Date(new Date().toISOString().slice(0, 10));

  return (
    <tr
      style={{
        borderLeft: isComplete
          ? "4px solid #10b981"
          : isInProgress
            ? "4px solid #0284c7"
            : "4px solid #f59e0b",
        background: isHovered
          ? isComplete
            ? "rgba(16, 185, 129, 0.04)"
            : isInProgress
              ? "rgba(2, 132, 199, 0.04)"
              : "rgba(245, 158, 11, 0.04)"
          : "#ffffff",
        transition: "background 0.15s ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. S.No */}
      <td
        className="align-middle text-center text-muted fw-semibold"
        style={{
          fontSize: "0.75rem",
          padding: "6px 2px",
          whiteSpace: "nowrap",
        }}
      >
        {index || "•"}
      </td>

      {/* 2. Issue Reported Date */}
      <td
        className="align-middle text-nowrap"
        style={{
          fontSize: "0.78rem",
          color: "#334155",
          padding: "6px 4px",
          whiteSpace: "nowrap",
        }}
      >
        <span>{formatDate(createdAt)}</span>
      </td>

      {/* 3. Card Created Date + Home Button */}
      <td
        className="align-middle text-nowrap"
        style={{ padding: "6px 4px", whiteSpace: "nowrap" }}
      >
        <div className="d-flex align-items-center gap-1">
          <span style={{ fontSize: "0.78rem", color: "#334155" }}>
            {cardDateDisplay}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary p-0 d-inline-flex align-items-center justify-content-center rounded-circle shadow-xs"
            style={{
              width: "20px",
              height: "20px",
              fontSize: "0.68rem",
              flexShrink: 0,
            }}
            title="Jump to this card on Home Page"
            onClick={handleNavigateToHome}
          >
            <i className="bi bi-house-door-fill"></i>
          </button>
        </div>
      </td>

      {/* 4. Department Badge */}
      <td
        className="align-middle text-center"
        style={{ padding: "6px 2px", whiteSpace: "nowrap" }}
      >
        {pS === "S" ? (
          <span
            className="badge rounded-pill fw-semibold"
            style={{
              background: "#eff6ff",
              color: "#1d4ed8",
              border: "1px solid #bfdbfe",
              fontSize: "0.68rem",
              padding: "2px 6px",
            }}
            title="Production"
          >
            Prod
          </span>
        ) : pS === "P" ? (
          <span
            className="badge rounded-pill fw-semibold"
            style={{
              background: "#f5f3ff",
              color: "#6d28d9",
              border: "1px solid #ddd6fe",
              fontSize: "0.68rem",
              padding: "2px 6px",
            }}
            title="Maintenance"
          >
            Maint
          </span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>

      {/* 5. Line */}
      <td
        className="align-middle fw-semibold text-dark"
        style={{ fontSize: "0.78rem", padding: "6px 4px" }}
      >
        <div className="text-truncate" title={line}>
          {line || "—"}
        </div>
      </td>

      {/* 6. Station (OP) */}
      <td
        className="align-middle"
        style={{ fontSize: "0.78rem", padding: "6px 4px" }}
      >
        <span
          className="badge bg-light text-dark border fw-bold px-1.5 py-0.5 rounded text-truncate d-inline-block"
          style={{ fontSize: "0.72rem", maxWidth: "100%" }}
          title={processNo}
        >
          {processNo || "—"}
        </span>
      </td>

      {/* 7. Inspection Item */}
      <td
        className="align-middle"
        style={{ padding: "6px 4px" }}
        title={workDetail}
      >
        <div
          className="text-truncate fw-medium text-dark"
          style={{ fontSize: "0.78rem" }}
        >
          {workDetail || "—"}
        </div>
      </td>

      {/* 8. Abnormality / Defect */}
      <td
        className="align-middle"
        style={{ padding: "6px 4px" }}
        title={abnormality}
      >
        <div
          className="d-flex align-items-center text-danger fw-semibold"
          style={{ fontSize: "0.78rem" }}
        >
          <i
            className="bi bi-exclamation-triangle-fill text-danger me-1 flex-shrink-0"
            style={{ fontSize: "0.75rem" }}
          ></i>
          <span className="text-truncate">{abnormality || "—"}</span>
        </div>
      </td>

      {/* 9. Countermeasure */}
      <td
        className="align-middle"
        style={{ padding: "6px 4px" }}
        title={countermeasure}
      >
        {countermeasure ? (
          <div
            className="text-truncate text-secondary"
            style={{ fontSize: "0.78rem" }}
          >
            {countermeasure}
          </div>
        ) : (
          <span className="text-muted fst-italic">—</span>
        )}
      </td>

      {/* 10. Spare */}
      <td
        className="align-middle text-center"
        style={{ fontSize: "0.75rem", padding: "6px 2px" }}
      >
        {spare ? (
          <span
            className="badge bg-light text-secondary border px-1.5 py-0.5 rounded"
            style={{ fontSize: "0.7rem" }}
          >
            {spare}
          </span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>

      {/* 11. PIC (Person in Charge) */}
      <td
        className="align-middle"
        style={{ fontSize: "0.78rem", padding: "6px 4px" }}
      >
        {pic ? (
          <div className="text-truncate text-dark fw-medium" title={pic}>
            <i
              className="bi bi-person-fill text-secondary me-1"
              style={{ fontSize: "0.72rem" }}
            ></i>
            <span>{pic}</span>
          </div>
        ) : (
          <span
            className="text-muted fst-italic"
            style={{ fontSize: "0.74rem" }}
          >
            Unassigned
          </span>
        )}
      </td>

      {/* 12. Target Date (with Overdue pill if past deadline) */}
      <td
        className="align-middle"
        style={{ padding: "6px 4px", whiteSpace: "nowrap" }}
      >
        {targetDate ? (
          <div className="d-flex align-items-center gap-1">
            <span
              style={{
                fontSize: "0.76rem",
                color: isOverdue ? "#dc2626" : "#475569",
                fontWeight: isOverdue ? 700 : 500,
              }}
            >
              {formatDate(targetDate)}
            </span>
            {isOverdue && (
              <span
                className="badge rounded-pill bg-danger bg-opacity-10 text-danger border border-danger border-opacity-50 fw-bold"
                style={{ fontSize: "0.6rem", padding: "1px 4px" }}
              >
                Overdue
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>

      {/* 13. Sleek Action Buttons Toolbar */}
      <td
        className="align-middle text-center"
        style={{ padding: "6px 2px", whiteSpace: "nowrap" }}
      >
        <div className="d-inline-flex align-items-center gap-1 justify-content-center">
          {/* Images Button */}
          <button
            type="button"
            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 px-2 py-0.5 rounded-pill shadow-xs"
            style={{ fontSize: "0.72rem", fontWeight: 500 }}
            onClick={() => setShowModalImage(true)}
            title="View Defect Photos (Before/After)"
          >
            <i className="bi bi-image" style={{ fontSize: "0.75rem" }}></i>
            <span>Images</span>
            {(beforeImage || afterImage) && (
              <span
                className="badge bg-primary text-white rounded-circle p-0"
                style={{ width: "5px", height: "5px" }}
              ></span>
            )}
          </button>

          {/* Update Button (Level >= 20) */}
          {level >= 20 && (
            <button
              type="button"
              className="btn btn-sm btn-warning d-inline-flex align-items-center gap-1 px-2 py-0.5 rounded-pill shadow-xs text-dark fw-semibold"
              style={{ fontSize: "0.72rem" }}
              onClick={() => setShowModal(true)}
              title="Update Status & Countermeasure"
            >
              <i
                className="bi bi-pencil-square"
                style={{ fontSize: "0.75rem" }}
              ></i>
              <span>Update</span>
            </button>
          )}

          {/* Raise Card Button (Level >= 100) */}
          {level >= 100 && (
            <button
              type="button"
              className="btn btn-sm btn-info text-white d-inline-flex align-items-center gap-1 px-2 py-0.5 rounded-pill shadow-xs"
              style={{
                fontSize: "0.72rem",
                background: "#0284c7",
                borderColor: "#0284c7",
              }}
              onClick={() => setShowModalRaiseCard(true)}
              title="Raise Preventive Maintenance Card"
            >
              <i className="bi bi-files" style={{ fontSize: "0.75rem" }}></i>
              <span>Raise</span>
            </button>
          )}

          {/* Delete Button (Level >= 40) */}
          {level >= 40 && (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center p-0 rounded-circle shadow-xs"
              style={{ width: "24px", height: "24px" }}
              onClick={deleteConfirmation}
              title="Delete Abnormality Record"
            >
              <i className="bi bi-trash3" style={{ fontSize: "0.75rem" }}></i>
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
