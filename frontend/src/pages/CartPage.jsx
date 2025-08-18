import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, updateQuantity } from "../redux/slices/cartSlice";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDecrease = (_id, qty) => {
    if (qty > 1) {
      dispatch(updateQuantity({ _id, qty: qty - 1 }));
    }
  };

  const handleIncrease = (_id, qty) => {
    if (qty < 100) {
      dispatch(updateQuantity({ _id, qty: qty + 1 }));
    }
  };

  const handleInputChange = (_id, value) => {
    let qty = parseInt(value, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    else if (qty > 100) qty = 100;
    dispatch(updateQuantity({ _id, qty }));
  };

  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-black">Your Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      ) : (
        cartItems.map((item) => (
          <div
            key={item._id}
            className="flex flex-col sm:flex-row justify-between items-center border-b py-6 gap-4"
          >
            <div className="flex items-center gap-4 w-full sm:w-2/3">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg shadow"
              />
              <div>
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-gray-700 font-sans mt-1">₹{item.price}</p>
              </div>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center gap-2 border rounded-md overflow-hidden select-none w-32">
              <button
                onClick={() => handleDecrease(item._id, item.qty)}
                className="btn-green"
                aria-label={`Decrease quantity of ${item.name}`}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max="100"
                value={item.qty}
                onChange={(e) => handleInputChange(item._id, e.target.value)}
                className="quantity-input"
                aria-label={`Quantity input for ${item.name}`}
              />
              <button
                onClick={() => handleIncrease(item._id, item.qty)}
                className="btn-green"
                aria-label={`Increase quantity of ${item.name}`}
              >
                +
              </button>
            </div>
            <div className="font-semibold text-lg w-24 text-right">
              ₹{(item.price * item.qty).toFixed(2)}
            </div>

            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow transition w-full sm:w-auto"
              onClick={() => dispatch(removeFromCart(item._id))}
              aria-label={`Remove ${item.name} from cart`}
            >
              Remove
            </button>
          </div>
        ))
      )}

      {cartItems.length > 0 && (
        <div className="mt-8 text-right">
          <div className="text-2xl font-bold mb-4">Total: ₹{total.toFixed(2)}</div>
          <button
            onClick={() => navigate("/checkout")}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded shadow-lg transition transform hover:scale-105"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
