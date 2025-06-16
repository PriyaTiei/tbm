// import React, { useState, useEffect } from "react";
// import { useSearchParams } from "react-router-dom";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import TrendGraph from "./TrendGraph";
// import DatePicker from "react-date-picker";
// import "./trend.css";

// const JudgementHistoryData = ({ checkItem, query = {}, byData = 'no' }) => {

//   const auth = useSelector((state) => state.auth);
//   const role = auth.user ? auth.user.role : 0;
//   const [cardList, setCardList] = useState([])

//   useEffect(() => {
//     axios.get(
//       `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/dailyStatusByCheckItem?checkItem=${checkItem}&query=${query}&byData=${byData}`)
//       .then((result) => {
//         if (result.data.success) {
//           setCardList(result.data.dailyStatusAll)
//         }
//       })
//       .catch((err) => {
//         // console.log("error ", err);
//         // toast.error(`Data could not be saved , ${err.message}`);
//       });

//   }, [])

//   const verfifyToggle = (role, changed, id, setChanged) => {
//     axios.put(
//       `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/changeVerified?role=${role}&status=${!changed}&id=${id}`)
//       .then((result) => {
//         if (result.data.success) {
//           setChanged(!changed)
//         }
//       })
//       .catch((err) => {
//         // console.log("error ", err);
//         // toast.error(`Data could not be saved , ${err.message}`);
//       });
//   }

//   const GetVerified = ({ data }) => {
//     const { role, status, id } = data
//     const [changed, setChanged] = useState(status)

//     return (
//       <div style={{
//         display: "flex"
//       }}>
//         {
//           changed &&
//           <div>
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#4caf50" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z" /><path fill="#ccff90" d="M34.602,14.602L21,28.199l-5.602-5.598l-2.797,2.797L21,33.801l16.398-16.402L34.602,14.602z" /></svg>
//           </div>
//         }
//         <button onClick={() => verfifyToggle(role, changed, id, setChanged)}>
//           {
//             changed ? (
//               "Unverify"

//             ) : (
//               "Verify"
//             )
//           }
//         </button>
//       </div>
//     )
//   }

//   const list = cardList.map((item) => {


//     return (
//       <tr>
//         <td>{item.checkedAt.split("T")[0]}</td>
//         <td>{item.result}</td>
//         <td>{item.value}</td>
//         <td>{item.remarks}</td>
//         <td>{item.checkedBy}</td>
//         <td>{new Date(item.checkedAt).toLocaleTimeString()}</td>
//         <td>
//           {
//             role == "tl" ? (
//               <GetVerified data={{ role, status: item.tl, id: item._id }} />
//             ) : (
//               item.tl ? (
//                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#4caf50" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z" /><path fill="#ccff90" d="M34.602,14.602L21,28.199l-5.602-5.598l-2.797,2.797L21,33.801l16.398-16.402L34.602,14.602z" /></svg>
//               ) : "Not Verified"
//             )
//           }
//         </td>
//         <td>
//           {
//             role == "gl" ? (
//               <GetVerified data={{ role, status: item.gl, tlstatus: item.tl, id: item._id }} />
//             ) : (
//               item.gl ? (
//                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#4caf50" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z" /><path fill="#ccff90" d="M34.602,14.602L21,28.199l-5.602-5.598l-2.797,2.797L21,33.801l16.398-16.402L34.602,14.602z" /></svg>
//               ) : "Not Verified"
//             )
//           }
//         </td>
//       </tr>
//     );
//   });

//   return (
//     <table className="m-3   table table-bordered table-sm table-hover text-dark ">
//       {/* <table className="m-5 border border-black-50 text-light"> */}
//       <thead>
//         <tr>
//           <th>Entry Date</th>
//           <th>Result</th>
//           <th>Value</th>
//           <th>Remarks</th>
//           <th>Checked By</th>
//           <th>Checked At</th>
//           <th>Team Lead</th>
//           <th>Group Lead</th>
//         </tr>

//       </thead>

//       <tbody>{list}</tbody>
//     </table>
//   )
// }

// export default JudgementHistoryData


// import React, { useState, useEffect } from "react";
// import { useSearchParams } from "react-router-dom";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import TrendGraph from "./TrendGraph";
// import DatePicker from "react-date-picker";
// import "./trend.css";

// const JudgementHistoryData = ({ checkItem, query = {}, byData = 'no' }) => {

//   const auth = useSelector((state) => state.auth);
//   const role = auth.user ? auth.user.role : 0;
//   const [cardList, setCardList] = useState([])

//   useEffect(() => {
//     axios.get(
//       `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/dailyStatusByCheckItem?checkItem=${checkItem}&query=${query}&byData=${byData}`)
//       .then((result) => {
//         if (result.data.success) {
//           setCardList(result.data.dailyStatusAll)
//         }
//       })
//       .catch((err) => {
//         // console.log("error ", err);
//         // toast.error(`Data could not be saved , ${err.message}`);
//       });

