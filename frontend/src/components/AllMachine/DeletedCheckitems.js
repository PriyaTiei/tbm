import React, { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDeletedCheckItems} from "../../redux/machine/machineActions";

import AlldelMachineLine from "./AlldelMachineLine";
import Loading from "../Loading";


export default function DelMachine() {
  const dispatch = useDispatch();
  const machines = useSelector((state) => state.machines); 
 
  const filters = useSelector((state) => state.filters);
  
  

  let lineStr = filters.line === null ? '' : `&line=${filters.line}`
  let rSStr = filters.rS === null ? '' : `&rS=${filters.rS}`

  let queryStr = `&pS=${filters.pS}` + lineStr + rSStr;

  useEffect(() => {
    dispatch(getDeletedCheckItems(queryStr)); 
  }, [dispatch , filters , queryStr]);
 
  const { loading, machineData } = machines;  
  
  return (
    <Fragment>
      {loading ? (
        <Loading />
      ) : (
        <Fragment >
         <div className="overflow-auto" style={{height:"85vh", paddingBottom: "10%"}}>
          {machineData.success
            ? machineData.machineData.map((item, i) => {
                return (
                  <AlldelMachineLine                    
                    line={item.line}
                    processList={item.processList}
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
