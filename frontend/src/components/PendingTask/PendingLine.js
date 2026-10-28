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
      <div
        className="mx-3 my-2 p-2 px-3 rounded-3 d-flex justify-content-between align-items-center shadow-sm"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderLeft: "4px solid #f59e0b",
        }}
      >
        <h5 className="m-0 fw-bold text-dark d-flex align-items-center">
          <i className="bi bi-hourglass-split text-warning me-2"></i>
          {line}
        </h5>
        <span className="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-50 rounded-pill px-3 py-1.5 fw-semibold">
          {totalSum} Pending {totalSum === 1 ? "Station" : "Stations"}
        </span>
      </div>
      <div className="d-flex flex-wrap gap-3 mx-3 mb-4">
        {processList.length > 0 ? (
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
