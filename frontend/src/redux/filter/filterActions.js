import {
  FILTER_DATE,

  FILTER_DEPT,
} from "./filterTypes";

export const filterDate = (d,w, m, y, dt) => {
  return {
    type: FILTER_DATE,
    payload: { d, w, m, y , dt},
  };
};

export const filterDept = (dept) => {
  return {
    type: FILTER_DEPT,
    payload: dept,
  };
};
