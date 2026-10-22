const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    category: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    barcode: {
      type: String,
      trim: true,
      default: ""
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number"
      }
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0
    },
    image: {
  type: String,
  default: ""
  }
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);