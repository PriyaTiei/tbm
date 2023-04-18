import React, { Fragment } from "react"; 
import PendingCard from "./PendingCard";
import { useDispatch } from 'react-redux';
import { setProcessData } from '../../redux/processData/processActions';

function PendingLine({ line, processList  }) { 
 
  
  const dispatch = useDispatch();

  const handleClick = (processData) => {
    dispatch(setProcessData(processData));
    console.log(processData)
  };

  

  return (
    <Fragment>
      <h3 className="mx-3 p-1 bg-info text-center ">{line}</h3>
      <div className="d-flex flex-wrap">
        {processList
        .map((processNo) => {
             
          return (
            <PendingCard
              onClick={() => handleClick(processNo.processData)}
              processNo={processNo.processNo}
              key={processNo.processNo} 
              processData={processNo.processData}
             
            />
          );
        })}
      </div>
    </Fragment>
  );
}

export default PendingLine;
