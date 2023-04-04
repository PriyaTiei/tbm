import React, { Fragment } from "react"; 
import PendingCard from "./PendingCard";

function PendingLine({ line, processList, counts  }) { 

  function removeDuplicateProcesses(processList) {
    const uniqueProcesses = new Set();
    const result = [];
    
    processList.forEach(process => {
      if (!uniqueProcesses.has(process.processNo)) {
        uniqueProcesses.add(process.processNo);
        result.push(process);
      }
    });
    
    return result;
  }

  let pendingData = removeDuplicateProcesses(processList);
  

  return (
    <Fragment>
      <h3 className="mx-3 p-1 bg-info text-center ">{line}</h3>
      <div className="d-flex flex-wrap">
        {pendingData.map((processNo) => {
           
          return (
            <PendingCard
              processNo={processNo.processNo}
              key={processNo.processNo}
              line={line} 
              counts={counts[processNo.processNo]}
              result = {processNo.result}
            />
          );
        })}
      </div>
    </Fragment>
  );
}

export default PendingLine;
