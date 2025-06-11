import React, { Fragment } from "react";
import PendingCard from "./PendingCard";
import { useDispatch } from "react-redux";
import { setProcessData } from "../../redux/processData/processActions";

function PendingLine({ line, processList, counts }) {
  const dispatch = useDispatch();
  const handleClick = (processData) => {
    dispatch(setProcessData(processData));
  };

  const totalSum = counts && typeof counts === "object" ? Object.values(counts).reduce((acc, curr) => acc + curr, 0) : 0;

  return (
    <Fragment>
      <h3 className="mx-3 p-1 bg-info text-center">{`${line} - ${totalSum}`}</h3>
      <div className="d-flex flex-wrap">
        {processList.length > 0 ? (
          processList.map((process) => (
            <PendingCard
              key={process.processNo}
              onClick={() => handleClick(process.processData)}
              processNo={process.processNo}
              processData={process.processData}
              result={process.processData?.[0]?.result || "PENDING"}
            />
          ))
        ) : (
          <div className="text-center w-100 py-4">No pending cards available.</div>
        )}
      </div>
    </Fragment>
  );
}

export default PendingLine;
