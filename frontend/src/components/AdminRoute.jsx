import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (!user.isAdmin) {
    // Logged in but not admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
