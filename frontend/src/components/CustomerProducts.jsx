
import { useEffect, useState } from "react";
import api from "../services/api";
import "./CustomerProducts.css";

function CustomerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products");
        setProducts(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load products. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const term = search.trim().toLowerCase();

    return (
      product.name?.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term)
    );
  });

  return (
    <main className="customer-shop">
      <header className="shop-header">
        <div>
          <h1>Vendora Store</h1>
          <p>Browse our available products.</p>
        </div>
      </header>

      <div className="shop-search">
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search products"
        />
      </div>

      {loading ? (
        <p className="shop-message">Loading products...</p>
      ) : error ? (
        <p className="shop-message shop-error">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="shop-message">
          {products.length === 0
            ? "No products are available yet."
            : "No products match your search."}
        </p>
      ) : (
        <section className="product-grid">
          {filteredProducts.map((product) => (
            <article className="customer-product-card" key={product._id}>
              <div className="product-placeholder">
  {product.image ? (
    <img
      src={`http://localhost:5000${product.image}`}
      alt={product.name}
      className="customer-product-image"
    />
  ) : (
    product.name?.charAt(0)?.toUpperCase() || "P"
  )}
</div>

              <div className="customer-product-info">
                <p className="product-category">
                  {product.category}
                </p>

                <h2>{product.name}</h2>

                <p className="product-description">
                  {product.description || "No description available."}
                </p>

                <div className="product-card-footer">
                  <strong>
                    ₱{Number(product.price).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </strong>

                  <span
                    className={
                      product.stockQuantity > 0
                        ? "stock-available"
                        : "stock-unavailable"
                    }
                  >
                    {product.stockQuantity > 0
                      ? `${product.stockQuantity} in stock`
                      : "Out of stock"}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default CustomerProducts;
