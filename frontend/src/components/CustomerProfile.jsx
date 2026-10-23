
import "./CustomerProfile.css";

function CustomerProfile({ customerUser, onBack }) {
  return (
    <main className="customer-profile-page">
      <section className="customer-profile-card">
        <div className="customer-profile-avatar">
          {customerUser?.name?.charAt(0)?.toUpperCase() || "C"}
        </div>

        <h1>My Profile</h1>
        <p className="customer-profile-subtitle">
          Your Vendora account information
        </p>

        <div className="customer-profile-field">
          <span>Full Name</span>
          <strong>{customerUser?.name || "Not available"}</strong>
        </div>

        <div className="customer-profile-field">
          <span>Email Address</span>
          <strong>{customerUser?.email || "Not available"}</strong>
        </div>

        <div className="customer-profile-field">
          <span>Account Type</span>
          <strong>Customer</strong>
        </div>

        <button type="button" onClick={onBack}>
          Back to Store
        </button>
      </section>
    </main>
  );
}

export default CustomerProfile;
