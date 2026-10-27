import React, { Fragment, useState } from "react";
import MachineCard from "./MachineCard";
import Loading from "./Loading";
import CardStatusGraphModel from "./CardStatusGraphModel";

function Line({ line, processNos, counts, dailyStatusDataLinewise }) {
  const [showGraphModal, setShowGraphModal] = useState(false);
  const resultData = {};
  dailyStatusDataLinewise = dailyStatusDataLinewise
    ? dailyStatusDataLinewise
    : [];
  dailyStatusDataLinewise.forEach((element) => {
    resultData[element.processNo] = {
      OK: element.result.OK,
      NG: element.result.NG,
    };
  }); 

  let totalSum = 0;
  if (counts && processNos) {
    totalSum = processNos.reduce((sum, p) => sum + (Number(counts[p]) || 0), 0);
  } else if (processNos) {
    totalSum = processNos.length;
  }

  return (
    <Fragment>
      {/* Modern Responsive Line Header */}
      <div
        className="d-flex align-items-center justify-content-between flex-wrap gap-2 px-3 py-2 mx-2 my-3 rounded-3 shadow-sm text-white"
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center bg-white bg-opacity-20 rounded-2"
            style={{ width: "34px", height: "34px" }}
          >
            <i className="bi bi-diagram-3-fill fs-5 text-white"></i>
          </div>
          <h5 className="m-0 fw-bold" style={{ letterSpacing: "0.4px", fontSize: "1.15rem" }}>
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
            title="Total CheckItems"
          >
            {totalSum} Items
          </span>
        </div>

        <button
          onClick={() => setShowGraphModal(true)}
          className="btn btn-sm btn-light text-primary fw-semibold rounded-pill px-3 py-1 shadow-sm d-flex align-items-center gap-1.5 border-0"
          style={{ fontSize: "0.85rem" }}
          title="View Line Status Trend Graph"
        >
          <i className="bi bi-graph-up-arrow"></i>
          <span>Graph</span>
        </button>
      </div>

      {/* Responsive Cards Grid */}
      <div className="d-flex flex-wrap gap-3 px-2 mb-4">
        {processNos ? (
          processNos.map((processNo) => (
            <MachineCard
              processNo={processNo}
              key={processNo}
              line={line}
              count={counts ? counts[processNo] : 0}
              resultData={resultData}
              OK={resultData[processNo] ? resultData[processNo].OK : 0}
              NG={resultData[processNo] ? resultData[processNo].NG : 0}
            />
          ))
        ) : (
          <Loading />
        )}
      </div>

      {showGraphModal && (
        <CardStatusGraphModel
          showModal={showGraphModal}
          setShowModal={setShowGraphModal}
          line={line}
        />
      )}
    </Fragment>
  );
}

export default Line;
