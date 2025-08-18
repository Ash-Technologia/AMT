import React, { useState } from "react";
import api from "../api";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../redux/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import "../styles/CheckoutPage.css"; // ✅ NEW CSS import

const CheckoutPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shippingData, setShippingData] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 500 ? 0 : 50;
  const totalPrice = itemsPrice + shippingPrice;

  const validateShipping = () => {
    const { fullName, address, city, postalCode, country, phone } = shippingData;
    if (!fullName || !address || !city || !postalCode || !country || !phone) {
      setError("Please fill in all shipping details.");
      return false;
    }
    if (!/^\d{10,}$/.test(phone)) {
      setError("Please enter a valid phone number.");
      return false;
    }
    setError("");
    return true;
  };

  const handleChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleRazorpay = async () => {
    if (!validateShipping()) return;
    setLoading(true);
    setError("");
    try {
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          image: item.image,
        })),
        shippingAddress: shippingData,
        paymentMethod: "razorpay",
        itemsPrice,
        shippingPrice,
        totalPrice,
      };

      const createRes = await api.post("/api/orders", orderPayload);
      const { razorpayOrder, order } = createRes.data;

      const ok = await loadRazorpayScript();
      if (!ok) {
        setError("Razorpay SDK failed to load.");
        setLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || "",
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "AMT",
        description: `Order ${order._id}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            await api.post("/api/orders/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });
            dispatch(clearCart());
            alert("Payment Successful!");
            navigate(`/order/${order._id}`);
          } catch (verifyErr) {
            setError("Payment verification failed");
          }
        },
        prefill: {
          name: shippingData.fullName,
          email: JSON.parse(localStorage.getItem("amtUser"))?.user?.email || "",
          contact: shippingData.phone,
        },
        theme: { color: "#16a34a" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      {error && <div className="error-box">{error}</div>}

      {/* Shipping Form */}
      <div className="section">
        <h3 className="section-title">Shipping Details</h3>
        <div className="form-grid">
          {["fullName", "address", "city", "postalCode", "country", "phone"].map((field) => (
            <input
              key={field}
              type={field === "phone" ? "tel" : "text"}
              name={field}
              placeholder={field.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
              value={shippingData[field]}
              onChange={handleChange}
              className="input-field"
              required
            />
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="section">
        <h3 className="section-title">Order Summary</h3>
        {cartItems.map((item) => (
          <div key={item._id} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-img" />
            <div className="cart-details">
              <h4 className="cart-name">{item.name}</h4>
              <p className="cart-qty">Qty: {item.qty} × ₹{item.price.toFixed(2)}</p>
            </div>
            <div className="cart-total">₹{(item.price * item.qty).toFixed(2)}</div>
          </div>
        ))}
        <div className="summary">
          <div className="summary-line">
            <span>Items Price:</span>
            <span>₹{itemsPrice.toFixed(2)}</span>
          </div>
          <div className="summary-line">
            <span>Shipping:</span>
            <span>₹{shippingPrice.toFixed(2)}</span>
          </div>
          <div className="summary-total">
            <span>Total:</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleRazorpay}
        disabled={loading}
        className={`pay-btn ${loading ? "disabled" : ""}`}
      >
        {loading ? "Processing Payment..." : "Pay with Razorpay"}
      </button>
    </div>
  );
};

export default CheckoutPage;
