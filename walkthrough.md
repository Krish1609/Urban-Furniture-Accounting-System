# FurniLedger: 3-Role Architecture & MySQL (XAMPP) Setup

## 1. System Role Breakdown (Flowchart Alignment)

Your project is structured around **3 distinct user roles**:

```mermaid
flowchart TD
    subgraph Roles ["3 User Roles"]
        R1["👑 1. Administrator (Admin)"]
        R2["💼 2. Accountant"]
        R3["👤 3. User (Client / Customer)"]
    end

    subgraph AdminCap ["Administrator Capabilities"]
        A1["Executive Dashboard & ERP Control"]
        A2["User Management & Organizations"]
        A3["All Commercial Ops (Sales & Purchase)"]
        A4["All Accounting & Analytical Budgets"]
        A5["All Financial Reports (P&L, BS, Taxes)"]
    end

    subgraph AccCap ["Accountant Capabilities"]
        AC1["Financial Hub & Accounting Dashboard"]
        AC2["Chart of Accounts, Journals & Entry Posting"]
        AC3["Sales Invoices & Vendor Bills Approval"]
        AC4["Budget Lines & Analytic Allocations"]
        AC5["Profit & Loss, Balance Sheet & Auditing"]
    end

    subgraph UserCap ["User / Customer Capabilities"]
        U1["Self-Service Customer Portal (/portal)"]
        U2["View Specific Invoices & Payment History"]
        U3["Track Outstanding Due Balances"]
        U4["View Order Receipts & Confirmations"]
        U5["Manage Customer Profile"]
    end

    R1 --> AdminCap
    R2 --> AccCap
    R3 --> UserCap
```

---

## 2. Updated Role Features Across the Project

### A. Sign In ([`LoginPage.jsx`](file:///e:/manav/fullwith%20sql/frontend/src/pages/LoginPage.jsx))
- **3-Role Toggle Switch**: Select between **Admin**, **Accountant**, and **User**.
- **Blank Fields by Default**: Login ID and Password fields start completely empty (`""`).
- **Dynamic Routing**:
  - `Administrator` &rarr; `/dashboard`
  - `Accountant` &rarr; `/dashboard`
  - `User` &rarr; `/portal`

### B. User Registration ([`CreateUserPage.jsx`](file:///e:/manav/fullwith%20sql/frontend/src/pages/CreateUserPage.jsx))
- Allows creating users with role selection: **User**, **Accountant**, or **Admin**.
- After creation, redirects to the Sign In page with a confirmation message and fresh, blank fields.

### C. Top Navigation Bar ([`Navbar.jsx`](file:///e:/manav/fullwith%20sql/frontend/src/components/Navbar.jsx))
- **Full Navigation Strip** for **Admin** and **Accountant**:
  - **Sales**: Sales Order, Sale Invoice, Receipt
  - **Purchase**: Purchase Order, Purchase Bill, Payment
  - **Account**: Contact, Product, Analytics, Analytical Budget, Chart of Account, Journals, Journal Entries
  - **Report**: Balance Sheet, Profit and Loss, Budget Report
- **Role Switcher**: Cycles dynamically between all 3 roles (**Admin** &harr; **Accountant** &harr; **User**).

---

## 3. Demo Credentials for All 3 Roles

| Role | Login ID | Email | Password | Access Area |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin_demo` | `admin@urbanfurniture.com` | `Password@123` | `/dashboard` (Executive ERP Hub) |
| **Accountant** | `accountant_demo` | `accountant@urbanfurniture.com` | `Password@123` | `/dashboard` (Accounting Hub) |
| **User** | `nimesh_user` | `nimesh.pathak@client.com` | `Password@123` | `/portal` (Customer Self-Service Portal) |

---

## 4. Verification

- **XAMPP MySQL Database**: Seeded and synchronized with all 3 role accounts.
- **Backend API Tests**: Passed 100% of modules (`npm run test:api`).
- **Frontend Production Build**: `npm run build` compiled cleanly in 2.91s with 0 errors.
