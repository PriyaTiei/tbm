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
import axios from "axios";

import AllMachineLine from "./AllMachineLine";
import Loading from "../Loading";

export default function AllMachine() {
  const filters = useSelector((state) => state.filters);
  
  // Local state for date range filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allMachineData, setAllMachineData] = useState(null);
  const [filteredMachineData, setFilteredMachineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [machineDetailsCache, setMachineDetailsCache] = useState({});

  let lineStr = filters.line === null ? '' : `&line=${filters.line}`
  let rSStr = filters.rS === null ? '' : `&rS=${filters.rS}`
  let queryStr = `&pS=${filters.pS}` + lineStr + rSStr;

  // Fetch all machine list data
  const fetchAllMachineList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5051/head/allMachineList?${queryStr}`, {
        timeout: 10000
      });
      
      if (response.data.success) {
        setAllMachineData(response.data);
        setFilteredMachineData(response.data.machineData); // Initially show all data
      }
    } catch (error) {
      console.error("Error fetching machine list:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch machine details for date filtering
  const fetchMachineDetails = async (ids) => {
    setDetailsLoading(true);
    const newDetails = { ...machineDetailsCache };
    const idsToFetch = ids.filter(id => !newDetails[id]); // Only fetch IDs we don't have cached
    
    try {
      const promises = idsToFetch.map(async (id) => {
        try {
          const response = await axios.get(`http://localhost:5051/head/machine/${id}`, {
            timeout: 10000
          });
          
          if (response.data.success && response.data.data) {
            return { id, data: response.data.data };
          }
          return { id, data: null };
        } catch (error) {
          console.error(`Failed to fetch details for machine ${id}:`, error);
          return { id, data: null };
        }
      });

      const results = await Promise.all(promises);
      results.forEach(({ id, data }) => {
        if (data) {
          newDetails[id] = data;
        }
      });

      setMachineDetailsCache(newDetails);
    } catch (error) {
      console.error("Error fetching machine details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Extract all unique IDs from machine data
  const extractAllIds = (machineData) => {
    const allIds = [];
    if (machineData && Array.isArray(machineData)) {
      machineData.forEach(item => {
        if (item.processList && Array.isArray(item.processList)) {
          item.processList.forEach(process => {
            if (process.processData && Array.isArray(process.processData)) {
              process.processData.forEach(machine => {
                if (machine.id && !allIds.includes(machine.id)) {
                  allIds.push(machine.id);
                }
              });
            }
          });
        }
      });
    }
    return allIds;
  };

  // Load initial data
  useEffect(() => {
    fetchAllMachineList();
  }, [filters, queryStr]);

  // Apply date filtering
  useEffect(() => {
    if (!allMachineData || !allMachineData.machineData) {
      return;
    }

    // If no date filters, show all data
    if (!startDate && !endDate) {
      setFilteredMachineData(allMachineData.machineData);
      return;
    }

    // Extract all IDs and fetch their details for date filtering
    const allIds = extractAllIds(allMachineData.machineData);
    
    if (allIds.length > 0) {
      fetchMachineDetails(allIds);
    }
  }, [allMachineData, startDate, endDate]);

  // Filter based on date range once we have machine details
  useEffect(() => {
    if (!allMachineData || !allMachineData.machineData || (!startDate && !endDate)) {
      return;
    }

    const startDateObj = startDate ? new Date(startDate) : null;
    const endDateObj = endDate ? new Date(endDate + 'T23:59:59.999Z') : null;

    // Get IDs that match the date criteria
    const matchingIds = [];
    Object.keys(machineDetailsCache).forEach(id => {
      const detail = machineDetailsCache[id];
      if (detail && detail.createdAt) {
        const machineDate = new Date(detail.createdAt);
        
        let includeInFilter = true;
        if (startDateObj && endDateObj) {
          includeInFilter = machineDate >= startDateObj && machineDate <= endDateObj;
        } else if (startDateObj) {
          includeInFilter = machineDate >= startDateObj;
        } else if (endDateObj) {
          includeInFilter = machineDate <= endDateObj;
        }

        if (includeInFilter) {
          matchingIds.push(id);
        }
      }
    });

    // Filter the machine data to only include matching IDs
    const filtered = allMachineData.machineData.map(item => {
      const filteredProcessList = item.processList.map(process => {
        const filteredProcessData = process.processData.filter(machine => 
          matchingIds.includes(machine.id)
        );
        
        return {
          ...process,
          processData: filteredProcessData
        };
      }).filter(process => process.processData.length > 0); // Remove empty processes

      // Recalculate counts based on filtered data
      const newCounts = {};
      filteredProcessList.forEach(process => {
        newCounts[process.processNo] = process.processData.length;
      });

      return {
        ...item,
        processList: filteredProcessList,
        counts: newCounts
      };
    }).filter(item => item.processList.length > 0); // Remove empty lines

    setFilteredMachineData(filtered);
  }, [machineDetailsCache, allMachineData, startDate, endDate]);

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const handleTodayFilter = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  const handleThisWeekFilter = () => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    setStartDate(startOfWeek.toISOString().split('T')[0]);
    setEndDate(endOfWeek.toISOString().split('T')[0]);
  };

  const handleLastMonthFilter = () => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    setStartDate(lastMonth.toISOString().split('T')[0]);
    setEndDate(lastDayOfLastMonth.toISOString().split('T')[0]);
  };

  // Count total filtered machines
  const getTotalFilteredMachines = () => {
    return filteredMachineData.reduce((total, item) => {
      return total + item.processList?.reduce((processTotal, process) => {
        return processTotal + (process.processData?.length || 0);
      }, 0) || 0;
    }, 0);
  };

  return (
    <Fragment>
      {loading ? (
        <Loading />
      ) : (
        <Fragment>
          {/* Date Range Filter Section */}
          <div className="container-fluid mb-3 p-3 bg-light border rounded">
            <div className="row align-items-center">
              <div className="col-md-3">
                <label className="form-label fw-bold">Start Date:</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">End Date:</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Quick Filters:</label>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleTodayFilter}
                  >
                    Today
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleThisWeekFilter}
                  >
                    This Week
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleLastMonthFilter}
                  >
                    Last Month
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
            
            {/* Display active filters and loading state */}
            <div className="mt-2">
              {detailsLoading && (
                <div className="text-info mb-2">
                  <small>
                    <i className="spinner-border spinner-border-sm me-2"></i>
                    Loading machine details for date filtering...
                  </small>
                </div>
              )}
              
              {(startDate || endDate) && (
                <small className="text-muted">
                  <strong>Active Date Filter:</strong> 
                  {startDate && ` From: ${startDate}`}
                  {endDate && ` To: ${endDate}`}
                  {!detailsLoading && ` (${getTotalFilteredMachines()} machines found)`}
                </small>
              )}
            </div>
          </div>

          <div className="overflow-auto" style={{height:"85vh", paddingBottom: "10%"}}>
            {allMachineData?.success ? (
              filteredMachineData.length > 0 ? (
                filteredMachineData.map((item, i) => {
                  return (
                    <AllMachineLine                    
                      line={item.line}
                      processList={item.processList}
                      counts={item.counts}
                      key={item.line} 
                    />
                  );
                })
              ) : (
                <div className="text-center p-4">
                  <div className="alert alert-info">
                    <h5>No machines found for the selected date range</h5>
                    <p>Try adjusting your date filters or clear them to see all data.</p>
                    {detailsLoading && <p className="text-muted">Still loading machine details...</p>}
                  </div>
                </div>
              )
            ) : (
              <div className="text-center p-4">
                <div className="alert alert-warning">
                  <h5>No machine data available</h5>
                  <p>Unable to load machine data. Please try refreshing the page.</p>
                </div>
              </div>
            )}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
}