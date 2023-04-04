import React, { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDailyStatus } from "../redux/dailyStatus/dailyStatusActions";
import { getMachines } from "../redux/machine/machineActions";
import Line from "./Line";
import Loading from "./Loading";

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
  const dailyStatusDataLinewise ={} 
  dailyStatusData.forEach((item)=>{
      dailyStatusDataLinewise[item.line]= item.processes
  })
  

  let queryStr = `d=${filters.d}&w=${filters.w}&m=${filters.m}&y=${filters.y}&pS=${filters.pS}`;
  let DailyStatusQueryStr = `entryFor=${filters.y}-${filters.m}-${filters.dt}&pS=${filters.pS}`;

  useEffect(() => {
    dispatch(getMachines(queryStr));

    dispatch(getDailyStatus(DailyStatusQueryStr));
    // dispatch(getDailyStatus());
  }, [dispatch, filters]);

  const { loading, machineData } = machines;

  console.log(machineData)
 
  return (
    <Fragment>
      {loading ? (
        <Loading />
      ) : (
        <Fragment >
         <div className="overflow-auto" style={{height:"75vh"}}>
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
