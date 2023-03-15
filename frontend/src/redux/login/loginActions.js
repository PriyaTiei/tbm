import { LOGIN, LOGOUT } from "./loginTypes";

export const getLogin = (name, role) => {
  return {
    type: LOGIN,
    name,
    role
  };
};

export const getLogout = () => {
  return {
    type: LOGOUT,
  };
};
