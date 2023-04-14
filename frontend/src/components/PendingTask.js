import React, { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPendingTasks } from "../redux/pendingTasks/pendingActions"; 

import PendingLine from "./PendingLine";
import Loading from "./Loading";

export default function PendingTask() {
  const dispatch = useDispatch();
  const pendingTasks = useSelector((state) => state.pendingTasks); 
  const filters = useSelector((state) => state.filters);
   
  let queryStr = `pS=${filters.pS}`;

  useEffect(() => {
    dispatch(getPendingTasks(queryStr)); 
  }, [dispatch, filters ]);

  const { loading, pendingTasksData } = pendingTasks;  
  console.log(pendingTasksData.pendingData)

  return (
    <Fragment>
      {loading ? (
        <Loading />
      ) : (
        <Fragment>
          <div className="overflow-auto" style={{ height: "75vh" }}>
            {pendingTasksData.success
              ? pendingTasksData.pendingData                
                  .map((item, i) => { 
                    return (
                      <PendingLine
                        line={item.line} 
                        processList = {item.processList} 
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
