

import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./Dashboard.css";
import ProductForm from "./ProductForm";
import Orders from "./Orders";


function Dashboard({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
const [editingProduct, setEditingProduct] = useState(null);
const [savingProduct, setSavingProduct] = useState(false);
const [productActionMessage, setProductActionMessage] = useState("");
const [searchTerm, setSearchTerm] = useState("");
const [selectedCategory, setSelectedCategory] = useState("All");
const [selectedStockStatus, setSelectedStockStatus] = useState("All");
const [currentPage, setCurrentPage] = useState(1);
const productsPerPage = 10;
const [activeSection, setActiveSection] = useState("Dashboard");



  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductError("");

    try {
      const response = await api.get("/products", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("vendoraToken")}`
        }
      });

      // Supports either a plain array or { products: [...] }.
      const data = response.data;
      const productList = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : [];

      setProducts(productList);
    } catch (error) {
      console.error("Product loading error:", error);
      setProductError(
        error.response?.data?.message || "Could not load products."
      );
    } finally {
      setLoadingProducts(false);
    }
  }, []);



const handleSaveProduct = async (productData) => {
  setSavingProduct(true);
  setProductActionMessage("");

  try {
    const token = sessionStorage.getItem("vendoraToken");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    // Remove the image file from the regular product data.
    const { imageFile, ...productFields } = productData;

    let productId;

    if (editingProduct) {
      const response = await api.put(
        `/products/${editingProduct._id}`,
        productFields,
        config
      );

      productId = response.data._id;
    } else {
      const response = await api.post(
        "/products",
        productFields,
        config
      );

      productId = response.data._id;
    }

    // Upload the selected image separately.
    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);

      await api.post(
  `/products/${productId}/image`,
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  }
);
    }

    setProductActionMessage(
      editingProduct
        ? "Product updated successfully."
        : "Product added successfully."
    );

    setShowProductForm(false);
    setEditingProduct(null);

    await loadProducts();
  } catch (error) {
    setProductActionMessage(
      error.response?.data?.message || "Failed to save product."
    );
  } finally {
    setSavingProduct(false);
  }
};


const handleDeleteProduct = async (product) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${product.name}"?`
  );

  if (!confirmed) return;

  setProductActionMessage("");

  try {
    const token = sessionStorage.getItem("vendoraToken");

    await api.delete(`/products/${product._id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setProductActionMessage("Product deleted successfully.");
    await loadProducts();
  } catch (error) {
    setProductActionMessage(
      error.response?.data?.message || "Failed to delete product."
    );
  }
};
  
//


  useEffect(() => {
    loadProducts();
  }, [loadProducts]);






  const downloadReport = async (reportType) => {
    try {
      const token = sessionStorage.getItem("vendoraToken");

      const response = await api.get(`/reports/${reportType}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob"
      });

      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download =
        reportType === "inventory"
          ? "vendora_inventory.xlsx"
          : "vendora_sales.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Report download error:", error);
      alert("Failed to download report. Please check your login.");
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 0) {
      return { label: "Out of stock", className: "stock-out" };
    }

    if (quantity <= 5) {
      return { label: "Low stock", className: "stock-low" };
    }

    return { label: "In stock", className: "stock-good" };
  };


const totalProducts = products.length;

const lowStockProducts = products.filter((product) => {
  const quantity = Number(product.stockQuantity ?? 0);
  const threshold = Number(product.lowStockThreshold ?? 5);

  return quantity > 0 && quantity <= threshold;
}).length;

const outOfStockProducts = products.filter(
  (product) => Number(product.stockQuantity ?? 0) <= 0
).length;

const categories = [
  "All",
  ...new Set(
    products
      .map((product) => product.category)
      .filter(Boolean)
  )
];


const filteredProducts = products.filter((product) => {
  const search = searchTerm.toLowerCase();

  const matchesSearch = [
    product.name,
    product.category,
    product.barcode
  ]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(search));

  const matchesCategory =
    selectedCategory === "All" ||
    product.category === selectedCategory;

  const quantity = Number(product.stockQuantity ?? 0);
  const threshold = Number(product.lowStockThreshold ?? 5);

  const matchesStockStatus =
    selectedStockStatus === "All" ||
    (selectedStockStatus === "Low Stock" &&
      quantity > 0 &&
      quantity <= threshold) ||
    (selectedStockStatus === "Out of Stock" && quantity <= 0) ||
    (selectedStockStatus === "In Stock" && quantity > threshold);

  return matchesSearch && matchesCategory && matchesStockStatus;
});

const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

const startIndex = (currentPage - 1) * productsPerPage;

const paginatedProducts = filteredProducts.slice(
  startIndex,
  startIndex + productsPerPage
);

useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, selectedCategory, selectedStockStatus]);



  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">V</span>
          <span>Vendora</span>
        </div>

        <div className="sidebar-label">MAIN MENU</div>

<div
  className={`sidebar-item ${
    activeSection === "Dashboard" ? "active" : ""
  }`}
  onClick={() => setActiveSection("Dashboard")}
>
  Dashboard
</div>

<div
  className={`sidebar-item ${
    activeSection === "Inventory & Reports" ? "active" : ""
  }`}
  onClick={() => setActiveSection("Inventory & Reports")}
>
  Inventory & Reports
</div>

<div
  className={`sidebar-item ${
    activeSection === "Orders" ? "active" : ""
  }`}
  onClick={() => setActiveSection("Orders")}
>
  Orders
