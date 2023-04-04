import { combineReducers } from "redux";

import userReducer from "./redux/user/userReducer";
import machineReducer from "./redux/machine/machineReducer";
import checkItemReducer from "./redux/checkItem/checkItemsReducer";
import filterReducer from "./redux/filter/filterReducer";
import loginReducer from "./redux/login/loginReducer";
import dailyStatusReducer from "./redux/dailyStatus/dailyStatusReducer";
import abnormalityReducer from "./redux/abnormality/abnormalityReducer";
import cardReducer from "./redux/card/cardReducer";
import pendingTaskReducer from "./redux/pendingTasks/pendingReducer";

const rootReducer = combineReducers({
  users: userReducer,
  machines: machineReducer,
  checkItems: checkItemReducer,
  filters: filterReducer,
  logins: loginReducer,
  dailyStatuses: dailyStatusReducer,
  abnormalities: abnormalityReducer,
  cards: cardReducer,
  pendingTasks: pendingTaskReducer,
});

export default rootReducer;
