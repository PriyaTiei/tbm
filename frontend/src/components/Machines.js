import React, { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDailyStatus } from "../redux/dailyStatus/dailyStatusActions";
import { getMachines } from "../redux/machine/machineActions";
import Line from "./Line";
import Loading from "./Loading";
import { getLoginCookie } from "../services/getLoginCookie.js"
import MultiLevelXAxisBarChart from "../BarChart.js";

function Machines() {
  const dispatch = useDispatch();
  const machines = useSelector((state) => state.machines);
  const filters = useSelector((state) => state.filters);
  const dailyStatuses = useSelector((state) => state.dailyStatuses);
  const dailyStatusData =
    dailyStatuses.loading === false
      ? dailyStatuses.dailyStatus.success
        ? dailyStatuses.dailyStatus.sortedDailyStatus
        : []
      : [];
  const dailyStatusDataLinewise = {}
  dailyStatusData.forEach((item) => {
    dailyStatusDataLinewise[item.line] = item.processes
  })
  

  let lineStr = filters.line === null ? '' : `&line=${filters.line}`
  let rSStr = filters.rS === null ? '' : `&rS=${filters.rS}`
  let groupStr = filters.group === null ? '' : `&group=${filters.group}`
   let processNoStr = filters.processNo === null || filters.processNo === "" ? '' : `&processNo=${filters.processNo}`
  let cardNoStr = filters.cardNo === null || filters.cardNo === "" ? '' : `&cardNo=${filters.cardNo}`

  // let queryStr = `d=${filters.d}&w=${filters.w}&m=${filters.m}&y=${filters.y}&pS=${filters.pS}` + lineStr + rSStr + groupStr;
  // let DailyStatusQueryStr = `entryFor=${filters.y}-${filters.m}-${filters.dt}&pS=${filters.pS}`;
  let queryStr 
  let DailyStatusQueryStr 
  if(filters.processNo ===  "" && filters.cardNo === "" ){
    console.log("test ********************")
    queryStr = `d=${filters.d}&w=${filters.w}&m=${filters.m}&y=${filters.y}&pS=${filters.pS}` + lineStr + rSStr +groupStr + processNoStr + cardNoStr;
    DailyStatusQueryStr = `entryFor=${filters.y}-${filters.m}-${filters.dt}&pS=${filters.pS}` + lineStr + rSStr +groupStr + processNoStr + cardNoStr;
  }else{
    queryStr = `pS=${filters.pS}` + lineStr  + processNoStr + cardNoStr;
    DailyStatusQueryStr = `pS=${filters.pS}` + lineStr +  processNoStr + cardNoStr;
  }

  useEffect(() => {
    dispatch(getMachines(queryStr));

    dispatch(getDailyStatus(DailyStatusQueryStr));
    // dispatch(getDailyStatus());
  }, [dispatch, filters, queryStr, DailyStatusQueryStr]);

  const { loading, machineData } = machines;


  return (
    <Fragment>
      {loading ? (
        <Loading />
      ) : (
        <Fragment >

          <div className="overflow-auto" style={{ height: "85vh", paddingBottom: "10%" }}>
            {machineData.success
              ? machineData.machineData.map((item, i) => {
                return (
                  <Line

                    line={item.line}
                    processNos={item.processNos}
                    counts={item.counts}
                    key={item.line}

                    dailyStatusDataLinewise={dailyStatusDataLinewise[item.line]}
                  />
                );
              })
              : null}

          </div>
        </Fragment>
      )}

    </Fragment>
  );
}

export default Machines;