</div>

        <button className="logout-button" onClick={onLogout}>
          Sign out
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage your store inventory and reports.</p>
          </div>

          <div className="admin-profile">
            <div className="avatar">A</div>
            <div>
              <strong>{user?.name || "Administrator"}</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

    {activeSection === "Orders" ? (
  <Orders />
) : activeSection === "Inventory & Reports" ? (
  <>
{}




        <section className="inventory-section">
            {showProductForm && (
  <ProductForm
    product={editingProduct}
    onSave={handleSaveProduct}
    onCancel={() => {
      setShowProductForm(false);
      setEditingProduct(null);
    }}
    saving={savingProduct}
  />
)}

{productActionMessage && (
  <p className="inventory-message">{productActionMessage}</p>
)}
          
<div className="inventory-heading">
  <div>
    <h2>Product Inventory</h2>
    <p>Current products and stock levels</p>
  </div>

  <div className="inventory-actions">
    <button
      className="add-product-button"
      onClick={() => {
        setEditingProduct(null);
        setProductActionMessage("");
        setShowProductForm(true);
      }}
    >
      + Add Product
    </button>

    <button
      className="refresh-button"
      onClick={loadProducts}
      disabled={loadingProducts}
    >
      {loadingProducts ? "Loading..." : "Refresh"}
    </button>
  </div>
</div>

<div className="inventory-filters">
  <input
    type="search"
    className="product-search"
    placeholder="Search products, categories, or barcodes..."
    value={searchTerm}
    onChange={(event) => setSearchTerm(event.target.value)}
  />

  <select
    className="category-filter"
    value={selectedCategory}
    onChange={(event) => setSelectedCategory(event.target.value)}
  >
    
    {categories.map((category) => (
      <option key={category} value={category}>
        {category}
      </option>
    ))}
  </select>

<select
  className="stock-filter"
  value={selectedStockStatus}
  onChange={(event) => setSelectedStockStatus(event.target.value)}
>
  <option value="All">All Stock Statuses</option>
  <option value="In Stock">In Stock</option>
  <option value="Low Stock">Low Stock</option>
  <option value="Out of Stock">Out of Stock</option>
</select>

</div>




          {productError && (
            <div className="inventory-message error-message">
              {productError}
            </div>
          )}

          {loadingProducts ? (
            <p className="inventory-message">Loading products...</p>
          ) : !productError && products.length === 0 ? (
            <p className="inventory-message">
  {products.length === 0
    ? "No products found."
    : "No products match your search or category."}
</p>
          ) : (
            !productError && (
               
              <div className="inventory-table-wrapper">

                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedProducts.map((product) => {
                      const status = getStockStatus(
                        Number(product.stockQuantity ?? 0)
                      );

                      return (
                        <tr key={product._id}>
                          <td>
                            <strong>{product.name}</strong>
                          </td>
                          <td>
                            ₱{Number(product.price ?? 0).toLocaleString(
                              "en-PH",
                              { minimumFractionDigits: 2 }
                            )}
                          </td>
                          <td>{product.stockQuantity ?? 0}</td>
                          <td>
                            <span
                              className={`stock-badge ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td>
  <div className="product-row-actions">
    <button
      className="edit-product-button"
      onClick={() => {
        setEditingProduct(product);
        setProductActionMessage("");
        setShowProductForm(true);
      }}
    >
      Edit
    </button>

    <button
      className="delete-product-button"
      onClick={() => handleDeleteProduct(product)}
    >
      Delete
    </button>
  </div>
</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
  
            )

          )}
          
          {totalPages > 1 && (
  <div className="pagination-controls">
    <button
      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
      disabled={currentPage === 1}
    >
      Previous
    </button>

    <span>
      Page {currentPage} of {totalPages}
    </span>

    <button
      onClick={() =>
        setCurrentPage((page) => Math.min(totalPages, page + 1))
      }
      disabled={currentPage === totalPages}
    >
      Next
    </button>
  </div>
)}


          {!loadingProducts && !productError && products.length > 0 && (
            <p className="inventory-count">
              Showing {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""}
            </p>
          )}
        </section>

         </>
) : (
  <>
    <section className="welcome-section">
      <h2>Welcome back!</h2>
      <p>Here's an overview of your store inventory.</p>
    </section>

    <section className="stats-grid">
      <article className="stat-card">
        <div className="stat-icon total-icon">▦</div>
        <div>
          <p>Total Products</p>
          <h2>{totalProducts}</h2>
        </div>
      </article>

      <article className="stat-card">
        <div className="stat-icon low-icon">!</div>
        <div>
          <p>Low Stock</p>
          <h2>{lowStockProducts}</h2>
        </div>
      </article>

      <article className="stat-card">
        <div className="stat-icon out-icon">×</div>
        <div>
          <p>Out of Stock</p>
          <h2>{outOfStockProducts}</h2>
        </div>
      </article>
    </section>

    <section className="report-grid">
      <article className="report-card">
        <div className="report-icon inventory-icon">▤</div>
        <h3>Inventory Report</h3>
        <p>Export product names, prices, and stock quantities.</p>
        <button onClick={() => downloadReport("inventory")}>
          Download Excel
        </button>
      </article>

      <article className="report-card">
        <div className="report-icon sales-icon">₱</div>
        <h3>Sales Report</h3>
        <p>Export order records, customers, statuses, and totals.</p>
        <button onClick={() => downloadReport("sales")}>
          Download Excel
        </button>
      </article>
    </section>
  </>
)}
      </main>
    </div>
  );
}

export default Dashboard;
