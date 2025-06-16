import React, { Fragment, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPendingTasks } from "../../redux/pendingTasks/pendingActions";
import * as XLSX from "xlsx";
import PendingLine from "./PendingLine";
import Loading from "../Loading";
import { Button } from "react-bootstrap";
import axios from "axios";

export default function PendingTask() {
  const dispatch = useDispatch();

  const pendingTasks = useSelector((state) => state.pendingTasks);
  const filters = useSelector((state) => state.filters);

  const [header, setHeader] = useState([]);
  const [body, setBody] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [ageFilter, setAgeFilter] = useState("ALL");
  const [isExcelDataReady, setIsExcelDataReady] = useState(false);
  const [isExcelApiLoaded, setIsExcelApiLoaded] = useState(false);

  const queryStr =
    `pS=${filters.pS}` +
    (filters.line ? `&line=${filters.line}` : "") +
    (filters.rS ? `&rS=${filters.rS}` : "");

  useEffect(() => {
    dispatch(getPendingTasks(queryStr));
  }, [dispatch, queryStr]);

  const { loading, pendingTasksData, error } = pendingTasks;

  // Fetch Excel data from the report endpoint with ALL filters applied
  useEffect(() => {
    setIsExcelApiLoaded(false);
    setIsExcelDataReady(false);
    
    // Use the same queryStr that's used for display data to ensure consistency
    const url = `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/pendingTasks/getPendingTaskReport?${queryStr}`;
    
    axios
      .get(url)
      .then((res) => {
        if (res.data && res.data.success && res.data.pendingData) {
          setExcelData(res.data);
          setIsExcelApiLoaded(true);
        } else {
          // Use display data as fallback
          setExcelData({ 
            success: true, 
            pendingData: pendingTasksData?.pendingData || [] 
          });
          setIsExcelApiLoaded(true);
        }
      })
      .catch((err) => {
        console.error("Excel data fetch error:", err);
        // Fallback to using display data if Excel API fails
        setExcelData({ 
          success: true, 
          pendingData: pendingTasksData?.pendingData || [] 
        });
        setIsExcelApiLoaded(true);
      });
  }, [queryStr, pendingTasksData]); // Changed dependency from filters to queryStr

  // Sanitize and prepare the Excel data with proper createdAt dates
  const sanitizedExcelData = useMemo(() => {
    return (excelData?.pendingData || []).map((item) => ({
      ...item,
      processList: (item.processList || []).map((entry) => {
        const direct = entry.createdAt;
        const fromProcessData =
          entry.processData?.[0]?.createdAt ||
          entry.processData?.[0]?.entryDates?.[0] ||
          null;

        const createdAt = direct || fromProcessData;

        return {
          ...entry,
          createdAt,
        };
      }),
    }));
  }, [excelData]);

  // Sanitize and prepare the pending data with proper createdAt dates
  const sanitizedPendingData = useMemo(() => {
    return (pendingTasksData?.pendingData || []).map((item) => ({
      ...item,
      processList: (item.processList || []).map((entry) => {
        const direct = entry.createdAt;
        const fromProcessData =
          entry.processData?.[0]?.createdAt ||
          entry.processData?.[0]?.entryDates?.[0] ||
          null;

        const createdAt = direct || fromProcessData;

        return {
          ...entry,
          createdAt,
        };
      }),
    }));
  }, [pendingTasksData]);

  // Filter data based on age filter
  const filterDataByAge = (data) => {
    const now = new Date();

    return data
      .map((item) => {
        const filteredProcessList = item.processList.filter((entry) => {
          const createdAt = new Date(entry.createdAt);

          if (!entry.createdAt) return ageFilter === "ALL";

          const createdDate = new Date(createdAt);
          if (isNaN(createdDate)) return ageFilter === "ALL";

          const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);

          switch (ageFilter) {
            case "ALL":
              return true;
            case "1-10":
              return diffDays >= 0 && diffDays < 10;
            case "11-20":
              return diffDays >= 10 && diffDays < 20;
            case ">20":
              return diffDays >= 20;
            default:
              return true;
          }
        });

        return filteredProcessList.length > 0 ? { ...item, processList: filteredProcessList } : null;
      })
      .filter(Boolean);
  };

  // Filter the Excel data based on age filter
  const filteredExcelData = useMemo(() => {
    return filterDataByAge(sanitizedExcelData);
  }, [sanitizedExcelData, ageFilter]);

  // Filter the display data based on age filter
  const filteredPendingData = useMemo(() => {
    return filterDataByAge(sanitizedPendingData);
  }, [sanitizedPendingData, ageFilter]);

  // Build Excel data whenever filtered data changes - but only after Excel API is loaded
  useEffect(() => {
    // Don't build Excel data until the Excel API has loaded
    if (!isExcelApiLoaded) {
      setIsExcelDataReady(false);
      return;
    }

    setIsExcelDataReady(false); // Mark as not ready when starting to build
    
    const columns = [
      "SL NO",
      "LATEST PLAN DATE",
      "LINE",
      "OP NO",
      "WORK DETAIL",
      "FREQUENCY",
      "MEASUREMENT",
      "STANDARD VALUE",
      "LATEST ACTUAL VALUE",
      "LAST COMPLETED DATE",
    ];
    setHeader(columns);

    // Prioritize Excel data over display data - only use display data if Excel data is truly empty
    const dataToUse = (filteredExcelData.length > 0) ? filteredExcelData : filteredPendingData;
    
    // Add a delay to ensure Excel API data is fully processed
    const buildExcelData = () => {
      try {
        const rows = buildExcelRowsFromFilteredData(dataToUse);
        setBody(rows);
        
        // Additional validation: ensure we have the complete data set
        // If we're using Excel data, verify it has populated values
        if (filteredExcelData.length > 0) {
          // Check if the Excel data has populated references (not just ObjectIds)
          const hasPopulatedData = rows.some(row => {
            const workDetail = row[4]; // Work detail column
            const frequency = row[5]; // Frequency column
            // Check if these fields contain actual data rather than ObjectIds or empty values
            return workDetail && workDetail !== "No work details available" && 
                   !workDetail.match(/^[0-9a-fA-F]{24}$/) &&
                   workDetail.length > 10; // Reasonable length for actual work details
          });
          
          if (hasPopulatedData) {
            setIsExcelDataReady(true);
          } else {
            // Excel data might not be fully populated yet, wait a bit more
            setTimeout(() => {
              setIsExcelDataReady(true);
            }, 1000);
          }
        } else {
          setIsExcelDataReady(true);
        }
      } catch (error) {
        console.error("Error building Excel data:", error);
        setIsExcelDataReady(false);
      }
    };

    // Use a longer timeout to ensure Excel API data is fully processed
    const timeoutId = setTimeout(buildExcelData, 500);
    
    return () => clearTimeout(timeoutId);
  }, [filteredExcelData, filteredPendingData, isExcelApiLoaded]);

  // Helper function to safely extract string value from object or ObjectId
  function extractStringValue(value, fallback = "") {
    if (!value) return fallback;
    
    // If it's a string that looks like an ObjectId (24 characters, hexadecimal), return fallback
    if (typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/)) {
      return fallback;
    }
    
    // If it's an object with common text properties, extract them
    if (typeof value === 'object' && value !== null) {
      return value.name || value.title || value.description || value.workDetail || 
             value.workInstruction || value.checkPoint || value.label || 
             value.text || value.value || fallback;
    }
    
    // If it's a regular string, return it
    if (typeof value === 'string') {
      return value;
    }
    
    return fallback;
  }

  // Function to build Excel rows from filtered data
  function buildExcelRowsFromFilteredData(data) {
    let index = 1;
    const rows = [];

    data.forEach((pending) => {
      if (!pending.processList) return;

      pending.processList.forEach((process) => {
        // Handle case where processData might not exist
        if (!process.processData || process.processData.length === 0) {
          rows.push([
            index++,
            process.createdAt?.split("T")[0] || "",
            pending.line || "",
            process.processNo || "",
            extractStringValue(process.workDetail, "No work details available"),
            extractStringValue(process.frequency || process.cycle, ""),
            "",
            "",
            "",
            process.lastCompleted?.split("T")[0] || process.lastChecked?.split("T")[0] || "",
          ]);
          return;
        }

        process.processData.forEach((dataItem) => {
          // Extract check items - handle both populated and non-populated references
          const checkItems = dataItem.checkitems || (dataItem.checkItem ? [dataItem.checkItem] : []);
          
          if (!checkItems || checkItems.length === 0) {
            // Create a basic row with available data
            const measurementText = dataItem.itemSpec?.m_spec?.map((spec) => `${spec.m_label}(${spec.m_unit})`).join(", ") || "";
            const standardValue = dataItem.itemSpec?.m_spec?.map((spec) => spec.m_criteria || "").join(", ") || "";
            const actualValue = dataItem.itemSpec?.m_spec?.map((spec) => spec.m_value || "").join(", ") || "";
            
            rows.push([
              index++,
              dataItem.entryDates?.[0]?.split("T")[0] || process.createdAt?.split("T")[0] || "",
              pending.line || "",
              process.processNo || "",
              extractStringValue(dataItem.workDetail, "No check items available"),
              extractStringValue(dataItem.frequency || dataItem.cycle, ""),
              measurementText,
              standardValue,
              actualValue,
              dataItem.lastCompleted?.split("T")[0] || dataItem.lastChecked?.split("T")[0] || 
              (dataItem.entryDates && dataItem.entryDates.length > 1 ? dataItem.entryDates[dataItem.entryDates.length - 2]?.split("T")[0] : "") || "",
            ]);
            return;
          }

          // Handle check items - process both populated objects and ObjectId strings
          const itemsToProcess = Array.isArray(checkItems) ? checkItems : [checkItems];
          
          itemsToProcess.forEach((item) => {
            // Extract work detail - handle ObjectId references
            let workDetail = "";
            if (typeof item === 'object' && item !== null) {
              // If item is populated object, extract meaningful text
              workDetail = extractStringValue(item.workDetail || item.description || item.workInstruction || item.checkPoint) ||
                          extractStringValue(dataItem.workDetail) ||
                          `Process ${process.processNo} Check`;
            } else if (typeof item === 'string') {
              // If item is ObjectId string or simple string
              if (item.match(/^[0-9a-fA-F]{24}$/)) {
                // It's an ObjectId, use fallback
                workDetail = extractStringValue(dataItem.workDetail) || `Process ${process.processNo} - Referenced Item`;
              } else {
                // It's a regular string
                workDetail = extractStringValue(dataItem.workDetail) || `Check item: ${item}`;
              }
            } else {
              workDetail = extractStringValue(dataItem.workDetail) || `Process ${process.processNo}`;
            }

            // Extract frequency - handle ObjectId references
            const frequency = extractStringValue(dataItem.frequency || dataItem.cycle || dataItem.checkFrequency || 
                            dataItem.scheduledFrequency || dataItem.itemSpec?.frequency) ||
                            (typeof item === 'object' && item !== null ? extractStringValue(item.frequency || item.cycle) : "") ||
                            extractStringValue(process.frequency || process.cycle, "");

            // Extract last completed date - handle ObjectId references
            const lastCompletedRaw = dataItem.lastCompleted || dataItem.lastCompletedDate || 
                                dataItem.lastChecked || dataItem.previousCompletionDate || 
                                dataItem.itemSpec?.checkedAt || dataItem.itemSpec?.lastCompleted ||
                                (typeof item === 'object' && item !== null ? (item.lastCompleted || item.lastChecked) : "") ||
                                process.lastCompleted || process.lastChecked ||
                                (dataItem.entryDates && dataItem.entryDates.length > 1 ? dataItem.entryDates[dataItem.entryDates.length - 2] : "") ||
                                "";

            const lastCompleted = extractStringValue(lastCompletedRaw, "");

            const measurementText = dataItem.itemSpec?.m_spec?.map((spec) => `${spec.m_label}(${spec.m_unit})`).join(", ") || "";
            const standardValue = dataItem.itemSpec?.m_spec?.map((spec) => spec.m_criteria || "").join(", ") || "";
            const actualValue = dataItem.itemSpec?.m_spec?.map((spec) => spec.m_value || "").join(", ") || "";
            
            rows.push([
              index++,
              dataItem.entryDates?.[0]?.split("T")[0] || process.createdAt?.split("T")[0] || "",
              pending.line || "",
              process.processNo || "",
              workDetail,
              frequency,
              measurementText,
              standardValue,
              actualValue,
              lastCompleted ? lastCompleted.split("T")[0] : "",
            ]);
          });
        });
      });
    });

    return rows;
  }

  // Excel download function
  function handleDownloadExcel() {
    if (body.length === 0) {
      alert("No data available to export");
      return;
    }

    const currentDate = new Date().toISOString().slice(0, 10);
    const filterSuffix = ageFilter !== "ALL" ? `-${ageFilter}-days` : "";
    
    // Add filter information to filename for better identification
    let filterInfo = "";
    if (filters.line) filterInfo += `-line-${filters.line}`;
    if (filters.rS) filterInfo += `-rS-${filters.rS}`;
    
    const filename = `${currentDate}-pending-cards${filterInfo}${filterSuffix}.xlsx`;
    
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pending Tasks");
    XLSX.writeFile(workbook, filename);
  }

  return (
    <Fragment>
      {loading ? (
        <Loading />
      ) : error ? (
        <div className="text-center text-danger py-4">Error: {error}</div>
      ) : (
        <Fragment>
          <div className="mx-3 my-2">
            <label className="me-2">
              <strong>Filter by Age:</strong>
            </label>
            <select
              className="form-select-sm"
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="1-10">1–10 days</option>
              <option value="11-20">11–20 days</option>
              <option value=">20">More than 20 days</option>
            </select>
          </div>

          <div>
            {isExcelDataReady && isExcelApiLoaded && body.length > 0 ? (
              <Button
                variant="warning"
                style={{ position: "absolute", right: 150 }}
                onClick={handleDownloadExcel}
              >
                Download Excel ({body.length} rows)
              </Button>
            ) : (
              <Button
                disabled
                style={{
                  position: "absolute",
                  right: 150,
                  backgroundColor: "#666",
                  cursor: "not-allowed",
                }}
              >
                {loading ? "Loading data..." : 
                 !isExcelApiLoaded ? "Fetching complete data..." :
                 !isExcelDataReady ? "Preparing Excel data..." : 
                 "No data to export"}
              </Button>
            )}
          </div>

          <div className="overflow-auto" style={{ height: "75vh", paddingBottom: "10%" }}>
            {filteredPendingData.length > 0 ? (
              filteredPendingData.map((item) => (
                <PendingLine
                  key={item.line}
                  line={item.line}
                  processList={item.processList}
                  counts={item.counts || { [item.line]: item.processList.length }}
                />
              ))
            ) : (
              <div className="text-center w-100 py-4">No pending tasks available.</div>
            )}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
}