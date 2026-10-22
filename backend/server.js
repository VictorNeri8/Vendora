
const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const { protect, adminOnly } = require("./middleware/authMiddleware");
const orderRoutes = require("./routes/orderRoutes");
const reportRoutes = require("./routes/reportRoutes");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);


app.use("/api/orders", orderRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "Vendora API is running" });
});


app.use("/api/products", productRoutes);

app.get("/api/auth/me", protect, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/admin/test", protect, adminOnly, (req, res) => {
  res.json({ message: "Admin access confirmed." });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Vendora API running on port ${PORT}`);
  });
}

startServer();