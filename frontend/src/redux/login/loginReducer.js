import { LOGIN, LOGOUT } from "./loginTypes";

const inititalLoginState = {
  login: false,
  token: null,
  role : null,
  name : null
};

const loginReducer = (state = inititalLoginState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        login: true,
        name: action.name,
        role: action.role,
        token: action.token,
      };
    case LOGOUT:
      return {
        login: false,
        token: null,
        name: action.name,
        role: action.role,
      };
    default:
      return state;
  }
};

export default loginReducer;
