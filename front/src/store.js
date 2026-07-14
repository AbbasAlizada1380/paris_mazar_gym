import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./dashboard/auth/userSlice/userSlice.js";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});
