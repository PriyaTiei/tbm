import React, { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPendingTasks } from "../redux/pendingTasks/pendingActions"; 

import PendingLine from "./PendingLine";
import Loading from "./Loading";

export default function PendingTask() {
  const dispatch = useDispatch();
  const pendingTasks = useSelector((state) => state.pendingTasks); 
   
 

  useEffect(() => {
    dispatch(getPendingTasks()); 
  }, [dispatch ]);

  const { loading, pendingTasksData } = pendingTasks; 

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
                        counts={item.counts}                         
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
