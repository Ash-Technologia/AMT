import React, { useEffect, useState, useContext } from "react";
import api from "../api"; // axios instance with auth headers
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const MyOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/orders/myorders"); // adjust path as needed
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch orders");
        setLoading(false);
      }
    };

    if (user) fetchOrders();
  }, [user]);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-600 font-semibold">You have no orders yet.</div>
    );
  if (error)
    return (
      <div className="p-6 text-center text-red-600 font-semibold">{error}</div>
    );
  if (orders.length === 0)
    return (
      <div className="p-6 text-center text-gray-500 font-medium">
        You have no orders yet.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white mt-10 shadow-md rounded-xl">
      <h2 className="text-3xl font-bold mb-8 border-b pb-3 text-gray-800">
        My Orders
      </h2>
      <ul className="space-y-6">
        {orders.map((order) => (
          <li
            key={order._id}
            className="border border-gray-300 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white"
          >
            <Link to={`/order/${order._id}`} className="block">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-semibold text-lg">
                  Order ID: {order._id}
                </span>
                <span
                  className={`font-semibold px-3 py-1 rounded-full text-sm ${
                    order.isPaid
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {order.isPaid ? "Paid" : "Pending Payment"}
                </span>
              </div>
              <div className="text-gray-600 mb-1">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </div>
              <div className="text-gray-800 font-semibold text-lg">
                Total: ₹{order.totalPrice.toFixed(2)}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyOrders;
