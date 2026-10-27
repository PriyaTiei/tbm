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
            minWidth: "125px",
            maxWidth: "150px",
            background: "linear-gradient(145deg, #1e293b, #0f172a)",
            color: "#ffffff",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.1)",
            transition: "all 0.2s ease-in-out",
            cursor: "pointer",
          }}
          onClick={onClick}
        >
          <div
            className="card-header py-2 border-bottom text-center"
            style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}
          >
            <h6 className="mb-0 fw-bold" style={{ fontSize: "0.95rem" }}>
              {processNo}
            </h6>
          </div>
          <div className="text-center py-2">
            <i
              className="bi bi-file-easel-fill"
              style={{ fontSize: "2.5rem", color: "#60a5fa" }}
            ></i>
          </div>
          <div className="text-center pb-2">
            <span
              className="badge rounded-pill px-2.5 py-1"
              style={{ background: "rgba(255,255,255,0.15)", fontSize: "0.75rem", fontWeight: 600 }}
            >
              Total: {counts}
            </span>
          </div>
          {result === "PENDING" && (
            <div className="text-center pb-2">
              <span className="badge bg-warning text-dark">PENDING</span>
            </div>
          )}
        </div>
      </Link>
    </Fragment>
  );
}
 
