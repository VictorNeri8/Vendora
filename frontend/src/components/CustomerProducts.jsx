
import { useEffect, useState } from "react";
import api from "../services/api";
import "./CustomerProducts.css";

function CustomerProducts({ customerToken, customerUser, onSignIn }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
   const [cartMessage, setCartMessage] = useState("");
   const [showCheckout, setShowCheckout] = useState(false);
const [isCheckingOut, setIsCheckingOut] = useState(false);

const [checkoutForm, setCheckoutForm] = useState({
  contactNumber: customerUser?.contactNumber || "",
  deliveryAddress: customerUser?.deliveryAddress || "",
  paymentMethod: "COD",
  orderNotes: ""
});
   const [selectedCategory, setSelectedCategory] = useState("all");
 const [cart, setCart] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("vendoraCart")) || [];
  } catch {
    return [];
  }
});


 
  useEffect(() => {
  localStorage.setItem("vendoraCart", JSON.stringify(cart));
}, [cart]);

useEffect(() => {
  if (customerUser) {
    setCheckoutForm((current) => ({
      ...current,
      contactNumber: customerUser.contactNumber || "",
      deliveryAddress: customerUser.deliveryAddress || ""
    }));
  }
}, [customerUser]);


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

  const categories = [
  ...new Set(
    products
      .map((product) => product.category?.trim())
      .filter(Boolean)
  )
].sort((a, b) => a.localeCompare(b));



  const filteredProducts = products
  .filter((product) => {
    const term = search.trim().toLowerCase();

    const matchesSearch =
      product.name?.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term);

    const matchesCategory =
      selectedCategory === "all" ||
      product.category?.trim() === selectedCategory;

    return matchesSearch && matchesCategory;
  })
  .sort((a, b) => {
    if (sortBy === "name-asc") {
      return (a.name || "").localeCompare(b.name || "");
    }

    if (sortBy === "price-asc") {
      return Number(a.price) - Number(b.price);
    }

    if (sortBy === "price-desc") {
      return Number(b.price) - Number(a.price);
    }

    return 0;
  });



  const addToCart = (product) => {
    setCartMessage("");

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item._id === product._id
      );

      const currentQuantity = existingItem
        ? existingItem.quantity
        : 0;

      if (currentQuantity >= Number(product.stockQuantity)) {
        setCartMessage(
          `Only ${product.stockQuantity} unit(s) of ${product.name} are available.`
        );
        return currentCart;
      }

      setCartMessage(`${product.name} added to cart.`);

      if (existingItem) {
        return currentCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

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

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  const formatPrice = (price) =>
    Number(price).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });




    const handleCheckout = () => {
  if (!customerToken) {
    setCartMessage("Please sign in before checking out.");
    if (onSignIn) onSignIn();
    return;
  }

  if (cart.length === 0) {
    setCartMessage("Your cart is empty.");
    return;
  }

  setCartMessage("");
  setShowCheckout(true);
};

