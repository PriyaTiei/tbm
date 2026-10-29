import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";

export default function AllMachineCard(props) {
  const { processNo, result, processData, onClick } = props;
  const counts = Array.isArray(processData) ? processData.length : (processData ? processData.length : 0);
  const isCompleted = result === "COMPLETED";
  const [isHovered, setIsHovered] = useState(false);

  // Home Page royal blue gradient (or emerald if completed)
  const cardGradient = isCompleted
    ? "linear-gradient(145deg, #10b981 0%, #059669 100%)"
    : "linear-gradient(145deg, #1e40af 0%, #2563eb 100%)";

  return (
    <Fragment>
      <Link
        to={`/allMachine/cardDetails/`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div
          className="card border-0 text-white shadow-sm"
          style={{
            width: "148px",
            height: "108px",
            minHeight: "108px",
            maxHeight: "108px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: cardGradient,
            borderRadius: "12px",
            boxShadow: isHovered
              ? "0 8px 18px rgba(30, 64, 175, 0.3)"
              : "0 3px 8px rgba(0, 0, 0, 0.1)",
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
          {/* Header: Process / Station Name with vertical centering & 2-line clamp */}
          <div
            className="px-2 py-1 text-center d-flex align-items-center justify-content-center"
            style={{
              height: "44px",
              minHeight: "44px",
              maxHeight: "44px",
              background: "rgba(0, 0, 0, 0.12)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.18)",
            }}
          >
            <span
              className="fw-bold text-white text-center"
              style={{
                fontSize: "0.85rem",
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

          {/* Body/Footer: Metrics (Total Count & Status Badge - No mid image) */}
          <div
            className="px-2 py-1.5 text-center d-flex flex-column align-items-center justify-content-center gap-1 flex-grow-1"
            style={{
              background: "rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              className="text-white-50 fw-semibold"
              style={{ fontSize: "0.72rem", lineHeight: "1.1" }}
            >
              Total: <span className="text-white fw-bold">{counts}</span>
            </div>

            <span
              className="badge rounded-pill fw-semibold d-inline-flex align-items-center"
              style={{
                background: "rgba(255, 255, 255, 0.22)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                fontSize: "0.68rem",
                padding: "2.5px 8px",
                letterSpacing: "0.3px",
              }}
            >
              <span
                className="rounded-circle me-1"
                style={{
                  width: "5px",
                  height: "5px",
                  background: isCompleted ? "#86efac" : "#60a5fa",
                  display: "inline-block",
                }}
              ></span>
              {result || "ACTIVE"}
            </span>
          </div>
        </div>
      </Link>
    </Fragment>
  );
}
