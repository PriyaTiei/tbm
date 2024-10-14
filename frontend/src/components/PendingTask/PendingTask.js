import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPendingTasks } from "../../redux/pendingTasks/pendingActions";
import { downloadExcel } from "react-export-table-to-excel";
import PendingLine from "./PendingLine";
import Loading from "../Loading";
import { Button } from "react-bootstrap";
import axios from "axios";

export default function PendingTask() {
  const dispatch = useDispatch();
  const pendingTasks = useSelector((state) => state.pendingTasks);
  const filters = useSelector((state) => state.filters);

  let lineStr = filters.line === null ? "" : `&line=${filters.line}`;
  let rSStr = filters.rS === null ? "" : `&rS=${filters.rS}`;
  const [header, setHeader] = useState([])
  const [body, setBody] = useState([])
  let queryStr = `pS=${filters.pS}` + lineStr + rSStr;
  const [exceldata, setExcelData] = useState([])

  useEffect(() => {
    dispatch(getPendingTasks(queryStr));
  }, [dispatch, filters, queryStr]);

  const { loading, pendingTasksData } = pendingTasks;

  useEffect(() => {
    axios.get(
      `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/pendingTasks/getPendingTaskReport?pS=S`)
      .then((result) => {
        if (result.data.success) {

          setExcelData(result.data)
          // setPendingTasksData(result.data.pendingData)
          // setPendingTasksData(result.data?.frequencyTasks)
          // setCardList(result.data.dailyStatusAll)
        }
      })
      .catch((err) => {
        // console.log("error ", err);
        // toast.error(`Data could not be saved , ${err.message}`);
      });

  }, [])

  useEffect(() => {
    if (exceldata?.pendingData?.length) {
      // console.log("pendingTasksData?.pendingData", pendingTasksData?.pendingData)
      // console.log("exceldata?.pendingData", exceldata?.pendingData)
      const newHeader = ["SL NO", "LATEST PLAN DATE", "OP NO", "WORK DETAIL", "FREQUENCY", "CRITERIA", "LATEST ACTUAL VALUE", "LAST COMPLETED DATE"];
      setHeader(newHeader);

      let index = 1; // Initialize the index

      function extractData(jsonData) {
        const results = [];
        let index = 1; // Initialize index for tracking

        jsonData.pendingData.forEach((pending) => {
          pending.processList.forEach((process) => {
            process.processData.forEach((data) => {
              data.checkitems.forEach((item) => {
                const workDetail = item.workDetail;
                const cycle = item.cycle;
                const entryDate = data?.entryDates[0];

                const result = data.result;
                const latestEntryFor = data.itemSpec?.checkedAt;
                const actuals = data.actuals;
                const m_criteria = item.m_spec
                  ? item.m_spec.map(spec => spec.m_criteria || '').join(', ')
                  : '';

                results.push([
                  index++,
                  entryDate?.split("T")[0],
                  process.processNo,
                  workDetail,
                  cycle,
                  m_criteria,
                  actuals,
                  latestEntryFor?.split("T")[0],
                ]);
              });
            });
          });
        });

        return results;
      }


      // Extracting and logging the data
      const extractedData = extractData(exceldata);

      setBody(extractedData)

    }
  }, [exceldata]);


  function handleDownloadExcel() {
    const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
    const fileName = `${today}-pending-cards`;

    downloadExcel({
      fileName: fileName,
      sheet: "pending-cards",
      tablePayload: {
        header: header,
        body: body,
      },
    });
  }

  return (
    <Fragment>
      {loading ? (
        <Loading />
      ) : (
        <Fragment>
          <div>

            {body.length > 0 && (
              <Button variant="warning" style={{ position: "absolute", right: 150 }} onClick={handleDownloadExcel}>
                Download Excel
              </Button>
            )}


          </div>
          <div className="overflow-auto" style={{ height: "75vh" }}>
            {pendingTasksData.success
              ? pendingTasksData.pendingData.map((item, i) => {
                return (<>
                  <PendingLine
                    line={item.line}
                    processList={item.processList}
                    key={item.line}
                    counts={item.counts}
                  />
                </>);
              })
              : null}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
}
