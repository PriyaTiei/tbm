import { LOGIN, LOGOUT } from "./loginTypes"; 
export const getLogin = (name, role, token) => {  
  return {
    type: LOGIN,
    name,
    role,
    token
  };
};

export const getLogout = (name, role, token) => {
  return {
    type: LOGOUT,
    name,
    role,
    token
  };
};
