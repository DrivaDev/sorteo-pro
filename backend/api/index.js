require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.APP_URL || 'http://localhost:3000',
  'http://localhost:5173',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));

// ── MongoDB ───────────────────────────────────────────────────────────────────
let dbReady = false;
async function connectDB() {
  if (dbReady) return;
  await mongoose.connect(process.env.MONGODB_URI);
  dbReady = true;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB] Connection error:', err.message);
    res.status(503).json({ error: 'Base de datos no disponible' });
  }
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('../routes/auth'));
app.use('/api/instagram',    require('../routes/instagram'));
app.use('/api/raffles',      require('../routes/raffles'));
app.use('/api/certificates', require('../routes/certificates'));

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ── Local dev server ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`[Server] http://localhost:${PORT}`));
}

module.exports = app;
