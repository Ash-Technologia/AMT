import React, { useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Store full login data including token and user in localStorage
      localStorage.setItem("amtUser", JSON.stringify(data));

      // Update AuthContext user
      login(data.user);

      // Redirect to previous page or home
      navigate(from, { replace: true });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "3rem auto",
        padding: "2rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: ".5rem" }}>
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: ".5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: ".5rem" }}>
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: ".5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            required
          />
        </div>

        {error && (
          <p style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>{error}</p>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: ".75rem",
            backgroundColor: "#16a34a",
            color: "white",
            fontWeight: "bold",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>

      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        New here?{" "}
        <Link to="/register" style={{ color: "#16a34a", fontWeight: "bold" }}>
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;

