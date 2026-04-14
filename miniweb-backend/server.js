const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/miniweb';
const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:4000', 'http://127.0.0.1:4000'];

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy does not allow this origin.'));
    },
    optionsSuccessStatus: 200,
  })
);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/contact', apiLimiter);
app.use(express.static(__dirname));

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

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

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
    return res.status(400).json({ error: 'Please enter a valid phone number.' });
  }

  try {
    const contact = new Contact({ name, phone, date, service, message });
    await contact.save();
    return res.status(201).json({ success: true, id: contact._id });
  } catch (error) {
    console.error('Failed to save contact:', error);
    return res.status(500).json({ error: 'Unable to save enquiry.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
