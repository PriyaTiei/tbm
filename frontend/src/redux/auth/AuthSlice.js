import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  isAuthenticated: false,
  user: null,
  // departments: [], 
  error: "",
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    fetchUserRequest: (state) => {
      state.loading = true;
      state.user = null;
      // state.departments = []; // 👈 Clear departments on request
      state.error = "";
    },
    fetchUserSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
      // state.departments = action.payload.departments || []; // 👈 Set departments
      state.error = "";
    },
    fetchUserFail: (state, action) => {
      state.loading = false;
      state.user = null;
      // state.departments = []; // 👈 Clear departments on fail
      state.error = action.payload;
    },
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user; 
      state.token = action.payload.token;
      // state.departments = action.payload.user.departments || []; // 👈 Set departments
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      // state.departments = []; // 👈 Clear on logout
    },
  },
});

export const {
  fetchUserRequest,
  fetchUserSuccess,
  fetchUserFail,
  login,
  logout,
} = authSlice.actions;
export default authSlice.reducer;
