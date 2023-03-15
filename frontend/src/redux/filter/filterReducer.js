import { FILTER_DATE, FILTER_DEPT } from "./filterTypes";
const todayDate = new Date(Date.now());
const dt = todayDate.getDate();
const d = todayDate.getDay();
const m = todayDate.getMonth() + 1;
const y = todayDate.getFullYear();
const w = Math.floor(dt / 7.1) + 1;
const pS = "S";
const initialFilterState = {
  d,
  m,
  y,
  w,
  pS,
  dt,
};

const filterReducer = (state = initialFilterState, action) => {
  switch (action.type) {
    case FILTER_DATE:
      return {
        ...state,
        ...action.payload,
      };
    case FILTER_DEPT:
      return {
        ...state,
        pS: action.payload,
      };
    default:
      return state;
  }
};

export default filterReducer;
