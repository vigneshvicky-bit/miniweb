const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// 🔥 Mongo URI (must come from ENV in production)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/miniweb';
const FRONTEND_DIR = path.join(__dirname);

// 🔐 Security Middlewares
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

// 🌐 CORS (Allow all for now — you can restrict later)
app.use(cors());

// 🚫 Rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
  message: 'Too many requests, try again later.',
});
app.use('/api/contact', apiLimiter);

// ✅ VERY IMPORTANT (serves CSS, JS, images)
app.use(express.static(FRONTEND_DIR));


// ================== DATABASE ==================
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  date: { type: String, trim: true, maxlength: 30 },
  service: { type: String, trim: true, maxlength: 100 },
  message: { type: String, trim: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model('Contact', contactSchema);

const phoneRegex = /^[\d+()\-\s]{7,30}$/;

// ================== MONGO CONNECT ==================
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });


// ================== ROUTES ==================
app.post('/api/contact', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const phone = String(req.body.phone || '').trim();
  const date = String(req.body.date || '').trim();
  const service = String(req.body.service || '').trim();
  const message = String(req.body.message || '').trim();

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }

  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone number.' });
  }

  try {
    const contact = new Contact({ name, phone, date, service, message });
    await contact.save();
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to save enquiry.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 🔥 FRONTEND ROUTE (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// ================== START SERVER ==================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});