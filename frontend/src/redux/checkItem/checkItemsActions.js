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
  return (dispatch) => {
    dispatch(checkItemFetchRequest());
    let url = `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/head/headCheckList?${queryStr}&page=${page}`;
    axios
      .get(url)
      .then((result) => {
        console.log("firstone", result)
        // getting additional data & added to first result
        axios
          .get(
            `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/dailyStatus/find/${result.data.headCheckList[0]._id}/entryFor/${entryForQueryStr}`
          )
          .then((result2) => {
            console.log("secondone", result2)
            result.data.headCheckList[0].dailyStatus =
              result2.data.dailyStatus.result;
            result.data.headCheckList[0].judgementRemarks =
              result2.data.dailyStatus.remarks;
            result.data.headCheckList[0].value = result2.data.dailyStatus.value;
            result.data.headCheckList[0].checkedBy = result2.data.dailyStatus.checkedBy;
            result.data.headCheckList[0].m_spec = result2.data.dailyStatus.m_spec ? result2.data.dailyStatus.m_spec : result.data.headCheckList[0].m_spec;
            result.data.headCheckList[0].tl = result2.data.dailyStatus.tl ? result2.data.dailyStatus.tl : result.data.headCheckList[0].tl;
            result.data.headCheckList[0].gl = result2.data.dailyStatus.gl ? result2.data.dailyStatus.gl : result.data.headCheckList[0].gl;
            result.data.headCheckList[0].tlBy = result2.data.dailyStatus.tlBy ? result2.data.dailyStatus.tlBy : result.data.headCheckList[0].tlBy;
            result.data.headCheckList[0].glBy = result2.data.dailyStatus.glBy ? result2.data.dailyStatus.glBy : result.data.headCheckList[0].glBy;
            result.data.headCheckList[0].tlAt = result2.data.dailyStatus.tlAt ? result2.data.dailyStatus.tlAt : result.data.headCheckList[0].tlAt;
            result.data.headCheckList[0].glAt = result2.data.dailyStatus.glAt ? result2.data.dailyStatus.glAt : result.data.headCheckList[0].glAt;
            result.data.headCheckList[0].tlComment = result2.data.dailyStatus.tlComment ? result2.data.dailyStatus.tlComment : result.data.headCheckList[0].tlComment;
            result.data.headCheckList[0].glComment = result2.data.dailyStatus.glComment ? result2.data.dailyStatus.glComment : result.data.headCheckList[0].glComment;
            dispatch(checkItemFetchSuccess(result.data));
          })
          .catch((err) => {

          });
      })
      .catch((err) => {
        dispatch(checkItemFetchFail(err.message));
      });
  };
};