//   }, [])

//   const verfifyToggle = (role, changed, id, setChanged) => {
//     axios.put(
//       `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/changeVerified?role=${role}&status=${!changed}&id=${id}`)
//       .then((result) => {
//         if (result.data.success) {
//           setChanged(!changed)
//         }
//       })
//       .catch((err) => {
//         // console.log("error ", err);
//         // toast.error(`Data could not be saved , ${err.message}`);
//       });
//   }

//   const GetVerified = ({ data }) => {
//     const { role, status, id } = data
//     const [changed, setChanged] = useState(status)

//     return (
//       <div style={{
//         display: "flex",
//         alignItems: "center",
//         gap: "8px"
//       }}>
//         {
//           changed &&
//           <div>
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#4caf50" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z" /><path fill="#ccff90" d="M34.602,14.602L21,28.199l-5.602-5.598l-2.797,2.797L21,33.801l16.398-16.402L34.602,14.602z" /></svg>
//           </div>
//         }
//         <button 
//           className="btn btn-sm btn-outline-primary"
//           onClick={() => verfifyToggle(role, changed, id, setChanged)}
//         >
//           {
//             changed ? (
//               "Unverify"

//             ) : (
//               "Verify"
//             )
//           }
//         </button>
//       </div>
//     )
//   }

//   const list = cardList.map((item, index) => {
//     return (
//       <tr key={item._id || index}>
//         <td>{item.checkedAt.split("T")[0]}</td>
//         <td>
//           <span className={`badge ${item.result === 'Pass' ? 'bg-success' : item.result === 'Fail' ? 'bg-danger' : 'bg-warning'}`}>
//             {item.result}
//           </span>
//         </td>
//         <td>{item.value}</td>
//         <td className="text-wrap" style={{ maxWidth: '200px' }}>{item.remarks}</td>
//         <td>{item.checkedBy}</td>
//         <td>{new Date(item.checkedAt).toLocaleTimeString()}</td>
//         <td>
//           {
//             role == "tl" ? (
//               <GetVerified data={{ role, status: item.tl, id: item._id }} />
//             ) : (
//               item.tl ? (
//                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#4caf50" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z" /><path fill="#ccff90" d="M34.602,14.602L21,28.199l-5.602-5.598l-2.797,2.797L21,33.801l16.398-16.402L34.602,14.602z" /></svg>
//               ) : <span className="text-muted">Not Verified</span>
//             )
//           }
//         </td>
//         <td>
//           {
//             role == "gl" ? (
//               <GetVerified data={{ role, status: item.gl, tlstatus: item.tl, id: item._id }} />
//             ) : (
//               item.gl ? (
//                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#4caf50" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z" /><path fill="#ccff90" d="M34.602,14.602L21,28.199l-5.602-5.598l-2.797,2.797L21,33.801l16.398-16.402L34.602,14.602z" /></svg>
//               ) : <span className="text-muted">Not Verified</span>
//             )
//           }
//         </td>
//       </tr>
//     );
//   });

//   return (
//     <div className="judgement-history-container">
//       <div className="judgement-table-wrapper">
//         <table className="table table-bordered table-sm table-hover text-dark mb-0 table-striped">
//           <thead className="table-dark table-sticky-header">
//             <tr>
//               <th scope="col">Entry Date</th>
//               <th scope="col">Result</th>
//               <th scope="col">Value</th>
//               <th scope="col">Remarks</th>
//               <th scope="col">Checked By</th>
//               <th scope="col">Checked At</th>
//               <th scope="col">Team Lead</th>
//               <th scope="col">Group Lead</th>
//             </tr>
//           </thead>
//           <tbody>
//             {list.length > 0 ? list : (
//               <tr>
//                 <td colSpan="8" className="text-center py-4 text-muted">
//                   No judgement history data available.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }

// export default JudgementHistoryData

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import TrendGraph from "./TrendGraph";
import DatePicker from "react-date-picker";
import "./trend.css";

