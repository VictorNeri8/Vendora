
import { useState } from "react";
import api from "./services/api";
import Dashboard from "./components/Dashboard";
import CustomerProducts from "./components/CustomerProducts";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
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
    setPage("order-confirmation");
  };

  const handleContinueShopping = () => {
    setPlacedOrder(null);
    setCheckoutCart([]);
    setPage("store");
  };

  if (token && user?.role === "admin") {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  if (page === "store") {
    return (



      <div>
        <nav className="store-navigation">
          <strong className="store-brand">
            <img
              src="/vendora-v-icon.svg"
              alt=""
              className="store-brand-logo"
            />
            <span>Vendora</span>
          </strong>

          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>



          
<div
  className={`store-nav-actions ${
    mobileMenuOpen ? "mobile-menu-open" : ""
  }`}
>
  <div className="profile-menu-wrapper">
    <button
      type="button"
      className="profile-icon-button"
      aria-label="Open profile menu"
      aria-expanded={profileMenuOpen}
      onClick={() => setProfileMenuOpen((open) => !open)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </svg>
    </button>

    {profileMenuOpen && (
      <div className="profile-dropdown">
        {customerUser?.role === "customer" ? (
          <>
            <div className="profile-dropdown-header">
              <strong>{customerUser.name}</strong>
              <span>{customerUser.email}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen(false);
                setPage("customer-orders");
              }}
            >
              Order History
            </button>

            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen(false);
                setPage("customer-profile");
              }}
            >
              My Profile
            </button>

            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen(false);
                handleCustomerLogout();
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setProfileMenuOpen(false);
              setPage("customer-auth");
            }}
          >
            Sign In
          </button>
        )}

        <div className="profile-dropdown-divider" />

        <button
          type="button"
          onClick={() => {
            setProfileMenuOpen(false);
            setError("");
            setPage("admin");
          }}
        >
          Admin Login
        </button>
      </div>
    )}
  </div>
</div>





        </nav>

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

  if (page === "checkout") {
    return (
      <Checkout
        cart={checkoutCart}
        customerToken={customerToken}
        customerUser={customerUser}
        onBack={() => setPage("store")}
        onOrderPlaced={handleOrderPlaced}
      />
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
        <nav className="store-navigation">
          <strong>Vendora</strong>
          <button onClick={() => setPage("store")}>
            Back to Store
          </button>
        </nav>

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
        <nav className="store-navigation">
          <strong className="store-brand">Vendora</strong>

          <button
            type="button"
            className="nav-text-button"
            onClick={() => setPage("store")}
          >
            Back to Store
          </button>
        </nav>

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
        <div className="brand-mark">V</div>
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
