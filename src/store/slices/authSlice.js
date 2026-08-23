import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("ecosync_token");
const user = localStorage.getItem("ecosync_user");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: token || null,
    user: user ? JSON.parse(user) : null,
    isLoggedIn: !!token,
  },
  reducers: {
    setAuth: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isLoggedIn = true;
      localStorage.setItem("ecosync_token", action.payload.token);
      localStorage.setItem("ecosync_user", JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isLoggedIn = false;
      localStorage.removeItem("ecosync_token");
      localStorage.removeItem("ecosync_user");
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;