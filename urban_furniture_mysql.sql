-- =============================================================================
-- FurniLedger Accounting & ERP - MySQL Database Dump (XAMPP / phpMyAdmin Ready)
-- Database Name: urban_furniture
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `urban_furniture` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `urban_furniture`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Organizations Table
DROP TABLE IF EXISTS `organizations`;
CREATE TABLE `organizations` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `legal_name` VARCHAR(255) DEFAULT NULL,
  `tax_identifier` VARCHAR(64) DEFAULT NULL,
  `base_currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
  `fiscal_year_start_month` INT NOT NULL DEFAULT 4,
  `timezone` VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. App Users Table
DROP TABLE IF EXISTS `app_users`;
CREATE TABLE `app_users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `login_id` VARCHAR(64) NOT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `display_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(32) DEFAULT NULL,
  `role` VARCHAR(64) NOT NULL DEFAULT 'Administrator',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `app_users_email_key` (`email`),
  UNIQUE KEY `app_users_login_id_key` (`login_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Organization Memberships Table
DROP TABLE IF EXISTS `organization_memberships`;
CREATE TABLE `organization_memberships` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `role` VARCHAR(64) NOT NULL DEFAULT 'accountant',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `org_user_unique` (`organization_id`, `user_id`),
  CONSTRAINT `fk_org_memberships_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_org_memberships_user` FOREIGN KEY (`user_id`) REFERENCES `app_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Product Categories Table
DROP TABLE IF EXISTS `product_categories`;
CREATE TABLE `product_categories` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `parent_id` VARCHAR(36) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(64) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_product_categories_org` (`organization_id`),
  CONSTRAINT `fk_prod_cat_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Products Table
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `category_id` VARCHAR(36) DEFAULT NULL,
  `sku` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `product_type` VARCHAR(32) NOT NULL DEFAULT 'goods',
  `sales_price` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `cost_price` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `income_account_id` VARCHAR(36) DEFAULT NULL,
  `expense_account_id` VARCHAR(36) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_products_org` (`organization_id`),
  KEY `idx_products_cat` (`category_id`),
  CONSTRAINT `fk_products_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_products_cat` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Inventory Movements Table
