const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// GET: Retrieve all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve products" });
  }
});

// GET: Retrieve one product
router.get("/:id", async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve product" });
  }
});

// POST: Create a product
router.post("/", async (req, res) => {
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
      name,
      description,
      category,
      price,
      barcode,
      stockQuantity,
      lowStockThreshold
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Failed to create product" });
  }
});

// PUT: Update a product
router.put("/:id", async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: "Failed to update product" });
  }
});

// DELETE: Delete a product
router.delete("/:id", async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;