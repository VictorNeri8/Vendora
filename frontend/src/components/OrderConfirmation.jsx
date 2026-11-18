
import "./OrderConfirmation.css";

function OrderConfirmation({ order, onContinueShopping }) {
  if (!order) {
    return (
      <main className="confirmation-page">
        <div className="confirmation-card">
          <h1>Order details unavailable</h1>
          <p>Please check your order history for the latest status.</p>
          <button type="button" onClick={onContinueShopping}>
            Return to Store
          </button>
        </div>
      </main>
    );
  }

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP"
    }).format(Number(amount || 0));

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short"
      })
    : "Just now";

  return (
    <main className="confirmation-page">
      <div className="confirmation-container">
        <div className="confirmation-success">
          <div className="confirmation-check">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p>
            Thank you for shopping with Vendora. Your order has been
            received and confirmed.
          </p>
        </div>

        <section className="confirmation-card">
          <div className="confirmation-header">
            <div>
              <h2>Order Receipt</h2>
              <p>Order #{String(order._id || "").toUpperCase()}</p>
            </div>
            <span className="confirmation-status">
              {order.status || "Confirmed"}
            </span>
          </div>

          <div className="confirmation-info-grid">
            <div>
              <span>Order Date</span>
              <strong>{orderDate}</strong>
            </div>
            <div>
              <span>Payment Method</span>
              <strong>
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : order.paymentMethod}
              </strong>
            </div>
          </div>

          <div className="confirmation-divider" />

          <h3>Customer Information</h3>

          <div className="confirmation-customer-info">
            <p>
              <span>Name</span>
              <strong>{order.customerName}</strong>
            </p>
            <p>
              <span>Email</span>
              <strong>{order.customerEmail}</strong>
            </p>
            <p>
              <span>Contact Number</span>
              <strong>{order.contactNumber}</strong>
            </p>
            <p>
              <span>Delivery Address</span>
              <strong>{order.deliveryAddress}</strong>
            </p>
          </div>

          <div className="confirmation-divider" />

          <h3>Ordered Items</h3>

          <div className="confirmation-items">
            {(order.items || []).map((item, index) => (
              <div
                className="confirmation-item"
                key={item._id || item.product || index}
              >
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.quantity} × {formatPrice(item.price)}
                  </span>
                </div>
                <strong>
                  {formatPrice(
                    Number(item.price || 0) * Number(item.quantity || 0)
                  )}
                </strong>
              </div>
            ))}
          </div>

          {order.orderNotes && (
            <>
              <div className="confirmation-divider" />
              <h3>Order Notes</h3>
              <p className="confirmation-notes">{order.orderNotes}</p>
            </>
          )}

          <div className="confirmation-total">
            <span>Total Amount</span>
            <strong>{formatPrice(order.totalAmount)}</strong>
          </div>

          <p className="confirmation-thank-you">
            Please keep this receipt for your reference.
          </p>
        </section>

        <button
          type="button"
          className="confirmation-continue-button"
          onClick={onContinueShopping}
        >
          Continue Shopping
        </button>
      </div>
    </main>
  );
}

export default OrderConfirmation;
