import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDailyStatus } from "../redux/dailyStatus/dailyStatusActions";
import { getMachines } from "../redux/machine/machineActions";
import Line from "./Line";
import Loading from "./Loading";
import MachineListTable from "./MachineListTable";

function Machines() {
  const dispatch = useDispatch();
  const [viewMode, setViewMode] = useState("card"); // "card" | "list"
  const [scheduleMode, setScheduleMode] = useState("scheduled"); // "scheduled" | "all"

  const machines = useSelector((state) => state.machines);
  const filters = useSelector((state) => state.filters);
  const dailyStatuses = useSelector((state) => state.dailyStatuses);

  const dailyStatusData =
    dailyStatuses.loading === false
      ? dailyStatuses.dailyStatus.success
        ? dailyStatuses.dailyStatus.sortedDailyStatus
        : []
      : [];

  const dailyStatusDataLinewise = {};
  dailyStatusData.forEach((item) => {
    dailyStatusDataLinewise[item.line] = item.processes;
  });

  const getLineGroup = (line) => {
    if (!line) return "Other Lines";
    const lower = String(line).toLowerCase();
    if (lower.includes("assembly")) return "Assembly";
    if (
      lower.includes("block") ||
      lower.includes("crank") ||
      lower.includes("head") ||
      lower.includes("cam")
    ) {
      return "Machining";
    }
    return "Other Lines";
  };

  const rSStr = filters.rS ? `&rS=${filters.rS}` : "";
  const groupStr = filters.group ? `&group=${filters.group}` : "";
  const processNoStr = filters.processNo
    ? `&processNo=${encodeURIComponent(filters.processNo)}`
    : "";
  const cardNoStr = filters.cardNo ? `&cardNo=${filters.cardNo}` : "";

  // Schedule filtering:
  // When scheduleMode is 'scheduled' (default), query by date (d, w, m, y)
  // When scheduleMode is 'all', query by department only to browse the full master equipment catalog
  let queryStr, DailyStatusQueryStr;
  if (scheduleMode === "scheduled" && filters.processNo === "" && filters.cardNo === "") {
    queryStr = `d=${filters.d}&w=${filters.w}&m=${filters.m}&y=${filters.y}&pS=${filters.pS}` + rSStr + groupStr + processNoStr + cardNoStr;
    DailyStatusQueryStr = `entryFor=${filters.y}-${filters.m}-${filters.dt}&pS=${filters.pS}` + rSStr + groupStr + processNoStr + cardNoStr;
  } else if (filters.processNo === "" && filters.cardNo === "") {
    queryStr = `pS=${filters.pS}` + rSStr + groupStr + processNoStr + cardNoStr;
    DailyStatusQueryStr = `entryFor=${filters.y}-${filters.m}-${filters.dt}&pS=${filters.pS}` + rSStr + groupStr + processNoStr + cardNoStr;
  } else {
    queryStr = `pS=${filters.pS}` + processNoStr + cardNoStr;
    DailyStatusQueryStr = `pS=${filters.pS}` + processNoStr + cardNoStr;
  }

  useEffect(() => {
    dispatch(getMachines(queryStr));
    dispatch(getDailyStatus(DailyStatusQueryStr));
  }, [dispatch, queryStr, DailyStatusQueryStr]);

  const { loading, machineData } = machines;

  const filteredMachines = (machineData?.machineData || []).filter((item) => {
    if (!filters.line) return true;
    const group = getLineGroup(item.line);
    if (filters.line === "Assembly") return group === "Assembly";
    if (filters.line === "Machining") return group === "Machining";
    if (filters.line === "Other Lines") return group === "Other Lines";
    return item.line === filters.line;
  });

  return (
    <Fragment>
      {/* Mode Controls: Schedule View & Card/List View */}
      <div className="d-flex justify-content-between align-items-center px-3 py-1 mb-2 flex-wrap gap-2">
        {/* Schedule Mode: Today's Scheduled vs All Equipment */}
        <div className="btn-group bg-white p-1 rounded-pill border shadow-sm" role="group">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
              scheduleMode === "scheduled"
                ? "btn-primary shadow-sm"
                : "btn-light text-muted border-0 bg-transparent"
            }`}
            onClick={() => setScheduleMode("scheduled")}
            title="Show only equipment scheduled for the selected date"
          >
            <i className="bi bi-calendar-check me-1"></i> Scheduled on Date ({filters.dt}/{filters.m}/{filters.y})
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
              scheduleMode === "all"
                ? "btn-secondary shadow-sm text-white"
                : "btn-light text-muted border-0 bg-transparent"
            }`}
            onClick={() => setScheduleMode("all")}
            title="Show all equipment master catalog for this department"
          >
            <i className="bi bi-collection me-1"></i> All Equipment Catalog
          </button>
        </div>

        {/* View Mode: Card View vs List View */}
        <div className="btn-group bg-white p-1 rounded-pill border shadow-sm" role="group">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
              viewMode === "card"
                ? "btn-primary shadow-sm"
                : "btn-light text-muted border-0 bg-transparent"
            }`}
            onClick={() => setViewMode("card")}
          >
            <i className="bi bi-grid-fill me-1"></i> Card View
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
              viewMode === "list"
                ? "btn-success shadow-sm"
                : "btn-light text-muted border-0 bg-transparent"
            }`}
            onClick={() => setViewMode("list")}
          >
            <i className="bi bi-table me-1"></i> List View
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <Fragment>
          {machineData.success && viewMode === "card" ? (
            <div className="overflow-auto" style={{ height: "85vh", paddingBottom: "10%" }}>
              {filteredMachines.length > 0 ? (
                filteredMachines.map((item) => (
                  <Line
                    key={item.line}
                    line={item.line}
                    processNos={item.processNos}
                    counts={item.counts}
                    dailyStatusDataLinewise={dailyStatusDataLinewise[item.line]}
                  />
                ))
              ) : (
                <div className="p-4 text-center text-muted">
                  <h5>No machine data available for {filters.line || "this filter"}.</h5>
                </div>
              )}
            </div>
          ) : viewMode === "card" && !machineData.success ? (
            <div className="p-5 text-center text-muted bg-white rounded-3 mx-3 my-4 shadow-sm border">
              <div style={{ fontSize: "2.5rem" }}>📅</div>
              <h5 className="mt-2 fw-bold text-dark">No Maintenance Scheduled for this Date</h5>
              <p className="small text-muted mb-3">
                There are no maintenance cards scheduled for <strong>{filters.dt}/{filters.m}/{filters.y}</strong> under {filters.pS === "S" ? "Service Dept" : "Maintenance Dept"}.
              </p>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1"
                onClick={() => setScheduleMode("all")}
              >
                Browse All Equipment Catalog
              </button>
            </div>
          ) : (
            <MachineListTable
              machineData={filteredMachines}
              dailyStatusDataLinewise={dailyStatusDataLinewise}
            />
          )}
        </Fragment>
      )}
    </Fragment>
  );
}

export default Machines;
