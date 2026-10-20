
const express = require("express");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Customer creates an order
router.post("/", protect, async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "At least one product is required."
      });
    }

    // Validate and combine duplicate product IDs
    const quantities = new Map();

    for (const item of items) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: "Each item needs a valid productId and positive whole-number quantity."
        });
      }

      const id = item.productId;
      const combined = (quantities.get(id) || 0) + item.quantity;

      if (!Number.isSafeInteger(combined)) {
        return res.status(400).json({
          message: "Invalid total quantity."
        });
      }

      quantities.set(id, combined);
    }

    const orderItems = [];
    let totalAmount = 0;

    // Transactions require a MongoDB replica set or sharded cluster.
    await session.withTransaction(async () => {
      orderItems.length = 0;
      totalAmount = 0;

      for (const [productId, quantity] of quantities) {
        const product = await Product.findById(productId).session(session);

        if (!product) {
          const error = new Error("A requested product was not found.");
          error.status = 404;
          throw error;
        }

        // Atomically deduct stock only when enough stock remains.
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: productId,
            stockQuantity: { $gte: quantity }
          },
          {
            $inc: { stockQuantity: -quantity }
          },
          {
            new: true,
            session,
            runValidators: true
          }
        );

        if (!updatedProduct) {
          const error = new Error(
            `Insufficient stock for ${product.name}.`
          );
          error.status = 409;
          throw error;
        }

        const lineTotal = product.price * quantity;

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity
        });

        totalAmount += lineTotal;
      }

      if (!Number.isFinite(totalAmount)) {
        throw new Error("Order total is invalid.");
      }

      await Order.create(
        [
          {
            customer: req.user._id,
            items: orderItems,
            totalAmount: Number(totalAmount.toFixed(2)),
            status: "confirmed"
          }
        ],
        { session }
      );
    });

    const order = await Order.findOne({
      customer: req.user._id
    })
      .sort({ createdAt: -1 })
      .populate("customer", "name email");

    return res.status(201).json({
      message: "Order confirmed and inventory updated.",
      order
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    return res.status(error.status || 500).json({
      message: error.status
        ? error.message
        : "Unable to create order. Check that MongoDB transactions are supported."
    });
  } finally {
    await session.endSession();
  }
});

// Customer sees their own orders; admin can see all orders
router.get("/", protect, async (req, res) => {
  try {
    const filter =
      req.user.role === "admin" ? {} : { customer: req.user._id };

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("customer", "name email");

    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error.message);
    res.status(500).json({ message: "Unable to retrieve orders." });
  }
});

// Admin confirms a pending order
router.patch("/:id/confirm", protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, status: "pending" },
      { $set: { status: "confirmed" } },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Pending order not found."
      });
    }

    res.json({ message: "Order confirmed.", order });
  } catch (error) {
    console.error("Confirm order error:", error.message);
    res.status(500).json({ message: "Unable to confirm order." });
  }
});

// Admin cancels a pending order
router.patch("/:id/cancel", protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, status: "pending" },
      { $set: { status: "cancelled" } },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Pending order not found."
      });
    }

    res.json({
      message: "Order cancelled.",
      order
    });
  } catch (error) {
    console.error("Cancel order error:", error.message);
    res.status(500).json({ message: "Unable to cancel order." });
  }
});

module.exports = router;
