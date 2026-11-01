import React, { Fragment } from "react";
import { Link } from "react-router-dom";

function MachineCard(props) {
  const { processNo, line, count = 0, OK = 0, NG = 0 } = props;

  // Determine dynamic gradient based on check completion status
  let cardGradient = "linear-gradient(145deg, #4338ca 0%, #3730a3 100%)"; // default indigo
  if (count > 0 && OK === count) {
    cardGradient = "linear-gradient(145deg, #10b981 0%, #059669 100%)"; // complete: emerald green
  } else if (NG > 0) {
    cardGradient = "linear-gradient(145deg, #ef4444 0%, #dc2626 100%)"; // issue: red alert
  } else if (OK > 0) {
    cardGradient = "linear-gradient(145deg, #0284c7 0%, #0369a1 100%)"; // in progress: ocean blue
  }

  return (
    <Fragment>
      <Link
        to={`/checkList?line=${encodeURIComponent(line || "")}&processNo=${encodeURIComponent(processNo || "")}`}
        className="text-decoration-none"
      >
        <div
          className="card border-0 text-white shadow-sm machine-home-card"
          style={{
            width: "148px",
            minHeight: "170px",
            background: cardGradient,
            borderRadius: "12px",
            transition: "all 0.2s ease-in-out",
            cursor: "pointer",
            overflow: "hidden",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 8px 18px rgba(0, 0, 0, 0.18)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.08)";
          }}
        >
          {/* Header: Process Name */}
          <div
            className="px-2 py-2 text-center"
            style={{
              borderBottom: "1px solid rgba(255, 255, 255, 0.18)",
              background: "rgba(0, 0, 0, 0.08)",
            }}
          >
            <span
              className="fw-bold d-block text-truncate"
              style={{ fontSize: "0.86rem", letterSpacing: "0.2px" }}
              title={processNo}
            >
              {processNo}
            </span>
          </div>

          {/* Center: Machine Emblem */}
          <div className="d-flex align-items-center justify-content-center py-2.5 flex-grow-1">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: "44px",
                height: "44px",
                background: "rgba(255, 255, 255, 0.18)",
                boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.25)",
              }}
            >
              <i className="bi bi-gear-wide-connected fs-4 text-white"></i>
            </div>
          </div>

          {/* Footer: Metrics */}
          <div
            className="px-2 py-2 text-center"
            style={{
              borderTop: "1px solid rgba(255, 255, 255, 0.18)",
              background: "rgba(0, 0, 0, 0.12)",
            }}
          >
            <div
              className="text-white-50 fw-semibold mb-1"
              style={{ fontSize: "0.74rem" }}
            >
              Total: <span className="text-white fw-bold">{count}</span>
            </div>
            <div className="d-flex align-items-center justify-content-center gap-1.5">
              <span
                className="badge rounded-pill fw-semibold"
                style={{
                  background: "rgba(255, 255, 255, 0.22)",
                  fontSize: "0.7rem",
                  padding: "3px 7px",
                }}
              >
                OK {OK}
              </span>
              <span
                className="badge rounded-pill fw-semibold"
                style={{
                  background: NG > 0 ? "#ef4444" : "rgba(255, 255, 255, 0.12)",
                  fontSize: "0.7rem",
                  padding: "3px 7px",
                }}
              >
                NG {NG}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </Fragment>
  );
}

export default MachineCard;
