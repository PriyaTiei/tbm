import React, { Fragment } from "react";
import PendingCard from "./PendingCard";
import { useDispatch } from "react-redux";
import { setProcessData } from "../../redux/processData/processActions";

function PendingLine({ line, processList, counts }) {
  const dispatch = useDispatch();
  const handleClick = (processData) => {
    dispatch(setProcessData(processData));
  };

  const totalSum = processList ? processList.length : 0;

  return (
    <Fragment>
      {/* Modern Responsive Line Header - Home Page Style */}
      <div
        className="d-flex align-items-center justify-content-between flex-wrap gap-2 px-3 py-2 mx-3 my-3 rounded-3 shadow-sm text-white"
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <h5 className="m-0 fw-bold d-flex align-items-center" style={{ letterSpacing: "0.4px", fontSize: "1.1rem" }}>
            <i className="bi bi-hourglass-split me-2 text-white-50"></i>
            {line}
          </h5>
          <span
            className="badge rounded-pill fw-bold ms-1"
            style={{
              background: "rgba(255, 255, 255, 0.22)",
              color: "#ffffff",
              fontSize: "0.82rem",
              padding: "3px 10px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
            title="Pending Stations"
          >
            {totalSum} Pending {totalSum === 1 ? "Station" : "Stations"}
          </span>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-3 mx-3 mb-4">
        {processList && processList.length > 0 ? (
          processList.map((process) => (
            <PendingCard
              key={process.processNo}
              onClick={() => handleClick(process.processData)}
              processNo={process.processNo}
              processData={process.processData}
              result={process.processData?.[0]?.result || "PENDING"}
            />
          ))
        ) : (
          <div className="text-center w-100 py-3 text-muted">No pending cards available.</div>
        )}
      </div>
    </Fragment>
  );
}

export default PendingLine;
