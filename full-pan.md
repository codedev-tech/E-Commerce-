# Cellphone Shop — Full System Plan

> Covers: project overview, build phases, tech stack, landing page, main shop page, admin panel, security, and error handling.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Build Phases](#2-build-phases)
3. [Tech Stack](#3-tech-stack)
4. [Sample / Placeholder Images](#4-sample--placeholder-images)
5. [Landing Page](#5-landing-page)
6. [Main Shop Page](#6-main-shop-page)
7. [Admin Panel](#7-admin-panel)
8. [Navigation Flow](#8-navigation-flow)
9. [Backend API Structure](#9-backend-api-structure)
10. [Database Schema](#10-database-schema)
11. [Security](#11-security)
12. [Error Handling](#12-error-handling)
13. [Third-Party Integrations](#13-third-party-integrations)
14. [Deployment](#14-deployment)
15. [Pre-Launch Checklist](#15-pre-launch-checklist)

---

## 1. Project Overview

A custom e-commerce system for a cellphone shop selling brand new phones, second-hand / ref units, and accessories. Supports both online ordering and in-store pickup, with manual GCash and COD payment options.

**Business type:** Brand new + second-hand + accessories
**Fulfillment:** Pickup or delivery
**Scale:** Small shop (solo or small staff)
**Priority:** Online store + inventory management

---

## 2. Build Phases

### Phase 1 — Core Store (1–2 months)

Focus on getting the store live and taking orders.

- Product listings with filters (Brand New / Second-hand / Accessories)
- Basic cart and checkout with conditional payment options
- Order form with pickup or delivery selection
- Customer registration and login
- Admin: add/edit/delete products, view and update orders
- Placeholder images during development (swap with real photos before launch)

### Phase 2 — Inventory + Admin (1 month)

Professionalize operations once sales are flowing.

- Inventory tracker with low-stock alerts
- Order status management (Pending → Confirmed → Completed)
- Basic sales reports (revenue per day/week, best-sellers)
- Customer list in admin

### Phase 3 — Growth Features (Optional)

Scale up after the core business is stable.

- Customer reviews and ratings
- Discount codes and promos
- Courier API integration (J&T, LBC)
- Facebook Shop sync
- SMS / Viber order notifications

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| State management | Zustand |
| Routing | React Router |
| HTTP client | Axios |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| DB query library | pg (node-postgres) |
| Auth | JWT + httpOnly cookies |
| Image storage | Cloudinary |
| Hosting (backend) | Railway or Render |
| Hosting (frontend) | Vercel |

> **No payment gateway integration needed for Phase 1.** Payment is handled manually — customer selects their method at checkout, then pays offline. Admin confirms payment manually via the admin panel.

### Project Folder Structure

```
cellphone-shop/
├── frontend/               ← React app (Vite)
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── assets/
│       │   └── placeholders/   ← sample images (replace before launch)
│       ├── store/              ← Zustand
│       └── lib/                ← Axios instance
└── backend/                ← Node.js + Express
    ├── routes/
    ├── middleware/
    ├── controllers/
    ├── utils/
    ├── db.js
    └── index.js
```

### Install Commands

```bash
# Frontend
npm create vite@latest frontend -- --template react
cd frontend
npm install react-router-dom axios zustand

# Backend
mkdir backend && cd backend
npm init -y
npm install express pg bcrypt jsonwebtoken dotenv cors helmet express-validator express-rate-limit
npm install -D nodemon
```

---

## 4. Sample / Placeholder Images

During development, use generated placeholder images for all products so the UI looks realistic before you have final photos. Replace each placeholder with the real product photo before launch.

### How to generate placeholder images

**Option A — Use an AI image generator (recommended)**
Use any of these free tools to generate clean product mockup images:

- [Leonardo.ai](https://leonardo.ai) — free tier, good phone mockups
- [Adobe Firefly](https://firefly.adobe.com) — free credits, clean white backgrounds
- [Canva AI](https://canva.com) — good for accessories and product cards

Prompt to use:
```
Product photo of [Samsung Galaxy A55 / iPhone 15 / phone case], 
on a clean white background, studio lighting, top-down angle, 
no text, high resolution, e-commerce style
```

**Option B — Use placeholder image services (for development only)**

In your React components, use these as temporary `src` values:

```jsx
// Generic phone placeholder (400x400)
<img src="https://placehold.co/400x400?text=Samsung+A55" alt="Samsung A55" />

// Or use a local placeholder component
const ProductImage = ({ src, name }) => (
  <img
    src={src || `https://placehold.co/400x400/e2e8f0/64748b?text=${encodeURIComponent(name)}`}
    alt={name}
    onError={(e) => {
      e.target.src = `https://placehold.co/400x400/e2e8f0/64748b?text=No+Image`;
    }}
  />
);
```

**Option C — Use a local placeholder folder**

Store generated sample images in `frontend/src/assets/placeholders/`:

```
frontend/src/assets/placeholders/
├── phone-samsung-a55.jpg       ← AI-generated or downloaded sample
├── phone-iphone-15.jpg
├── phone-vivo-y35.jpg
├── phone-oppo-a78.jpg
├── phone-ref-grade-a.jpg       ← generic "ref unit" image
├── accessory-case.jpg
├── accessory-charger.jpg
└── hero-banner.jpg             ← for the landing page hero section
```

### Image swap instructions (before launch)

When you have your actual product photos ready:

1. Name each photo to match the product (e.g. `samsung-galaxy-a55-black.jpg`)
2. Upload to Cloudinary via the admin panel's product form
3. The Cloudinary URL replaces the placeholder URL in the database automatically
4. No code changes needed — the product card just reads whatever URL is stored

### Recommended photo specs

| Use | Size | Format | Notes |
|---|---|---|---|
| Product card thumbnail | 400 × 400 px | JPG / WebP | Square, white background |
| Product detail main photo | 800 × 800 px | JPG / WebP | Square, clean bg |
| Hero banner (landing page) | 1280 × 640 px | JPG / WebP | Wide, can have gradient overlay |
| Admin product list thumbnail | 100 × 100 px | JPG | Auto-resized by Cloudinary |

---

## 5. Landing Page

The storefront — the first page every visitor sees. Goal: make an immediate impression and funnel the customer to the shop.

### Sections

#### 5.1 Topbar / Navigation

- Shop logo / name (left)
- Navigation links: Home, Shop, About, Contact (center)
- **Login button** (right) — opens login modal
- On mobile: hamburger menu

#### 5.2 Hero Section

- Large headline (e.g. "Your Next Phone Starts Here")
- Short tagline (e.g. "Brand new, ref units, and accessories — all with warranty")
- Primary CTA button: **"Shop Now"** → links to `/shop`
- Secondary CTA: **"View Ref Units"** → links to `/shop?type=secondhand`
- Background: hero banner image (use `hero-banner.jpg` placeholder, replace before launch)

#### 5.3 Features / Why Buy Here

Four short selling points in a row:

| Icon | Headline | Subtext |
|---|---|---|
| Phone | Brand New + Ref Units | Grade A, B, and C ref units available |
| Wallet | GCash / COD Accepted | Flexible payment options |
| Truck | Pickup or Delivery | Same-day pickup available |
| Shield | Warranty Included | All units come with warranty |

#### 5.4 Featured Products Preview

- Section title: "Latest Arrivals" or "Featured Units"
- 3–4 product cards pulled from the database (newest or manually featured)
- Each card: photo (placeholder until real photos are uploaded), model name, condition tag, price, "View" button
- "View All Products" button at the bottom → `/shop`

#### 5.5 Footer

- Shop name + short description
- Quick links: Shop, About, Contact
- Contact info: Facebook page, email, phone number
- Delivery coverage areas
- Copyright line

---

## 6. Main Shop Page

The full product catalog. Accessed via `/shop`.

### 6.1 Topbar

- Same logo and nav as landing page
- **Login button** (right): opens login modal
- After login: shows "Hi, [Name]" or "My Account" with dropdown (My Orders, Logout)

### 6.2 Filter Sidebar (Desktop) / Drawer (Mobile)

```
Category
  [ ] All
  [ ] Brand New
  [ ] Second-hand / Ref
  [ ] Accessories

Brand
  [ ] Samsung
  [ ] iPhone / Apple
  [ ] Vivo
  [ ] OPPO
  [ ] Xiaomi
  [ ] Realme
  [ ] Others

Condition (for ref units)
  [ ] Grade A
  [ ] Grade B
  [ ] Grade C

Price Range
  Min: [_____]  Max: [_____]

[ Clear Filters ]
```

### 6.3 Product Grid

- Search bar above the grid
- Sort dropdown: Newest, Price Low–High, Price High–Low
- Product cards in a responsive grid (3 columns desktop, 2 tablet, 1 mobile)

**Each product card contains:**

- Product photo (placeholder image if no real photo yet)
- Model name (e.g. "Samsung Galaxy A55")
- Condition badge: `NEW` / `Grade A` / `Grade B` / `Accessory`
- Price (e.g. ₱18,500)
- Stock status: "In Stock" / "Low Stock" / "Out of Stock"
- "Add to Cart" button

### 6.4 Cart

- Cart icon with item count badge in topbar
- Slide-in cart drawer (right side)
- Shows: product photo, name, quantity controls, subtotal
- Checkout button at bottom

### 6.5 Checkout Flow

1. Cart review
2. Customer info (name, phone number)
3. Fulfillment selection:

```
How would you like to receive your order?

  ( ) Delivery
        → Enter delivery address
        → Delivery fee shown

  ( ) Pickup
        → Show store address + hours
        → No delivery fee
```

4. Payment method — **options change based on fulfillment**:

```
IF DELIVERY selected:
  ( ) GCash
        → After placing order, you will see the GCash number
          Send the exact amount with your order number as reference
  ( ) Cash on Delivery (COD)
        → Pay the rider when the order arrives

IF PICKUP selected:
  ( ) GCash
        → Send payment before coming to the store
          GCash number shown after order is placed
  ( ) Pay in Store
        → Pay cash when you pick up your order
```

5. Order summary + "Place Order" button
6. Order confirmation page with:
   - Order number
   - Summary of items
   - If GCash selected: show GCash number + exact amount + instruction to include order number in the reference/note
   - If COD: "Pay the rider upon delivery"
   - If Pay in Store: "Pay when you arrive at the store"

---

## 7. Admin Panel

Accessible at `/admin`. Requires admin login. Completely separate from the customer-facing site in terms of routing and JWT role verification.

### 7.1 Admin Login Page

- Email + password form
- JWT role check: must be `role = 'admin'`
- Failed login returns generic error (never specify which field was wrong)
- Rate limited: 5 attempts per 15 minutes

### 7.2 Dashboard

First screen after admin login. At-a-glance health check.

- Total sales today / this week / this month
- Number of pending orders (with quick-view list)
- Low stock alerts (units with stock below threshold)
- Recent orders table (last 10 orders)
- Quick action buttons: Add Product, View All Orders

### 7.3 Product Management (`/admin/products`)

- Table of all products: photo, name, type, condition, price, stock, status
- Filters: by category, by brand, by status (active/inactive)
- **Add Product** form:
  - Name, brand, model
  - Type: Brand New / Second-hand / Accessory
  - Condition grade (Grade A / B / C — for ref units only)
  - Price
  - Stock quantity
  - Description
  - Upload photos (multiple — stored on Cloudinary; use placeholder during dev)
  - Toggle: Active / Inactive
- **Edit Product**: same form, pre-filled
- **Delete Product**: marks as inactive (soft delete — not permanently removed)

### 7.4 Order Management (`/admin/orders`)

- Table of all orders: order ID, customer name, items, total, fulfillment, payment method, payment status, order status, date
- Filter by status, date range, fulfillment type
- **Order detail view**:
  - Items ordered (photo, name, qty, price)
  - Customer name and phone number
  - Fulfillment: Pickup or Delivery
  - Delivery address (if delivery)
  - Payment method selected by customer
  - Payment status: Unpaid / Paid
  - **"Mark as Paid"** button — click this after you confirm GCash payment on your phone
  - Order status with update button

**Order status flow:**

```
Pending → Confirmed → Ready for Pickup / Out for Delivery → Completed
                                                           ↘ Cancelled
```

### 7.5 Inventory Tracker (`/admin/inventory`)

- Table of all products with current stock levels
- Color-coded: green (OK), yellow (low), red (out of stock)
- Set custom low-stock threshold per product
- **Stock-in form**: log incoming units (date, quantity, notes)
- Stock history log per product

### 7.6 Customer List (`/admin/customers`)

- Table of registered customers: name, email, phone, total orders, total spent, date joined
- Click customer to view their order history

### 7.7 Sales Reports (`/admin/reports`)

- Revenue chart: daily / weekly / monthly toggle
- Best-selling products (top 10 by units sold)
- Sales breakdown by category: New vs Ref vs Accessories
- Payment method breakdown: GCash vs COD vs Pay in Store
- Export to CSV (Phase 2)

---

## 8. Navigation Flow

```
Landing Page  (/)
    │
    ├── "Shop Now" button
    │       ↓
    │   Main Shop Page  (/shop)
    │       ├── Filter sidebar
    │       ├── Product grid
    │       ├── Add to Cart → Cart drawer
    │       │       ↓
    │       │   Checkout  (/checkout)
    │       │       ├── Select: Delivery or Pickup
    │       │       ├── Select: GCash / COD (delivery) or GCash / Pay in Store (pickup)
    │       │       ↓
    │       │   Order Confirmation  (/order/:id)
    │       │       └── GCash: shows number + amount + instructions
    │       │
    │       └── Login button (topbar)
    │               ↓
    │           Login modal
    │               ↓
    │           My Account / My Orders  (/account)
    │
    └── Admin Login  (/admin/login)
            ↓
        Admin Dashboard  (/admin)
            ├── Products     (/admin/products)
            ├── Orders       (/admin/orders)
            ├── Inventory    (/admin/inventory)
            ├── Customers    (/admin/customers)
            └── Reports      (/admin/reports)
```

---

## 9. Backend API Structure

```
backend/
├── routes/
│   ├── auth.js        POST /api/auth/login
│   │                  POST /api/auth/register
│   │                  POST /api/auth/refresh
│   │                  POST /api/auth/logout
│   │
│   ├── products.js    GET    /api/products          (with filters + search)
│   │                  GET    /api/products/:id
│   │                  POST   /api/products          (admin only)
│   │                  PUT    /api/products/:id      (admin only)
│   │                  DELETE /api/products/:id      (admin only)
│   │
│   ├── orders.js      POST   /api/orders
│   │                  GET    /api/orders/:id
│   │                  GET    /api/orders/my         (customer's own orders)
│   │                  GET    /api/orders            (admin only — all orders)
│   │                  PUT    /api/orders/:id/status (admin only)
│   │                  PUT    /api/orders/:id/payment (admin only — mark as paid)
│   │
│   └── inventory.js   GET    /api/inventory         (admin only)
│                      POST   /api/inventory/stock-in (admin only)
│
├── middleware/
│   ├── auth.js         ← verifies JWT, attaches req.user
│   └── requireAdmin.js ← checks req.user.role === 'admin'
│
├── utils/
│   └── AppError.js     ← custom error class
│
├── db.js               ← PostgreSQL pool connection
└── index.js            ← Express app setup
```

> Note: No `payments.js` route needed in Phase 1 — payment confirmation is done manually by admin.

---

## 10. Database Schema

```sql
-- Users (customers and admins)
CREATE TABLE users (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(100),
  email          VARCHAR(100) UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  phone          VARCHAR(20),
  role           VARCHAR(20) DEFAULT 'customer',  -- 'customer' or 'admin'
  created_at     TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  brand        VARCHAR(100),
  model        VARCHAR(100),
  type         VARCHAR(20) NOT NULL,     -- 'new', 'secondhand', 'accessory'
  condition    VARCHAR(20),              -- 'Grade A', 'Grade B', 'Grade C'
  price        DECIMAL(10,2) NOT NULL,
  stock        INT DEFAULT 0,
  description  TEXT,
  images       TEXT[],                  -- array of Cloudinary URLs (or placeholder URLs)
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id               SERIAL PRIMARY KEY,
  user_id          INT REFERENCES users(id),
  total            DECIMAL(10,2) NOT NULL,
  status           VARCHAR(30) DEFAULT 'pending',
  fulfillment      VARCHAR(20) NOT NULL,    -- 'pickup' or 'delivery'
  address          TEXT,                    -- required only if fulfillment = 'delivery'
  payment_method   VARCHAR(30),             -- 'gcash', 'cod', 'pay_in_store'
  payment_status   VARCHAR(20) DEFAULT 'unpaid',  -- 'unpaid' or 'paid'
  created_at       TIMESTAMP DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INT REFERENCES orders(id),
  product_id  INT REFERENCES products(id),
  quantity    INT NOT NULL,
  price       DECIMAL(10,2) NOT NULL   -- snapshot of price at time of order
);

-- Inventory log
CREATE TABLE inventory_log (
  id          SERIAL PRIMARY KEY,
  product_id  INT REFERENCES products(id),
  quantity    INT NOT NULL,
  notes       TEXT,
  logged_by   INT REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Refresh tokens (session management)
CREATE TABLE refresh_tokens (
  id           SERIAL PRIMARY KEY,
  user_id      INT REFERENCES users(id),
  token_hash   TEXT NOT NULL,
  device_id    TEXT,
  last_used_at TIMESTAMP,
  expires_at   TIMESTAMP,
  is_revoked   BOOLEAN DEFAULT false
);
```

**Payment method values by fulfillment type:**

| Fulfillment | Allowed payment_method values |
|---|---|
| `delivery` | `gcash`, `cod` |
| `pickup` | `gcash`, `pay_in_store` |

---

## 11. Security

### 11.1 Authentication — JWT + httpOnly Cookies

- Access token: **15–30 minute expiry**, stored in memory (never localStorage)
- Refresh token: **7-day expiry**, stored in `httpOnly` cookie (JavaScript cannot read it)
- On logout: mark refresh token as `is_revoked = true` in the database

```js
// Sign tokens
const accessToken = jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

const refreshToken = jwt.sign(
  { id: user.id },
  process.env.REFRESH_SECRET,
  { expiresIn: '7d' }
);

// Set refresh token as httpOnly cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: true,       // HTTPS only
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

### 11.2 Session Limits

Store active refresh tokens in the database with a `device_id`. Enforce a maximum of 3 active sessions per user. On new login from a 4th device, revoke the oldest session.

### 11.3 Password Hashing

Always hash passwords with `bcrypt` at cost factor 12:

```js
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(plainPassword, 12);
const valid = await bcrypt.compare(plainPassword, hash);
```

### 11.4 Rate Limiting

```js
const rateLimit = require('express-rate-limit');

// Login: 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Try again later.' }
});

// General API: 100 requests per minute
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100
});

// Admin routes: 30 requests per minute
const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30
});

app.post('/api/auth/login', loginLimiter, authController.login);
app.use('/api/', apiLimiter);
app.use('/api/admin/', adminLimiter);
```

### 11.5 Input Validation

Validate and sanitize all incoming data with `express-validator`. Never trust the frontend.

```js
const { body, validationResult } = require('express-validator');

const validateProduct = [
  body('name').trim().notEmpty().isLength({ max: 200 }),
  body('price').isFloat({ min: 0 }),
  body('stock').isInt({ min: 0 }),
  body('type').isIn(['new', 'secondhand', 'accessory']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validate payment method matches fulfillment type
const validateOrder = [
  body('fulfillment').isIn(['pickup', 'delivery']),
  body('payment_method').custom((value, { req }) => {
    const allowed = {
      delivery: ['gcash', 'cod'],
      pickup:   ['gcash', 'pay_in_store']
    };
    if (!allowed[req.body.fulfillment]?.includes(value)) {
      throw new Error('Invalid payment method for selected fulfillment type.');
    }
    return true;
  }),
];
```

### 11.6 SQL Injection Prevention

Always use **parameterized queries** — never string concatenation:

```js
// CORRECT
const result = await db.query(
  'SELECT * FROM products WHERE id = $1', [productId]
);

// NEVER DO THIS
const result = await db.query(
  `SELECT * FROM products WHERE id = ${productId}` // vulnerable!
);
```

### 11.7 Security Headers

```js
const helmet = require('helmet');
app.use(helmet());
```

### 11.8 CORS

Only allow your actual frontend domain:

```js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### 11.9 Admin Route Protection

```js
// middleware/requireAdmin.js
module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

// Usage
router.post('/products', verifyToken, requireAdmin, createProduct);
router.put('/orders/:id/payment', verifyToken, requireAdmin, markAsPaid);
```

### 11.10 Security Checklist

| Area | Requirement |
|---|---|
| Passwords | `bcrypt` with cost factor 12 |
| Access tokens | Short-lived JWT (15–30 min), in-memory only |
| Refresh tokens | httpOnly cookie, stored + revokable in DB |
| Session limit | Max 3 active sessions per user |
| Login protection | Rate limit: 5 attempts / 15 min |
| General API | Rate limit: 100 req / min |
| Admin API | Rate limit: 30 req / min + role check |
| SQL queries | Always parameterized — never interpolated |
| Input data | Validated + sanitized before DB write |
| Payment method | Validated server-side against fulfillment type |
| Error messages | Generic to client, full detail in server logs |
| HTTP headers | `helmet` middleware enabled |
| CORS | Whitelist production domain only |
| Admin routes | `requireAdmin` middleware on every route |

---

## 12. Error Handling

### 12.1 Custom Error Class (Backend)

```js
// utils/AppError.js
class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

module.exports = AppError;

// Usage
throw new AppError('Product not found.', 404);
throw new AppError('Insufficient stock.', 400);
throw new AppError('Invalid payment method for this fulfillment type.', 400);
throw new AppError('Admin access required.', 403);
```

### 12.2 Global Error Handler (Express)

Add at the bottom of `index.js` — after all routes:

```js
app.use((err, req, res, next) => {
  const status = err.status || 500;

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.url}`, err);

  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? getPublicMessage(status)
      : err.message
  });
});

function getPublicMessage(status) {
  const messages = {
    400: 'Invalid request.',
    401: 'Please log in to continue.',
    403: 'You do not have permission to do this.',
    404: 'Resource not found.',
    429: 'Too many requests. Please slow down.',
    500: 'Something went wrong on our end. Please try again.'
  };
  return messages[status] || 'An unexpected error occurred.';
}
```

### 12.3 Frontend Axios Interceptor

```js
// src/lib/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

api.interceptors.response.use(
  res => res,
  async err => {
    const status = err.response?.status;

    if (status === 401) {
      try {
        await api.post('/auth/refresh');
        return api(err.config);
      } catch {
        window.location.href = '/login';
      }
    }

    if (status === 403) window.location.href = '/';
    if (status === 429) showToast('Too many requests. Please wait a moment.');
    if (status >= 500) showToast('Server error. Please try again later.');

    return Promise.reject(err);
  }
);

export default api;
```

### 12.4 HTTP Status Code Reference

| Code | Meaning | When to use |
|---|---|---|
| 200 | OK | Successful GET or PUT |
| 201 | Created | Successful POST (new resource created) |
| 400 | Bad Request | Invalid input, wrong payment method for fulfillment |
| 401 | Unauthorized | Not logged in / token expired |
| 403 | Forbidden | Logged in but not allowed (e.g. non-admin) |
| 404 | Not Found | Product, order, or user doesn't exist |
| 409 | Conflict | Email already registered |
| 422 | Unprocessable | Out of stock, business rule violation |
| 429 | Too Many Requests | Rate limit hit |
| 500 | Server Error | Unhandled exceptions, database errors |

---

## 13. Third-Party Integrations

### 13.1 Cloudinary (Image Storage)

Upload product photos to Cloudinary rather than storing on your own server. Use placeholder images during development — upload real product photos through the admin panel before launch.

```js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key:    process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const result = await cloudinary.uploader.upload(filePath, {
  folder: 'cellphone-shop/products',
  transformation: [{ width: 800, crop: 'limit' }]
});

const imageUrl = result.secure_url; // store this in products.images[]
```

### 13.2 Semaphore / Itexmo (SMS Notifications — Phase 2)

Philippine-based SMS providers. Send order status updates to the customer's phone when order status changes. Not needed for Phase 1.

---

## 14. Deployment

| Component | Platform | Notes |
|---|---|---|
| Frontend (React + Vite) | Vercel | Free tier, auto-deploy from GitHub |
| Backend (Node.js + Express) | Railway or Render | Free tier available |
| Database (PostgreSQL) | Railway or Supabase | Managed PostgreSQL |
| Images | Cloudinary | Free tier: 25GB storage |

### Environment Variables (`.env`)

```
# Backend
DATABASE_URL=postgresql://user:password@host:5432/cellphone_shop
JWT_SECRET=your_long_random_secret_here
REFRESH_SECRET=another_long_random_secret
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret
FRONTEND_URL=https://yourshop.com
NODE_ENV=production

# Frontend
VITE_API_URL=https://api.yourshop.com
```

> No payment gateway keys needed — payments are confirmed manually.

**Never commit `.env` to Git.** Add it to `.gitignore` immediately.

---

## 15. Pre-Launch Checklist

### Images

- [ ] Generate placeholder images for all products using AI tool (Leonardo.ai, Adobe Firefly, or Canva AI)
- [ ] Place placeholders in `frontend/src/assets/placeholders/`
- [ ] Verify all product cards and the hero section show images correctly
- [ ] Replace placeholder images with real product photos before going live
- [ ] Upload final photos to Cloudinary via the admin product form

### Content

- [ ] Shop name finalized
- [ ] Logo ready (or text logo set)
- [ ] GCash number confirmed and added to order confirmation page
- [ ] At least 10–20 products added with descriptions and prices
- [ ] Pricing set (SRP vs selling price for new; grade + price for ref units)
- [ ] Delivery policy written (coverage area, fee, lead time)
- [ ] Warranty policy written (especially for second-hand units)
- [ ] Store address and pickup hours added (for pickup orders)
- [ ] Contact info complete (Facebook page, phone, email)

### Technical

- [ ] HTTPS enabled
- [ ] All `.env` variables set in production
- [ ] Cloudinary account set up and working
- [ ] Payment method validation active (server-side, per fulfillment type)
- [ ] Rate limiting active on login and API routes
- [ ] Admin route protected by `requireAdmin` middleware
- [ ] Database backups configured
- [ ] Error monitoring set up (e.g. Sentry — free tier)

### Testing

- [ ] Test delivery order with GCash — confirm GCash number and amount shown on confirmation page
- [ ] Test delivery order with COD
- [ ] Test pickup order with GCash
- [ ] Test pickup order with Pay in Store
- [ ] Verify COD is not shown as an option for pickup orders
- [ ] Verify Pay in Store is not shown as an option for delivery orders
- [ ] Test admin: add product with placeholder image, update order status, mark as paid
- [ ] Test login rate limiting (5 failed attempts)
- [ ] Test on mobile (iOS + Android browsers)

---

*Document version: 1.1 — updated payment flow (manual, no gateway), confirmed tech stack (React + Vite + Node + Express), added placeholder image instructions.*
*Update this document as the system evolves.*
