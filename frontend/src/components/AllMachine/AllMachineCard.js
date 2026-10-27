import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/smilecard.module.css";


export default function AllMachineCard(props) {
  const { processNo, result, processData, onClick } = props;

  console.log("ProcessData for", processNo, ":", processData);

  let statusColor = "rgba(76,74,75)";
  const counts = processData.length;

 

  return (
    <Fragment>
      <Link
        to={`/allMachine/cardDetails/`}
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
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 6px rgba(15, 23, 42, 0.05)",
            transition: "all 0.2s ease-in-out",
            cursor: "pointer",
          }}
          onClick={onClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 6px 14px rgba(37, 99, 235, 0.12)";
            e.currentTarget.style.borderColor = "#93c5fd";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 6px rgba(15, 23, 42, 0.05)";
            e.currentTarget.style.borderColor = "#e2e8f0";
          }}
        >
          <div
            className="card-header py-2 border-bottom text-center"
            style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}
          >
            <h6 className="mb-0 fw-bold text-dark text-truncate" style={{ fontSize: "0.92rem" }} title={processNo}>
              {processNo}
            </h6>
          </div>
          <div className="text-center py-2.5">
            <i
              className="bi bi-file-easel-fill"
              style={{ fontSize: "2.4rem", color: "#2563eb" }}
            ></i>
          </div>
          <div className="text-center pb-2.5">
            <span
              className="badge rounded-pill px-2.5 py-1"
              style={{
                background: "#eff6ff",
                color: "#1d4ed8",
                border: "1px solid #bfdbfe",
                fontSize: "0.76rem",
                fontWeight: 600,
              }}
            >
              Total: {counts}
            </span>
          </div>
          {result === "PENDING" && (
            <div className="text-center pb-2">
              <span
                className="badge rounded-pill px-2 py-1"
                style={{
                  background: "#fef3c7",
                  color: "#92400e",
                  border: "1px solid #fde68a",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                }}
              >
                PENDING
              </span>
            </div>
          )}
        </div>
      </Link>
    </Fragment>
  );
}
 
