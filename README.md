# Vendora - E-Commerce and Inventory System

Vendora is a web-based e-commerce and inventory management system designed for small businesses. It allows customers to browse products and place orders, while administrators can manage products, monitor inventory, and track sales.

The system automatically updates stock quantities when orders are confirmed. It also uses Nodemailer to send email notifications and SheetJS to generate Excel reports for inventory and sales.

## Features

- User registration and login
- Product browsing and management
- Customer order placement
- Automatic inventory updates after order confirmation
- Email notifications for order confirmations
- Low-stock email notifications, where configured
- Inventory and sales reports downloadable in Excel format
- Admin access control and protected API endpoints

## Built With

- **Frontend:** React.js, JavaScript, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JSON Web Token (JWT)
- **Email:** Nodemailer
- **Excel Reports:** SheetJS

## Getting Started

### Requirements

- Node.js and npm
- MongoDB
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/VictorNeri8/Vendora.git
cd Vendora
```

Install the backend dependencies:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder and add your database connection, JWT secret, and email configuration using the environment variable names required by the project.

Start the backend using the appropriate script in `backend/package.json`.

Install the frontend dependencies in the frontend directory and run the development server using its configured npm script.

## Project Purpose

Vendora was developed to make it easier for small businesses to manage online orders and inventory in one system. It combines basic e-commerce features with inventory tracking, email notifications, and Excel reporting to make everyday business operations more organized.

## Developer

Victor 

GitHub: https://github.com/VictorNeri8
