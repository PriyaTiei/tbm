import {
  PENDING_TASK_FETCH_REQUEST,
  PENDING_TASK_FETCH_SUCCESS,
  PENDING_TASK_FETCH_FAIL,
} from "./pendingTypes";

const initialPendingTaskState = {
  loading: false,
  pendingTasksData: {},
  error: "",
};

const pendingTaskReducer = (state = initialPendingTaskState, action) => {
  switch (action.type) {
    case PENDING_TASK_FETCH_REQUEST:
      return {
        ...state,
        loading: true,
        pendingTasksData: {},
        error: "",
      };
    case PENDING_TASK_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        pendingTasksData: action.payload,
        error: "",
      };
    case PENDING_TASK_FETCH_FAIL:
      return {
        ...state,
        loading: false,
        pendingTasksData: {},
        error: action.error,
      };

    default:
      return state;
  }
};

export default pendingTaskReducer;
