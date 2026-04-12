const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/miniweb';
const FRONTEND_DIR = path.join(__dirname, '..');

app.use(cors());
app.use(express.json());
app.use(express.static(FRONTEND_DIR));

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  date: String,
  service: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});

app.post('/api/contact', async (req, res) => {
  const { name, phone, date, service, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
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
  res.sendFile(path.join(FRONTEND_DIR, 'index.HTML'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
