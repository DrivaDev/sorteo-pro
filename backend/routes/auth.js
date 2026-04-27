const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../db/models/User');
const EmailVerification = require('../db/models/EmailVerification');
const { sendVerificationCode } = require('../services/email');

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email: email.toLowerCase(), passwordHash });

    // Crear y enviar código de verificación
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await EmailVerification.create({ email: email.toLowerCase(), code, expiresAt });
    await sendVerificationCode(email.toLowerCase(), code);

    res.status(201).json({ ok: true, message: 'Cuenta creada. Revisá tu email para verificar tu cuenta.' });
  } catch (err) {
    console.error('[Auth/Register]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email y código son requeridos' });

    const record = await EmailVerification.findOne({
      email: email.toLowerCase(),
      code,
      used: false,
      expiresAt: { $gt: new Date() },
    });
    if (!record) return res.status(400).json({ error: 'Código inválido o expirado' });

    await EmailVerification.updateOne({ _id: record._id }, { used: true });
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { verified: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const token = signToken(user._id);
    res.json({ ok: true, token, user: { email: user.email, verified: true } });
  } catch (err) {
    console.error('[Auth/VerifyEmail]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/resend-code
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (user.verified) return res.status(400).json({ error: 'La cuenta ya está verificada' });

    // Invalidar códigos anteriores
    await EmailVerification.updateMany({ email: email.toLowerCase(), used: false }, { used: true });

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await EmailVerification.create({ email: email.toLowerCase(), code, expiresAt });
    await sendVerificationCode(email.toLowerCase(), code);

    res.json({ ok: true, message: 'Código reenviado' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Email o contraseña incorrectos' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Email o contraseña incorrectos' });

    if (!user.verified) return res.status(403).json({ error: 'Verificá tu email antes de ingresar', needsVerification: true, email: user.email });

    const token = signToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        plan: user.plan,
        instagramUsername: user.instagramUsername,
        instagramConnected: !!user.instagramAccessToken,
        rafflesThisMonth: user.rafflesThisMonth,
      },
    });
  } catch (err) {
    console.error('[Auth/Login]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/me  (requiere token)
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({
      id: user._id,
      email: user.email,
      plan: user.plan,
      instagramUsername: user.instagramUsername,
      instagramConnected: !!user.instagramAccessToken,
      rafflesThisMonth: user.rafflesThisMonth,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
