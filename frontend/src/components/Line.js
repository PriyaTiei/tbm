import React, { Fragment } from "react";
import MachineCard from "./MachineCard";

function Line({ line, processNos, counts, dailyStatusDataLinewise }) {
  const resultData = {};
  dailyStatusDataLinewise = dailyStatusDataLinewise
    ? dailyStatusDataLinewise
    : [];
  dailyStatusDataLinewise.forEach((element) => {
    resultData[element.processNo] = {
      OK: element.result.OK,
      NG: element.result.NG,
    };
  }); 
 

  return (
    <Fragment>
      <h3 className="mx-3 p-1 bg-info text-center ">{line}</h3>
      <div className="d-flex flex-wrap">
        {processNos.map((processNo) => {
          return (
            <MachineCard
              processNo={processNo}
              key={processNo}
              line={line}
              count={counts[processNo]}
              resultData={resultData}
              OK={resultData[processNo] ? resultData[processNo].OK : 0}
              NG={resultData[processNo] ? resultData[processNo].NG : 0}
            />
          );
        })}
      </div>
    </Fragment>
  );
}

export default Line;
