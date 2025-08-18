import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: (JSON.parse(localStorage.getItem('cart')) || []).map(item => ({
    ...item,
    qty: item.qty && item.qty > 0 ? item.qty : 1, // ensure qty present
  })),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.cartItems.find(item => item._id === newItem._id);
      if (existingItem) {
        existingItem.qty += newItem.qty;
      } else {
        state.cartItems.push(newItem);
      }
      localStorage.setItem('cart', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(item => item._id !== action.payload);
      localStorage.setItem('cart', JSON.stringify(state.cartItems));
    },
    updateQuantity: (state, action) => {
      const { _id, qty } = action.payload;
      const item = state.cartItems.find(item => item._id === _id);
      if (item && qty > 0) {
        item.qty = qty;
      }
      localStorage.setItem('cart', JSON.stringify(state.cartItems));
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cart');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

export default cartSlice.reducer;



