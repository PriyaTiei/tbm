// actions.js
import axios from "axios";

export const FETCH_DATA_REPORT_REQUEST = "FETCH_DATA_REQUEST";
export const FETCH_DATA_REPORT_SUCCESS = "FETCH_DATA_SUCCESS";
export const FETCH_DATA_REPORT_FAILURE = "FETCH_DATA_FAILURE";
export const CREATE_DATA_REPORT_SUCCESS = "CREATE_DATA_SUCCESS";
export const UPDATE_DATA_REPORT_SUCCESS = "UPDATE_DATA_SUCCESS";
export const DELETE_DATA_REPORT_SUCCESS = "DELETE_DATA_SUCCESS";
export const FETCH_SINGLE_REPORT_DATA_SUCCESS = "FETCH_SINGLE_DATA_SUCCESS"

const API_URL = `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`;

// Action creators
export const fetchDataReportRequest = () => ({
    type: FETCH_DATA_REPORT_REQUEST,
});

export const fetchReportSuccess = (data) => ({
    type: FETCH_DATA_REPORT_SUCCESS,
    payload: data,
});

export const fetchDataReportFailure = (error) => ({
    type: FETCH_DATA_REPORT_FAILURE,
    payload: error,
});



// Thunk actions with promises for status
export const fetchReportData = (newData) => {
    return async (dispatch) => {
        dispatch(fetchDataReportRequest());
        try {
            const response = await axios.post(API_URL + `/reports/tbmStatus`, newData);
            dispatch(fetchReportSuccess(response.data));
            return Promise.resolve("success");
        } catch (error) {
            dispatch(fetchDataReportFailure(error.message));
            return Promise.reject(error.message);
        }
    };
};

// export const fetchSingleReportData = (id) => {
//     return async (dispatch) => {

//         try {
//             const response = await axios.get(API_URL + `/holidays/` + id);
//             dispatch(fetchSingleSuccess(response.data));
//             return Promise.resolve("success");
//         } catch (error) {

//             return Promise.reject(error.message);
//         }
//     };
// };

// export const createReportData = (newData) => {
//     return async (dispatch) => {
//         try {
//             const response = await axios.post(API_URL + `/holidays`, newData);
//             dispatch(createDataSuccess(response.data));
//             return Promise.resolve("success");
//         } catch (error) {
//             dispatch(fetchDataFailure(error.message));
//             return Promise.reject(error.message);
//         }
//     };
// };

// export const updateReportData = (id, updatedData) => {
//     return async (dispatch) => {
//         try {
//             const response = await axios.put(`${API_URL}/holidays/${id}`, updatedData);
//             dispatch(updateDataSuccess(response.data));
//             return Promise.resolve("success");
//         } catch (error) {
//             dispatch(fetchDataFailure(error.message));
//             return Promise.reject(error.message);
//         }
//     };
// };

// export const deleteReportData = (id) => {
//     return async (dispatch) => {
//         try {
//             await axios.delete(`${API_URL}/holidays/${id}`);
//             dispatch(deleteDataSuccess(id));
//             return Promise.resolve("success");
//         } catch (error) {
//             dispatch(fetchDataFailure(error.message));
//             return Promise.reject(error.message);
//         }
//     };
// };
