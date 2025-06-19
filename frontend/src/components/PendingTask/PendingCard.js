import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/smilecard.module.css";

function PendingCard({ processNo, result, processData, onClick }) {
  const counts = Array.isArray(processData) ? processData.length : 0;

  let statusColor;
  switch (result) {
    case "PENDING":
      statusColor = "rgba(54, 53, 53, 0.8)"; // Red for pending
      break;
    case "COMPLETED":
      statusColor = "rgba(50, 205, 50, 0.8)"; // Green for completed
      break;
    default:
      statusColor = "rgba(76, 74, 75, 0.8)"; // Default gray
  }

  return (
    <Fragment>
      <Link
        to={`/pendingTasks/cardDetails/`}
        style={{ textDecoration: "none" }}
      >
        <div
          className={`card mx-3 mb-3 ${styles.bg} ${styles.translate}`}
          style={{
            width: "8vmax",
            background: statusColor,
            color: "white",
          }}
          onClick={onClick}
        >
          <div className="card-header">
            <h6 className="text-center">{processNo}</h6>
          </div>
          <div className="m-auto">
            <i
              className="bi bi-file-easel-fill"
              style={{ fontSize: "3rem", color: "white" }}
            ></i>
          </div>
          <div className="text-center">Total {counts}</div>
          <div style={{ height: 10 }}></div>
          <div className="text-center">{processNo}</div>
          {result && <div className="text-center">{result}</div>}
        </div>
      </Link>
    </Fragment>
  );
}

export default PendingCard;