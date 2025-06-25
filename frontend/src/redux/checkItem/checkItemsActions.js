import axios from "axios";
import {
  CHECKITEM_FETCH_REQUEST,
  CHECKITEM_FETCH_SUCCESS,
  CHECKITEM_FETCH_FAIL,
} from "./checkItemsTypes";

export const checkItemFetchRequest = () => {
  return {
    type: CHECKITEM_FETCH_REQUEST,
  };
};

export const checkItemFetchSuccess = (checkItem) => {
  return {
    type: CHECKITEM_FETCH_SUCCESS,
    payload: checkItem,
  };
};

export const checkItemFetchFail = (error) => {
  return {
    type: CHECKITEM_FETCH_FAIL,
    error: error,
  };
};

export const getCheckItem = (queryStr, page, entryForQueryStr) => {
  return async (dispatch) => {
    dispatch(checkItemFetchRequest());

    try {
      const url = `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/head/headCheckList?${queryStr}&page=${page}`;
      const result = await axios.get(url);
      const checklist = result.data.headCheckList || [];

      console.log("Fetched checklist:", checklist);

      const mergedChecklist = await Promise.all(
        checklist.map(async (item) => {
          try {
            const statusRes = await axios.get(
              `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/find/${item._id}/entryFor/${entryForQueryStr}`
            );

            const status = statusRes?.data?.dailyStatus || {};

            const mergedItem = {
              ...item,
              dailyStatus: status.result || "Pending",
              judgementRemarks: status.remarks ?? "-",
              value: status.value ?? "-",
              checkedBy: status.checkedBy ?? "-",
              m_spec: status.m_spec ?? item.m_spec ?? "-",
              tl: status.tl ?? item.tl ?? "-",
              gl: status.gl ?? item.gl ?? "-",
              tlBy: status.tlBy ?? item.tlBy ?? "-",
              glBy: status.glBy ?? item.glBy ?? "-",
              tlAt: status.tlAt ?? item.tlAt ?? "-",
              glAt: status.glAt ?? item.glAt ?? "-",
              tlComment: status.tlComment ?? item.tlComment ?? "-",
              glComment: status.glComment ?? item.glComment ?? "-",
            };

            console.log(`Merged item for ${item._id}:`, mergedItem);
            return mergedItem;

          } catch (error) {
            console.warn(`Status fetch failed for item ${item._id}:`, error);
            return {
              ...item,
              dailyStatus: "Pending",
              judgementRemarks: "-",
              value: "-",
              checkedBy: "-",
              m_spec: item.m_spec ?? "-",
              tl: item.tl ?? "-",
              gl: item.gl ?? "-",
              tlBy: item.tlBy ?? "-",
              glBy: item.glBy ?? "-",
              tlAt: item.tlAt ?? "-",
              glAt: item.glAt ?? "-",
              tlComment: item.tlComment ?? "-",
              glComment: item.glComment ?? "-",
            };
          }
        })
      );

      const updatedResult = { ...result.data, headCheckList: mergedChecklist };

      dispatch(checkItemFetchSuccess(updatedResult));
      return updatedResult;

    } catch (err) {
      console.error("Fetch failed:", err);
      dispatch(checkItemFetchFail(err.message));
      throw err;
    }
  };
};


// export const getCheckItem = (queryStr, page, entryForQueryStr) => {
//   return (dispatch) => {
//     dispatch(checkItemFetchRequest());
//     let url = `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/head/headCheckList?${queryStr}&page=${page}`;
//     axios
//       .get(url)
//       .then((result) => {
//         console.log("firstone", result)
//         // getting additional data & added to first result
//         axios
//           .get(
//             `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/find/${result.data.headCheckList[0]._id}/entryFor/${entryForQueryStr}`
//           )
//           .then((result2) => {
//             console.log("secondone", result2)
//             result.data.headCheckList[0].dailyStatus =
//               result2.data.dailyStatus.result;
//             result.data.headCheckList[0].judgementRemarks =
//               result2.data.dailyStatus.remarks;
//             result.data.headCheckList[0].value = result2.data.dailyStatus.value;
//             result.data.headCheckList[0].checkedBy = result2.data.dailyStatus.checkedBy;
//             result.data.headCheckList[0].m_spec = result2.data.dailyStatus.m_spec ? result2.data.dailyStatus.m_spec : result.data.headCheckList[0].m_spec;
//             result.data.headCheckList[0].tl = result2.data.dailyStatus.tl ? result2.data.dailyStatus.tl : result.data.headCheckList[0].tl;
//             result.data.headCheckList[0].gl = result2.data.dailyStatus.gl ? result2.data.dailyStatus.gl : result.data.headCheckList[0].gl;
//             result.data.headCheckList[0].tlBy = result2.data.dailyStatus.tlBy ? result2.data.dailyStatus.tlBy : result.data.headCheckList[0].tlBy;
//             result.data.headCheckList[0].glBy = result2.data.dailyStatus.glBy ? result2.data.dailyStatus.glBy : result.data.headCheckList[0].glBy;
//             result.data.headCheckList[0].tlAt = result2.data.dailyStatus.tlAt ? result2.data.dailyStatus.tlAt : result.data.headCheckList[0].tlAt;
//             result.data.headCheckList[0].glAt = result2.data.dailyStatus.glAt ? result2.data.dailyStatus.glAt : result.data.headCheckList[0].glAt;
//             result.data.headCheckList[0].tlComment = result2.data.dailyStatus.tlComment ? result2.data.dailyStatus.tlComment : result.data.headCheckList[0].tlComment;
//             result.data.headCheckList[0].glComment = result2.data.dailyStatus.glComment ? result2.data.dailyStatus.glComment : result.data.headCheckList[0].glComment;
//             dispatch(checkItemFetchSuccess(result.data));
//             return { payload: result.data }; // ✅ RETURN PAYLOAD

