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
            height: "154px",
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
              ? "1px solid #14b8a6"
              : "1px solid #e2e8f0",
            borderTop: isCompleted ? "3px solid #10b981" : "3px solid #0d9488",
            boxShadow: isHovered
              ? "0 8px 18px rgba(13, 148, 136, 0.12)"
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
          {/* Header: Station / Process Name with guaranteed vertical centering & 2-line clamp */}
          <div
            className="px-2 py-1 text-center d-flex align-items-center justify-content-center"
            style={{
              height: "46px",
              minHeight: "46px",
              maxHeight: "46px",
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
                letterSpacing: "0.2px",
              }}
              title={processNo}
            >
              {processNo}
            </span>
          </div>

          {/* Middle: Pending Clock-History Emblem (distinct from Home page gear) */}
          <div className="d-flex align-items-center justify-content-center py-2 flex-grow-1">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: "44px",
                height: "44px",
                background: isCompleted ? "#ecfdf5" : "#f0fdfa",
                border: isCompleted ? "1px solid #a7f3d0" : "1px solid #99f6e4",
                boxShadow: "0 2px 5px rgba(13, 148, 136, 0.08)",
                transition: "transform 0.2s ease",
                transform: isHovered ? "scale(1.08)" : "scale(1)",
              }}
            >
              <i
                className={isCompleted ? "bi bi-check-circle-fill" : "bi bi-clock-history"}
                style={{
                  fontSize: "1.45rem",
                  color: isCompleted ? "#059669" : "#0d9488",
                }}
              ></i>
            </div>
          </div>

          {/* Footer: Metrics (Total Count only - No status/pill badges) */}
          <div
            className="px-2 py-2 text-center d-flex justify-content-center align-items-center"
            style={{
              borderTop: "1px solid #f1f5f9",
              background: "#ffffff",
            }}
          >
            <div
              className="text-muted fw-semibold"
              style={{ fontSize: "0.78rem" }}
            >
              Total: <strong className="text-dark">{counts}</strong>
            </div>
          </div>
        </div>
      </Link>
    </Fragment>
  );
}

export default PendingCard;
