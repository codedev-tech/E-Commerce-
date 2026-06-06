require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const adminRoutes = require('./routes/admin');

const app = express();

// Security headers
app.use(helmet());

// CORS — only allow the frontend domain
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Try again later.' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
});

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});

// Routes
app.use('/api/auth/login', loginLimiter);
app.use('/api/', apiLimiter);
app.use('/api/admin/', adminLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Resource not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.url}`, err);

  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? getPublicMessage(status)
      : err.message,
  });
});

function getPublicMessage(status) {
  const messages = {
    400: 'Invalid request.',
    401: 'Please log in to continue.',
    403: 'You do not have permission to do this.',
    404: 'Resource not found.',
    429: 'Too many requests. Please slow down.',
    500: 'Something went wrong on our end. Please try again.',
  };
  return messages[status] || 'An unexpected error occurred.';
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
