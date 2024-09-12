// reducers.js
import {
    FETCH_DATA_REPORT_REQUEST,
    FETCH_DATA_REPORT_SUCCESS,
    FETCH_DATA_REPORT_FAILURE,
    CREATE_DATA_REPORT_SUCCESS,
    UPDATE_DATA_REPORT_SUCCESS,
    DELETE_DATA_REPORT_SUCCESS,
    FETCH_SINGLE_REPORT_DATA_SUCCESS
} from "./reportChartActions";


const initialState = {
    loading: false,
    data: [],
    error: "",
};

const reportChartReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_DATA_REPORT_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case FETCH_DATA_REPORT_SUCCESS:
            return {
                ...state,
                loading: false,
                reportChartdata: action.payload,
            };
        case FETCH_DATA_REPORT_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case CREATE_DATA_REPORT_SUCCESS:
            return {
                ...state,
                reportChartdata: [...state.data, action.payload],
            };
        case UPDATE_DATA_REPORT_SUCCESS:
            return {
                ...state,
                reportChartdata: state.data.map((item) =>
                    item.id === action.payload.id ? action.payload : item
                ),
            };
        case FETCH_SINGLE_REPORT_DATA_SUCCESS:
            return {
                ...state,
                holidaySingledata: action.payload,
            };
        case DELETE_DATA_REPORT_SUCCESS:
            return {
                ...state,
                reportChartdata: state.data.filter((item) => item.id !== action.payload),
            };
        default:
            return state;
    }
};

export default reportChartReducer;
