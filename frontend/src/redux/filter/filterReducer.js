import {
  FILTER_CHECK,
  FILTER_DATE,
  FILTER_DEPT,
  FILTER_LINE,
  FILTER_MAIN_LINE,
  FILTER_SUB_LINE,
  FILTER_GROUP,
  FILTER_PROCESS_NO,
  FILTER_CARD_NO
} from "./filterTypes";
const todayDate = new Date(Date.now());
const dt = todayDate.getDate();
const d = todayDate.getDay();
const m = todayDate.getMonth() + 1;
const y = todayDate.getFullYear();
const w = Math.floor(dt / 7.1) + 1;
const pS = "S";
const line = null;
const mainLine = null;
const subLine = null;
const rS = null;
const group = null;
const processNo ="";
const cardNo = "";
const initialFilterState = {
  d,
  m,
  y,
  w,
  pS,
  dt,
  line,
  mainLine,
  subLine,
  rS, 
  group,
  processNo,
  cardNo
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
    case FILTER_MAIN_LINE:
      return {
        ...state,
        mainLine: action.payload,
        subLine: null,
        line: action.payload,
      };
    case FILTER_SUB_LINE:
      return {
        ...state,
        subLine: action.payload,
        line: action.payload !== null ? action.payload : state.mainLine,
      };
    case FILTER_LINE: {
      const val = action.payload;
      const isMainCategory = val === "Assembly" || val === "Machining" || val === "Other Lines";
      return {
        ...state,
        line: val,
        mainLine: isMainCategory ? val : (val === null ? null : state.mainLine),
        subLine: isMainCategory ? null : val,
      };
    }
    case FILTER_CHECK:
      return {
        ...state,
        rS: action.payload,
      };
      case FILTER_GROUP:
        return {
          ...state,
          group: action.payload,
        };
        case FILTER_PROCESS_NO:
          return {
            ...state,
            processNo: action.payload,
          };
          case FILTER_CARD_NO:
            return {
              ...state,
              cardNo: action.payload,
            };
    default:
      return state;
  }
};

export default filterReducer;
