
import { useState } from "react";
import api from "./services/api";
import Dashboard from "./components/Dashboard";
import CustomerNavbar from "./components/CustomerNavbar";
import CustomerProducts from "./components/CustomerProducts";
import CustomerCart from "./components/CustomerCart";
import CustomerAuth from "./components/CustomerAuth";
import CustomerOrders from "./components/CustomerOrders";
import CustomerProfile from "./components/CustomerProfile";
import Checkout from "./components/Checkout";
import OrderConfirmation from "./components/OrderConfirmation";
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

  const [customerToken, setCustomerToken] = useState(
    sessionStorage.getItem("vendoraCustomerToken")
  );

  const [customerUser, setCustomerUser] = useState(() => {
    try {
      return (
        JSON.parse(sessionStorage.getItem("vendoraCustomerUser")) || null
      );
    } catch {
      return null;
    }
  });

  const [checkoutCart, setCheckoutCart] = useState([]);
  const [placedOrder, setPlacedOrder] = useState(null);

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

  const handleCustomerLogin = (newToken, loggedInUser) => {
    sessionStorage.setItem("vendoraCustomerToken", newToken);
    sessionStorage.setItem(
      "vendoraCustomerUser",
      JSON.stringify(loggedInUser)
    );

    setCustomerToken(newToken);
    setCustomerUser(loggedInUser);
    setPage("store");
  };

  const handleCustomerLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    );

    if (!confirmed) return;

    sessionStorage.removeItem("vendoraCustomerToken");
    sessionStorage.removeItem("vendoraCustomerUser");
    localStorage.removeItem("vendoraCart");

    window.dispatchEvent(new Event("vendoraCartUpdated"));

    setCustomerToken(null);
    setCustomerUser(null);
    setCheckoutCart([]);
    setPlacedOrder(null);
    setPage("store");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("vendoraToken");
    sessionStorage.removeItem("vendoraUser");
    setToken(null);
    setUser(null);
    setPassword("");
    setPage("store");
  };

  const handleStartCheckout = (cart) => {
    setCheckoutCart(cart);
    setPage("checkout");
  };

  const handleOrderPlaced = (order) => {
    setPlacedOrder(order);
    setCheckoutCart([]);
    localStorage.removeItem("vendoraCart");

    window.dispatchEvent(new Event("vendoraCartUpdated"));

    setPage("order-confirmation");
  };

  const handleContinueShopping = () => {
    setPlacedOrder(null);
    setCheckoutCart([]);
    setPage("store");
  };

  const handleAdminLogin = () => {
    setError("");
    setPage("admin");
  };

  const renderCustomerNavbar = () => (
    <CustomerNavbar
      customerUser={customerUser}
      onNavigate={setPage}
      onLogout={handleCustomerLogout}
      onAdminLogin={handleAdminLogin}
    />
  );

  if (token && user?.role === "admin") {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  if (page === "store") {
    return (
      <div>
        {renderCustomerNavbar()}

        <CustomerProducts
          customerToken={
            customerUser?.role === "customer" ? customerToken : null
          }
          customerUser={
            customerUser?.role === "customer" ? customerUser : null
          }
          onSignIn={() => setPage("customer-auth")}
          onCheckout={handleStartCheckout}
        />
      </div>
    );
  }

  if (page === "customer-cart") {
    return (
      <div>
        {renderCustomerNavbar()}

        <CustomerCart
          customerToken={
            customerUser?.role === "customer" ? customerToken : null
          }
          onSignIn={() => setPage("customer-auth")}
          onCheckout={handleStartCheckout}
          onContinueShopping={() => setPage("store")}
        />
      </div>
    );
  }

  if (page === "checkout") {
    return (
      <div>
        {renderCustomerNavbar()}

        <Checkout
          cart={checkoutCart}
          customerToken={customerToken}
          customerUser={customerUser}
          onBack={() => setPage("customer-cart")}
          onOrderPlaced={handleOrderPlaced}
        />
      </div>
    );
  }

  if (page === "order-confirmation") {
    return (
      <OrderConfirmation
        order={placedOrder}
        onContinueShopping={handleContinueShopping}
      />
    );
  }

  if (page === "customer-auth") {
    return (
      <CustomerAuth
        onLogin={handleCustomerLogin}
        onClose={() => setPage("store")}
      />
    );
  }

  if (page === "customer-orders") {
    return (
      <div>
        {renderCustomerNavbar()}

        <CustomerOrders
          customerToken={customerToken}
          onBack={() => setPage("store")}
        />
      </div>
    );
  }

  if (page === "customer-profile") {
    return (
      <div>
        {renderCustomerNavbar()}

        <CustomerProfile
          customerUser={customerUser}
          onBack={() => setPage("store")}
          onProfileUpdated={(updatedUser) => {
            setCustomerUser(updatedUser);

            sessionStorage.setItem(
              "vendoraCustomerUser",
              JSON.stringify(updatedUser)
            );
          }}
        />
      </div>
    );
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <img
  src="/vendora-v-icon.svg"
  alt=""
  className="brand-mark"
/>
        <h1>Vendora</h1>
        <p className="subtitle">
          E-Commerce & Inventory Management
        </p>

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

        <p className="footer-text">
          Authorized administrators only
        </p>
      </section>
    </main>
  );
}

export default App;
