import React, { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"; 
import { getMachines } from "../redux/machine/machineActions";
import Line from "./Line";
import Loading from "./Loading";

export default function AllCard() {
  const dispatch = useDispatch();
  const machines = useSelector((state) => state.machines); 
 
  const filters = useSelector((state) => state.filters);
  
  

  let lineStr = filters.line === null ? '' : `&line=${filters.line}`
  let rSStr = filters.rS === null ? '' : `&rS=${filters.rS}`

  let queryStr = `&pS=${filters.pS}` + lineStr + rSStr;

  useEffect(() => {
    dispatch(getMachines(queryStr)); 
  }, [dispatch , filters , queryStr]);

  const { loading, machineData } = machines;  
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
 
