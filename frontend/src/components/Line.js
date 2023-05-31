import React, { Fragment, useState } from "react";
import MachineCard from "./MachineCard";
import Loading from "./Loading";
import CardStatusGraphModel from "./CardStatusGraphModel";

function Line({ line, processNos, counts, dailyStatusDataLinewise }) {
  const [showGraphModal, setShowGraphModal] = useState(false);
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

  let totalSum = Object.values(counts).reduce((acc, curr) => acc + curr, 0);
 

  return (
    <Fragment>
      <div className="d-flex bg-info m-3 p-1 w-90 justify-content-between">
      <h3 className="bg-info text-center ">{`${line} - ${totalSum}`}</h3>
      <button onClick={()=>setShowGraphModal(true)} className="btn btn-primary">Graph</button>
      </div>
      
      <div className="d-flex flex-wrap">
        { processNos ? processNos.map((processNo) => {
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
        }) : <Loading/>}
      </div>
      {
        showGraphModal && (
          <CardStatusGraphModel showModal={showGraphModal} setShowModal={setShowGraphModal} line={line} />
        )
      }
    </Fragment>
  );
}

export default Line;
