import React from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute"; // <== Added import here
import ProductDetails from "./pages/ProductDetails";
import MyOrders from "./pages/MyOrders";
import AdminAddProduct from "./pages/admin/AdminAddProduct";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import AdminMessages from "./pages/admin/AdminMessages";
export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/order/:id"
            element={
              <PrivateRoute>
                <OrderConfirmation />
              </PrivateRoute>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        <Route path="/admin/add-product" element={<AdminAddProduct />} />
          {/* Admin route wrapped inside AdminRoute for admin-only access */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
<Route path="/admin/products" element={<ManageProducts />} />
<Route path="/admin/orders" element={<ManageOrders />} />
<Route path="/admin/users" element={<ManageUsers />} />
<Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/my-orders" element={<MyOrders />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

