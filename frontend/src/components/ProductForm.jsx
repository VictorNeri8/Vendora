
import { useEffect, useState } from "react";

function ProductForm({ product, onSave, onCancel, saving }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [barcode, setBarcode] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    setName(product?.name || "");
    setDescription(product?.description || "");
    setCategory(product?.category || "");
    setPrice(product?.price ?? "");
    setBarcode(product?.barcode || "");
    setStockQuantity(product?.stockQuantity ?? 0);
    setLowStockThreshold(product?.lowStockThreshold ?? 5);
    setImageFile(null);

   setImagePreview(
  product?.image
    ? product.image.startsWith("http")
      ? product.image
      : `http://localhost:5000${product.image}`
    : ""
);


  }, [product]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Please select a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSave({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      price: Number(price),
      barcode: barcode.trim(),
      stockQuantity: Number(stockQuantity),
      lowStockThreshold: Number(lowStockThreshold),
      imageFile
    });
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h3>{product ? "Edit Product" : "Add Product"}</h3>

      <label htmlFor="product-name">Product Name *</label>
      <input
        id="product-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        maxLength={100}
      />

      <label htmlFor="product-category">Category *</label>
      <input
        id="product-category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        placeholder="e.g. Electronics"
        required
      />

      <label htmlFor="product-description">Description</label>
      <textarea
        id="product-description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Optional product description"
        rows={3}
      />

      <label htmlFor="product-price">Price (₱) *</label>
      <input
        id="product-price"
        type="number"
        min="0"
        step="0.01"
        value={price}
        onChange={(event) => setPrice(event.target.value)}
        required
      />

      <label htmlFor="product-barcode">Barcode</label>
      <input
        id="product-barcode"
        value={barcode}
        onChange={(event) => setBarcode(event.target.value)}
        placeholder="Optional"
      />

      <label htmlFor="product-stock">Stock Quantity</label>
      <input
        id="product-stock"
        type="number"
        min="0"
        step="1"
        value={stockQuantity}
        onChange={(event) => setStockQuantity(event.target.value)}
        required
      />

      <label htmlFor="product-threshold">Low Stock Alert Threshold</label>
      <input
        id="product-threshold"
        type="number"
        min="0"
        step="1"
        value={lowStockThreshold}
        onChange={(event) => setLowStockThreshold(event.target.value)}
        required
      />

      <label htmlFor="product-image">Product Image</label>
      <input
        id="product-image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageChange}
      />

      {imagePreview && (
        <div className="product-image-preview">
          <img
            src={imagePreview}
            alt="Product preview"
            style={{
              width: "160px",
              height: "160px",
              objectFit: "contain",
              borderRadius: "8px"
            }}
          />
        </div>
      )}

      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Product"}
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
