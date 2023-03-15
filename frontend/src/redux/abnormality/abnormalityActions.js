import axios from "axios";
import {
  ABNORMALITY_FETCH_REQUEST,
  ABNORMALITY_FETCH_SUCCESS,
  ABNORMALITY_FETCH_FAIL,
} from "./abnormalityTypes";

// const host = "localhost";
const host = "10.82.126.73"
const port = 5051;

export const abnormalityFetchRequest = () => {
  return {
    type: ABNORMALITY_FETCH_REQUEST,
  };
};

export const abnormalityFetchSuccess = (abnormalityList) => {
  return {
    type: ABNORMALITY_FETCH_SUCCESS,
    payload: abnormalityList,
  };
};
export const abnormalityFetchFail = (error) => {
  return {
    type: ABNORMALITY_FETCH_FAIL,
    error: error,
  };
};

export const getAbnormality = ( fromDateSt, toDateSt) => {
  

  return (dispatch) => {
    dispatch(abnormalityFetchRequest());
    axios
      .get(`http://${host}:${port}/abnormality/find/fromDate/${fromDateSt}/toDate/${toDateSt}`)
      .then((result) => {
        console.log("results ab",result.data)
        dispatch(abnormalityFetchSuccess(result.data));        
      })
      .catch((error) => {
        dispatch(abnormalityFetchFail(error.message));
        console.log("triggered getAbnormality & Error", error.message);
      });
  };
};
