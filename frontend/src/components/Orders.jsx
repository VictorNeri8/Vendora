
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [currentPage, setCurrentPage] = useState(1);
const ordersPerPage = 10;

  const pendingOrders = orders.filter(
  (order) => order.status === "pending"
).length;

const confirmedOrders = orders.filter(
  (order) => order.status === "confirmed"
).length;

const cancelledOrders = orders.filter(
  (order) => order.status === "cancelled"
).length;

const filteredOrders = orders.filter((order) => {
  const search = searchTerm.toLowerCase();

  const matchesSearch =
    (order.customer?.name || "").toLowerCase().includes(search) ||
    (order.customer?.email || "").toLowerCase().includes(search) ||
    order._id.toLowerCase().includes(search);

  const matchesStatus =
    statusFilter === "all" || order.status === statusFilter;

  return matchesSearch && matchesStatus;
});

const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

const paginatedOrders = filteredOrders.slice(
  (currentPage - 1) * ordersPerPage,
  currentPage * ordersPerPage
);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("vendoraToken");

      const response = await api.get("/orders", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  


const cancelOrder = async () => {
  if (!selectedOrder) return;

  try {
    const token = sessionStorage.getItem("vendoraToken");

    await api.patch(
      `/orders/${selectedOrder._id}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setSelectedOrder(null);
    await loadOrders();
  } catch (err) {
    alert(
      err.response?.data?.message ||
      "Unable to cancel this order."
    );
  }
};





  useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, statusFilter]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatPrice = (amount) =>
    `₱${Number(amount ?? 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  return (
    <section className="orders-section">
        <div className="order-stats-grid">
  <article className="stat-card">
    <div>
      <p>Total Orders</p>
      <h2>{orders.length}</h2>
    </div>
  </article>

  <article className="stat-card">
    <div>
      <p>Pending</p>
      <h2>{pendingOrders}</h2>
    </div>
  </article>

  <article className="stat-card">
    <div>
      <p>Confirmed</p>
      <h2>{confirmedOrders}</h2>
    </div>
  </article>

  <article className="stat-card">
    <div>
      <p>Cancelled</p>
      <h2>{cancelledOrders}</h2>
    </div>
  </article>
</div>
      <div className="orders-heading">
  <div>
    <h2>Orders</h2>
    <p>View and monitor customer orders.</p>
  </div>

  <div className="orders-heading-actions">
    <button onClick={loadOrders} disabled={loading}>
      {loading ? "Loading..." : "Refresh Orders"}
    </button>

    <button
      onClick={() => {
        const token = sessionStorage.getItem("vendoraToken");

        api.get("/reports/sales", {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: "blob"
        }).then((response) => {
          const url = window.URL.createObjectURL(
            new Blob([response.data])
          );

          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "vendora-sales-report.xlsx");
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        }).catch(() => {
          setError("Unable to export the sales report.");
        });
      }}
    >
      Export to Excel
    </button>
  </div>
</div>

      <div className="orders-filters">
  <input
    type="text"
    placeholder="Search customer or order ID..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="all">All Statuses</option>
    <option value="pending">Pending</option>
    <option value="confirmed">Confirmed</option>
    <option value="cancelled">Cancelled</option>
  </select>
</div>

      {error && <p className="inventory-message error-message">{error}</p>}

      {loading ? (
        <p className="inventory-message">Loading orders...</p>
      ) : !error && filteredOrders.length === 0 ? (
  <p className="inventory-message">
    {orders.length === 0
      ? "No orders found."
      : "No orders match your search or status filter."}
  </p>
      ) : (
        !error && (
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {paginatedOrders.map((order) => (
                 <tr
  key={order._id}
  className="clickable-order-row"
  onClick={() => setSelectedOrder(order)}
>
                    <td>{order._id.slice(-8).toUpperCase()}</td>
                    <td>
                      <strong>
                        {order.customer?.name || "Unknown customer"}
                      </strong>
                      <br />
                      <small>{order.customer?.email || "—"}</small>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      {Array.isArray(order.items)
                        ? order.items.reduce(
                            (sum, item) => sum + Number(item.quantity ?? 0),
                            0
                          )
                        : 0}
                    </td>
                    <td>{formatPrice(order.totalAmount)}</td>
                    <td>
  <span
    className={`order-status-badge ${
      order.status === "confirmed"
        ? "order-status-confirmed"
        : order.status === "pending"
        ? "order-status-pending"
        : order.status === "cancelled"
        ? "order-status-cancelled"
        : "order-status-unknown"
    }`}
  >
    {order.status || "Unknown"}
  </span>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {!loading && !error && filteredOrders.length > 0 && (
  <div className="orders-pagination">
    <p className="inventory-count">
      Showing {(currentPage - 1) * ordersPerPage + 1}–
      {Math.min(currentPage * ordersPerPage, filteredOrders.length)} of{" "}
      {filteredOrders.length} matching orders
    </p>

    {totalPages > 1 && (
      <div className="pagination-controls">
        <button
          onClick={() => setCurrentPage((page) => page - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((page) => page + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    )}
  </div>
)}

      {selectedOrder && (
  <div
  className="order-details-overlay"
  onClick={() => setSelectedOrder(null)}
>
    <div
      className="order-details-panel"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="order-details-heading">
        <div>
          <h2>Order Details</h2>
          <p>Order #{selectedOrder._id.slice(-8).toUpperCase()}</p>
        </div>

        <button
          className="order-details-close"
          onClick={() => setSelectedOrder(null)}
        >
          ×
        </button>
      </div>

      <div className="order-details-info">
        <p>
          <strong>Customer:</strong>{" "}
          {selectedOrder.customer?.name || "Unknown customer"}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {selectedOrder.customer?.email || "—"}
        </p>

        <p>
          <strong>Order Date:</strong>{" "}
          {formatDate(selectedOrder.createdAt)}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          <span className="order-status-badge">
            {selectedOrder.status || "Unknown"}
          </span>
        </p>
      </div>

      <h3>Products Ordered</h3>

      {Array.isArray(selectedOrder.items) &&
      selectedOrder.items.length > 0 ? (
        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {selectedOrder.items.map((item, index) => {
                const quantity = Number(item.quantity ?? 0);
                const price = Number(item.price ?? 0);

                return (
                  <tr key={item._id || index}>
                    <td>
                      {item.name ||
                        item.product?.name ||
                        "Product"}
                    </td>
                    <td>{quantity}</td>
                    <td>{formatPrice(price)}</td>
                    <td>{formatPrice(quantity * price)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No product details available.</p>
      )}

      <div className="order-details-total">
        <strong>Total Amount</strong>
        <strong>{formatPrice(selectedOrder.totalAmount)}</strong>
      </div>

      {["pending", "confirmed"].includes(selectedOrder.status) && (
  <button
  className="cancel-order-button"
  onClick={() => setShowCancelConfirmation(true)}
>
  Cancel Order
</button>

)}

{showCancelConfirmation && (
  <div className="cancel-confirmation">
    <p>Are you sure you want to cancel this order?</p>
    <p>The inventory will be restored.</p>

    <div className="cancel-confirmation-actions">
      <button
        type="button"
        onClick={() => setShowCancelConfirmation(false)}
      >
        Keep Order
      </button>

      <button
        type="button"
        className="confirm-cancel-button"
        onClick={cancelOrder}
      >
        Confirm Cancellation
      </button>
    </div>
  </div>
)}

    </div>
  </div>
)}
    </section>
  );
}

export default Orders;
