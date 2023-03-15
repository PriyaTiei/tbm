import axios from "axios";
import {
  DAILYSTATUS_FETCH_REQUEST,
  DAILYSTATUS_FETCH_SUCCESS,
  DAILYSTATUS_FETCH_FAIL,
} from "./dailyStatusTypes";
// const host = "localhost";
const host= "10.82.126.73";
const port = 5051;

export const dailyStatusFetchRequest = () => {
  return {
    type: DAILYSTATUS_FETCH_REQUEST,
  };
};

export const dailyStatusFetchSuccess = (dailyStatus) => {
  return {
    type: DAILYSTATUS_FETCH_SUCCESS,
    payload: dailyStatus,
  };
};

export const dailyStatusFetchFail = (error) => {
  return {
    type: DAILYSTATUS_FETCH_FAIL,
    error: error,
  };
};

export const getDailyStatus = (queryStr) => {
  return (dispatch) => {
    dispatch(dailyStatusFetchRequest());
    axios
      .get(`http://${host}:${port}/dailyStatus?${queryStr}`)
      .then((result) => {
        dispatch(dailyStatusFetchSuccess(result.data));
      })
      .catch((error) => {
        dispatch(dailyStatusFetchFail(error.message));
      });
  };
};
