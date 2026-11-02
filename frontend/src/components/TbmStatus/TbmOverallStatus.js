import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import "./TbmOverallStatus.css";

export default function TbmOverallStatus() {
  // Format today as YYYY-MM-DD
  const getTodayStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const [fromDate, setFromDate] = useState(getTodayStr());
  const [toDate, setToDate] = useState(getTodayStr());
  // Department: 'P' = Maintenance (TBM), 'S' = Production (Smile Card)
  const [department, setDepartment] = useState("P");
  // Line Filter: 'ALL' | '3C' (Machining) | 'ASSEMBLY'
  const [lineFilter, setLineFilter] = useState("ALL");

  const isDateRange = fromDate !== toDate;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Compute base API URL
  const getApiBaseUrl = () => {
    if (process.env.REACT_APP_HOST && process.env.REACT_APP_PORT) {
      return `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`;
    }
    if (window.location.port) {
      return `http://${window.location.hostname}:${window.location.port}`;
    }
    return `http://${window.location.hostname || "localhost"}:5070`;
  };

  const apiBaseUrl = getApiBaseUrl();

  // Fetch Dashboard Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${apiBaseUrl}/reports/overallTbmStatus`, {
        params: {
          fromDate: fromDate,
          toDate: toDate,
          pS: department,
        },
        timeout: 10000,
      });

      if (res.data && res.data.success) {
        setDashboardData(res.data);
        setLoading(false);
        return;
      }
    } catch (apiErr) {
      console.warn("Backend /reports/overallTbmStatus error, falling back:", apiErr.message);
    }

    // Client-side fallback
    try {
      const startParts = fromDate.split(/[-/]/).map(Number);
      const endParts = toDate.split(/[-/]/).map(Number);
      const startD = new Date(startParts[0], startParts[1] - 1, startParts[2]);
      const endD = new Date(endParts[0], endParts[1] - 1, endParts[2]);

      const endYear = endD.getFullYear();
      const endMonth = endD.getMonth() + 1;
      const endDay = endD.getDate();
      const daysInEndMonth = new Date(endYear, endMonth, 0).getDate();

      const startOfMonth = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;
      const endOfMonth = `${endYear}-${String(endMonth).padStart(2, "0")}-${String(daysInEndMonth).padStart(2, "0")}`;

      const lines = ["BLOCK", "CRANK", "HEAD"];
      const linesData = [];
      const totals = {
        todaysPlan: 0,
        todaysActual: 0,
        cumPlanAod: 0,
        cumActualAod: 0,
        cumPendingAod: 0,
        cumPlanMonth: 0,
        cumActualMonth: 0,
        cumPendingMonth: 0,
      };

      for (const lineName of lines) {
        let periodPlan = 0;
        let periodActual = 0;
        let cumPlanAod = 0;
        let cumActualAod = 0;
        let cumPlanMonth = 0;
        let cumActualMonth = 0;

        try {
          const titleLine = lineName.charAt(0).toUpperCase() + lineName.slice(1).toLowerCase();
          const graphRes = await axios.post(`${apiBaseUrl}/dailyStatus/getGraphData`, {
            startDate: startOfMonth,
            endDate: endOfMonth,
            pS: department,
            line: titleLine,
          });

          const totalData = graphRes.data?.totalData || {};

          Object.values(totalData).forEach((entry) => {
            const plan = Number(entry.total) || 0;
            const ok = Number(entry.totalOK) || 0;
            const ng = Number(entry.totalNG) || 0;
            const actual = ok + ng;

            let entryDateObj = null;
            let entryDay = null;
            if (entry.date) {
              const dParts = entry.date.split("-").map(Number);
              const eYear = dParts[0] > 1000 ? dParts[0] : dParts[2];
              const eMonth = dParts[1];
              const eDay = dParts[0] > 1000 ? dParts[2] : dParts[0];
              entryDay = eDay;
              entryDateObj = new Date(eYear, eMonth - 1, eDay);
            }

            if (entryDateObj && entryDateObj >= startD && entryDateObj <= endD) {
              periodPlan += plan;
              periodActual += actual;
            }
            if (entryDay && entryDay <= endDay) {
              cumPlanAod += plan;
              cumActualAod += actual;
            }
            cumPlanMonth += plan;
            cumActualMonth += actual;
          });
        } catch (lineErr) {
          console.warn(`Fallback error for line ${lineName}:`, lineErr.message);
        }

        const cumPendingAod = Math.max(0, cumPlanAod - cumActualAod);
        const cumPendingMonth = Math.max(0, cumPlanMonth - cumActualMonth);

        totals.todaysPlan += periodPlan;
        totals.todaysActual += periodActual;
        totals.cumPlanAod += cumPlanAod;
        totals.cumActualAod += cumActualAod;
        totals.cumPendingAod += cumPendingAod;
        totals.cumPlanMonth += cumPlanMonth;
        totals.cumActualMonth += cumActualMonth;
        totals.cumPendingMonth += cumPendingMonth;

        linesData.push({
          line: lineName,
          todaysPlan: periodPlan,
          todaysActual: periodActual,
          cumPlanAod,
          cumActualAod,
          cumPendingAod,
          cumPlanMonth,
          cumActualMonth,
          cumPendingMonth,
        });
      }

      setDashboardData({
        success: true,
        date: fromDate === toDate ? fromDate : `${fromDate} to ${toDate}`,
        fromDate: fromDate,
        toDate: toDate,
        isRange: fromDate !== toDate,
        pS: department,
        departmentName: department === "P" ? "Maintenance (TBM)" : "Production (Smile Card)",
        lines: linesData,
        total: totals,
        todaysTbmStatus: {
          todaysCompleted: {
            BLOCK: linesData.find((l) => l.line === "BLOCK")?.todaysActual || 0,
            CRANK: linesData.find((l) => l.line === "CRANK")?.todaysActual || 0,
            HEAD: linesData.find((l) => l.line === "HEAD")?.todaysActual || 0,
            TOTAL: totals.todaysActual,
          },
          otherDaysCompleted: { BLOCK: 0, CRANK: 0, HEAD: 0, TOTAL: 0 },
        },
      });
    } catch (fallbackErr) {
      setError("Failed to load dashboard data. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, department, apiBaseUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group lines into Machining (3C) vs Assembly
  const {
    machiningLines,
    assemblyLines,
    visibleLines,
    machiningTotals,
    assemblyTotals,
    computedTotals,
  } = useMemo(() => {
    const all = dashboardData?.lines || [];

    const is3C = (lineStr) => {
      const lower = String(lineStr || "").toLowerCase();
      if (lower.includes("assembly")) return false;
      return lower.includes("block") || lower.includes("crank") || lower.includes("head");
    };

    const mLines = all.filter((l) => is3C(l.line));
    const aLines = all.filter((l) => !is3C(l.line));

    let active;
    if (lineFilter === "3C") {
      active = mLines;
    } else if (lineFilter === "ASSEMBLY") {
      active = aLines;
    } else {
      active = all;
    }

    const calcTotal = (lineArr) => {
      return lineArr.reduce(
        (acc, row) => ({
          todaysPlan: acc.todaysPlan + (row.todaysPlan || 0),
          todaysActual: acc.todaysActual + (row.todaysActual || 0),
          cumPlanAod: acc.cumPlanAod + (row.cumPlanAod || 0),
          cumActualAod: acc.cumActualAod + (row.cumActualAod || 0),
          cumPendingAod: acc.cumPendingAod + (row.cumPendingAod || 0),
          cumPlanMonth: acc.cumPlanMonth + (row.cumPlanMonth || 0),
          cumActualMonth: acc.cumActualMonth + (row.cumActualMonth || 0),
          cumPendingMonth: acc.cumPendingMonth + (row.cumPendingMonth || 0),
        }),
        {
          todaysPlan: 0,
          todaysActual: 0,
          cumPlanAod: 0,
          cumActualAod: 0,
          cumPendingAod: 0,
          cumPlanMonth: 0,
          cumActualMonth: 0,
          cumPendingMonth: 0,
        }
      );
    };

    return {
      machiningLines: mLines,
      assemblyLines: aLines,
      visibleLines: active,
      machiningTotals: calcTotal(mLines),
      assemblyTotals: calcTotal(aLines),
      computedTotals: calcTotal(active),
    };
  }, [dashboardData, lineFilter]);

  // Dynamic Table 2 Columns based on active filter
  const table2Columns = useMemo(() => {
    if (lineFilter === "3C") {
      return ["BLOCK", "CRANK", "HEAD"];
    }
    if (lineFilter === "ASSEMBLY") {
      return assemblyLines.map((l) => l.line);
    }
    // ALL: show 3C lines first, then assembly lines
    return [...machiningLines.map((l) => l.line), ...assemblyLines.map((l) => l.line)];
  }, [lineFilter, machiningLines, assemblyLines]);

  const todaysCompletedMap = dashboardData?.todaysTbmStatus?.todaysCompleted || {};
  const otherDaysCompletedMap = dashboardData?.todaysTbmStatus?.otherDaysCompleted || {};

  const table2Totals = useMemo(() => {
    const todays = table2Columns.reduce((sum, col) => sum + (todaysCompletedMap[col] || 0), 0);
    const other = table2Columns.reduce((sum, col) => sum + (otherDaysCompletedMap[col] || 0), 0);
    return { todays, other };
  }, [table2Columns, todaysCompletedMap, otherDaysCompletedMap]);

  // Export matching Excel Workbook
  const handleExportExcel = () => {
    if (!dashboardData) return;

    const wb = XLSX.utils.book_new();

    const wsData = [
      ["TBM DASHBOARD"],
      [],
      ["FROM DATE", fromDate],
      ["TO DATE", toDate],
      ["DEPARTMENT", department === "P" ? "Maintenance (TBM)" : "Production (Smile Card)"],
      ["FILTER VIEW", lineFilter],
      [],
      [
        "Line",
        isDateRange ? "Period plan" : "Todays plan",
        isDateRange ? "Period actual" : "Todays actual",
        "Cum plan (Aod)",
        "Cum Actual (Aod)",
        "Cum pending (Aod)",
        "Cum plan- for Month",
        "Cum Actual for Month",
        "Cum Pending For month",
      ],
    ];

    visibleLines.forEach((row) => {
      wsData.push([
        row.line,
        row.todaysPlan,
        row.todaysActual,
        row.cumPlanAod,
        row.cumActualAod,
        row.cumPendingAod,
        row.cumPlanMonth,
        row.cumActualMonth,
        row.cumPendingMonth,
      ]);
    });

    wsData.push([
      `TOTAL (${lineFilter})`,
      computedTotals.todaysPlan,
      computedTotals.todaysActual,
      computedTotals.cumPlanAod,
      computedTotals.cumActualAod,
      computedTotals.cumPendingAod,
      computedTotals.cumPlanMonth,
      computedTotals.cumActualMonth,
      computedTotals.cumPendingMonth,
    ]);

    wsData.push([]);
    wsData.push([isDateRange ? "Period TBM STATUS" : "Todays TBM STATUS"]);

    const cols = ["Status Category", ...table2Columns, "TOTAL"];
    wsData.push(cols);

    wsData.push([
      isDateRange ? "In-Period: No of TBMs completed" : "Todays: No of TBMs completed",
      ...table2Columns.map((c) => todaysCompletedMap[c] || 0),
      table2Totals.todays,
    ]);

    wsData.push([
      "Other days: No of TBMs completed",
      ...table2Columns.map((c) => otherDaysCompletedMap[c] || 0),
      table2Totals.other,
    ]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "overall status");
    const filename = isDateRange ? `TBM_Dashboard_${fromDate}_to_${toDate}.xlsx` : `TBM_Dashboard_${fromDate}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="excel-dashboard-container">
      {/* Top Bar: All Controls in One Single Compact Row */}
      <div className="excel-top-bar">
        <div className="excel-header-left">
          <button
            type="button"
            className="excel-btn"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = "/";
              }
            }}
            title="Back to previous page"
            style={{
              textDecoration: "none",
              border: "none",
              cursor: "pointer",
              background: "transparent",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <i className="bi bi-arrow-left"></i> Back
          </button>
          <h1 className="excel-main-title">TBM DASHBOARD</h1>

          {/* Department Segmented Switch */}
          <div className="segmented-group">
            <button
              className={`segmented-btn ${department === "P" ? "active" : ""}`}
              onClick={() => setDepartment("P")}
              title="Maintenance TBM"
            >
              <i className="bi bi-tools"></i> Mnt (TBM)
            </button>
            <button
              className={`segmented-btn ${department === "S" ? "active-blue" : ""}`}
              onClick={() => setDepartment("S")}
              title="Production Smile Card"
            >
              <i className="bi bi-person-check"></i> Prod (Smile Card)
            </button>
          </div>

          {/* Quick Line Filter Tabs */}
          <div className="segmented-group">
            <button
              className={`segmented-btn ${lineFilter === "ALL" ? "active" : ""}`}
              onClick={() => setLineFilter("ALL")}
            >
              All Lines
            </button>
            <button
              className={`segmented-btn ${lineFilter === "3C" ? "active" : ""}`}
              onClick={() => setLineFilter("3C")}
            >
              3C Machining
            </button>
            <button
              className={`segmented-btn ${lineFilter === "ASSEMBLY" ? "active" : ""}`}
              onClick={() => setLineFilter("ASSEMBLY")}
            >
              Assembly
            </button>
          </div>
        </div>

        <div className="excel-actions">
          {/* From - To Date Filter Box */}
          <div className="excel-date-box">
            <span className="excel-date-label">From:</span>
            <input
              type="date"
              className="excel-date-input"
              value={fromDate}
              onChange={(e) => {
                const val = e.target.value;
                setFromDate(val);
                if (toDate && val > toDate) {
                  setToDate(val);
                }
              }}
            />
            <span className="excel-date-label" style={{ marginLeft: "4px" }}>To:</span>
            <input
              type="date"
              className="excel-date-input"
              value={toDate}
              min={fromDate}
              onChange={(e) => {
                const val = e.target.value;
                setToDate(val);
                if (fromDate && val < fromDate) {
                  setFromDate(val);
                }
              }}
            />
            <button
              className="excel-btn"
              style={{ padding: "2px 8px", fontSize: "11px" }}
              onClick={() => {
                const today = getTodayStr();
                setFromDate(today);
                setToDate(today);
              }}
              title="Set to Today"
            >
              Today
            </button>
            <button
              className="excel-btn"
              style={{ padding: "2px 8px", fontSize: "11px" }}
              onClick={() => {
                const now = new Date();
                const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
                setFromDate(startOfMonth);
                setToDate(getTodayStr());
              }}
              title="From start of this month to Today"
            >
              This Month
            </button>
          </div>

          <button className="excel-btn excel-btn-success" onClick={handleExportExcel} disabled={loading}>
            <i className="bi bi-file-earmark-excel"></i> Export
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger py-1 mb-2 font-13">{error}</div>}

      {/* Main Sheet Container */}
      <div className="excel-sheet-card">
        {/* Table 1: Overall Line Status Matrix */}
        <table className="excel-grid-table">
          <thead>
            <tr>
              <th rowSpan={2} style={{ width: "16%" }}>Line</th>
              <th colSpan={2} className="header-dark" style={{ width: "20%" }}>
                {isDateRange ? `TARGET (${fromDate} to ${toDate})` : "TODAY'S TARGET"}
              </th>
              <th colSpan={3} className="header-dark" style={{ width: "32%" }}>
                CUMULATIVE AS OF DATE (AOD)
              </th>
              <th colSpan={3} className="header-dark" style={{ width: "32%" }}>
                CUMULATIVE FULL MONTH HORIZON
              </th>
            </tr>
            <tr>
              <th>{isDateRange ? "Period plan" : "Todays plan"}</th>
              <th>{isDateRange ? "Period actual" : "Todays actual"}</th>
              <th>Cum plan (Aod)</th>
              <th>Cum Actual (Aod)</th>
              <th style={{ backgroundColor: "#fce4d6" }}>Cum pending (Aod)</th>
              <th>Cum plan- for Month</th>
              <th>Cum Actual for Month</th>
              <th style={{ backgroundColor: "#fce4d6" }}>Cum Pending For month</th>
            </tr>
          </thead>
          <tbody>
            {/* If lineFilter === 'ALL', render Machining with Subtotal, then Assembly with Subtotal */}
            {lineFilter === "ALL" && machiningLines.length > 0 && (
              <>
                <tr className="excel-section-header">
                  <td colSpan={9}>Machining Lines (3C)</td>
                </tr>
                {machiningLines.map((row) => (
                  <tr key={row.line}>
                    <td className="cell-line">{row.line}</td>
                    <td className="cell-num">{row.todaysPlan}</td>
                    <td className="cell-num">{row.todaysActual}</td>
                    <td className="cell-num">{row.cumPlanAod}</td>
                    <td className="cell-num">{row.cumActualAod}</td>
                    <td className="cell-num cell-pending">{row.cumPendingAod}</td>
                    <td className="cell-num">{row.cumPlanMonth}</td>
                    <td className="cell-num">{row.cumActualMonth}</td>
                    <td className="cell-num cell-pending">{row.cumPendingMonth}</td>
                  </tr>
                ))}
                <tr className="excel-subtotal-row">
                  <td className="cell-line font-bold">SUBTOTAL (3C MACHINING)</td>
                  <td className="cell-num">{machiningTotals.todaysPlan}</td>
                  <td className="cell-num">{machiningTotals.todaysActual}</td>
                  <td className="cell-num">{machiningTotals.cumPlanAod}</td>
                  <td className="cell-num">{machiningTotals.cumActualAod}</td>
                  <td className="cell-num cell-pending">{machiningTotals.cumPendingAod}</td>
                  <td className="cell-num">{machiningTotals.cumPlanMonth}</td>
                  <td className="cell-num">{machiningTotals.cumActualMonth}</td>
                  <td className="cell-num cell-pending">{machiningTotals.cumPendingMonth}</td>
                </tr>
              </>
            )}

            {lineFilter === "ALL" && assemblyLines.length > 0 && (
              <>
                <tr className="excel-section-header">
                  <td colSpan={9}>Assembly Sublines</td>
                </tr>
                {assemblyLines.map((row) => (
                  <tr key={row.line}>
                    <td className="cell-line">{row.line}</td>
                    <td className="cell-num">{row.todaysPlan}</td>
                    <td className="cell-num">{row.todaysActual}</td>
                    <td className="cell-num">{row.cumPlanAod}</td>
                    <td className="cell-num">{row.cumActualAod}</td>
                    <td className="cell-num cell-pending">{row.cumPendingAod}</td>
                    <td className="cell-num">{row.cumPlanMonth}</td>
                    <td className="cell-num">{row.cumActualMonth}</td>
                    <td className="cell-num cell-pending">{row.cumPendingMonth}</td>
                  </tr>
                ))}
                <tr className="excel-subtotal-row">
                  <td className="cell-line font-bold">SUBTOTAL (ASSEMBLY)</td>
                  <td className="cell-num">{assemblyTotals.todaysPlan}</td>
                  <td className="cell-num">{assemblyTotals.todaysActual}</td>
                  <td className="cell-num">{assemblyTotals.cumPlanAod}</td>
                  <td className="cell-num">{assemblyTotals.cumActualAod}</td>
                  <td className="cell-num cell-pending">{assemblyTotals.cumPendingAod}</td>
                  <td className="cell-num">{assemblyTotals.cumPlanMonth}</td>
                  <td className="cell-num">{assemblyTotals.cumActualMonth}</td>
                  <td className="cell-num cell-pending">{assemblyTotals.cumPendingMonth}</td>
                </tr>
              </>
            )}

            {/* If filtered to 3C or ASSEMBLY specifically, render visible lines directly */}
            {lineFilter !== "ALL" &&
              visibleLines.map((row) => (
                <tr key={row.line}>
                  <td className="cell-line">{row.line}</td>
                  <td className="cell-num">{row.todaysPlan}</td>
                  <td className="cell-num">{row.todaysActual}</td>
                  <td className="cell-num">{row.cumPlanAod}</td>
                  <td className="cell-num">{row.cumActualAod}</td>
                  <td className="cell-num cell-pending">{row.cumPendingAod}</td>
                  <td className="cell-num">{row.cumPlanMonth}</td>
                  <td className="cell-num">{row.cumActualMonth}</td>
                  <td className="cell-num cell-pending">{row.cumPendingMonth}</td>
                </tr>
              ))}

            {/* Grand Total Row */}
            <tr className="excel-total-row">
              <td className="cell-line font-bold">
                {lineFilter === "ALL" ? "GRAND TOTAL" : `TOTAL (${lineFilter})`}
              </td>
              <td className="cell-num">{computedTotals.todaysPlan}</td>
              <td className="cell-num">{computedTotals.todaysActual}</td>
              <td className="cell-num">{computedTotals.cumPlanAod}</td>
              <td className="cell-num">{computedTotals.cumActualAod}</td>
              <td className="cell-num cell-pending">{computedTotals.cumPendingAod}</td>
              <td className="cell-num">{computedTotals.cumPlanMonth}</td>
              <td className="cell-num">{computedTotals.cumActualMonth}</td>
              <td className="cell-num cell-pending">{computedTotals.cumPendingMonth}</td>
            </tr>
          </tbody>
        </table>

        {/* Table 2: Today's TBM Execution Status Breakdown (Rows 10-12) */}
        <div className="excel-sub-section">
          <div style={{ flex: "1 1 auto", maxWidth: "100%", overflowX: "auto" }}>
            <h3 className="excel-sub-title">
              <i className="bi bi-card-checklist text-success"></i>{" "}
              {isDateRange ? `TBM STATUS (${fromDate} to ${toDate})` : "Todays TBM STATUS"}
            </h3>
            <table className="excel-grid-table" style={{ marginBottom: 0, width: "auto", minWidth: "500px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", paddingLeft: "12px", minWidth: "180px" }}>
                    Status Category
                  </th>
                  {table2Columns.map((col) => (
                    <th key={col} style={{ minWidth: "75px" }}>
                      {col}
                    </th>
                  ))}
                  <th style={{ minWidth: "75px" }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="cell-line" style={{ fontWeight: 600 }}>
                    {isDateRange ? "In-Period: No of TBMs completed" : "Todays: No of TBMs completed"}
                  </td>
                  {table2Columns.map((col) => (
                    <td key={col} className="cell-num">
                      {todaysCompletedMap[col] || 0}
                    </td>
                  ))}
                  <td className="cell-num font-bold">{table2Totals.todays}</td>
                </tr>
                <tr>
                  <td className="cell-line" style={{ fontWeight: 600 }}>
                    Other days: No of TBMs completed
                  </td>
                  {table2Columns.map((col) => (
                    <td key={col} className="cell-num">
                      {otherDaysCompletedMap[col] || 0}
                    </td>
                  ))}
                  <td className="cell-num font-bold">{table2Totals.other}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
