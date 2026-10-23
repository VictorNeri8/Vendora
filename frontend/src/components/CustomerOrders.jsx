
import { useEffect, useState } from "react";
import api from "../services/api";
import "./CustomerOrders.css";

function CustomerOrders({ customerToken, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await api.get("/orders", {
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
        });

        const data = response.data;
        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    if (customerToken) {
      loadOrders();
    } else {
      setError("Please sign in to view your orders.");
      setLoading(false);
    }
  }, [customerToken]);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime())
      ? "Date unavailable"
      : parsedDate.toLocaleString();
  };

  return (
    <main className="customer-orders-page">
      <div className="customer-orders-header">
        <div>
          <h1>My Orders</h1>
          <p>View your purchases and order status.</p>
        </div>

        <button type="button" onClick={onBack}>
          Back to Store
        </button>
      </div>

      {loading ? (
        <p className="orders-info">Loading your orders...</p>
      ) : error ? (
        <p className="orders-error">{error}</p>
      ) : orders.length === 0 ? (
        <section className="orders-empty">
          <h2>No orders yet</h2>
          <p>Your purchases will appear here after checkout.</p>
          <button type="button" onClick={onBack}>
            Start Shopping
          </button>
        </section>
      ) : (
        <div className="customer-orders-list">
          {orders.map((order) => (
            <article className="customer-order-card" key={order._id}>
              <div className="customer-order-top">
                <div>
                  <h2>Order #{order._id?.slice(-8).toUpperCase()}</h2>
                  <p>{formatDate(order.createdAt)}</p>
                </div>

                <span className={`order-status status-${String(order.status || "confirmed").toLowerCase()}`}>
                  {order.status || "Confirmed"}
                </span>
              </div>

              <div className="customer-order-items">
                {(order.items || []).map((item, index) => (
                  <div
                    className="customer-order-item"
                    key={item._id || item.product?._id || index}
                  >
                    <span>
                      {item.product?.name ||
                        item.productName ||
                        item.name ||
                        "Product"}
                      {" × "}
                      {item.quantity}
                    </span>

                    <span>
                      ₱
                      {(
                        Number(item.price || item.unitPrice || 0) *
                        Number(item.quantity || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="customer-order-total">
                <span>Order Total</span>
                <strong>
                  ₱{Number(order.totalAmount ?? order.total ?? 0).toFixed(2)}
                </strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default CustomerOrders;
