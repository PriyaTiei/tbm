import React, { Fragment } from "react"; 
import AllMachineCard from "./AllMachineCard";
import { useDispatch } from 'react-redux';
import { setProcessData } from '../../redux/processData/processActions';
import Loading from "../Loading";

export default function AllMachineLine({ line, processList , counts  }) { 
 
  
  const dispatch = useDispatch();

  const handleClick = (processData) => {
    dispatch(setProcessData(processData)); 
  };

  let totalSum = processList ? processList.length : 0;

  return (
    <Fragment>
      <div
        className="mx-3 my-2 p-2 px-3 rounded-3 d-flex justify-content-between align-items-center shadow-sm"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderLeft: "4px solid #2563eb",
        }}
      >
        <h5 className="m-0 fw-bold text-dark d-flex align-items-center">
          <i className="bi bi-diagram-3-fill text-primary me-2"></i>
          {line}
        </h5>
        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1.5 fw-semibold">
          {totalSum} {totalSum === 1 ? "Station" : "Stations"}
        </span>
      </div>
      <div className="d-flex flex-wrap mx-2 mb-3">
        {processList ? (
          processList.map((processNo) => (
            <AllMachineCard
              onClick={() => handleClick(processNo.processData)}
              processNo={processNo.processNo}
              key={processNo.processNo}
              processData={processNo.processData}
            />
          ))
        ) : (
          <Loading />
        )}
      </div>
    </Fragment>
  );
}
 
