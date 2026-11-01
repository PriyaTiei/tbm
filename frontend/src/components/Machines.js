import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDailyStatus } from "../redux/dailyStatus/dailyStatusActions";
import { getMachines } from "../redux/machine/machineActions";
import Line from "./Line";
import Loading from "./Loading";
import MachineListTable from "./MachineListTable"; // ✅ New component

function Machines() {
  const dispatch = useDispatch();
  const [viewMode, setViewMode] = useState("card"); // ✅ Toggle state

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

  // Filters: do not pass category names or line filter directly to backend getMachines query
  // so that machineData in Redux retains all lines, preventing the sub-line dropdown from collapsing.
  // Frontend filteredMachines handles line/category filtering cleanly and instantly.
  const rSStr = filters.rS ? `&rS=${filters.rS}` : "";
  const groupStr = filters.group ? `&group=${filters.group}` : "";
  const processNoStr = filters.processNo
    ? `&processNo=${encodeURIComponent(filters.processNo)}`
    : "";
  const cardNoStr = filters.cardNo ? `&cardNo=${filters.cardNo}` : "";

  let queryStr, DailyStatusQueryStr;
  if (filters.processNo === "" && filters.cardNo === "") {
    queryStr = `d=${filters.d}&w=${filters.w}&m=${filters.m}&y=${filters.y}&pS=${filters.pS}` + rSStr + groupStr + processNoStr + cardNoStr;
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
      {/* View Mode Pill Switch */}
      <div className="d-flex justify-content-end align-items-center px-3 py-1 mb-2">
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
                <div className="p-3 text-center">No machine data available for {filters.line}.</div>
              )}
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
