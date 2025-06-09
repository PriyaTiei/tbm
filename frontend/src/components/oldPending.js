import React, { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPendingTasks } from "../redux/pendingTasks/pendingActions";
import PendingLine from "./PendingTask/PendingLine";
import Loading from "./Loading";

export default function OldPending() {
  const dispatch = useDispatch();
  const pendingTasks = useSelector((state) => state.pendingTasks.tasks);
  const filters = useSelector((state) => state.filters);

  let lineStr = filters.line === null ? "" : `&line=${filters.line}`;
  let rSStr = filters.rS === null ? "" : `&rS=${filters.rS}`;

  let queryStr = `pS=${filters.pS}` + lineStr + rSStr;

  useEffect(() => {
    dispatch(getPendingTasks(queryStr));
  }, [dispatch, filters, queryStr]);

  const { loading, pendingTasksData } = pendingTasks; 

  return (
    <Fragment>
      {loading ? (
        <Loading />
      ) : (
        <Fragment>
          <div className="overflow-auto" style={{ height: "75vh", paddingBottom: "10%" }}>
            {pendingTasksData.success
              ? pendingTasksData.pendingData.map((item, i) => {
                  return (
                    <PendingLine
                      line={item.line}
                      processList={item.processList}
                      key={item.line}
                      counts = {item.counts}
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