const JudgementHistoryData = ({ checkItem, query = {}, byData = 'no' }) => {

  const auth = useSelector((state) => state.auth);
  const role = auth.user ? auth.user.role : 0;
  const [cardList, setCardList] = useState([])

  useEffect(() => {
    axios.get(
      `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/dailyStatusByCheckItem?checkItem=${checkItem}&query=${query}&byData=${byData}`)
      .then((result) => {
        if (result.data.success) {
          setCardList(result.data.dailyStatusAll)
        }
      })
      .catch((err) => {
        // console.log("error ", err);
        // toast.error(`Data could not be saved , ${err.message}`);
      });

  }, [])

  const verfifyToggle = (role, changed, id, setChanged) => {
    axios.put(
      `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/changeVerified?role=${role}&status=${!changed}&id=${id}`)
      .then((result) => {
        if (result.data.success) {
          setChanged(!changed)
        }
      })
      .catch((err) => {
        // console.log("error ", err);
        // toast.error(`Data could not be saved , ${err.message}`);
      });
  }

  const GetVerified = ({ data }) => {
    const { role, status, id } = data
    const [changed, setChanged] = useState(status)

    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        {
          changed &&
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#4caf50" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z" /><path fill="#ccff90" d="M34.602,14.602L21,28.199l-5.602-5.598l-2.797,2.797L21,33.801l16.398-16.402L34.602,14.602z" /></svg>
          </div>
        }
        <button 
          className="btn btn-sm btn-outline-primary"
          onClick={() => verfifyToggle(role, changed, id, setChanged)}
        >
          {
            changed ? (
              "Unverify"

            ) : (
              "Verify"
            )
          }
        </button>
      </div>
    )
  }

  const list = cardList.map((item, index) => {
    return (
      <tr key={item._id || index}>
        <td>{item.checkedAt.split("T")[0]}</td>
        <td>
          <span className={`badge ${item.result === 'Pass' ? 'bg-success' : item.result === 'Fail' ? 'bg-danger' : 'bg-warning'}`}>
            {item.result}
          </span>
        </td>
        <td>{item.value}</td>
        <td className="text-wrap" style={{ maxWidth: '200px' }}>{item.remarks}</td>
        <td>{item.checkedBy}</td>
        <td>{new Date(item.checkedAt).toLocaleTimeString()}</td>
        <td>
          {
            role == "tl" ? (
              <GetVerified data={{ role, status: item.tl, id: item._id }} />
            ) : (
              item.tl ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#4caf50" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z" /><path fill="#ccff90" d="M34.602,14.602L21,28.199l-5.602-5.598l-2.797,2.797L21,33.801l16.398-16.402L34.602,14.602z" /></svg>
              ) : <span className="text-muted">Not Verified</span>
            )
          }
        </td>
        <td>
          {
            role == "gl" ? (
              <GetVerified data={{ role, status: item.gl, tlstatus: item.tl, id: item._id }} />
            ) : (
              item.gl ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#4caf50" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z" /><path fill="#ccff90" d="M34.602,14.602L21,28.199l-5.602-5.598l-2.797,2.797L21,33.801l16.398-16.402L34.602,14.602z" /></svg>
              ) : <span className="text-muted">Not Verified</span>
            )
          }
        </td>
      </tr>
    );
  });

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.5rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      minHeight: '600px'
    }}>
      <div 
        className="custom-scroll-container"
        style={{
          maxHeight: '700px',
          overflowY: 'scroll',
          overflowX: 'auto',
          border: '1px solid #000000',
          borderRadius: '0.375rem',
          backgroundColor: 'white',
          minHeight: '592px'
        }}
      >
        <style>{`
          .custom-scroll-container::-webkit-scrollbar {
            width: 12px !important;
            height: 12px !important;
          }
          .custom-scroll-container::-webkit-scrollbar-track {
            background: #e9ecef !important;
            border-radius: 6px !important;
          }
          .custom-scroll-container::-webkit-scrollbar-thumb {
            background: #6c757d !important;
            border-radius: 6px !important;
            border: 2px solid #e9ecef !important;
          }
          .custom-scroll-container::-webkit-scrollbar-thumb:hover {
            background: #495057 !important;
          }
          .custom-scroll-container::-webkit-scrollbar-corner {
            background: #e9ecef !important;
          }
          /* For Firefox */
          .custom-scroll-container {
            scrollbar-width: auto !important;
            scrollbar-color: #6c757d #e9ecef !important;
          }
        `}</style>
        <table className="table table-bordered table-sm table-hover text-dark mb-0 table-striped">
          <thead style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 10, 
            backgroundColor: '#212529'
          }}>
            <tr>
              <th scope="col" style={{ backgroundColor: '#212529', color: 'white' }}>Entry Date</th>
              <th scope="col" style={{ backgroundColor: '#212529', color: 'white' }}>Result</th>
              <th scope="col" style={{ backgroundColor: '#212529', color: 'white' }}>Value</th>
              <th scope="col" style={{ backgroundColor: '#212529', color: 'white' }}>Remarks</th>
              <th scope="col" style={{ backgroundColor: '#212529', color: 'white' }}>Checked By</th>
              <th scope="col" style={{ backgroundColor: '#212529', color: 'white' }}>Checked At</th>
              <th scope="col" style={{ backgroundColor: '#212529', color: 'white' }}>Team Lead</th>
              <th scope="col" style={{ backgroundColor: '#212529', color: 'white' }}>Group Lead</th>
            </tr>
          </thead>
          <tbody>
            {list.length > 0 ? list : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">
                  No judgement history data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default JudgementHistoryData