const handlePlaceOrder = async (event) => {
  event.preventDefault();

  if (!customerToken || cart.length === 0) {
    setCartMessage("Your cart is empty or your session has expired.");
    return;
  }

  try {
    setIsCheckingOut(true);
    setCartMessage("Processing your order...");

    const response = await api.post(
      "/orders",
      {
        items: cart.map((item) => ({
          productId: item._id,
          quantity: item.quantity
        })),
        contactNumber: checkoutForm.contactNumber,
        deliveryAddress: checkoutForm.deliveryAddress,
        paymentMethod: checkoutForm.paymentMethod,
        orderNotes: checkoutForm.orderNotes
      },
      {
        headers: {
          Authorization: `Bearer ${customerToken}`
        }
      }
    );

    setCart([]);
    setShowCheckout(false);

    setCheckoutForm((current) => ({
      ...current,
      orderNotes: ""
    }));

    setCartMessage(
      response.data?.message || "Order placed successfully!"
    );

    const productsResponse = await api.get("/products");

    setProducts(
      Array.isArray(productsResponse.data)
        ? productsResponse.data
        : []
    );

  } catch (err) {
    setCartMessage(
      err.response?.data?.message ||
        "Checkout failed. Please try again."
    );
  } finally {
    setIsCheckingOut(false);
  }
};




  return (
    <main className="customer-shop">
      <header className="shop-header">
        <div>
          <h1>Vendora Store</h1>
       
        </div>

        <div className="cart-summary">
          <span>🛒 Cart: {cartCount}</span>
          <strong>₱{formatPrice(cartTotal)}</strong>
        </div>
      </header>

<div className="shop-toolbar">
  <div className="shop-search shop-search-inline">
    <input
      type="search"
      placeholder="Search products..."
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      aria-label="Search products"
    />
    <button
  type="button"
  className="clear-filters-btn"
  onClick={() => {
    setSearch("");
    setSelectedCategory("all");
    setSortBy("default");
  }}
>
  Clear Filters
</button>
  </div>

  <div className="shop-filter-group">
   {/*  <label htmlFor="product-category">Category</label> */}
    <select
      id="product-category"
      value={selectedCategory}
      onChange={(event) => setSelectedCategory(event.target.value)}
    >
      <option value="all">All Categories</option>
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  </div>

  <div className="shop-filter-group">
   {/*  <label htmlFor="product-sort">Sort by</label> */}
    <select
      id="product-sort"
      value={sortBy}
      onChange={(event) => setSortBy(event.target.value)}
    >
      <option value="default">Recommended</option>
      <option value="name-asc">Name: A–Z</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
    </select>
  </div>
</div>





      {cartMessage && (
        <p className="cart-message" role="status">
          {cartMessage}
        </p>
      )}

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
          {filteredProducts.map((product) => {
            const cartItem = cart.find(
              (item) => item._id === product._id
            );

            const quantityInCart = cartItem?.quantity || 0;
            const stock = Number(product.stockQuantity) || 0;

            return (
              <article
                className="customer-product-card"
                key={product._id}
              >
                <div className="product-placeholder">
                  {product.image ? (
                   
                   
<img
  src={
    product.image?.startsWith("http")
      ? product.image
      : product.image
        ? `${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "")}${product.image}`
        : ""
  }
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
                    {product.description ||
                      "No description available."}
                  </p>

                  <div className="product-card-footer">
                    <strong>₱{formatPrice(product.price)}</strong>

                    <span
  className={
    stock === 0
      ? "stock-unavailable"
      : stock <= 5
        ? "stock-low"
        : "stock-available"
  }
>
  {stock === 0
    ? "Out of stock"
    : stock <= 5
      ? `Only ${stock} left`
      : `${stock} in stock`}
</span>

                  </div>

                  {quantityInCart > 0 && (
                    <div className="cart-quantity-controls">
                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(product._id, -1)
                        }
                        aria-label={`Remove one ${product.name}`}
                      >
                        −
                      </button>

                      <span>{quantityInCart} in cart</span>

                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(product._id, 1)
                        }
                        disabled={quantityInCart >= stock}
                        aria-label={`Add one ${product.name}`}
                      >
                        +
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    className="add-to-cart-button"
                    onClick={() => addToCart(product)}
                    disabled={stock === 0}
                  >
                    {stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {cart.length > 0 && (
        <section className="cart-panel">
          <h2>Your Shopping Cart</h2>

          {cart.map((item) => (
            <div className="cart-item" key={item._id}>
              <div>
                <strong>{item.name}</strong>
                <p>
                  ₱{formatPrice(item.price)} × {item.quantity}
                </p>
              </div>

              <div className="cart-item-actions">
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

                <button
                  type="button"
                  className="remove-cart-item"
                  onClick={() =>
                    setCart((currentCart) =>
                      currentCart.filter(
                        (cartProduct) =>
                          cartProduct._id !== item._id
                      )
                    )
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="cart-total">
            <strong>Total</strong>
            <strong>₱{formatPrice(cartTotal)}</strong>
          </div>

          {showCheckout && (
  <form className="checkout-form" onSubmit={handlePlaceOrder}>
    <h3>Checkout Details</h3>

    <div className="checkout-field">
      <label htmlFor="checkout-name">Full Name</label>
      <input
        id="checkout-name"
        type="text"
        value={customerUser?.name || ""}
        readOnly
      />
    </div>

    <div className="checkout-field">
      <label htmlFor="checkout-email">Email Address</label>
      <input
        id="checkout-email"
        type="email"
        value={customerUser?.email || ""}
        readOnly
      />
    </div>

    <div className="checkout-field">
      <label htmlFor="checkout-contact">Contact Number</label>
      <input
        id="checkout-contact"
        type="tel"
        value={checkoutForm.contactNumber}
        onChange={(event) =>
          setCheckoutForm({
            ...checkoutForm,
            contactNumber: event.target.value
          })
        }
        maxLength={20}
        required
      />
    </div>

    <div className="checkout-field">
      <label htmlFor="checkout-address">Delivery Address</label>
      <textarea
        id="checkout-address"
        value={checkoutForm.deliveryAddress}
        onChange={(event) =>
          setCheckoutForm({
            ...checkoutForm,
            deliveryAddress: event.target.value
          })
        }
        maxLength={300}
        rows={3}
        required
      />
    </div>

    <div className="checkout-field">
      <label htmlFor="checkout-payment">Payment Method</label>
      <select
        id="checkout-payment"
        value={checkoutForm.paymentMethod}
        onChange={(event) =>
          setCheckoutForm({
            ...checkoutForm,
            paymentMethod: event.target.value
          })
        }
        required
      >
        <option value="COD">COD (Cash on Delivery)</option>
        <option value="Online Payment">Online Payment</option>
      </select>
    </div>

    <div className="checkout-field">
      <label htmlFor="checkout-notes">
        Order Notes (Optional)
      </label>
      <textarea
        id="checkout-notes"
        value={checkoutForm.orderNotes}
        onChange={(event) =>
          setCheckoutForm({
            ...checkoutForm,
            orderNotes: event.target.value
          })
        }
        maxLength={500}
        rows={3}
        placeholder="Additional delivery instructions..."
      />
    </div>

    <div className="checkout-total">
      <span>Order Total</span>
      <strong>₱{formatPrice(cartTotal)}</strong>
    </div>

    <div className="checkout-actions">
      <button
        type="button"
        onClick={() => setShowCheckout(false)}
        disabled={isCheckingOut}
      >
        Back to Cart
      </button>

      <button
        type="submit"
        disabled={isCheckingOut}
      >
        {isCheckingOut ? "Processing..." : "Place Order"}
      </button>
    </div>
  </form>
)}

          {!showCheckout && (
  <button
    type="button"
    className="checkout-button"
    onClick={handleCheckout}
  >
    Proceed to Checkout
  </button>
)}



        </section>
      )}
    </main>
  );
}

export default CustomerProducts;
