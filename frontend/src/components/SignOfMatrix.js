import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./trend.css";
import SOMSTATS from "./SignOfMatrixRow";

const SignOfMatrix = ({ checkItem, query = {}, byData = 'no' }) => {

  const auth = useSelector((state) => state.auth);
  const role = auth.user ? auth.user.role : 0;
  const [cardList, setCardList] = useState([])
  const state = useSelector((state) => state);
  const filters = useSelector((state) => state.filters);
  const [date,setDate] = useState(new Date(Date.now()));

  useEffect(() => {
    if(!filters.y || !filters.m || !filters.dt) return;

    setDate(new Date(`${filters.y}-${filters.m}-${filters.dt}`));

  }, [filters])
  
  useEffect(() => {
    if(!date) return;
    let lineStr = filters.line === null ? "" : `&line=${filters.line}`;
    let rSStr = filters.rS === null ? "" : `&rS=${filters.rS}`;
    let groupStr = filters.group === null ? '' : `&group=${filters.group}`
    let queryStr = `w=${filters.w}&m=${filters.m}&y=${filters.y}&pS=${filters.pS}` + lineStr + rSStr +groupStr;

    axios.get(
      `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/som/getAll?${queryStr}`)
      .then((result) => {
        if (result.data.success) {
          setCardList(result.data.itemsList)
        }
      })
      .catch((err) => {
      });
    
      return () => {
        setCardList([]);
      }

  }, [filters,date])

  const list = date? cardList.map((item,index) => {
    return (
      <tr>
        <td colspan="1" rowspan="1" colwidth="70">
          <p>{index+1}</p>
        </td>
        <td colspan="1" rowspan="1" colwidth="170">
          <p>{item.model}</p>
        </td>
        <td colspan="1" rowspan="1">
          <p>{item.processNo}</p>
        </td>
        <td colspan="1" rowspan="1">
          <p>&nbsp;{item.workDetail}&nbsp;</p>
        </td>
        <td colspan="1" rowspan="1">
          <p>{item.methodWssNo}</p>
        </td>
        <td colspan="1" rowspan="1">
          <p>{item.cycle}</p>
        </td>
        <td colspan="1" rowspan="1">
          <p>{item.workTime}</p>
        </td>

        <SOMSTATS item={item} /> 
      </tr>
    );
  }):null;

  return (
    <div style={{ "width": "min-content", "height": "1200px", "overflowY": "auto", "paddingRight": "1.3em" }}>
      <table style={{
        width: "calc(97vw - 10px)",
      }} className="m-3  table table-bordered table-sm table-hover text-dark ">
        {/* <table className="m-5 border border-black-50 text-light"> */}
        <thead style={{ position: "sticky" }} className="white top-0">
          <tr><th colspan="1" rowspan="2" colwidth="71"><p>SL NO</p></th><th colspan="1" rowspan="2" colwidth="66"><p>MACHINE NO</p></th><th colspan="1" rowspan="2" colwidth="54"><p>OP no	</p></th><th colspan="1" rowspan="2"><p>Description</p></th><th colspan="1" rowspan="2"><p>Ledger NO	</p></th><th colspan="1" rowspan="2"><p>Frequency/ Cycle	</p></th><th colspan="1" rowspan="2"><p>Required time	</p></th><th colspan="5" rowspan="1" class="selectedCell"><p>W{filters.w}{" ( "}{date.toLocaleString('default', { month: 'long' })}{" "}{date.getFullYear()}{" ) ["}{cardList.length}{" found ]"}</p></th></tr>
          <tr><th colspan="1" rowspan="1"><p>MON</p></th><th colspan="1" rowspan="1"><p>TUE</p></th><th colspan="1" rowspan="1"><p>WED</p></th><th colspan="1" rowspan="1"><p>THU</p></th><th colspan="1" rowspan="1"><p>FRI</p></th></tr>
        </thead>

        <tbody>{list}</tbody>
      </table>
    </div>

  )
}

export default SignOfMatrix