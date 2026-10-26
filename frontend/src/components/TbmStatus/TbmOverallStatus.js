import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import * as XLSX from "xlsx";
import "./TbmOverallStatus.css";

export default function TbmOverallStatus() {
  const reduxFilters = useSelector((state) => state.filters);

  // Format today as YYYY-MM-DD in local time
  const getTodayStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // State
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  
  // Default plant based on environment or fallback to TNGA
  const defaultPlant = (process.env.REACT_APP_PLANT || "TNGA").toUpperCase();
  const [activePlant, setActivePlant] = useState(defaultPlant === "GD" ? "GD" : "TNGA");
  
  // Department: 'P' = Maintenance (TBM), 'S' = Production (Smile Card)
  const [department, setDepartment] = useState(reduxFilters?.pS || "P");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Determine active port based on plant selection
  const activePort = useMemo(() => {
    if (activePlant === "GD") {
      return process.env.REACT_APP_GD_PORT || "5050";
    }
    return process.env.REACT_APP_TNGA_PORT || "5070";
  }, [activePlant]);

  const activeHost = process.env.REACT_APP_HOST || window.location.hostname || "localhost";
  const apiBaseUrl = `http://${activeHost}:${activePort}`;

  // Fetch Dashboard Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Try dedicated fast backend endpoint
      const res = await axios.get(`${apiBaseUrl}/reports/overallTbmStatus`, {
        params: {
          date: selectedDate,
          pS: department,
        },
        timeout: 8000,
      });

      if (res.data && res.data.success) {
        setDashboardData(res.data);
        setLoading(false);
        return;
      }
    } catch (apiErr) {
      console.warn("Dedicated endpoint failed or not yet deployed, falling back to client aggregation:", apiErr.message);
    }

    // 2. Client-side aggregation fallback using existing APIs (/head/headMachineList & /dailyStatus/getGraphData)
    try {
      const parts = selectedDate.split("-").map(Number);
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      const daysInMonth = new Date(year, month, 0).getDate();

      const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
      const endOfMonth = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

      // Discover lines from headMachineList
      let discoveredLines = ["BLOCK", "CRANK", "HEAD"];
      try {
        const lineRes = await axios.get(`${apiBaseUrl}/head/headMachineList`, {
          params: { pS: department },
          timeout: 5000,
        });
        if (lineRes.data && Array.isArray(lineRes.data.machineData) && lineRes.data.machineData.length > 0) {
          discoveredLines = lineRes.data.machineData.map((m) => m.line);
        }
      } catch (lineErr) {
        console.warn("Could not discover lines, using default 3C lines:", lineErr.message);
      }

      const priority = ["block", "crank", "head", "assembly"];
      discoveredLines.sort((a, b) => {
        const aL = (a || "").toLowerCase();
        const bL = (b || "").toLowerCase();
        const aIdx = priority.findIndex((p) => aL.includes(p));
        const bIdx = priority.findIndex((p) => bL.includes(p));
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return (a || "").localeCompare(b || "");
      });

      // Query graph data for each line
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

      for (const line of discoveredLines) {
        let todaysPlan = 0;
        let todaysActual = 0;
        let cumPlanAod = 0;
        let cumActualAod = 0;
        let cumPlanMonth = 0;
        let cumActualMonth = 0;

        try {
          const graphRes = await axios.post(`${apiBaseUrl}/dailyStatus/getGraphData`, {
            startDate: startOfMonth,
            endDate: endOfMonth,
            pS: department,
            line: line,
          });

          const totalData = graphRes.data?.totalData || {};

          Object.values(totalData).forEach((entry) => {
            const plan = Number(entry.total) || 0;
            const ok = Number(entry.totalOK) || 0;
            const ng = Number(entry.totalNG) || 0;
            const actual = ok + ng;

            // Parse entry.date (format DD-MM-YYYY or YYYY-MM-DD)
            let entryDay = null;
            if (entry.date) {
              const dParts = entry.date.split("-");
              if (dParts[0].length === 4) {
                entryDay = Number(dParts[2]);
              } else {
                entryDay = Number(dParts[0]);
              }
            }

            if (entryDay !== null) {
              if (entryDay === day) {
                todaysPlan = plan;
                todaysActual = actual;
              }
              if (entryDay <= day) {
                cumPlanAod += plan;
                cumActualAod += actual;
              }
            }
            cumPlanMonth += plan;
            cumActualMonth += actual;
          });
        } catch (gErr) {
          console.warn(`Could not fetch graph data for ${line}:`, gErr.message);
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
          line,
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
        pS: department,
        departmentName: department === "P" ? "Maintenance (TBM)" : "Production (Smile Card)",
        lines: linesData,
        total: totals,
        todaysTbmStatus: {
          todaysCompleted: linesData.reduce((acc, l) => ({ ...acc, [l.line]: l.todaysActual }), { TOTAL: totals.todaysActual }),
          otherDaysCompleted: linesData.reduce((acc, l) => ({ ...acc, [l.line]: 0 }), { TOTAL: 0 }),
        },
      });
    } catch (fallbackErr) {
      console.error("Dashboard calculation error:", fallbackErr);
      setError("Unable to retrieve dashboard metrics from server. Please verify backend connectivity.");
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, selectedDate, department]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Date Navigation
  const changeDateByDays = (offset) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offset);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const d = String(current.getDate()).padStart(2, "0");
    setSelectedDate(`${y}-${m}-${d}`);
  };

  // Excel Export
  const handleExportExcel = () => {
    if (!dashboardData || !dashboardData.lines) return;

    const wb = XLSX.utils.book_new();

    // Sheet 2: overall status layout matching TNGA-mnt.xlsx
    const rows = [
      ["", "TBM DASHBOARD"],
      [],
      [
        "ENTER DATE HERE",
        selectedDate,
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

    dashboardData.lines.forEach((item) => {
      rows.push([
        "",
        item.line,
        item.todaysPlan,
        item.todaysActual,
        item.cumPlanAod,
        item.cumActualAod,
        item.cumPendingAod,
        item.cumPlanMonth,
        item.cumActualMonth,
        item.cumPendingMonth,
      ]);
      rows.push([]); // blank row between lines matching excel wireframe
    });

    // Total Row
    rows.push([
      "",
      "TOTAL",
      dashboardData.total?.todaysPlan || 0,
      dashboardData.total?.todaysActual || 0,
      dashboardData.total?.cumPlanAod || 0,
      dashboardData.total?.cumActualAod || 0,
      dashboardData.total?.cumPendingAod || 0,
      dashboardData.total?.cumPlanMonth || 0,
      dashboardData.total?.cumActualMonth || 0,
      dashboardData.total?.cumPendingMonth || 0,
    ]);

    rows.push([]);
    rows.push([]);

    // Rows 10-12: Today's Status Breakdown
    const lineHeaders = dashboardData.lines.map((l) => l.line);
    rows.push(["Todays TBM STATUS", "", "", "", ...lineHeaders, "TOTAL"]);

    const todaysOnTime = lineHeaders.map((l) => dashboardData.todaysTbmStatus?.todaysCompleted?.[l] || 0);
    todaysOnTime.push(dashboardData.todaysTbmStatus?.todaysCompleted?.TOTAL || 0);
    rows.push(["Todays", "No of cards completed", "", "", ...todaysOnTime]);

    const otherDays = lineHeaders.map((l) => dashboardData.todaysTbmStatus?.otherDaysCompleted?.[l] || 0);
    otherDays.push(dashboardData.todaysTbmStatus?.otherDaysCompleted?.TOTAL || 0);
    rows.push(["Other days", "No of cards completed", "", "", ...otherDays]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "overall status");

    const fileName = `TBM_Dashboard_${activePlant}_${selectedDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const lines = dashboardData?.lines || [];
  const totals = dashboardData?.total || {};
  const todaysStatus = dashboardData?.todaysTbmStatus || { todaysCompleted: {}, otherDaysCompleted: {} };

  // Completion percentages
  const todayRate = totals.todaysPlan > 0 ? Math.round((totals.todaysActual / totals.todaysPlan) * 100) : 0;
  const aodRate = totals.cumPlanAod > 0 ? Math.round((totals.cumActualAod / totals.cumPlanAod) * 100) : 0;
  const monthRate = totals.cumPlanMonth > 0 ? Math.round((totals.cumActualMonth / totals.cumPlanMonth) * 100) : 0;

  return (
    <div className="tbm-status-container">
      {/* Top Header Card */}
      <div className="tbm-header-card">
        <div className="tbm-title-section">
          <div>
            <h1 className="tbm-title">
              <i className="bi bi-speedometer2 text-primary"></i>
              TBM Overall Status Dashboard
              <span className={`tbm-badge-plant ${activePlant === "TNGA" ? "badge-plant-tnga" : "badge-plant-gd"}`}>
                {activePlant} (Port {activePort})
              </span>
            </h1>
            <p className="tbm-subtitle">
              Time Based Maintenance & Autonomous Check Summary • Exact Digital Specification (TNGA-mnt.xlsx)
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-outline-success d-flex align-items-center gap-1" onClick={handleExportExcel}>
              <i className="bi bi-file-earmark-excel"></i> Export Excel
            </button>
            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={fetchData} title="Refresh Data">
              <i className="bi bi-arrow-clockwise"></i> Refresh
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="tbm-controls-row">
          {/* Date Picker */}
          <div className="control-group">
            <span className="control-label">Date:</span>
            <div className="date-selector-box">
              <button className="date-nav-btn" onClick={() => changeDateByDays(-1)} title="Previous Day">
                <i className="bi bi-chevron-left"></i>
              </button>
              <input
                type="date"
                className="date-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <button className="date-nav-btn" onClick={() => changeDateByDays(1)} title="Next Day">
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
            <button className="btn btn-sm btn-light border" onClick={() => setSelectedDate(getTodayStr())}>
              Today
            </button>
          </div>

          {/* Plant Selector */}
          <div className="control-group ms-auto">
            <span className="control-label">Plant Line:</span>
            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                className={`btn ${activePlant === "TNGA" ? "btn-danger fw-bold" : "btn-outline-secondary"}`}
                onClick={() => setActivePlant("TNGA")}
              >
                TNGA <span className="badge bg-dark ms-1">5070</span>
              </button>
              <button
                type="button"
                className={`btn ${activePlant === "GD" ? "btn-warning text-dark fw-bold" : "btn-outline-secondary"}`}
                onClick={() => setActivePlant("GD")}
              >
                GD <span className="badge bg-dark ms-1">5050</span>
              </button>
            </div>
          </div>

          {/* Department Selector */}
          <div className="control-group">
            <span className="control-label">Department:</span>
            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                className={`btn ${department === "P" ? "btn-primary fw-bold" : "btn-outline-secondary"}`}
                onClick={() => setDepartment("P")}
              >
                Maintenance (TBM)
              </button>
              <button
                type="button"
                className={`btn ${department === "S" ? "btn-info fw-bold text-dark" : "btn-outline-secondary"}`}
                onClick={() => setDepartment("S")}
              >
                Production (Smile Card)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <div>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
          <button className="btn btn-sm btn-outline-danger" onClick={fetchData}>
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="kpi-row">
        <div className="kpi-stat-card card-blue">
          <div className="kpi-stat-info">
            <h4>Today's Execution</h4>
            <div className="kpi-stat-number">{totals.todaysActual || 0} / {totals.todaysPlan || 0}</div>
            <div className="kpi-stat-subtext">Completion Rate: {todayRate}%</div>
          </div>
          <div className="kpi-stat-icon">
            <i className="bi bi-calendar-check"></i>
          </div>
        </div>

        <div className="kpi-stat-card card-green">
          <div className="kpi-stat-info">
            <h4>Cumulative Actual (AOD)</h4>
            <div className="kpi-stat-number">{totals.cumActualAod || 0}</div>
            <div className="kpi-stat-subtext">As of {selectedDate} (Plan: {totals.cumPlanAod || 0})</div>
          </div>
          <div className="kpi-stat-icon">
            <i className="bi bi-graph-up-arrow"></i>
          </div>
        </div>

        <div className="kpi-stat-card card-amber">
          <div className="kpi-stat-info">
            <h4>Pending Cards (AOD)</h4>
            <div className="kpi-stat-number">{totals.cumPendingAod || 0}</div>
            <div className="kpi-stat-subtext">Outstanding backlog up to today</div>
          </div>
          <div className="kpi-stat-icon">
            <i className="bi bi-hourglass-split"></i>
          </div>
        </div>

        <div className="kpi-stat-card card-purple">
          <div className="kpi-stat-info">
            <h4>Monthly Horizon</h4>
            <div className="kpi-stat-number">{totals.cumActualMonth || 0} / {totals.cumPlanMonth || 0}</div>
            <div className="kpi-stat-subtext">Month Achievement: {monthRate}% (Pending: {totals.cumPendingMonth || 0})</div>
          </div>
          <div className="kpi-stat-icon">
            <i className="bi bi-pie-chart"></i>
          </div>
        </div>
      </div>

      {/* Main Matrix Table */}
      <div className="tbm-table-wrapper">
        <div className="tbm-table-header-bar">
          <h2 className="tbm-table-header-title">
            <i className="bi bi-table text-primary"></i>
            Overall Line Maintenance Status Matrix
          </h2>
          <span className="tbm-table-header-meta">
            Target Date: <strong>{selectedDate}</strong> • Department: <strong>{department === "P" ? "Maintenance (TBM)" : "Production (Smile Card)"}</strong>
          </span>
        </div>

        {loading ? (
          <div className="loading-box">
            <div className="spinner-border text-primary me-2" role="status"></div>
            Loading line data from {activePlant} backend...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="tbm-matrix-table">
              <thead>
                <tr className="group-header">
                  <th rowSpan="2" style={{ minWidth: "140px" }}>Line</th>
                  <th colSpan="2">Today's Target</th>
                  <th colSpan="3">Cumulative As of Date (AOD)</th>
                  <th colSpan="3">Cumulative Full Month Horizon</th>
                  <th rowSpan="2" style={{ minWidth: "120px" }}>Achievement</th>
                </tr>
                <tr>
                  <th className="col-plan">Today's Plan</th>
                  <th className="col-actual">Today's Actual</th>
                  <th className="col-plan">Cum Plan (AOD)</th>
                  <th className="col-actual">Cum Actual (AOD)</th>
                  <th className="col-pending">Cum Pending (AOD)</th>
                  <th className="col-plan">Cum Plan (Month)</th>
                  <th className="col-actual">Cum Actual (Month)</th>
                  <th className="col-pending">Cum Pending (Month)</th>
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-muted py-4">
                      No line data found for this selection.
                    </td>
                  </tr>
                ) : (
                  lines.map((row) => {
                    const rowPct = row.cumPlanAod > 0 ? Math.round((row.cumActualAod / row.cumPlanAod) * 100) : 0;
                    const barColor = rowPct >= 90 ? "#16a34a" : rowPct >= 70 ? "#0284c7" : "#d97706";

                    return (
                      <tr key={row.line}>
                        <td className="line-cell">{row.line}</td>
                        <td className="col-plan">{row.todaysPlan}</td>
                        <td className="col-actual">{row.todaysActual}</td>
                        <td className="col-plan">{row.cumPlanAod}</td>
                        <td className="col-actual">{row.cumActualAod}</td>
                        <td className="col-pending">{row.cumPendingAod}</td>
                        <td className="col-plan">{row.cumPlanMonth}</td>
                        <td className="col-actual">{row.cumActualMonth}</td>
                        <td className="col-pending">{row.cumPendingMonth}</td>
                        <td>
                          <div className="progress-container">
                            <div className="progress-bar-bg">
                              <div
                                className="progress-bar-fill"
                                style={{ width: `${Math.min(100, rowPct)}%`, backgroundColor: barColor }}
                              ></div>
                            </div>
                            <span className="progress-pct" style={{ color: barColor }}>
                              {rowPct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td className="tfoot-label">TOTAL</td>
                  <td className="col-plan">{totals.todaysPlan || 0}</td>
                  <td className="col-actual">{totals.todaysActual || 0}</td>
                  <td className="col-plan">{totals.cumPlanAod || 0}</td>
                  <td className="col-actual">{totals.cumActualAod || 0}</td>
                  <td className="col-pending">{totals.cumPendingAod || 0}</td>
                  <td className="col-plan">{totals.cumPlanMonth || 0}</td>
                  <td className="col-actual">{totals.cumActualMonth || 0}</td>
                  <td className="col-pending">{totals.cumPendingMonth || 0}</td>
                  <td>
                    <div className="progress-container">
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${Math.min(100, aodRate)}%`,
                            backgroundColor: aodRate >= 90 ? "#16a34a" : aodRate >= 70 ? "#0284c7" : "#d97706",
                          }}
                        ></div>
                      </div>
                      <span className="progress-pct" style={{ color: aodRate >= 80 ? "#16a34a" : "#d97706" }}>
                        {aodRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Today's TBM Execution Status Card (Rows 10-12 of TNGA-mnt.xlsx) */}
      <div className="status-breakdown-card">
        <div className="status-breakdown-header">
          <i className="bi bi-calendar-event text-primary"></i>
          Today's TBM Execution Status Breakdown (On-Schedule vs Backlog Cleared)
        </div>
        <div className="table-responsive">
          <table className="tbm-matrix-table">
            <thead>
              <tr className="group-header">
                <th style={{ minWidth: "160px" }}>Category</th>
                <th>Metric</th>
                {lines.map((l) => (
                  <th key={l.line}>{l.line}</th>
                ))}
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fw-bold text-start ps-3">Today's Cards</td>
                <td className="text-muted text-start ps-3">Completed On-Schedule</td>
                {lines.map((l) => (
                  <td key={l.line} className="col-actual fw-bold">
                    {todaysStatus.todaysCompleted?.[l.line] || 0}
                  </td>
                ))}
                <td className="col-actual fw-bold">{todaysStatus.todaysCompleted?.TOTAL || 0}</td>
              </tr>
              <tr>
                <td className="fw-bold text-start ps-3">Other Days' Cards</td>
                <td className="text-muted text-start ps-3">Past Backlog Completed Today</td>
                {lines.map((l) => (
                  <td key={l.line} className="text-primary fw-bold">
                    {todaysStatus.otherDaysCompleted?.[l.line] || 0}
                  </td>
                ))}
                <td className="text-primary fw-bold">{todaysStatus.otherDaysCompleted?.TOTAL || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
