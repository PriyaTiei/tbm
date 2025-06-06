// import React, { Fragment, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { getAllMachines } from "../../redux/machine/machineActions";

// import AllMachineLine from "./AllMachineLine";
// import Loading from "../Loading";


// export default function AllMachine() {
//   const dispatch = useDispatch();
//   const machines = useSelector((state) => state.machines); 
 
//   const filters = useSelector((state) => state.filters);
  
  

//   let lineStr = filters.line === null ? '' : `&line=${filters.line}`
//   let rSStr = filters.rS === null ? '' : `&rS=${filters.rS}`

//   let queryStr = `&pS=${filters.pS}` + lineStr + rSStr;

//   useEffect(() => {
//     dispatch(getAllMachines(queryStr)); 
//   }, [dispatch , filters , queryStr]);

//   const { loading, machineData } = machines;  
  
//   return (
//     <Fragment>
//       {loading ? (
//         <Loading />
//       ) : (
//         <Fragment >
//          <div className="overflow-auto" style={{height:"85vh", paddingBottom: "10%"}}>
//           {machineData.success
//             ? machineData.machineData.map((item, i) => {
//                 return (
//                   <AllMachineLine                    
//                     line={item.line}
//                     processList={item.processList}
//                     counts={item.counts}
//                     key={item.line} 
//                   />
//                 );
//               })
//             : null}
//             </div>
//         </Fragment>
//       )}
      
//     </Fragment>
//   );
// }

import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllMachines } from "../../redux/machine/machineActions";

import AllMachineLine from "./AllMachineLine";
import Loading from "../Loading";

export default function AllMachine() {
  const dispatch = useDispatch();
  const machines = useSelector((state) => state.machines); 
  const filters = useSelector((state) => state.filters);

  // 🔹 Local filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | ok | ng

  // 🔹 Query string building
  const lineStr = filters.line ? `&line=${filters.line}` : "";
  const rSStr = filters.rS ? `&rS=${filters.rS}` : "";
  const startStr = startDate ? `&startDate=${startDate}` : "";
  const endStr = endDate ? `&endDate=${endDate}` : "";
  const statusStr = statusFilter !== "all" ? `&status=${statusFilter}` : "";

  const queryStr = `&pS=${filters.pS}` + lineStr + rSStr + startStr + endStr + statusStr;

  useEffect(() => {
    dispatch(getAllMachines(queryStr)); 
  }, [dispatch, filters, startDate, endDate, statusFilter]);

  const { loading, machineData } = machines;
  
  return (
    <Fragment>
      {/* 🔹 Filter Inputs */}
      <div className="flex flex-wrap gap-4 px-4 py-3 bg-gray-100 shadow-md items-end">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-1 rounded"
          >
            <option value="all">All</option>
            <option value="ok">OK</option>
            <option value="ng">NG</option>
          </select>
        </div>
      </div>

      {/* 🔹 Data Display */}
      {loading ? (
        <Loading />
      ) : (
        <div className="overflow-auto" style={{ height: "85vh", paddingBottom: "10%" }}>
          {machineData.success
            ? machineData.machineData.map((item) => (
                <AllMachineLine
                  key={item.line}
                  line={item.line}
                  processList={item.processList}
                  counts={item.counts}
                />
              ))
            : <p className="text-center mt-4">No data found.</p>}
        </div>
      )}
    </Fragment>
  );
}
