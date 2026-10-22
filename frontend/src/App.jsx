
import { useState } from "react";
import api from "./services/api";
import Dashboard from "./components/Dashboard";
import CustomerProducts from "./components/CustomerProducts";
import "./App.css";

function App() {
  const [token, setToken] = useState(
    sessionStorage.getItem("vendoraToken")
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("vendoraUser")) || null;
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState("store");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password
      });

      const { token: newToken, user: loggedInUser } = response.data;

      if (!newToken) {
        throw new Error("The server did not return a login token.");
      }

      if (loggedInUser?.role !== "admin") {
        setError("Administrator access is required.");
        return;
      }

      sessionStorage.setItem("vendoraToken", newToken);
      sessionStorage.setItem("vendoraUser", JSON.stringify(loggedInUser));

      setToken(newToken);
      setUser(loggedInUser);
      setPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to log in. Check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("vendoraToken");
    sessionStorage.removeItem("vendoraUser");
    setToken(null);
    setUser(null);
    setPassword("");
    setPage("store");
  };

  if (token && user?.role === "admin") {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  if (page === "store") {
    return (
      <div>
        <nav className="store-navigation">
          <strong>Vendora</strong>
          <button onClick={() => {
            setError("");
            setPage("admin");
          }}>
            Admin Login
          </button>
        </nav>

        <CustomerProducts />
      </div>
    );
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-mark">V</div>
        <h1>Vendora</h1>
        <p className="subtitle">E-Commerce & Inventory Management</p>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          className="store-return-button"
          onClick={() => {
            setError("");
            setPage("store");
          }}
        >
          Return to Store
        </button>

        <p className="footer-text">Authorized administrators only</p>
      </section>
    </main>
  );
}

export default App;
