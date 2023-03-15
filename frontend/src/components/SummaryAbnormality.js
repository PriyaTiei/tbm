import React, { useEffect, useState} from "react";
import { getAbnormality } from "../redux/abnormality/abnormalityActions";
import { useDispatch, useSelector } from "react-redux";
import AbnormilityDoc from "./AbnormalityDoc";
import DatePicker from "react-date-picker";
import GraphAbnormality from "./GraphAbnormality";

function SummaryAbnormality() {


  const [showGraph, setShowGraph] = useState(true);

  // begining of Month
  var beginingDate = new Date(Date.now());
  beginingDate.setDate(-30);
  //from date
  const [fromDate, setFromDate] = useState(beginingDate);
  const fromDt = fromDate.getDate();
  const fromMonth = fromDate.getMonth() + 1;
  const fromYear = fromDate.getFullYear();
  const fromDateSt = `${fromYear}-${fromMonth}-${fromDt}`;

  //to next date
  const [toDate, setToDate] = useState(new Date(Date.now()));
  var toNextDate = new Date(toDate);
  toNextDate.setDate(toNextDate.getDate() + 1);
  const toDt = toNextDate.getDate();
  const toMonth = toNextDate.getMonth() + 1;
  const toYear = toNextDate.getFullYear();
  const toDateSt = `${toYear}-${toMonth}-${toDt}`;

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAbnormality(fromDateSt, toDateSt));
  }, [fromDate, toDate]);
  const abnormalities = useSelector((state) => state.abnormalities);
  const abnormalityList = abnormalities.loading
    ? []
    : abnormalities.abnormalities.success
    ? abnormalities.abnormalities.abnormalities
    : [];
 
  const list = abnormalityList.map((item) => {
    return (
      <AbnormilityDoc
        key={item._id}
        item={item}
       
        fromDateSt={fromDateSt}
        toDateSt={toDateSt}
      />
    );
  });

  var total = 0;
  var complete = 0;
  var inprogress = 0;
  var pending = 0;
  if (abnormalityList.length > 0) {
    total = abnormalityList.length;
    abnormalityList.forEach(item=>{
      if(item.status==="complete"){
        complete +=1
      }
      if(item.status==="pending"){
        pending +=1
      }
      if(item.status==="inprogress"){
        inprogress +=1
      }
    })
   
  }

  const labels = ["Total", "Complete", "Pending", "Inprogress"];
  const data = [total, complete, pending, inprogress];

  return (
    <div>
      <div className="d-flex align-items-center bg-info ">
        <h3 className="mx-3  text-center ">Summary of Abnormality </h3>
        {showGraph ? (
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowGraph(false)}
          >
            Hide Graph
          </button>
        ) : (
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowGraph(true)}
          >
            Show Graph
          </button>
        )}
        <div className="ms-auto me-3">
          <span>From</span>
          <DatePicker
            value={fromDate}
            onChange={setFromDate}
            clearIcon={null}
          />
          <span className="ms-3">To</span>
          <DatePicker value={toDate} onChange={setToDate} clearIcon={null} />
        </div>
      </div>

      {showGraph ? <GraphAbnormality labels={labels} data={data} /> : null}

      <div className="overflow-auto " style={{ height: "65vh" , width:"97vw"}}>
        <table className="m-3   table table-bordered table-sm table-hover text-dark " >
          {/* <table className="m-5 border border-black-50 text-light"> */}
          <thead>
            <tr>
              <th>Entry Date</th>
              <th>Line</th>
              <th>OP</th>
              <th>Item</th>
              <th>Abnormality</th>
              <th>Countermeasure</th>
              <th>Spare</th>
              <th>PIC</th>
              <th>Target</th>
              <th>Status</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>

          <tbody>{list}</tbody>
        </table>
      </div>
    </div>
  );
}

export default SummaryAbnormality;
