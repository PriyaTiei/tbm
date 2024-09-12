// actions.js
import axios from "axios";

export const FETCH_DATA_REQUEST = "FETCH_DATA_REQUEST";
export const FETCH_DATA_SUCCESS = "FETCH_DATA_SUCCESS";
export const FETCH_DATA_FAILURE = "FETCH_DATA_FAILURE";
export const CREATE_DATA_SUCCESS = "CREATE_DATA_SUCCESS";
export const UPDATE_DATA_SUCCESS = "UPDATE_DATA_SUCCESS";
export const DELETE_DATA_SUCCESS = "DELETE_DATA_SUCCESS";
export const FETCH_SINGLE_DATA_SUCCESS = "FETCH_SINGLE_DATA_SUCCESS"

const API_URL = `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`;

// Action creators
export const fetchDataRequest = () => ({
    type: FETCH_DATA_REQUEST,
});

export const fetchDataSuccess = (data) => ({
    type: FETCH_DATA_SUCCESS,
    payload: data,
});

export const fetchDataFailure = (error) => ({
    type: FETCH_DATA_FAILURE,
    payload: error,
});

export const createDataSuccess = (data) => ({
    type: CREATE_DATA_SUCCESS,
    payload: data,
});

export const updateDataSuccess = (data) => ({
    type: UPDATE_DATA_SUCCESS,
    payload: data,
});

export const fetchSingleSuccess = (data) => ({
    type: FETCH_SINGLE_DATA_SUCCESS,
    payload: data,
});

export const deleteDataSuccess = (id) => ({
    type: DELETE_DATA_SUCCESS,
    payload: id,
});

// Thunk actions with promises for status
export const fetchData = () => {
    return async (dispatch) => {
        dispatch(fetchDataRequest());
        try {
            const response = await axios.get(API_URL + `/holidays`);
            dispatch(fetchDataSuccess(response.data));
            return Promise.resolve("success");
        } catch (error) {
            dispatch(fetchDataFailure(error.message));
            return Promise.reject(error.message);
        }
    };
};

export const fetchSingleData = (id) => {
    return async (dispatch) => {

        try {
            const response = await axios.get(API_URL + `/holidays/` + id);
            dispatch(fetchSingleSuccess(response.data));
            return Promise.resolve("success");
        } catch (error) {

            return Promise.reject(error.message);
        }
    };
};

export const createData = (newData) => {
    return async (dispatch) => {
        try {
            const response = await axios.post(API_URL + `/holidays`, newData);
            dispatch(createDataSuccess(response.data));
            return Promise.resolve("success");
        } catch (error) {
            dispatch(fetchDataFailure(error.message));
            return Promise.reject(error.message);
        }
    };
};

export const updateData = (id, updatedData) => {
    return async (dispatch) => {
        try {
            const response = await axios.put(`${API_URL}/holidays/${id}`, updatedData);
            dispatch(updateDataSuccess(response.data));
            return Promise.resolve("success");
        } catch (error) {
            dispatch(fetchDataFailure(error.message));
            return Promise.reject(error.message);
        }
    };
};

export const deleteData = (id) => {
    return async (dispatch) => {
        try {
            await axios.delete(`${API_URL}/holidays/${id}`);
            dispatch(deleteDataSuccess(id));
            return Promise.resolve("success");
        } catch (error) {
            dispatch(fetchDataFailure(error.message));
            return Promise.reject(error.message);
        }
    };
};
