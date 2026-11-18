
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number"
      }
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Customer information saved at the time of ordering
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Online Payment"],
      required: true
    },
    orderNotes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: items => items.length > 0,
        message: "An order must contain at least one item"
      }
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
