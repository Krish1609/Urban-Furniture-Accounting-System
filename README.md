# 🪑 FurniLedger — Urban Furniture Accounting & ERP System

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Backend-Express%205.x-black?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%206.x-2D3748?logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%20%2F%20XAMPP-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#license)

**FurniLedger** is a full-stack Enterprise Resource Planning (ERP) and double-entry accounting software designed for furniture manufacturing, sales, and retail distribution businesses. It features end-to-end commercial operations (Sales, Purchases, Invoicing, Receipts), general ledger bookkeeping, analytical budgeting, financial statements (P&L, Balance Sheet), and a dedicated 3-role permission workflow.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Role-Based Access & Permissions](#-role-based-access--permissions)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Directory Structure](#-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone & Install Dependencies](#1-clone--install-dependencies)
  - [2. Database Setup (MySQL / XAMPP)](#2-database-setup-mysql--xampp)
  - [3. Environment Variables Configuration](#3-environment-variables-configuration)
  - [4. Seed Master Data](#4-seed-master-data)
  - [5. Run Development Servers](#5-run-development-servers)
- [Demo Credentials](#-demo-credentials)
- [API Documentation](#-api-documentation)
- [Verification & Testing](#-verification--testing)
- [License](#-license)

---

## ✨ Key Features

### 👑 Super Administrator Hub (`/admin`)
- **Executive Oversight**: Global system metrics, revenue velocity, active users, and system audit trails.
- **User Provisioning**: Create and manage Administrator, Accountant, and Client accounts.
- **System Diagnostics**: Real-time database connectivity, API health status, and system configurations.

### 💼 Financial & ERP Accounting Engine (`/dashboard`)
- **Double-Entry Bookkeeping**: Full Chart of Accounts, Debit/Credit validation, journal entries, and automated ledger postings.
- **Sales & Commercial Ops**: Sales Orders, Customer Invoices, Payment Receipts, and Client credit limits.
- **Procurement Management**: Purchase Orders, Vendor Bills, Supplier Payments, and AP tracking.
- **Analytical Budgets**: Project-wise budget line allocations, target vs. actual expenditure monitoring, and variance analysis.
- **Comprehensive Financial Reports**:
  - **Profit & Loss (P&L)**: Real-time revenue, COGS, and operational margin computation.
  - **Balance Sheet**: Categorized assets, liabilities, and retained equity.
  - **Tax & Budget Variance Reports**: Breakdown of tax obligations and department spending.

### 👤 Customer Self-Service Portal (`/portal`)
- **Self-Service Dashboard**: Client invoice history, order fulfillment status, and outstanding balances.
- **Digital Receipts**: Downloadable payment receipts and invoice copies.
- **Account Settings**: Client profile information and security management.

### 🎨 Modern UI & UX
- **Theme Switcher**: Seamless Dark Mode and Light Mode support.
- **Interactive Visualizations**: Dynamic budget pie charts, cash flow graphs, and financial summary cards.
- **Responsive Layout**: Designed for desktop workstations, tablets, and mobile devices.

---

## 👥 Role-Based Access & Permissions

FurniLedger enforces strict Role-Based Access Control (RBAC) across both frontend routing and backend REST APIs:

| Feature / Module | 👑 Administrator | 💼 Accountant | 👤 User (Client) |
| :--- | :---: | :---: | :---: |
| **Super Admin Panel (`/admin`)** | ✅ Full Access | ❌ Restricted | ❌ Restricted |
| **Main ERP Dashboard (`/dashboard`)** | ✅ Full Access | ✅ Full Access | ❌ Redirects to `/portal` |
| **Sales & Purchase Management** | ✅ Full Control | ✅ Invoicing & Bills | ❌ Restricted |
| **Chart of Accounts & Journals** | ✅ Full Control | ✅ Full Control | ❌ Restricted |
| **Analytical Budgets & Allocations** | ✅ Full Control | ✅ Manage Budgets | ❌ Restricted |
| **Financial Reports (P&L, Balance Sheet)** | ✅ Full Control | ✅ Full Control | ❌ Restricted |
| **User & Staff Management** | ✅ Full Control | ❌ View Only | ❌ Restricted |
| **Customer Portal (`/portal`)** | ✅ Available | ✅ Available | ✅ Primary Portal |

---

## 🏛 System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (React 19 + Vite)"]
        UI["Modern Responsive UI / Dark Theme"]
        Router["React Router v7 Protected Routes"]
        AuthContext["Auth Context & JWT Storage"]
    end

    subgraph APILayer ["Backend API Layer (Express 5.x)"]
        AuthMiddleware["JWT & Role Authorization Middleware"]
        Controllers["Modular REST Controllers"]
        PrismaClient["Prisma ORM Layer"]
    end

    subgraph DataLayer ["Data Layer (MySQL / MariaDB)"]
        MySQL[("Urban Furniture Database\n(Users, Accounts, Invoices, Orders, Budgets)")]
    end

    UI --> Router
    Router --> AuthContext
    AuthContext -->|Bearer JWT| AuthMiddleware
    AuthMiddleware --> Controllers
    Controllers --> PrismaClient
    PrismaClient --> MySQL
```

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API (`AuthContext`, `AccountingContext`, `ThemeContext`)
- **Styling**: Vanilla CSS Design System with CSS Variables & Glassmorphism

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express 5.x](https://expressjs.com/)
- **ORM**: [Prisma 6.x](https://www.prisma.io/)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Security & Utilities**: CORS, Dotenv, Custom Error Middleware

### Database
- **Database**: MySQL 8.x / MariaDB (Supports XAMPP, Docker, or native MySQL server)

---

## 📁 Directory Structure

```text
furniledger/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma            # Prisma database schema & relations
│   ├── src/
│   │   ├── controllers/             # Business logic controllers
│   │   │   ├── accounting.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── budgets.controller.js
│   │   │   ├── contacts.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── invoices.controller.js
│   │   │   ├── orders.controller.js
│   │   │   ├── portal.controller.js
│   │   │   ├── products.controller.js
│   │   │   └── reports.controller.js
│   │   ├── middleware/              # Auth & error handling middlewares
│   │   │   ├── auth.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── routes/                  # Express API route endpoints
│   │   ├── lib/
│   │   │   └── prisma.js            # Prisma client instance
│   │   ├── seed.js                  # Database seeder script
│   │   ├── test-all-apis.js         # API integration verification script
│   │   └── index.js                 # Express server entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Reusable UI layouts & components
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── BudgetPieChart.jsx
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/                 # Application Context Providers
│   │   ├── pages/                   # Modular application pages
│   │   │   ├── admin/               # Dedicated Super Admin pages
│   │   │   ├── AccountingPage.jsx
│   │   │   ├── BudgetsPage.jsx
│   │   │   ├── ContactsPage.jsx
│   │   │   ├── CreateUserPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   ├── UserPortalPage.jsx
│   │   │   └── UsersPage.jsx
│   │   ├── services/
│   │   │   └── api.js               # Centralized Axios/Fetch API client
│   │   ├── theme/
│   │   │   └── theme.js             # Theme tokens & styling configs
│   │   ├── App.jsx                  # Main routing definition
│   │   └── main.jsx                 # React root entry
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── urban_furniture_mysql.sql        # Full MySQL database backup / import
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MySQL / XAMPP**: Running MySQL server on port `3306`

---

### 1. Clone & Install Dependencies

```powershell
# Clone repository
git clone https://github.com/Krish1609/Urban-Furniture-Accounting-System.git
cd Urban-Furniture-Accounting-System

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

---

### 2. Database Setup (MySQL / XAMPP)

1. Start **Apache** and **MySQL** in your **XAMPP Control Panel**.
2. Open **phpMyAdmin** (`http://localhost/phpmyadmin`) or MySQL CLI.
3. Create a database named `urban_furniture`:
   ```sql
   CREATE DATABASE urban_furniture CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. *(Optional)* You can import `urban_furniture_mysql.sql` directly in phpMyAdmin, or let Prisma handle the schema:
   ```powershell
   cd backend
   npx prisma db push
   ```

---

### 3. Environment Variables Configuration

Create a `.env` file in the `backend/` directory (you can copy from `backend/.env.example`):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MySQL Database Connection URL
DATABASE_URL="mysql://root:@localhost:3306/urban_furniture"

# JWT Authentication Secret
JWT_SECRET="urban_furniture_super_secret_jwt_key_2026"
JWT_EXPIRES_IN="7d"
```

> **Note**: If your MySQL has a password, update the URL accordingly: `mysql://root:your_password@localhost:3306/urban_furniture`.

---

### 4. Seed Master Data

Populate the database with default accounts, products, sample orders, and demo users:

```powershell
cd backend
npm run seed
```

---

### 5. Run Development Servers

Open two separate terminals:

**Terminal 1 — Backend API Server:**
```powershell
cd backend
npm run dev
# Server running at http://localhost:5000
```

**Terminal 2 — Frontend Application:**
```powershell
cd frontend
npm run dev
# Application running at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 🔐 Demo Credentials

Use these pre-seeded accounts to explore all three role interfaces:

| Role | Username / Login ID | Email | Password | Primary Interface |
| :--- | :--- | :--- | :--- | :--- |
| 👑 **Administrator** | `admin_demo` | `admin@urbanfurniture.com` | `Password@123` | `/admin` & `/dashboard` |
| 💼 **Accountant** | `accountant_demo` | `accountant@urbanfurniture.com` | `Password@123` | `/dashboard` |
| 👤 **User (Client)** | `nimesh_user` | `nimesh.pathak@client.com` | `Password@123` | `/portal` |

---

## 📡 API Documentation

The backend exposes structured REST endpoints under the `/api` prefix:

| Prefix | Method | Description | Protected |
| :--- | :--- | :--- | :---: |
| `/api/auth/login` | `POST` | Authenticate user & receive JWT token | Public |
| `/api/auth/register` | `POST` | Register a new user account | Public |
| `/api/auth/me` | `GET` | Get current authenticated user profile | 🔒 Auth |
| `/api/dashboard/stats`| `GET` | Retrieve executive overview metrics | 🔒 Admin / Accountant |
| `/api/contacts` | `GET`, `POST`, `PUT` | Manage customers and suppliers | 🔒 Admin / Accountant |
| `/api/products` | `GET`, `POST`, `PUT` | Manage inventory catalog & pricing | 🔒 Admin / Accountant |
| `/api/orders` | `GET`, `POST`, `PUT` | Manage Sales and Purchase orders | 🔒 Admin / Accountant |
| `/api/invoices` | `GET`, `POST`, `PUT` | Generate and post customer/vendor invoices| 🔒 Admin / Accountant |
| `/api/accounting` | `GET`, `POST` | Chart of Accounts, Journal entries & Ledger | 🔒 Admin / Accountant |
| `/api/budgets` | `GET`, `POST`, `PUT` | Analytical budget allocations & variance | 🔒 Admin / Accountant |
| `/api/reports` | `GET` | Generate P&L, Balance Sheet, & Tax reports | 🔒 Admin / Accountant |
| `/api/portal` | `GET` | Customer self-service invoices & receipts | 🔒 All Roles |

---

## 🧪 Verification & Testing

To run automated backend API integration tests across all modules:

```powershell
cd backend
npm run test:api
```

To test the frontend production build:

```powershell
cd frontend
npm run build
```

---

## 📄 License

This project is licensed under the MIT License — feel free to customize and expand for your commercial or educational projects.
