
const nodemailer = require("nodemailer");

function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error("Email credentials are missing from .env");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
}

async function sendOrderConfirmation(order) {
  const transporter = createTransporter();

  const itemsText = order.items
    .map(
      (item) =>
        `${item.name} x ${item.quantity} - PHP ${(
          item.price * item.quantity
        ).toFixed(2)}`
    )
    .join("\n");

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: order.customer.email,
    subject: `Vendora Order Confirmation - ${order._id}`,
    text: `Hello ${order.customer.name},

Your Vendora order has been confirmed.

Order ID: ${order._id}

Items:
${itemsText}

Total: PHP ${Number(order.totalAmount).toFixed(2)}

Thank you for shopping with Vendora!`,
  });
}

async function sendLowStockAlert(product) {
  const transporter = createTransporter();

  if (!process.env.ADMIN_EMAIL) {
    throw new Error("ADMIN_EMAIL is missing from .env");
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `Vendora Low Stock Alert: ${product.name}`,
    text: `Low stock alert!

Product: ${product.name}
Remaining quantity: ${product.stockQuantity}
Low-stock threshold: ${product.lowStockThreshold}

Please check your inventory in Vendora.`,
  });
}

module.exports = {
  sendOrderConfirmation,
  sendLowStockAlert,
};