DROP TABLE IF EXISTS `inventory_movements`;
CREATE TABLE `inventory_movements` (
  `id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `movement_type` VARCHAR(32) NOT NULL,
  `quantity_delta` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `reference_type` VARCHAR(64) DEFAULT NULL,
  `reference_id` VARCHAR(36) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_inventory_product` (`product_id`),
  CONSTRAINT `fk_inventory_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Contacts Table
DROP TABLE IF EXISTS `contacts`;
CREATE TABLE `contacts` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `contact_type` VARCHAR(32) NOT NULL DEFAULT 'customer',
  `display_name` VARCHAR(255) NOT NULL,
  `legal_name` VARCHAR(255) DEFAULT NULL,
  `tax_identifier` VARCHAR(64) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(32) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_contacts_org` (`organization_id`),
  CONSTRAINT `fk_contacts_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Contact Addresses Table
DROP TABLE IF EXISTS `contact_addresses`;
CREATE TABLE `contact_addresses` (
  `id` VARCHAR(36) NOT NULL,
  `contact_id` VARCHAR(36) NOT NULL,
  `address_type` VARCHAR(32) NOT NULL DEFAULT 'billing',
  `line1` VARCHAR(255) NOT NULL,
  `line2` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(128) DEFAULT NULL,
  `state` VARCHAR(128) DEFAULT NULL,
  `postal_code` VARCHAR(32) DEFAULT NULL,
  `country_code` VARCHAR(2) NOT NULL DEFAULT 'IN',
  `is_default` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_addresses_contact` (`contact_id`),
  CONSTRAINT `fk_addresses_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Chart of Accounts Table
DROP TABLE IF EXISTS `chart_of_accounts`;
CREATE TABLE `chart_of_accounts` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `account_code` VARCHAR(32) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `account_type` VARCHAR(32) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `parent_account_id` VARCHAR(36) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `coa_org_code_key` (`organization_id`, `account_code`),
  CONSTRAINT `fk_coa_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Journals Table
DROP TABLE IF EXISTS `journals`;
CREATE TABLE `journals` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(32) DEFAULT NULL,
  `type` VARCHAR(32) NOT NULL,
  `default_debit_account_id` VARCHAR(36) DEFAULT NULL,
  `default_credit_account_id` VARCHAR(36) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_journals_org` (`organization_id`),
  CONSTRAINT `fk_journals_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Analytic Accounts Table
DROP TABLE IF EXISTS `analytic_accounts`;
CREATE TABLE `analytic_accounts` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(64) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_analytic_org` (`organization_id`),
  CONSTRAINT `fk_analytic_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Commercial Documents Table (Orders, Invoices, Bills)
DROP TABLE IF EXISTS `commercial_documents`;
CREATE TABLE `commercial_documents` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `contact_id` VARCHAR(36) NOT NULL,
  `document_type` VARCHAR(32) NOT NULL,
  `document_number` VARCHAR(64) NOT NULL,
  `document_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `due_date` DATETIME(3) DEFAULT NULL,
  `currency_code` VARCHAR(3) NOT NULL DEFAULT 'INR',
  `status` VARCHAR(32) NOT NULL DEFAULT 'draft',
  `subtotal_amount` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `tax_amount` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `total_amount` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `origin_document_id` VARCHAR(36) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `doc_org_type_num_key` (`organization_id`, `document_type`, `document_number`),
  KEY `idx_documents_contact` (`contact_id`),
  KEY `idx_documents_origin` (`origin_document_id`),
  CONSTRAINT `fk_docs_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_docs_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_docs_origin` FOREIGN KEY (`origin_document_id`) REFERENCES `commercial_documents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Commercial Document Lines Table
DROP TABLE IF EXISTS `commercial_document_lines`;
CREATE TABLE `commercial_document_lines` (
  `id` VARCHAR(36) NOT NULL,
  `commercial_document_id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) DEFAULT NULL,
  `description` VARCHAR(255) NOT NULL,
  `quantity` DECIMAL(15,2) NOT NULL DEFAULT '1.00',
  `unit_price` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `line_tax_amount` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `line_total_amount` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `analytic_account_id` VARCHAR(36) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_doc_lines_doc` (`commercial_document_id`),
  KEY `idx_doc_lines_prod` (`product_id`),
  KEY `idx_doc_lines_analytic` (`analytic_account_id`),
  CONSTRAINT `fk_doc_lines_doc` FOREIGN KEY (`commercial_document_id`) REFERENCES `commercial_documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_doc_lines_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_doc_lines_analytic` FOREIGN KEY (`analytic_account_id`) REFERENCES `analytic_accounts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Journal Entries Table
DROP TABLE IF EXISTS `journal_entries`;
CREATE TABLE `journal_entries` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `journal_id` VARCHAR(36) NOT NULL,
  `entry_number` VARCHAR(64) NOT NULL,
  `entry_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `reference` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'draft',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `journal_entries_org_num_key` (`organization_id`, `entry_number`),
  CONSTRAINT `fk_entries_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_entries_journal` FOREIGN KEY (`journal_id`) REFERENCES `journals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Journal Entry Lines Table
DROP TABLE IF EXISTS `journal_entry_lines`;
CREATE TABLE `journal_entry_lines` (
  `id` VARCHAR(36) NOT NULL,
  `journal_entry_id` VARCHAR(36) NOT NULL,
  `account_id` VARCHAR(36) NOT NULL,
  `partner_id` VARCHAR(36) DEFAULT NULL,
  `analytic_account_id` VARCHAR(36) DEFAULT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `debit_amount` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `credit_amount` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_entry_lines_entry` (`journal_entry_id`),
  KEY `idx_entry_lines_account` (`account_id`),
  KEY `idx_entry_lines_analytic` (`analytic_account_id`),
  CONSTRAINT `fk_entry_lines_entry` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_entry_lines_account` FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_entry_lines_analytic` FOREIGN KEY (`analytic_account_id`) REFERENCES `analytic_accounts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Payments Table
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `contact_id` VARCHAR(36) NOT NULL,
  `payment_number` VARCHAR(64) NOT NULL,
  `payment_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `payment_direction` VARCHAR(16) NOT NULL DEFAULT 'inbound',
  `payment_method` VARCHAR(32) NOT NULL DEFAULT 'bank_transfer',
  `amount` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `currency_code` VARCHAR(3) NOT NULL DEFAULT 'INR',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_org_num_key` (`organization_id`, `payment_number`),
  CONSTRAINT `fk_payments_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payments_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Payment Allocations Table
DROP TABLE IF EXISTS `payment_allocations`;
CREATE TABLE `payment_allocations` (
  `id` VARCHAR(36) NOT NULL,
  `payment_id` VARCHAR(36) NOT NULL,
  `commercial_document_id` VARCHAR(36) NOT NULL,
  `allocated_amount` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_alloc_payment` (`payment_id`),
  KEY `idx_alloc_doc` (`commercial_document_id`),
  CONSTRAINT `fk_alloc_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_alloc_doc` FOREIGN KEY (`commercial_document_id`) REFERENCES `commercial_documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Budgets Table
DROP TABLE IF EXISTS `budgets`;
CREATE TABLE `budgets` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `period_start` DATETIME(3) NOT NULL,
  `period_end` DATETIME(3) NOT NULL,
  `currency_code` VARCHAR(3) NOT NULL DEFAULT 'INR',
  `status` VARCHAR(32) NOT NULL DEFAULT 'active',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_budgets_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Budget Lines Table
DROP TABLE IF EXISTS `budget_lines`;
CREATE TABLE `budget_lines` (
  `id` VARCHAR(36) NOT NULL,
  `budget_id` VARCHAR(36) NOT NULL,
  `analytic_account_id` VARCHAR(36) DEFAULT NULL,
  `account_id` VARCHAR(36) DEFAULT NULL,
  `planned_amount` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_bl_budget` FOREIGN KEY (`budget_id`) REFERENCES `budgets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bl_analytic` FOREIGN KEY (`analytic_account_id`) REFERENCES `analytic_accounts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bl_account` FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Tax Rates Table
DROP TABLE IF EXISTS `tax_rates`;
CREATE TABLE `tax_rates` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `rate_percentage` DECIMAL(5,2) NOT NULL DEFAULT '0.00',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tax_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Currencies Table
DROP TABLE IF EXISTS `currencies`;
CREATE TABLE `currencies` (
  `code` VARCHAR(3) NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `symbol` VARCHAR(8) NOT NULL,
  `decimal_places` INT NOT NULL DEFAULT 2,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- MASTER DATA INSERTIONS
-- =============================================================================

-- Currencies
INSERT INTO `currencies` (`code`, `name`, `symbol`, `decimal_places`, `is_active`) VALUES
('INR', 'Indian Rupee', '₹', 2, 1),
('USD', 'US Dollar', '$', 2, 1),
('EUR', 'Euro', '€', 2, 1);

-- Default Organization
INSERT INTO `organizations` (`id`, `name`, `legal_name`, `tax_identifier`, `base_currency`, `fiscal_year_start_month`, `timezone`, `is_active`) VALUES
('org-urban-001', 'Urban Furniture', 'Urban Furniture Pvt. Ltd.', '27AABCU9603R1ZM', 'INR', 4, 'Asia/Kolkata', 1);

-- Default Users (Password: 'Password@123' hashed with bcrypt)
-- HIERARCHY RULE: Exactly 1 Super Administrator, Multiple Accountants (ERP Operations), Multiple Users (Portal Access)
INSERT INTO `app_users` (`id`, `email`, `login_id`, `password_hash`, `display_name`, `phone`, `role`, `is_active`) VALUES
-- 👑 1 SINGLE SUPER ADMINISTRATOR
('usr-admin-001', 'admin@urbanfurniture.com', 'admin', '$2a$10$wNqv4t0361iJ4v50wY5Hfe4v0XjW4W2m4G4QZkV07m8gG4qR6aWte', 'Administrator (Super Admin)', '+91 98200 00001', 'Administrator', 1),

-- 💼 ACCOUNTANTS (OPERATIONAL ERP MANAGEMENT)
('usr-acc-001', 'accountant@urbanfurniture.com', 'accountant', '$2a$10$wNqv4t0361iJ4v50wY5Hfe4v0XjW4W2m4G4QZkV07m8gG4qR6aWte', 'Rajeev Mehta (Senior Accountant)', '+91 98200 00002', 'Accountant', 1),
('usr-acc-002', 'priya.sharma@urbanfurniture.com', 'priya_acc', '$2a$10$wNqv4t0361iJ4v50wY5Hfe4v0XjW4W2m4G4QZkV07m8gG4qR6aWte', 'Priya Sharma (Financial Accountant)', '+91 98200 00003', 'Accountant', 1),
('usr-acc-003', 'vikram.patel@urbanfurniture.com', 'vikram_acc', '$2a$10$wNqv4t0361iJ4v50wY5Hfe4v0XjW4W2m4G4QZkV07m8gG4qR6aWte', 'Vikram Patel (Tax & Audit Accountant)', '+91 98200 00004', 'Accountant', 1),
('usr-acc-004', 'ananya.d@urbanfurniture.com', 'ananya_acc', '$2a$10$wNqv4t0361iJ4v50wY5Hfe4v0XjW4W2m4G4QZkV07m8gG4qR6aWte', 'Ananya Deshmukh (Cost Accountant)', '+91 98200 00005', 'Accountant', 1),

-- 👥 CLIENTS, VENDORS & USERS (PORTAL ACCESS)
('usr-usr-001', 'nimesh.pathak@client.com', 'nimesh_user', '$2a$10$wNqv4t0361iJ4v50wY5Hfe4v0XjW4W2m4G4QZkV07m8gG4qR6aWte', 'Nimesh Pathak (Corporate Client)', '+91 98200 12345', 'User', 1),
('usr-usr-002', 'priya.mehta@studio.com', 'priya_client', '$2a$10$wNqv4t0361iJ4v50wY5Hfe4v0XjW4W2m4G4QZkV07m8gG4qR6aWte', 'Priya Mehta (Studio Architect)', '+91 98200 54321', 'User', 1),
('usr-usr-003', 'rahul.timber@sharmawood.in', 'rahul_wood', '$2a$10$wNqv4t0361iJ4v50wY5Hfe4v0XjW4W2m4G4QZkV07m8gG4qR6aWte', 'Rahul Sharma (Timber Supplier)', '+91 98200 98765', 'User', 1),
('usr-usr-004', 'sneha.joshi@design.in', 'sneha_user', '$2a$10$wNqv4t0361iJ4v50wY5Hfe4v0XjW4W2m4G4QZkV07m8gG4qR6aWte', 'Sneha Joshi (Interior Designer)', '+91 98200 45678', 'User', 1),
('usr-usr-005', 'rohit.verma@home.com', 'rohit_user', '$2a$10$wNqv4t0361iJ4v50wY5Hfe4v0XjW4W2m4G4QZkV07m8gG4qR6aWte', 'Rohit Verma (Retail Customer)', '+91 98200 67890', 'User', 1);

-- Organization Memberships
INSERT INTO `organization_memberships` (`id`, `organization_id`, `user_id`, `role`, `is_active`) VALUES
('mem-adm-001', 'org-urban-001', 'usr-admin-001', 'admin', 1),
('mem-acc-001', 'org-urban-001', 'usr-acc-001', 'accountant', 1),
('mem-acc-002', 'org-urban-001', 'usr-acc-002', 'accountant', 1),
('mem-acc-003', 'org-urban-001', 'usr-acc-003', 'accountant', 1),
('mem-acc-004', 'org-urban-001', 'usr-acc-004', 'accountant', 1),
('mem-usr-001', 'org-urban-001', 'usr-usr-001', 'accountant', 1),
('mem-usr-002', 'org-urban-001', 'usr-usr-002', 'accountant', 1),
('mem-usr-003', 'org-urban-001', 'usr-usr-003', 'accountant', 1),
('mem-usr-004', 'org-urban-001', 'usr-usr-004', 'accountant', 1),
('mem-usr-005', 'org-urban-001', 'usr-usr-005', 'accountant', 1);

-- Chart of Accounts
INSERT INTO `chart_of_accounts` (`id`, `organization_id`, `account_code`, `name`, `account_type`, `is_active`) VALUES
('coa-1010', 'org-urban-001', '1010', 'Cash in Hand', 'asset', 1),
('coa-1020', 'org-urban-001', '1020', 'HDFC Bank Account', 'asset', 1),
('coa-1100', 'org-urban-001', '1100', 'Accounts Receivable (Debtors)', 'asset', 1),
('coa-1200', 'org-urban-001', '1200', 'Furniture Inventory Stock', 'asset', 1),
('coa-2010', 'org-urban-001', '2010', 'Accounts Payable (Creditors)', 'liability', 1),
('coa-2050', 'org-urban-001', '2050', 'GST / Taxes Payable', 'liability', 1),
('coa-3010', 'org-urban-001', '3010', "Owner's Capital", 'equity', 1),
('coa-4010', 'org-urban-001', '4010', 'Furniture Sales Income', 'income', 1),
('coa-5010', 'org-urban-001', '5010', 'Raw Materials & Purchase Expense', 'expense', 1),
('coa-5020', 'org-urban-001', '5020', 'Showroom & Delivery Expense', 'expense', 1);

-- Journals
INSERT INTO `journals` (`id`, `organization_id`, `name`, `code`, `type`) VALUES
('jnl-001', 'org-urban-001', 'Customer Sales Journal', 'INV', 'sales'),
('jnl-002', 'org-urban-001', 'Vendor Purchase Journal', 'BILL', 'purchase'),
('jnl-003', 'org-urban-001', 'Bank Operations Journal', 'BNK', 'bank'),
('jnl-004', 'org-urban-001', 'Cash Receipts & Payments', 'CSH', 'cash'),
('jnl-005', 'org-urban-001', 'General Journal Entries', 'GEN', 'general');

-- Product Categories
INSERT INTO `product_categories` (`id`, `organization_id`, `name`, `code`) VALUES
('cat-001', 'org-urban-001', 'Ergonomic Seating', 'SEAT'),
('cat-002', 'org-urban-001', 'Tables & Workstations', 'TBL'),
('cat-003', 'org-urban-001', 'Storage & Cabinets', 'STRG'),
('cat-004', 'org-urban-001', 'Living Room Furniture', 'LVNG'),
('cat-005', 'org-urban-001', 'Services & Fitting', 'SERV');

-- Products
INSERT INTO `products` (`id`, `organization_id`, `category_id`, `sku`, `name`, `product_type`, `sales_price`, `cost_price`, `is_active`) VALUES
('prd-001', 'org-urban-001', 'cat-001', 'CHAIR-001', 'Aeron Ergonomic Office Chair', 'goods', 18500.00, 11000.00, 1),
('prd-002', 'org-urban-001', 'cat-002', 'TBL-002', 'Solid Teak Wood Dining Table', 'goods', 34000.00, 21000.00, 1),
('prd-003', 'org-urban-001', 'cat-002', 'DESK-003', 'Dual-Motor Electric Standing Desk', 'goods', 28000.00, 16500.00, 1),
('prd-004', 'org-urban-001', 'cat-001', 'CHAIR-004', 'Executive High-Back Leather Chair', 'goods', 15500.00, 9200.00, 1),
('prd-005', 'org-urban-001', 'cat-003', 'STRG-005', 'Modular 3-Door Credenza Storage', 'goods', 22000.00, 13500.00, 1),
('prd-006', 'org-urban-001', 'cat-004', 'LVNG-006', 'Modern Minimalist Coffee Table', 'goods', 8500.00, 4800.00, 1),
('prd-007', 'org-urban-001', 'cat-005', 'SERV-007', 'Assembly & On-Site Installation', 'service', 2500.00, 500.00, 1);

-- Contacts
INSERT INTO `contacts` (`id`, `organization_id`, `contact_type`, `display_name`, `email`, `phone`, `is_active`) VALUES
('cnt-001', 'org-urban-001', 'customer', 'Nimesh Pathak', 'nimesh.pathak@client.com', '+91 98200 12345', 1),
('cnt-002', 'org-urban-001', 'vendor', 'Azure Furniture Supplies', 'supplies@azurefurn.com', '+91 98450 67890', 1),
('cnt-003', 'org-urban-001', 'customer', 'Apex Interior Solutions', 'contact@apexinterior.in', '+91 98111 22334', 1),
('cnt-004', 'org-urban-001', 'vendor', 'Global Timber & Woods Co.', 'sales@globaltimber.com', '+91 94440 55667', 1);

-- Contact Addresses
INSERT INTO `contact_addresses` (`id`, `contact_id`, `address_type`, `line1`, `city`, `state`, `postal_code`, `country_code`, `is_default`) VALUES
('addr-001', 'cnt-001', 'billing', 'Nimesh Pathak Headquarters', 'Mumbai', 'Maharashtra', '400001', 'IN', 1),
('addr-002', 'cnt-002', 'billing', 'Azure Furniture Supplies Headquarters', 'Bengaluru', 'Karnataka', '560001', 'IN', 1),
('addr-003', 'cnt-003', 'billing', 'Apex Interior Solutions Headquarters', 'Delhi', 'Delhi', '110001', 'IN', 1),
('addr-004', 'cnt-004', 'billing', 'Global Timber & Woods Co. Headquarters', 'Chennai', 'Tamil Nadu', '600001', 'IN', 1);

-- Analytic Accounts
INSERT INTO `analytic_accounts` (`id`, `organization_id`, `code`, `name`, `is_active`) VALUES
('ana-001', 'org-urban-001', 'ANA-OFFICE', 'Commercial Office Projects', 1),
('ana-002', 'org-urban-001', 'ANA-RESIDENTIAL', 'Residential Living Division', 1),
('ana-003', 'org-urban-001', 'ANA-BESPOKE', 'Custom Bespoke Orders', 1);

-- Documents & Invoices
INSERT INTO `commercial_documents` (`id`, `organization_id`, `contact_id`, `document_type`, `document_number`, `document_date`, `due_date`, `status`, `subtotal_amount`, `tax_amount`, `total_amount`) VALUES
('doc-so-001', 'org-urban-001', 'cnt-001', 'sales_order', 'SO-2026-001', '2026-08-15', NULL, 'confirmed', 37000.00, 6660.00, 43660.00),
('doc-inv-001', 'org-urban-001', 'cnt-001', 'customer_invoice', 'INV-2026-001', '2026-08-20', '2026-09-20', 'confirmed', 37000.00, 6660.00, 43660.00),
('doc-po-001', 'org-urban-001', 'cnt-002', 'purchase_order', 'PO-2026-001', '2026-08-10', NULL, 'confirmed', 42000.00, 7560.00, 49560.00),
('doc-bill-001', 'org-urban-001', 'cnt-002', 'vendor_bill', 'BILL-2026-001', '2026-08-12', '2026-09-12', 'confirmed', 42000.00, 7560.00, 49560.00);

-- Document Lines
INSERT INTO `commercial_document_lines` (`id`, `commercial_document_id`, `product_id`, `description`, `quantity`, `unit_price`, `line_tax_amount`, `line_total_amount`) VALUES
('line-001', 'doc-so-001', 'prd-001', 'Aeron Ergonomic Office Chair', 2.00, 18500.00, 6660.00, 43660.00),
('line-002', 'doc-inv-001', 'prd-001', 'Aeron Ergonomic Office Chair', 2.00, 18500.00, 6660.00, 43660.00),
('line-003', 'doc-po-001', 'prd-002', 'Solid Teak Wood Dining Table - Raw Stock', 2.00, 21000.00, 7560.00, 49560.00),
('line-004', 'doc-bill-001', 'prd-002', 'Solid Teak Wood Dining Table - Raw Stock', 2.00, 21000.00, 7560.00, 49560.00);

-- Payments & Allocations
INSERT INTO `payments` (`id`, `organization_id`, `contact_id`, `payment_number`, `payment_date`, `payment_direction`, `payment_method`, `amount`, `currency_code`) VALUES
('pay-001', 'org-urban-001', 'cnt-001', 'PAY-2026-001', '2026-08-25', 'inbound', 'bank_transfer', 25000.00, 'INR');

INSERT INTO `payment_allocations` (`id`, `payment_id`, `commercial_document_id`, `allocated_amount`) VALUES
('alloc-001', 'pay-001', 'doc-inv-001', 25000.00);

-- Budgets
INSERT INTO `budgets` (`id`, `organization_id`, `name`, `period_start`, `period_end`, `currency_code`, `status`) VALUES
('bgt-001', 'org-urban-001', 'Q3 2026 Production & Wood Procurement', '2026-07-01', '2026-09-30', 'INR', 'active'),
('bgt-002', 'org-urban-001', 'FY 2026-27 Marketing & Showroom Expansion', '2026-04-01', '2027-03-31', 'INR', 'active'),
('bgt-003', 'org-urban-001', 'Q4 2026 Hardware Accessories Stock', '2026-10-01', '2026-12-31', 'INR', 'draft');

SET FOREIGN_KEY_CHECKS = 1;
