import React, { Fragment } from "react"; 
import AlldelMachineCard from "./AlldelMachineCards";
import { useDispatch } from 'react-redux';
import { setProcessData } from '../../redux/processData/processActions';
import Loading from "../Loading";

export default function AlldelMachineLine({ line, processList , counts  }) { 
 
  
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
          borderLeft: "4px solid #ef4444",
        }}
      >
        <h5 className="m-0 fw-bold text-dark d-flex align-items-center">
          <i className="bi bi-trash3-fill text-danger me-2"></i>
          {line}
        </h5>
        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3 py-1.5 fw-semibold">
          {totalSum} Deleted {totalSum === 1 ? "Station" : "Stations"}
        </span>
      </div>
      <div className="d-flex flex-wrap mx-2 mb-3">
        {processList ? (
          processList.map((processNo) => (
            <AlldelMachineCard
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
 
