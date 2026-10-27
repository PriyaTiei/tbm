import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import "./trend.css";

const JudgementHistoryData = ({ checkItem, byData = "no" }) => {
  const auth = useSelector((state) => state.auth);
  const role = auth.user ? auth.user.role : 0;

  const [rawList, setRawList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [resultFilter, setResultFilter] = useState("ALL"); // ALL, OK, NG
  const [verificationFilter, setVerificationFilter] = useState("ALL"); // ALL, VERIFIED, UNVERIFIED

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Fetch data - safe, runs only on mount or when checkItem / byData changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const safeCheckItem = checkItem && checkItem !== "undefined" ? checkItem : "";
    const url = `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/dailyStatusByCheckItem?checkItem=${safeCheckItem}&byData=${byData}&limit=200`;

    axios
      .get(url)
      .then((result) => {
        if (!isMounted) return;
        if (result.data.success) {
          setRawList(result.data.dailyStatusAll || []);
        } else {
          setRawList([]);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching judgement history:", err);
        setError("Unable to load judgement history. Please check connection.");
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [checkItem, byData]);

  // Toggle Verification (TL/GL)
  const verifyToggle = (targetRole, currentStatus, id) => {
    const nextStatus = !currentStatus;
    // Optimistic update
    setRawList((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, [targetRole]: nextStatus } : item
      )
    );

    axios
      .put(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/changeVerified?role=${targetRole}&status=${nextStatus}&id=${id}`
      )
      .then((result) => {
        if (!result.data.success) {
          // Revert if failed
          setRawList((prev) =>
            prev.map((item) =>
              item._id === id ? { ...item, [targetRole]: currentStatus } : item
            )
          );
        }
      })
      .catch((err) => {
        console.error("Error updating verification:", err);
        // Revert
        setRawList((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, [targetRole]: currentStatus } : item
          )
        );
      });
  };

  // Render Verification Cell
  const renderVerificationCell = (item, isTL) => {
    const isTargetRole = isTL ? role === "tl" : role === "gl";
    const status = isTL ? item.tl : item.gl;
    const targetRoleName = isTL ? "tl" : "gl";

    if (isTargetRole) {
      return (
        <div className="d-inline-flex align-items-center gap-1">
          {status && (
            <i className="bi bi-check-circle-fill text-success" title="Verified"></i>
          )}
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-2.5 py-0 fw-semibold ${
              status ? "btn-outline-secondary" : "btn-primary"
            }`}
            style={{ fontSize: "11px", height: "26px" }}
            onClick={() => verifyToggle(targetRoleName, status, item._id)}
          >
            {status ? "Unverify" : "Verify"}
          </button>
        </div>
      );
    }

    if (status) {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1">
          <i className="bi bi-check-circle-fill"></i> Verified
        </span>
      );
    }

    return (
      <span className="badge bg-light text-muted border px-2 py-1">
        Not Verified
      </span>
    );
  };

  // Render Result Badge
  const renderResultBadge = (res) => {
    if (!res) return <span className="text-muted">--</span>;
    const upper = String(res).trim().toUpperCase();
    if (upper === "OK" || upper === "PASS") {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1">
          <i className="bi bi-check-circle-fill"></i> OK
        </span>
      );
    }
    if (upper === "NG" || upper === "FAIL") {
      return (
        <span className="badge bg-danger text-white px-2.5 py-1 fw-semibold shadow-sm d-inline-flex align-items-center gap-1">
          <i className="bi bi-exclamation-triangle-fill"></i> NG
        </span>
      );
    }
    return (
      <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 fw-semibold">
        {res}
      </span>
    );
  };

  // Filtered List calculation
  const filteredList = useMemo(() => {
    return rawList.filter((item) => {
      // 1. Result filter
      if (resultFilter !== "ALL") {
        const itemResult = String(item.result || "").trim().toUpperCase();
        if (resultFilter === "OK" && itemResult !== "OK" && itemResult !== "PASS") return false;
        if (resultFilter === "NG" && itemResult !== "NG" && itemResult !== "FAIL") return false;
      }

      // 2. Verification filter
      if (verificationFilter === "VERIFIED") {
        if (!item.tl && !item.gl) return false;
      } else if (verificationFilter === "UNVERIFIED") {
        if (item.tl && item.gl) return false;
      }

      // 3. Search query
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase();
        const checkedBy = String(item.checkedBy || "").toLowerCase();
        const remarks = String(item.remarks || "").toLowerCase();
        const value = String(item.value || "").toLowerCase();
        const entryDate = String(item.checkedAt ? item.checkedAt.split("T")[0] : "").toLowerCase();
        if (
          !checkedBy.includes(q) &&
          !remarks.includes(q) &&
          !value.includes(q) &&
          !entryDate.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [rawList, resultFilter, verificationFilter, searchTerm]);

  // Counts for pills
  const okCount = useMemo(() => {
    return rawList.filter((i) => {
      const r = String(i.result || "").trim().toUpperCase();
      return r === "OK" || r === "PASS";
    }).length;
  }, [rawList]);

  const ngCount = useMemo(() => {
    return rawList.filter((i) => {
      const r = String(i.result || "").trim().toUpperCase();
      return r === "NG" || r === "FAIL";
    }).length;
  }, [rawList]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, resultFilter, verificationFilter, pageSize]);

  // Paginated List
  const totalItems = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentItems = filteredList.slice(startIndex, endIndex);

  // Download Excel
  const exportToExcel = () => {
    if (filteredList.length === 0) {
      alert("No records to export");
      return;
    }

    const data = filteredList.map((item, index) => ({
      "S.No": index + 1,
      "Entry Date": item.checkedAt ? item.checkedAt.split("T")[0] : "--",
      "Result": item.result || "--",
      "Value": item.value || "--",
      "Remarks": item.remarks || "--",
      "Checked By": item.checkedBy || "--",
      "Checked At": item.checkedAt
        ? new Date(item.checkedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : "--",
      "TL Verified": item.tl ? "Verified" : "Not Verified",
      "GL Verified": item.gl ? "Verified" : "Not Verified",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Judgement History");
    XLSX.writeFile(wb, `Judgement_History_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
      {/* Header Bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between px-3 px-md-4 py-3 bg-white border-bottom gap-2">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 d-inline-flex align-items-center justify-content-center">
            <i className="bi bi-clock-history fs-5"></i>
          </div>
          <div>
            <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              Judgement History Logs
              <span className="badge bg-light text-primary border rounded-pill fw-normal">
                {rawList.length} total
              </span>
            </h6>
            <small className="text-muted">Inspection results, remarks, and verification status</small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-success rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
            onClick={exportToExcel}
            disabled={filteredList.length === 0}
            title="Export filtered records to Excel"
          >
            <i className="bi bi-file-earmark-excel-fill"></i>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between p-3 bg-light border-bottom gap-3">
        {/* Search Input */}
        <div className="position-relative" style={{ minWidth: "220px", maxWidth: "340px", flex: 1 }}>
          <i
            className="bi bi-search position-absolute text-muted"
            style={{ left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "12px" }}
          ></i>
          <input
            type="text"
            className="form-control form-control-sm ps-4 rounded-pill"
            placeholder="Search checked by, remarks, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: "12px", height: "32px", borderColor: "#cbd5e1" }}
          />
          {searchTerm && (
            <button
              type="button"
              className="btn btn-sm position-absolute text-muted p-0"
              style={{ right: "10px", top: "50%", transform: "translateY(-50%)" }}
              onClick={() => setSearchTerm("")}
            >
              <i className="bi bi-x-circle-fill"></i>
            </button>
          )}
        </div>

        {/* Result Filter Tabs */}
        <div className="d-flex align-items-center gap-1 bg-white p-1 rounded-pill border shadow-sm">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${
              resultFilter === "ALL"
                ? "btn-primary text-white shadow-sm"
                : "btn-light text-secondary border-0"
            }`}
            style={{ fontSize: "11px" }}
            onClick={() => setResultFilter("ALL")}
          >
            All ({rawList.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${
              resultFilter === "OK"
                ? "btn-success text-white shadow-sm"
                : "btn-light text-secondary border-0"
            }`}
            style={{ fontSize: "11px" }}
            onClick={() => setResultFilter("OK")}
          >
            OK ({okCount})
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${
              resultFilter === "NG"
                ? "btn-danger text-white shadow-sm"
                : "btn-light text-secondary border-0"
            }`}
            style={{ fontSize: "11px" }}
            onClick={() => setResultFilter("NG")}
          >
            NG ({ngCount})
          </button>
        </div>

        {/* Page Size Selector */}
        <div className="d-flex align-items-center gap-2 ms-auto">
          <span className="text-muted small">Show:</span>
          <select
            className="form-select form-select-sm rounded-pill"
            style={{ width: "75px", fontSize: "12px", height: "32px" }}
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div
        className="table-responsive"
        style={{
          maxHeight: "58vh",
          overflowY: "auto",
          backgroundColor: "#ffffff",
        }}
      >
        <table className="table table-hover align-middle mb-0" style={{ fontSize: "12px" }}>
          <thead
            className="table-light text-uppercase sticky-top"
            style={{
              fontSize: "11px",
              letterSpacing: "0.5px",
              backgroundColor: "#f8fafc",
              borderBottom: "2px solid #e2e8f0",
              zIndex: 2,
            }}
          >
            <tr>
              <th scope="col" style={{ minWidth: "105px" }}>Entry Date</th>
              <th scope="col" style={{ width: "95px", textAlign: "center" }}>Result</th>
              <th scope="col" style={{ width: "80px", textAlign: "center" }}>Value</th>
              <th scope="col" style={{ minWidth: "220px" }}>Remarks</th>
              <th scope="col" style={{ minWidth: "130px" }}>Checked By</th>
              <th scope="col" style={{ minWidth: "110px" }}>Checked At</th>
              <th scope="col" style={{ width: "130px", textAlign: "center" }}>Team Lead</th>
              <th scope="col" style={{ width: "130px", textAlign: "center" }}>Group Lead</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-5 text-muted">
                  <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                  Loading judgement history records...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8" className="text-center py-5 text-danger">
                  <i className="bi bi-exclamation-triangle-fill fs-3 d-block mb-2"></i>
                  {error}
                </td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((item, index) => {
                const entryDate = item.checkedAt ? item.checkedAt.split("T")[0] : "--";
                const checkedTime = item.checkedAt
                  ? new Date(item.checkedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : "--";

                return (
                  <tr key={item._id || index} className="align-middle">
                    <td className="font-monospace text-secondary" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                      {entryDate}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {renderResultBadge(item.result)}
                    </td>
                    <td className="text-muted" style={{ textAlign: "center", fontSize: "12px" }}>
                      {item.value || "-"}
                    </td>
                    <td style={{ fontSize: "12px", maxWidth: "280px", wordBreak: "break-word" }}>
                      {item.remarks || "--"}
                    </td>
                    <td className="fw-medium text-dark" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                      {item.checkedBy || "--"}
                    </td>
                    <td className="text-secondary font-monospace" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                      {checkedTime}
                    </td>
                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                      {renderVerificationCell(item, true)}
                    </td>
                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                      {renderVerificationCell(item, false)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-5">
                  <div className="py-4">
                    <div
                      className="d-inline-flex align-items-center justify-content-center bg-light text-secondary rounded-circle mb-3"
                      style={{ width: 56, height: 56 }}
                    >
                      <i className="bi bi-journal-x fs-2"></i>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">No Judgement Records</h6>
                    <p className="text-muted small mb-0">
                      {searchTerm || resultFilter !== "ALL"
                        ? "No records match the current search or filter criteria."
                        : "No history found for this check item."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && totalItems > 0 && (
        <div className="d-flex flex-wrap align-items-center justify-content-between px-3 px-md-4 py-2 bg-white border-top gap-2">
          <div className="text-muted small">
            Showing <span className="fw-semibold text-dark">{startIndex + 1}</span> to{" "}
            <span className="fw-semibold text-dark">{endIndex}</span> of{" "}
            <span className="fw-semibold text-dark">{totalItems}</span> records
          </div>

          <div className="d-flex align-items-center gap-1">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{ fontSize: "11px" }}
            >
              <i className="bi bi-chevron-left me-1"></i> Prev
            </button>

            <span className="px-2 small fw-semibold text-secondary">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{ fontSize: "11px" }}
            >
              Next <i className="bi bi-chevron-right ms-1"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JudgementHistoryData;
