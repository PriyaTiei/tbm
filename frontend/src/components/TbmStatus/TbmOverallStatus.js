import React, { useState, useEffect, useCallback } from "react";
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

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
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
      // 1. Call dedicated backend endpoint for TBM (pS = "P")
      const res = await axios.get(`${apiBaseUrl}/reports/overallTbmStatus`, {
        params: {
          date: selectedDate,
          pS: "P",
        },
        timeout: 8000,
      });

      if (res.data && res.data.success) {
        setDashboardData(res.data);
        setLoading(false);
        return;
      }
    } catch (apiErr) {
      console.warn("Backend /reports/overallTbmStatus failed, falling back to local aggregation:", apiErr.message);
    }

    // 2. Client-side fallback using /head/headMachineList & /dailyStatus/getGraphData
    try {
      const parts = selectedDate.split(/[-/]/).map(Number);
      const year = parts[0] > 1000 ? parts[0] : parts[2];
      const month = parts[1];
      const day = parts[0] > 1000 ? parts[2] : parts[0];
      const daysInMonth = new Date(year, month, 0).getDate();

      const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
      const endOfMonth = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

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
        let todaysPlan = 0;
        let todaysActual = 0;
        let cumPlanAod = 0;
        let cumActualAod = 0;
        let cumPlanMonth = 0;
        let cumActualMonth = 0;

        try {
          // Normalize line string for DB query ("Block", "Crank", "Head")
          const titleLine = lineName.charAt(0).toUpperCase() + lineName.slice(1).toLowerCase();
          const graphRes = await axios.post(`${apiBaseUrl}/dailyStatus/getGraphData`, {
            startDate: startOfMonth,
            endDate: endOfMonth,
            pS: "P",
            line: titleLine,
          });

          const totalData = graphRes.data?.totalData || {};

          Object.values(totalData).forEach((entry) => {
            const plan = Number(entry.total) || 0;
            const ok = Number(entry.totalOK) || 0;
            const ng = Number(entry.totalNG) || 0;
            const actual = ok + ng;

            let entryDay = null;
            if (entry.date) {
              const dParts = entry.date.split("-").map(Number);
              entryDay = dParts[0] > 1000 ? dParts[2] : dParts[0];
            }

            if (entryDay === day) {
              todaysPlan = plan;
              todaysActual = actual;
            }
            if (entryDay && entryDay <= day) {
              cumPlanAod += plan;
              cumActualAod += actual;
            }
            cumPlanMonth += plan;
            cumActualMonth += actual;
          });
        } catch (lineErr) {
          console.warn(`Fallback failed for line ${lineName}:`, lineErr.message);
        }

        const cumPendingAod = Math.max(0, cumPlanAod - cumActualAod);
        const cumPendingMonth = Math.max(0, cumPlanMonth - cumActualMonth);

        totals.todaysPlan += todaysPlan;
        totals.todaysActual += todaysActual;
        totals.cumPlanAod += cumPlanAod;
        totals.cumActualAod += cumActualAod;
        totals.cumPendingAod += cumPendingAod;
        totals.cumPlanMonth += cumPlanMonth;
        totals.cumActualMonth += cumActualMonth;
        totals.cumPendingMonth += cumPendingMonth;

        linesData.push({
          line: lineName,
          todaysPlan,
          todaysActual,
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
        date: selectedDate,
        pS: "P",
        departmentName: "Maintenance (TBM)",
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
      console.error("Aggregation fallback failed:", fallbackErr);
      setError("Failed to load dashboard data. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, apiBaseUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Export matching Excel Workbook
  const handleExportExcel = () => {
    if (!dashboardData) return;

    const wb = XLSX.utils.book_new();

    const wsData = [
      ["TBM DASHBOARD"],
      [],
      ["ENTER DATE HERE", dashboardData.date],
      [],
      [
        "Line",
        "Todays plan",
        "Todays actual",
        "Cum plan (Aod)",
        "Cum Actual (Aod)",
        "Cum pending (Aod)",
        "Cum plan- for Month",
        "Cum Actual for Month",
        "Cum Pending For month",
      ],
    ];

    (dashboardData.lines || []).forEach((row) => {
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

    if (dashboardData.total) {
      const tot = dashboardData.total;
      wsData.push([
        "TOTAL",
        tot.todaysPlan,
        tot.todaysActual,
        tot.cumPlanAod,
        tot.cumActualAod,
        tot.cumPendingAod,
        tot.cumPlanMonth,
        tot.cumActualMonth,
        tot.cumPendingMonth,
      ]);
    }

    wsData.push([]);
    wsData.push(["Todays TBM STATUS"]);
    wsData.push([
      "",
      "BLOCK",
      "CRANK",
      "HEAD",
      "TOTAL",
    ]);

    const todaysMap = dashboardData.todaysTbmStatus?.todaysCompleted || {};
    const otherMap = dashboardData.todaysTbmStatus?.otherDaysCompleted || {};

    wsData.push([
      "Todays: No of cards completed",
      todaysMap["BLOCK"] || 0,
      todaysMap["CRANK"] || 0,
      todaysMap["HEAD"] || 0,
      todaysMap["TOTAL"] || 0,
    ]);

    wsData.push([
      "Other days: No of cards completed",
      otherMap["BLOCK"] || 0,
      otherMap["CRANK"] || 0,
      otherMap["HEAD"] || 0,
      otherMap["TOTAL"] || 0,
    ]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "overall status");
    XLSX.writeFile(wb, `TBM_Dashboard_${dashboardData.date}.xlsx`);
  };

  return (
    <div className="excel-dashboard-container">
      {/* Top Header & Actions */}
      <div className="excel-top-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link to="/" className="excel-btn" style={{ textDecoration: "none" }}>
            <i className="bi bi-arrow-left"></i> Home
          </Link>
          <h1 className="excel-main-title">TBM DASHBOARD</h1>
        </div>

        <div className="excel-actions">
          <button className="excel-btn excel-btn-success" onClick={handleExportExcel}>
            <i className="bi bi-file-earmark-excel"></i> Export Excel
          </button>
          <button className="excel-btn" onClick={fetchData} disabled={loading}>
            <i className={`bi bi-arrow-clockwise ${loading ? "spin" : ""}`}></i> Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* Main Sheet Container */}
      <div className="excel-sheet-card">
        {/* Date Row (Excel cell A3/B3) */}
        <div className="excel-date-row">
          <span className="excel-date-label">ENTER DATE HERE:</span>
          <input
            type="date"
            className="excel-date-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button
            className="excel-btn"
            style={{ padding: "4px 10px", fontSize: "12px" }}
            onClick={() => setSelectedDate(getTodayStr())}
          >
            Today
          </button>
        </div>

        {/* Table 1: Overall Line Status Matrix */}
        <table className="excel-grid-table">
          <thead>
            <tr>
              <th rowSpan={2} style={{ width: "13%" }}>Line</th>
              <th colSpan={2} className="header-dark" style={{ width: "22%" }}>
                TODAY'S TARGET
              </th>
              <th colSpan={3} className="header-dark" style={{ width: "32%" }}>
                CUMULATIVE AS OF DATE (AOD)
              </th>
              <th colSpan={3} className="header-dark" style={{ width: "33%" }}>
                CUMULATIVE FULL MONTH HORIZON
              </th>
            </tr>
            <tr>
              <th>Todays plan</th>
              <th>Todays actual</th>
              <th>Cum plan (Aod)</th>
              <th>Cum Actual (Aod)</th>
              <th style={{ backgroundColor: "#fce4d6" }}>Cum pending (Aod)</th>
              <th>Cum plan- for Month</th>
              <th>Cum Actual for Month</th>
              <th style={{ backgroundColor: "#fce4d6" }}>Cum Pending For month</th>
            </tr>
          </thead>
          <tbody>
            {(dashboardData?.lines || []).map((row) => (
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

            {/* Total Row */}
            {dashboardData?.total && (
              <tr className="excel-total-row">
                <td className="cell-line font-bold">TOTAL</td>
                <td className="cell-num">{dashboardData.total.todaysPlan}</td>
                <td className="cell-num">{dashboardData.total.todaysActual}</td>
                <td className="cell-num">{dashboardData.total.cumPlanAod}</td>
                <td className="cell-num">{dashboardData.total.cumActualAod}</td>
                <td className="cell-num cell-pending">{dashboardData.total.cumPendingAod}</td>
                <td className="cell-num">{dashboardData.total.cumPlanMonth}</td>
                <td className="cell-num">{dashboardData.total.cumActualMonth}</td>
                <td className="cell-num cell-pending">{dashboardData.total.cumPendingMonth}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Table 2: Today's TBM Execution Status Breakdown (Rows 10-12) */}
        <div style={{ marginTop: "32px" }}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: "10px",
              color: "#1e293b",
            }}
          >
            Todays TBM STATUS
          </h3>
          <table className="excel-grid-table" style={{ maxWidth: "800px" }}>
            <thead>
              <tr>
                <th style={{ width: "40%", textAlign: "left", paddingLeft: "16px" }}>
                  Status Category
                </th>
                <th style={{ width: "15%" }}>BLOCK</th>
                <th style={{ width: "15%" }}>CRANK</th>
                <th style={{ width: "15%" }}>HEAD</th>
                <th style={{ width: "15%" }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="cell-line" style={{ fontWeight: 600 }}>
                  Todays: No of cards completed
                </td>
                <td className="cell-num">
                  {dashboardData?.todaysTbmStatus?.todaysCompleted?.["BLOCK"] || 0}
                </td>
                <td className="cell-num">
                  {dashboardData?.todaysTbmStatus?.todaysCompleted?.["CRANK"] || 0}
                </td>
                <td className="cell-num">
                  {dashboardData?.todaysTbmStatus?.todaysCompleted?.["HEAD"] || 0}
                </td>
                <td className="cell-num font-bold">
                  {dashboardData?.todaysTbmStatus?.todaysCompleted?.["TOTAL"] || 0}
                </td>
              </tr>
              <tr>
                <td className="cell-line" style={{ fontWeight: 600 }}>
                  Other days: No of cards completed
                </td>
                <td className="cell-num">
                  {dashboardData?.todaysTbmStatus?.otherDaysCompleted?.["BLOCK"] || 0}
                </td>
                <td className="cell-num">
                  {dashboardData?.todaysTbmStatus?.otherDaysCompleted?.["CRANK"] || 0}
                </td>
                <td className="cell-num">
                  {dashboardData?.todaysTbmStatus?.otherDaysCompleted?.["HEAD"] || 0}
                </td>
                <td className="cell-num font-bold">
                  {dashboardData?.todaysTbmStatus?.otherDaysCompleted?.["TOTAL"] || 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
