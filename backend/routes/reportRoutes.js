
const express = require("express");
const XLSX = require("xlsx");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Export product inventory to Excel
router.get("/inventory", protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find().lean();

    const rows = products.map((product) => ({
      "Product ID": product._id.toString(),
      "Product Name": product.name,
      Price: product.price,
      "Stock Quantity": product.stockQuantity,
      "Created At": product.createdAt
        ? new Date(product.createdAt).toLocaleDateString()
        : ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx"
    });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="vendora_inventory.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(buffer);
  } catch (error) {
    console.error("Inventory export error:", error);
    return res.status(500).json({
      message: "Failed to export inventory report."
    });
  }
});

// Export order and sales records to Excel
router.get("/sales", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const rows = orders.map((order) => ({
      "Order ID": order._id.toString(),
      "Customer Name": order.customer?.name || "Deleted customer",
      "Customer Email": order.customer?.email || "",
      Date: order.createdAt
        ? new Date(order.createdAt).toLocaleString()
        : "",
      Status: order.status,
      "Total Amount": order.totalAmount,
      Items: order.items
        .map((item) => `${item.name} x ${item.quantity}`)
        .join(", ")
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx"
    });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="vendora_sales.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(buffer);
  } catch (error) {
    console.error("Sales export error:", error);
    return res.status(500).json({
      message: "Failed to export sales report."
    });
  }
});

module.exports = router;
