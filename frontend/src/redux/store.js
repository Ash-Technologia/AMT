import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice"; // ✅ fixed path

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

export default store;
