import {
  FILTER_DATE,
  FILTER_LINE,
  FILTER_DEPT,
  FILTER_CHECK,
  FILTER_GROUP,
  FILTER_PROCESS_NO,
  FILTER_CARD_NO
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


export const filterLine = (line) => {
  return {
    type: FILTER_LINE,
    payload: line,
  };
};

export const filterCheck = (check) => {
  return {
    type: FILTER_CHECK,
    payload: check,
  };
};


export const filterGroup = (group) => {
  return {
    type: FILTER_GROUP,
    payload: group,
  };
};


export const filterProcessNo = (processNo) => {
  return {
    type: FILTER_PROCESS_NO,
    payload: processNo,
  };
};
export const filterCardNo = (cardNo) => {
  return {
    type: FILTER_CARD_NO,
    payload: cardNo,
  };
};
