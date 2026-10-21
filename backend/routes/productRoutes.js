
const express = require("express");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const allowedFields = [
  "name",
  "description",
  "category",
  "price",
  "barcode",
  "stockQuantity",
  "lowStockThreshold"
];

// GET /api/products/low-stock
// Must appear before /:id
router.get("/low-stock", protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find({
      $expr: {
        $lte: ["$stockQuantity", "$lowStockThreshold"]
      }
    }).sort({ stockQuantity: 1 });

    res.json(products);
  } catch (error) {
    console.error("Low-stock query failed:", error.message);
    res.status(500).json({ message: "Failed to retrieve low-stock products" });
  }
});

// GET /api/products?q=mouse&category=Accessories
router.get("/", async (req, res) => {
  try {
    const { q, category } = req.query;
    const filter = {};

    if (q !== undefined) {
      if (typeof q !== "string" || q.length > 100) {
        return res.status(400).json({ message: "Invalid search query" });
      }

      const search = new RegExp(escapeRegex(q.trim()), "i");

      filter.$or = [
        { name: search },
        { description: search },
        { category: search },
        { barcode: search }
      ];
    }

    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        return res.status(400).json({ message: "Invalid category" });
      }

      filter.category = category.trim();
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Product retrieval failed:", error.message);
    res.status(500).json({ message: "Failed to retrieve products" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Product retrieval failed:", error.message);
    res.status(500).json({ message: "Failed to retrieve product" });
  }
});

// POST /api/products
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      barcode,
      stockQuantity,
      lowStockThreshold
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0 ||
      (description !== undefined && typeof description !== "string") ||
      (barcode !== undefined && typeof barcode !== "string") ||
      (stockQuantity !== undefined &&
        (!Number.isInteger(stockQuantity) || stockQuantity < 0)) ||
      (lowStockThreshold !== undefined &&
        (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0))
    ) {
      return res.status(400).json({
        message: "Please provide valid product information"
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description,
      category: category.trim(),
      price,
      barcode,
      stockQuantity,
      lowStockThreshold
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Product creation failed:", error.message);
    res.status(400).json({ message: "Failed to create product" });
  }
});

// PUT /api/products/:id
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const fields = Object.keys(req.body);

    if (
      fields.length === 0 ||
      fields.some((field) => !allowedFields.includes(field))
    ) {
      return res.status(400).json({
        message: "Empty update or unsupported product field"
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    for (const field of fields) {
      product[field] = req.body[field];
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error("Product update failed:", error.message);
    res.status(400).json({
      message: "Failed to update product. Check the supplied values."
    });
  }
});

// DELETE /api/products/:id
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Product deletion failed:", error.message);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;
