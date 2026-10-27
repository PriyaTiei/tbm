import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/smilecard.module.css";

function PendingCard({ processNo, result, processData, onClick }) {
  const counts = Array.isArray(processData) ? processData.length : 0;

  const isCompleted = result === "COMPLETED";

  return (
    <Fragment>
      <Link
        to={`/pendingTasks/cardDetails/`}
        style={{ textDecoration: "none" }}
      >
        <div
          className={`card mx-2 mb-3 shadow-sm ${styles.translate}`}
          style={{
            minWidth: "125px",
            maxWidth: "150px",
            background: isCompleted
              ? "linear-gradient(145deg, #065f46, #047857)"
              : "linear-gradient(145deg, #1e293b, #0f172a)",
            color: "#ffffff",
            borderRadius: "10px",
            border: isCompleted ? "1px solid #34d399" : "1px solid #fbbf24",
            transition: "all 0.2s ease-in-out",
            cursor: "pointer",
          }}
          onClick={onClick}
        >
          <div
            className="card-header py-2 border-bottom text-center"
            style={{
              borderColor: "rgba(255,255,255,0.1)",
              background: isCompleted ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
            }}
          >
            <h6
              className="mb-0 fw-bold"
              style={{ fontSize: "0.95rem", color: isCompleted ? "#a7f3d0" : "#fde68a" }}
            >
              {processNo}
            </h6>
          </div>
          <div className="text-center py-2">
            <i
              className="bi bi-file-easel-fill"
              style={{ fontSize: "2.5rem", color: isCompleted ? "#34d399" : "#fbbf24" }}
            ></i>
          </div>
          <div className="text-center pb-1">
            <span
              className="badge rounded-pill px-2.5 py-1"
              style={{ background: "rgba(255,255,255,0.15)", fontSize: "0.75rem", fontWeight: 600 }}
            >
              Total: {counts}
            </span>
          </div>
          <div className="text-center pb-2">
            <span className={`badge ${isCompleted ? "bg-success" : "bg-warning text-dark"}`}>
              {result || "PENDING"}
            </span>
          </div>
        </div>
      </Link>
    </Fragment>
  );
}

export default PendingCard;