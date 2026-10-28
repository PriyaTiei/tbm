import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";

function PendingCard({ processNo, result, processData, onClick }) {
  const counts = Array.isArray(processData) ? processData.length : 0;
  const isCompleted = result === "COMPLETED";
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Fragment>
      <Link
        to={`/pendingTasks/cardDetails/`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div
          className="card shadow-sm"
          style={{
            width: "152px",
            height: "192px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#ffffff",
            borderRadius: "12px",
            border: isCompleted
              ? isHovered
                ? "1px solid #10b981"
                : "1px solid #d1fae5"
              : isHovered
              ? "1px solid #f59e0b"
              : "1px solid #e2e8f0",
            borderTop: isCompleted ? "3px solid #10b981" : "3px solid #f59e0b",
            boxShadow: isHovered
              ? "0 8px 18px rgba(15, 23, 42, 0.1)"
              : "0 2px 6px rgba(15, 23, 42, 0.05)",
            transform: isHovered ? "translateY(-4px)" : "translateY(0)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "pointer",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Header: Process Name with guaranteed fixed height & vertical centering */}
          <div
            className="px-2 py-1 text-center d-flex align-items-center justify-content-center"
            style={{
              height: "48px",
              minHeight: "48px",
              maxHeight: "48px",
              background: isCompleted ? "rgba(16, 185, 129, 0.06)" : "#f8fafc",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <span
              className="fw-bold text-dark text-center"
              style={{
                fontSize: "0.82rem",
                lineHeight: "1.25",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
              }}
              title={processNo}
            >
              {processNo}
            </span>
          </div>

          {/* Center: Machine / Easel Emblem with soft circular background */}
          <div className="d-flex align-items-center justify-content-center py-2 flex-grow-1">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: "44px",
                height: "44px",
                background: isCompleted ? "#ecfdf5" : "#fef3c7",
                border: isCompleted ? "1px solid #a7f3d0" : "1px solid #fde68a",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                transition: "transform 0.2s ease",
                transform: isHovered ? "scale(1.08)" : "scale(1)",
              }}
            >
              <i
                className="bi bi-file-easel-fill"
                style={{
                  fontSize: "1.45rem",
                  color: isCompleted ? "#059669" : "#d97706",
                }}
              ></i>
            </div>
          </div>

          {/* Footer: Metrics (Total Count & Status Badge) */}
          <div
            className="px-2 pb-2 text-center d-flex flex-column align-items-center gap-1.5"
            style={{
              borderTop: "1px solid #f8fafc",
              background: "#ffffff",
            }}
          >
            <span
              className="badge rounded-pill fw-semibold"
              style={{
                background: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
                fontSize: "0.72rem",
                padding: "2.5px 8px",
              }}
            >
              Total: <strong className="text-dark">{counts}</strong>
            </span>

            <span
              className="badge rounded-pill fw-bold d-inline-flex align-items-center"
              style={{
                background: isCompleted ? "#dcfce7" : "#fef3c7",
                color: isCompleted ? "#15803d" : "#92400e",
                border: isCompleted ? "1px solid #86efac" : "1px solid #fde68a",
                fontSize: "0.7rem",
                padding: "3px 9px",
                letterSpacing: "0.3px",
              }}
            >
              <span
                className="rounded-circle me-1"
                style={{
                  width: "5px",
                  height: "5px",
                  background: isCompleted ? "#16a34a" : "#d97706",
                  display: "inline-block",
                }}
              ></span>
              {result || "PENDING"}
            </span>
          </div>
        </div>
      </Link>
    </Fragment>
  );
}

export default PendingCard;