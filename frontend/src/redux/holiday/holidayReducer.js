// reducers.js
import {
    FETCH_DATA_REQUEST,
    FETCH_DATA_SUCCESS,
    FETCH_DATA_FAILURE,
    CREATE_DATA_SUCCESS,
    UPDATE_DATA_SUCCESS,
    DELETE_DATA_SUCCESS,
    FETCH_SINGLE_DATA_SUCCESS
} from "./holidayActions";


const initialState = {
    loading: false,
    data: [],
    error: "",
};

const holidayReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_DATA_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case FETCH_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                holidaydata: action.payload,
            };
        case FETCH_DATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case CREATE_DATA_SUCCESS:
            return {
                ...state,
                holidaydata: [...state.data, action.payload],
            };
        case UPDATE_DATA_SUCCESS:
            return {
                ...state,
                holidaydata: state.data.map((item) =>
                    item.id === action.payload.id ? action.payload : item
                ),
            };
        case FETCH_SINGLE_DATA_SUCCESS:
            return {
                ...state,
                holidaySingledata: action.payload,
            };
        case DELETE_DATA_SUCCESS:
            return {
                ...state,
                holidaydata: state.data.filter((item) => item.id !== action.payload),
            };
        default:
            return state;
    }
};

export default holidayReducer;
