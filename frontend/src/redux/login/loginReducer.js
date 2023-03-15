import { LOGIN, LOGOUT } from "./loginTypes";

const inititalLoginState = {
  login: false,
};

const loginReducer = (state = inititalLoginState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        login: true,
        name:action.name,
        role:action.role
      };
    case LOGOUT:
      return {
        login: false,
      };
    default:
      return state;
  }
};

export default loginReducer;
