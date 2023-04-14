import React, { Fragment } from "react"; 
import PendingCard from "./PendingCard";

function PendingLine({ line, processList  }) { 
 
  
  

  return (
    <Fragment>
      <h3 className="mx-3 p-1 bg-info text-center ">{line}</h3>
      <div className="d-flex flex-wrap">
        {processList
        .map((processNo) => {
           
          return (
            <PendingCard
              processNo={processNo.processNo}
              key={processNo.processNo}
              line={line}  
              processData={processNo.processData}
            />
          );
        })}
      </div>
    </Fragment>
  );
}

export default PendingLine;
