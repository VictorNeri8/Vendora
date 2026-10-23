
import { useState } from "react";
import api from "../services/api";
import "./CustomerAuth.css";

function CustomerAuth({ onLogin, onClose }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await api.post("/auth/register", { name, email, password });
        setMode("login");
        setPassword("");
        setError("Account created! Please sign in.");
        return;
      }

      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      if (!token || !user || user.role !== "customer") {
        setError("Please use a customer account.");
        return;
      }

      onLogin(token, user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to continue. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="customer-auth-page">
      <section className="customer-auth-card">
        <div className="customer-auth-brand">
          <div className="customer-auth-logo">V</div>
          <span>Vendora</span>
        </div>

        <div className="customer-auth-heading">
          <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p>
            {mode === "login"
              ? "Sign in to continue shopping."
              : "Join Vendora and start shopping today."}
          </p>
        </div>

        <form className="customer-auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="customer-auth-field">
              <label htmlFor="customer-name">Full name</label>
              <input
                id="customer-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
                autoComplete="name"
              />
            </div>
          )}

          <div className="customer-auth-field">
            <label htmlFor="customer-email">Email address</label>
            <input
              id="customer-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="customer-auth-field">
            <label htmlFor="customer-password">Password</label>
            <input
              id="customer-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
          </div>

          {error && (
            <p className="customer-auth-message" role="status">
              {error}
            </p>
          )}

          <button
            className="customer-auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <p className="customer-auth-switch">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
              setPassword("");
            }}
          >
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </p>

        <button
          className="customer-auth-back"
          type="button"
          onClick={onClose}
        >
          ← Back to store
        </button>
      </section>
    </main>
  );
}

export default CustomerAuth;
