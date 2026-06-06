-- Cellphone Shop — Database Schema
-- Run this file against your PostgreSQL database to initialize all tables.

-- Users (customers and admins)
CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(100),
  email          VARCHAR(100) UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  phone          VARCHAR(20),
  role           VARCHAR(20) DEFAULT 'customer',
  created_at     TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  brand        VARCHAR(100),
  model        VARCHAR(100),
  type         VARCHAR(20) NOT NULL CHECK (type IN ('new', 'secondhand', 'accessory')),
  condition    VARCHAR(20) CHECK (condition IN ('Grade A', 'Grade B', 'Grade C')),
  price        DECIMAL(10,2) NOT NULL,
  stock        INT DEFAULT 0,
  description  TEXT,
  images       TEXT[] DEFAULT '{}',
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  user_id          INT REFERENCES users(id),
  customer_name    VARCHAR(100) NOT NULL,
  customer_phone   VARCHAR(20) NOT NULL,
  total            DECIMAL(10,2) NOT NULL,
  status           VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','ready','out_for_delivery','completed','cancelled')),
  fulfillment      VARCHAR(20) NOT NULL CHECK (fulfillment IN ('pickup', 'delivery')),
  address          TEXT,
  payment_method   VARCHAR(30) CHECK (payment_method IN ('gcash', 'cod', 'pay_in_store')),
  payment_status   VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  created_at       TIMESTAMP DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INT REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INT REFERENCES products(id),
  quantity    INT NOT NULL,
  price       DECIMAL(10,2) NOT NULL
);

-- Inventory log
CREATE TABLE IF NOT EXISTS inventory_log (
  id          SERIAL PRIMARY KEY,
  product_id  INT REFERENCES products(id),
  quantity    INT NOT NULL,
  notes       TEXT,
  logged_by   INT REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Refresh tokens (session management)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id           SERIAL PRIMARY KEY,
  user_id      INT REFERENCES users(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL,
  device_id    TEXT,
  last_used_at TIMESTAMP,
  expires_at   TIMESTAMP,
  is_revoked   BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
