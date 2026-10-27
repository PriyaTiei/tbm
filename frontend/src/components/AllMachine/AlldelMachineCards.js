import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/smilecard.module.css";


export default function AlldelMachineCard(props) {
  const { processNo, result, processData, onClick } = props;

  let statusColor = "rgba(76,74,75)";
  const counts = processData.length;

 

  return (
    <Fragment>
      <Link
        to={`/delMachine/cardDetails/`}
        style={{ textDecoration: "none" }}
      >
        <div
          className={`card mx-2 mb-3 shadow-sm ${styles.translate}`}
          style={{
            minWidth: "130px",
            maxWidth: "155px",
            background: "#ffffff",
            color: "#1e293b",
            borderRadius: "10px",
            border: "1px solid #fecaca",
            boxShadow: "0 2px 6px rgba(239, 68, 68, 0.05)",
            transition: "all 0.2s ease-in-out",
            cursor: "pointer",
          }}
          onClick={onClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 6px 14px rgba(239, 68, 68, 0.12)";
            e.currentTarget.style.borderColor = "#f87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 6px rgba(239, 68, 68, 0.05)";
            e.currentTarget.style.borderColor = "#fecaca";
          }}
        >
          <div
            className="card-header py-2 border-bottom text-center"
            style={{ borderColor: "#fee2e2", background: "#fef2f2" }}
          >
            <h6 className="mb-0 fw-bold text-truncate" style={{ fontSize: "0.92rem", color: "#b91c1c" }} title={processNo}>
              {processNo}
            </h6>
          </div>
          <div className="text-center py-2.5">
            <i
              className="bi bi-file-easel-fill"
              style={{ fontSize: "2.4rem", color: "#ef4444" }}
            ></i>
          </div>
          <div className="text-center pb-2.5">
            <span
              className="badge rounded-pill px-2.5 py-1"
              style={{
                background: "#fee2e2",
                color: "#b91c1c",
                border: "1px solid #fca5a5",
                fontSize: "0.76rem",
                fontWeight: 600,
              }}
            >
              Deleted: {counts}
            </span>
          </div>
        </div>
      </Link>
    </Fragment>
  );
}
 
