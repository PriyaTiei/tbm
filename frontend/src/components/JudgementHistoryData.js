import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./trend.css";

const JudgementHistoryData = ({ checkItem, query = {}, byData = 'no' }) => {
  const auth = useSelector((state) => state.auth);
  const role = auth.user ? auth.user.role : 0;
  const [cardList, setCardList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/dailyStatusByCheckItem?checkItem=${checkItem}&query=${query}&byData=${byData}`
      )
      .then((result) => {
        if (result.data.success) {
          setCardList(result.data.dailyStatusAll || []);
        }
      })
      .catch((err) => {
        console.error("Error fetching judgement history:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [checkItem, query, byData]);

  const verfifyToggle = (targetRole, changed, id, setChanged) => {
    axios
      .put(
        `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/changeVerified?role=${targetRole}&status=${!changed}&id=${id}`
      )
      .then((result) => {
        if (result.data.success) {
          setChanged(!changed);
        }
      })
      .catch((err) => {
        console.error("Error updating verification:", err);
      });
  };

  const GetVerified = ({ data }) => {
    const { role: userRole, status, id } = data;
    const [changed, setChanged] = useState(status);

    return (
      <div className="d-flex align-items-center justify-content-center gap-2">
        {changed && (
          <i className="bi bi-check-circle-fill text-success fs-6" title="Verified"></i>
        )}
        <button
          className={`btn btn-sm rounded-pill px-3 py-0 fw-semibold ${
            changed ? "btn-outline-secondary" : "btn-outline-primary"
          }`}
          style={{ fontSize: "11px", height: "26px" }}
          onClick={() => verfifyToggle(userRole, changed, id, setChanged)}
        >
          {changed ? "Unverify" : "Verify"}
        </button>
      </div>
    );
  };

  const renderResultBadge = (res) => {
    if (!res) return <span className="text-muted">--</span>;
    const upper = String(res).trim().toUpperCase();
    if (upper === "OK" || upper === "PASS") {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1">
          <i className="bi bi-check-circle-fill"></i> OK
        </span>
      );
    }
    if (upper === "NG" || upper === "FAIL") {
      return (
        <span className="badge bg-danger text-white px-2 py-1 fw-semibold shadow-sm d-inline-flex align-items-center gap-1">
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

  const list = cardList.map((item, index) => {
    const entryDate = item.checkedAt ? item.checkedAt.split("T")[0] : "--";
    const checkedTime = item.checkedAt
      ? new Date(item.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
        <td style={{ fontSize: "12px", maxWidth: "260px", wordBreak: "break-word" }}>
          {item.remarks || "--"}
        </td>
        <td className="fw-medium text-dark" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
          {item.checkedBy || "--"}
        </td>
        <td className="text-secondary font-monospace" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
          {checkedTime}
        </td>
        <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
          {role === "tl" ? (
            <GetVerified data={{ role, status: item.tl, id: item._id }} />
          ) : item.tl ? (
            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1">
              <i className="bi bi-check-circle-fill"></i> Verified
            </span>
          ) : (
            <span className="badge bg-light text-muted border px-2 py-1">Not Verified</span>
          )}
        </td>
        <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
          {role === "gl" ? (
            <GetVerified data={{ role, status: item.gl, tlstatus: item.tl, id: item._id }} />
          ) : item.gl ? (
            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1">
              <i className="bi bi-check-circle-fill"></i> Verified
            </span>
          ) : (
            <span className="badge bg-light text-muted border px-2 py-1">Not Verified</span>
          )}
        </td>
      </tr>
    );
  });

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
      {/* Header Bar */}
      <div className="d-flex align-items-center justify-content-between px-4 py-3 bg-white border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 d-inline-flex align-items-center justify-content-center">
            <i className="bi bi-clock-history fs-5"></i>
          </div>
          <div>
            <h6 className="mb-0 fw-bold text-dark">Judgement History Logs</h6>
            <small className="text-muted">Inspection results, remarks, and verification status</small>
          </div>
        </div>
        <div>
          <span className="badge bg-light text-dark border px-3 py-1 rounded-pill fw-medium">
            Total Records: {cardList.length}
          </span>
        </div>
      </div>

      <div
        className="table-responsive"
        style={{
          maxHeight: "600px",
          overflowY: "auto",
          backgroundColor: "#ffffff"
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
              zIndex: 1
            }}
          >
            <tr>
              <th scope="col" style={{ minWidth: "105px" }}>Entry Date</th>
              <th scope="col" style={{ width: "90px", textAlign: "center" }}>Result</th>
              <th scope="col" style={{ width: "70px", textAlign: "center" }}>Value</th>
              <th scope="col" style={{ minWidth: "220px" }}>Remarks</th>
              <th scope="col" style={{ minWidth: "120px" }}>Checked By</th>
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
                  Loading judgement history...
                </td>
              </tr>
            ) : list.length > 0 ? (
              list
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-5">
                  <div className="py-4">
                    <div className="d-inline-flex align-items-center justify-content-center bg-light text-secondary rounded-circle mb-3" style={{ width: 56, height: 56 }}>
                      <i className="bi bi-journal-x fs-2"></i>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">No Judgement History</h6>
                    <p className="text-muted small mb-0">No records found for this check item.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JudgementHistoryData;