//           })
//           .catch((err) => {

//           });
//       })
//       .catch((err) => {
//         dispatch(checkItemFetchFail(err.message));
//         throw err; // ✅ LET .catch() work

//       });
//   };
// };

// export const getCheckItem = (queryStr, page, entryForQueryStr) => {
//   return (dispatch) => {
//     dispatch(checkItemFetchRequest());
//     let url = `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/head/headCheckList?${queryStr}&page=${page}`;
    
//     // Return the promise so that the caller can await it
//     return axios
//       .get(url)
//       .then((result) => {
//         // get additional data & add to first result
//         return axios
//           .get(
//             `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/find/${result.data.headCheckList[0]._id}/entryFor/${entryForQueryStr}`
//           )
//           .then((result2) => {
//             result.data.headCheckList[0].dailyStatus =
//               result2.data.dailyStatus.result;
//             result.data.headCheckList[0].judgementRemarks =
//               result2.data.dailyStatus.remarks;
//             result.data.headCheckList[0].value = result2.data.dailyStatus.value;
//             result.data.headCheckList[0].checkedBy = result2.data.dailyStatus.checkedBy;
//             result.data.headCheckList[0].m_spec = result2.data.dailyStatus.m_spec ?? result.data.headCheckList[0].m_spec;
//             result.data.headCheckList[0].tl = result2.data.dailyStatus.tl ?? result.data.headCheckList[0].tl;
//             result.data.headCheckList[0].gl = result2.data.dailyStatus.gl ?? result.data.headCheckList[0].gl;
//             result.data.headCheckList[0].tlBy = result2.data.dailyStatus.tlBy ?? result.data.headCheckList[0].tlBy;
//             result.data.headCheckList[0].glBy = result2.data.dailyStatus.glBy ?? result.data.headCheckList[0].glBy;
//             result.data.headCheckList[0].tlAt = result2.data.dailyStatus.tlAt ?? result.data.headCheckList[0].tlAt;
//             result.data.headCheckList[0].glAt = result2.data.dailyStatus.glAt ?? result.data.headCheckList[0].glAt;
//             result.data.headCheckList[0].tlComment = result2.data.dailyStatus.tlComment ?? result.data.headCheckList[0].tlComment;
//             result.data.headCheckList[0].glComment = result2.data.dailyStatus.glComment ?? result.data.headCheckList[0].glComment;
            
//             dispatch(checkItemFetchSuccess(result.data));
            
//             // Return data so caller can await and get it
//             return { payload: result.data };
//           });
//       })
//       .catch((err) => {
//         dispatch(checkItemFetchFail(err.message));
//         // rethrow error so caller can catch it if needed
//         throw err;
//       });
//   };
// };


// export const getCheckItem = (queryStr, page, entryForQueryStr) => {
//   return async (dispatch) => {
//     dispatch(checkItemFetchRequest());

//     try {
//       const url = `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/head/headCheckList?${queryStr}&page=${page}`;
//       const result = await axios.get(url);
//       const checklist = result.data.headCheckList || [];

//       // Merge dailyStatus data into each checklist item
//       const mergedChecklist = await Promise.all(
//         checklist.map(async (item) => {
//           try {
//             const statusRes = await axios.get(
//               `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/find/${item._id}/entryFor/${entryForQueryStr}`
//             );

//             const status = statusRes.data.dailyStatus || {};

//             return {
//               ...item,
//               dailyStatus: status.result || "Pending",
//               judgementRemarks: status.remarks || "-",
//               value: status.value || "-",
//               checkedBy: status.checkedBy || "-",
//               m_spec: status.m_spec || item.m_spec,
//               tl: status.tl || item.tl,
//               gl: status.gl || item.gl,
//               tlBy: status.tlBy || item.tlBy,
//               glBy: status.glBy || item.glBy,
//               tlAt: status.tlAt || item.tlAt,
//               glAt: status.glAt || item.glAt,
//               tlComment: status.tlComment || item.tlComment,
//               glComment: status.glComment || item.glComment,
//             };
//           } catch (error) {
//             console.warn(`Failed fetching status for item ${item._id}:`, error);
//             return item; // fallback to original item
//           }
//         })
//       );

//       const updatedResult = { ...result.data, headCheckList: mergedChecklist };

//       dispatch(checkItemFetchSuccess(updatedResult));
//       return updatedResult;

//     } catch (err) {
//       dispatch(checkItemFetchFail(err.message));
//       throw err;
//     }
//   };
// };
