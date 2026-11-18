
import { useEffect, useState } from "react";
import "./CustomerCart.css";

function CustomerCart({
  customerToken,
  onSignIn,
  onCheckout,
  onContinueShopping
}) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("vendoraCart")) || [];
    } catch {
      return [];
    }
  });

  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("vendoraCart", JSON.stringify(cart));
    window.dispatchEvent(new Event("vendoraCartUpdated"));
  }, [cart]);

  const formatPrice = (price) =>
    Number(price).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const changeQuantity = (productId, amount) => {
    setCartMessage("");

    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item._id !== productId) return item;

          const newQuantity = item.quantity + amount;

          if (newQuantity > Number(item.stockQuantity)) {
            setCartMessage(
              `Only ${item.stockQuantity} unit(s) are available for ${item.name}.`
            );
            return item;
          }

          return { ...item, quantity: newQuantity };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setCartMessage("");

    setCart((currentCart) =>
      currentCart.filter((item) => item._id !== productId)
    );
  };

  const handleCheckout = () => {
    if (!customerToken) {
      setCartMessage("Please sign in before checking out.");

      if (onSignIn) {
        onSignIn();
      }

      return;
    }

    if (cart.length === 0) {
      setCartMessage("Your cart is empty.");
      return;
    }

    setCartMessage("");

    if (onCheckout) {
      onCheckout(cart);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http")) {
      return image;
    }

    const apiUrl = (
      import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");

    return `${apiUrl}${image}`;
  };

  return (
    <main className="customer-cart-page">
      <header className="customer-cart-header">
        <div>
          <p className="customer-cart-eyebrow">YOUR ITEMS</p>
          <h1>Shopping Cart</h1>
          <p className="customer-cart-subtitle">
            Review your selected products before checkout.
          </p>
        </div>

        <span className="customer-cart-item-count">
          {cartCount} {cartCount === 1 ? "item" : "items"}
        </span>
      </header>

      {cartMessage && (
        <p className="customer-cart-message" role="status">
          {cartMessage}
        </p>
      )}

      {cart.length === 0 ? (
        <section className="customer-cart-empty">
          <div className="customer-cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>
            You haven't added any products to your shopping cart yet.
          </p>

          <button
            type="button"
            className="customer-cart-primary-button"
            onClick={onContinueShopping}
          >
            Continue Shopping
          </button>
        </section>
      ) : (
        <div className="customer-cart-layout">
          <section className="customer-cart-items">
            {cart.map((item) => (
              <article className="customer-cart-item" key={item._id}>
                <div className="customer-cart-product-image">
                  {item.image ? (
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                    />
                  ) : (
                    <span>
                      {item.name?.charAt(0)?.toUpperCase() || "P"}
                    </span>
                  )}
                </div>

                <div className="customer-cart-product-details">
                  <div className="customer-cart-product-heading">
                    <div>
                      <p className="customer-cart-category">
                        {item.category}
                      </p>
                      <h2>{item.name}</h2>
                    </div>

                    <strong className="customer-cart-line-total">
                      ₱{formatPrice(
                        Number(item.price) * item.quantity
                      )}
                    </strong>
                  </div>

                  <p className="customer-cart-unit-price">
                    ₱{formatPrice(item.price)} each
                  </p>

                  <div className="customer-cart-item-bottom">
                    <div className="customer-cart-quantity">
                      <button
                        type="button"
                        onClick={() => changeQuantity(item._id, -1)}
                        aria-label={`Remove one ${item.name}`}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() => changeQuantity(item._id, 1)}
                        disabled={
                          item.quantity >= Number(item.stockQuantity)
                        }
                        aria-label={`Add one ${item.name}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="customer-cart-remove"
                      onClick={() => removeItem(item._id)}
                    >
                      Remove
                    </button>
                  </div>

                  {Number(item.stockQuantity) <= 5 && (
                    <p className="customer-cart-stock-note">
                      {Number(item.stockQuantity) === 0
                        ? "Currently out of stock"
                        : `${item.stockQuantity} unit(s) currently available`}
                    </p>
                  )}
                </div>
              </article>
            ))}

            <button
              type="button"
              className="customer-cart-continue-link"
              onClick={onContinueShopping}
            >
              ← Continue Shopping
            </button>
          </section>

          <aside className="customer-cart-summary">
            <h2>Order Summary</h2>

            <div className="customer-cart-summary-row">
              <span>Items ({cartCount})</span>
              <span>₱{formatPrice(cartTotal)}</span>
            </div>

            <div className="customer-cart-summary-row">
              <span>Shipping</span>
              <span>Calculated separately</span>
            </div>

            <div className="customer-cart-summary-divider" />

            <div className="customer-cart-summary-total">
              <span>Total</span>
              <strong>₱{formatPrice(cartTotal)}</strong>
            </div>

            <button
              type="button"
              className="customer-cart-checkout-button"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>

            <p className="customer-cart-summary-note">
              Your order details will be reviewed before you place your order.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}

export default CustomerCart;
