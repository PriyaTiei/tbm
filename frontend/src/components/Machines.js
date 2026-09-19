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

  // Filters: do not pass category names directly to backend query to prevent 404
  const isCategoryFilter = filters.line === "Assembly" || filters.line === "Machining" || filters.line === "Other Lines";
  const lineStr = filters.line && !isCategoryFilter ? `&line=${filters.line}` : "";
  const rSStr = filters.rS ? `&rS=${filters.rS}` : "";
  const groupStr = filters.group ? `&group=${filters.group}` : "";
  const processNoStr = filters.processNo ? `&processNo=${filters.processNo}` : "";
  const cardNoStr = filters.cardNo ? `&cardNo=${filters.cardNo}` : "";

  let queryStr, DailyStatusQueryStr;
  if (filters.processNo === "" && filters.cardNo === "") {
    queryStr = `d=${filters.d}&w=${filters.w}&m=${filters.m}&y=${filters.y}&pS=${filters.pS}` + lineStr + rSStr + groupStr + processNoStr + cardNoStr;
    DailyStatusQueryStr = `entryFor=${filters.y}-${filters.m}-${filters.dt}&pS=${filters.pS}` + lineStr + rSStr + groupStr + processNoStr + cardNoStr;
  } else {
    queryStr = `pS=${filters.pS}` + lineStr + processNoStr + cardNoStr;
    DailyStatusQueryStr = `pS=${filters.pS}` + lineStr + processNoStr + cardNoStr;
  }

  useEffect(() => {
    dispatch(getMachines(queryStr));
    dispatch(getDailyStatus(DailyStatusQueryStr));
  }, [dispatch, filters]);

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
      <div className="d-flex justify-content-end align-items-center m-2">
        <button
          className="btn btn-sm btn-outline-primary me-2"
          onClick={() => setViewMode("card")}
        >
          Card View
        </button>
        <button
          className="btn btn-sm btn-outline-success"
          onClick={() => setViewMode("list")}
        >
          List View
        </button>
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
