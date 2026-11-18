
import { useEffect, useState } from "react";

function CustomerNavbar({
  customerUser,
  onNavigate,
  onLogout,
  onAdminLogin
}) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart =
          JSON.parse(localStorage.getItem("vendoraCart")) || [];

        const count = cart.reduce(
          (total, item) => total + Number(item.quantity || 0),
          0
        );

        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();

    window.addEventListener("vendoraCartUpdated", updateCartCount);

    return () => {
      window.removeEventListener(
        "vendoraCartUpdated",
        updateCartCount
      );
    };
  }, []);

  const navigate = (page) => {
    setProfileMenuOpen(false);
    onNavigate(page);
  };

  const handleLogout = () => {
    setProfileMenuOpen(false);
    onLogout();
  };

  return (
    <nav className="store-navigation">
      <strong
        className="store-brand"
        onClick={() => navigate("store")}
        style={{ cursor: "pointer" }}
      >
        <img
          src="/vendora-v-icon.svg"
          alt=""
          className="store-brand-logo"
        />
        <span>Vendora</span>
      </strong>

      <div className="store-nav-actions">
        <button
          type="button"
          className="nav-text-button cart-nav-button"
          onClick={() => navigate("customer-cart")}
        >
          Cart
          {/* <span className="nav-cart-count">{cartCount}</span> */}
        </button>

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
              <button
                type="button"
                onClick={() => navigate("customer-cart")}
              >
                Cart
              </button>

              {customerUser?.role === "customer" ? (
                <>
                  <div className="profile-dropdown-header">
                    <strong>{customerUser.name}</strong>
                    <span>{customerUser.email}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("customer-orders")}
                  >
                    Order History
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("customer-profile")}
                  >
                    My Profile
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("customer-auth")}
                >
                  Sign In
                </button>
              )}

              <div className="profile-dropdown-divider" />

              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  onAdminLogin();
                }}
              >
                Admin Login
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default CustomerNavbar;
