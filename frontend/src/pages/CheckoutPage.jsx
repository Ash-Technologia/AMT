// frontend/src/pages/CheckoutPage.jsx
import React, { useState } from "react";
import api from "../api";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../redux/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import "../styles/CheckoutPage.css";

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

  const shippingPrice = cartItems.reduce((acc, item) => {
    if (item.shippingType === "cod") {
      return acc + (Number(item.shippingCharge) || 0) * (item.qty || 1);
    }
    return acc;
  }, 0);

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

  // Helper to dynamically load Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    if (!validateShipping()) return;
    setLoading(true);
    setError("");

    try {
      // 1) Create order on server (DB order + Razorpay order)
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          image: item.image,
        })),
        shippingAddress: shippingData,
        paymentMethod: "Razorpay",
      };

      console.log("Creating Razorpay order payload", orderPayload);

      const res = await api.post("/api/orders/razorpay/create", orderPayload);
      console.log("createRazorpayOrder response:", res.data);

      const { razorpayOrder, orderId, razorpayKeyId } = res.data;

      if (!razorpayOrder || !razorpayKeyId) {
        setError(res.data?.message || "Failed to initiate Razorpay payment.");
        setLoading(false);
        return;
      }

      // 2) Load Razorpay SDK
      const ok = await loadRazorpayScript();
      if (!ok) {
        setError("Failed to load Razorpay SDK. Check your network.");
        setLoading(false);
        return;
      }

      // 3) Open Razorpay Checkout
      const options = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount, // in paise
        currency: razorpayOrder.currency || "INR",
        name: "Your Shop Name",
        description: `Order #${orderId}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: shippingData.fullName,
          contact: shippingData.phone,
        },
        handler: async function (response) {
          // response: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
          try {
            setLoading(true);
            const verifyRes = await api.post("/api/orders/razorpay/verify", {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              merchantOrderId: orderId, // our DB order id
            });

            console.log("verify response:", verifyRes.data);

            if (verifyRes.data && verifyRes.data.success) {
              // Payment confirmed. Clear cart and navigate to order page.
              dispatch(clearCart());
              navigate(`/order/${orderId}`);
            } else {
              setError("Payment verification failed on server.");
            }
          } catch (err) {
            console.error("Payment verify error:", err?.response?.data || err?.message || err);
            setError(err?.response?.data?.message || "Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            // User closed checkout; do not clear cart
            console.log("Razorpay modal closed by user");
          },
        },
        theme: {
          color: "#F37254",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (paymentFailureResponse) {
        console.error("Razorpay payment failed:", paymentFailureResponse);
        setError("Payment failed. Please try again or use another method.");
      });

      rzp.open();
    } catch (err) {
      console.error("❌ Razorpay Checkout error:", err?.response?.data || err?.message || err);
      setError(err?.response?.data?.message || "Failed to create Razorpay order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      {error && <div className="error-box">{error}</div>}

      <div className="section">
        <h3 className="section-title">Shipping Details</h3>
        <div className="form-grid">
          {["fullName", "address", "city", "postalCode", "country", "phone"].map(
            (field) => (
              <input
                key={field}
                type={field === "phone" ? "tel" : "text"}
                name={field}
                placeholder={field
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
                value={shippingData[field]}
                onChange={handleChange}
                className="input-field"
                required
              />
            )
          )}
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Order Summary</h3>
        {cartItems.map((item) => (
          <div key={item._id} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-img" />
            <div className="cart-details">
              <h4 className="cart-name">{item.name}</h4>
              <p className="cart-qty">
                Qty: {item.qty} × ₹{item.price.toFixed(2)}
              </p>
              {item.shippingType === "cod" && (
                <p className="cod-note">
                  Delivery charges approx 3000rs, to be paid at time of delivery.
                </p>
              )}
            </div>
            <div className="cart-total">
              ₹{(item.price * item.qty).toFixed(2)}
            </div>
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
        onClick={handleRazorpayPayment}
        disabled={loading}
        className={`pay-btn ${loading ? "disabled" : ""}`}
      >
        {loading ? "Processing Payment..." : "Pay with Razorpay"}
      </button>
    </div>
  );
};

export default CheckoutPage;
