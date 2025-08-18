import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("amtUser");
    return saved ? JSON.parse(saved).user : null;
  });

  useEffect(() => {
    if (user) {
      // Store full object including token + user for persistence
      const amtUser = JSON.parse(localStorage.getItem("amtUser")) || {};
      amtUser.user = user;
      localStorage.setItem("amtUser", JSON.stringify(amtUser));
    } else {
      localStorage.removeItem("amtUser");
    }
  }, [user]);

  const login = (userData) => setUser(userData);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("amtUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

