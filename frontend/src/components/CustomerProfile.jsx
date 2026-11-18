
import { useEffect, useState } from "react";
import api from "../services/api";
import "./CustomerProfile.css";

function CustomerProfile({ customerUser, onBack, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    name: customerUser?.name || "",
    email: customerUser?.email || "",
    contactNumber: customerUser?.contactNumber || "",
    deliveryAddress: customerUser?.deliveryAddress || ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData({
      name: customerUser?.name || "",
      email: customerUser?.email || "",
      contactNumber: customerUser?.contactNumber || "",
      deliveryAddress: customerUser?.deliveryAddress || ""
    });
  }, [customerUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = sessionStorage.getItem("vendoraCustomerToken");

      if (!token) {
        setError("Your session has expired. Please sign in again.");
        return;
      }

      const response = await api.put(
        "/auth/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const updatedUser = response.data.user;

      onProfileUpdated(updatedUser);
      setMessage("Your profile has been updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="customer-profile-page">
      <section className="customer-profile-card">
        <div className="customer-profile-avatar">
          {formData.name?.charAt(0)?.toUpperCase() || "C"}
        </div>

        <h1>My Profile</h1>

        <p className="customer-profile-subtitle">
          Manage your Vendora account information
        </p>

        <form onSubmit={handleSubmit}>
          <div className="customer-profile-field">
            <label htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={100}
              required
            />
          </div>

          <div className="customer-profile-field">
            <label htmlFor="profile-email">Email Address</label>
            <input
              id="profile-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="customer-profile-field">
            <label htmlFor="profile-contact">Contact Number</label>
            <input
              id="profile-contact"
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              maxLength={20}
              required
            />
          </div>

          <div className="customer-profile-field">
            <label htmlFor="profile-address">Delivery Address</label>
            <textarea
              id="profile-address"
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              maxLength={300}
              rows={4}
              required
            />
          </div>

          <div className="customer-profile-field">
            <span>Account Type</span>
            <strong>Customer</strong>
          </div>

          {error && (
            <p className="customer-profile-error">{error}</p>
          )}

          {message && (
            <p className="customer-profile-success">{message}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <button
          type="button"
          className="customer-profile-back"
          onClick={onBack}
        >
          Back to Store
        </button>
      </section>
    </main>
  );
}

export default CustomerProfile;
