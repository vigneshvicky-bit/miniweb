const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/miniweb';
const FRONTEND_DIR = path.join(__dirname);

// ================== SECURITY ==================
app.disable('x-powered-by');

// ✅ FIX: Helmet with proper CSP so fonts, images, inline styles all work
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc:     ["'self'", "data:", "https://images.unsplash.com", "https:"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"],
      frameSrc:   ["'none'"],
      objectSrc:  ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json({ limit: '10kb' }));
app.use(cors());

// ✅ FIX: Define apiLimiter BEFORE using it
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ FIX: Apply rate limiter and static files
app.use('/api/contact', apiLimiter);
app.use(express.static(FRONTEND_DIR));

// ================== MONGOOSE SCHEMA ==================
const contactSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true, maxlength: 80 },
  phone:   { type: String, required: true, trim: true, maxlength: 30 },
  message: { type: String, trim: true, maxlength: 500 },
  date:    { type: Date, default: Date.now },
});

const Contact = mongoose.model('Contact', contactSchema);

// ================== MONGO CONNECT ==================
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ================== API ROUTES ==================

// Health check — used by loading screen
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, message } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required.' });
    }
    const contact = new Contact({ name, phone, message });
    await contact.save();
    return res.status(201).json({ success: true, message: 'Thank you! We will contact you soon.' });
  } catch (err) {
    console.error('Contact save error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ================== SERVE FRONTEND ==================
// ✅ All other routes → send index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ================== START SERVER ==================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});