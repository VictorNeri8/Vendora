
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Checkout.css";

function Checkout({
  cart,
  customerToken,
  customerUser,
  onBack,
  onOrderPlaced
}) {
  const [contactNumber, setContactNumber] = useState(
    customerUser?.contactNumber || ""
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    customerUser?.deliveryAddress || ""
  );
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [orderNotes, setOrderNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setContactNumber(customerUser?.contactNumber || "");
    setDeliveryAddress(customerUser?.deliveryAddress || "");
  }, [customerUser]);

  const totalAmount = cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP"
    }).format(amount);

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setError("");

    if (!customerToken) {
      setError("Please sign in before placing an order.");
      return;
    }

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    if (!contactNumber.trim() || !deliveryAddress.trim()) {
      setError("Please provide your contact number and delivery address.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/orders",
        {
          items: cart.map((item) => ({
            productId: item._id,
            quantity: item.quantity
          })),
          contactNumber: contactNumber.trim(),
          deliveryAddress: deliveryAddress.trim(),
          paymentMethod,
          orderNotes: orderNotes.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${customerToken}`
          }
        }
      );

      if (!response.data?.order) {
        throw new Error("The server did not return the order details.");
      }

      onOrderPlaced(response.data.order);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="checkout-page">
        
      <div className="checkout-container">
        <button
          type="button"
          className="checkout-back-button"
          onClick={onBack}
          disabled={loading}
        >
          ← Back to Cart
        </button>

        <div className="checkout-heading">
          <h1>Checkout</h1>
          <p>Review your information and complete your order.</p>
        </div>

        <form className="checkout-layout" onSubmit={handlePlaceOrder}>
          <section className="checkout-details">
            <div className="checkout-card">
              <h2>Customer Information</h2>

              <div className="checkout-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={customerUser?.name || ""}
                  readOnly
                />
              </div>

              <div className="checkout-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={customerUser?.email || ""}
                  readOnly
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="checkout-contact">
                  Contact Number
                </label>
                <input
                  id="checkout-contact"
                  type="tel"
                  value={contactNumber}
                  onChange={(event) =>
                    setContactNumber(event.target.value)
                  }
                  placeholder="Enter your contact number"
                  maxLength={20}
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="checkout-address">
                  Delivery Address
                </label>
                <textarea
                  id="checkout-address"
                  value={deliveryAddress}
                  onChange={(event) =>
                    setDeliveryAddress(event.target.value)
                  }
                  placeholder="Enter your complete delivery address"
                  maxLength={300}
                  rows={4}
                  required
                />
              </div>
            </div>

            <div className="checkout-card">
              <h2>Payment Method</h2>

              <div className="checkout-payment-option">
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                  />
                  <span>
                    <strong>Cash on Delivery</strong>
                    <small>Pay when your order arrives.</small>
                  </span>
                </label>
              </div>

              <div className="checkout-payment-option">
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online Payment"
                    checked={paymentMethod === "Online Payment"}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                  />
                  <span>
                    <strong>Online Payment</strong>
                    <small>Online payment processing is not currently available.</small>
                  </span>
                </label>
              </div>
            </div>

            <div className="checkout-card">
              <h2>Order Notes</h2>

              <div className="checkout-field">
                <label htmlFor="checkout-notes">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  id="checkout-notes"
                  value={orderNotes}
                  onChange={(event) =>
                    setOrderNotes(event.target.value)
                  }
                  placeholder="Add delivery instructions or other notes..."
                  maxLength={500}
                  rows={3}
                />
              </div>
            </div>
          </section>

          <aside className="checkout-summary">
            <h2>Order Summary</h2>

            <div className="checkout-summary-items">
              {cart.map((item) => (
                <div
                  className="checkout-summary-item"
                  key={item._id}
                >
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      {item.quantity} × {formatPrice(Number(item.price || 0))}
                    </span>
                  </div>

                  <strong>
                    {formatPrice(
                      Number(item.price || 0) *
                        Number(item.quantity || 0)
                    )}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-summary-total">
              <span>Total</span>
              <strong>{formatPrice(totalAmount)}</strong>
            </div>

            {error && (
              <p className="checkout-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="checkout-place-order-button"
              disabled={loading || cart.length === 0}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>

            <p className="checkout-secure-note">
              Your order details will be saved securely.
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default Checkout;
