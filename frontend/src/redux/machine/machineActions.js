import {
  MACHINE_FETCH_REQUEST,
  MACHINE_FETCH_SUCCESS,
  MACHINE_FETCH_FAIL,
} from "./machineTypes";
import axios from "axios";

// const host = "localhost";
const host= "10.82.126.73";
const port = 5051;

export const machineFetchRequest = () => {
  return {
    type: MACHINE_FETCH_REQUEST,
  };
};

export const machineFetchSuccess = (machines) => {
  return {
    type: MACHINE_FETCH_SUCCESS,
    payload: machines,
  };
};

export const machineFetchFail = (error) => {
  return {
    type: MACHINE_FETCH_FAIL,
    error: error,
  };
};

export const getMachines = (queryStr) => {
  return (dispatch) => {
    dispatch(machineFetchRequest());
    let url = `http://${host}:${port}/head/headMachineList?${queryStr}`;
    // let url = "http://3.108.56.58/trial.php";
    axios
      .get(url)
      .then((result) => {
        dispatch(machineFetchSuccess(result.data));
      })
      .catch((err) => {
        dispatch(machineFetchFail(err.message));
      });
  };
};
