const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const auth    = require('../middleware/auth');
const User    = require('../db/models/User');
const { getParticipants } = require('../services/instagram');

const GRAPH_BASE = 'https://graph.instagram.com';

// GET /api/instagram/connect  → redirige al OAuth de Meta (nueva Instagram API)
router.get('/connect', auth, (req, res) => {
  const params = new URLSearchParams({
    client_id:     process.env.META_APP_ID,
    redirect_uri:  process.env.INSTAGRAM_REDIRECT_URI,
    scope:         'instagram_business_basic,instagram_manage_comments',
    response_type: 'code',
    state:         req.userId,
  });
  res.redirect(`https://www.instagram.com/oauth/authorize?${params.toString()}`);
});

// GET /api/instagram/callback  → recibe el code y obtiene el token
router.get('/callback', async (req, res) => {
  const { code, state: userId, error } = req.query;
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  if (error) {
    return res.redirect(`${appUrl}/settings?ig_error=${encodeURIComponent(req.query.error_description || 'Acceso denegado')}`);
  }
  if (!code || !userId) {
    return res.redirect(`${appUrl}/settings?ig_error=Parámetros inválidos`);
  }

  try {
    // 1. Intercambiar code por short-lived token (nueva Instagram API)
    const tokenRes = await axios.post('https://api.instagram.com/oauth/access_token', new URLSearchParams({
      client_id:     process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      grant_type:    'authorization_code',
      redirect_uri:  process.env.INSTAGRAM_REDIRECT_URI,
      code,
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    const shortToken = tokenRes.data.access_token;
    const igUserId   = tokenRes.data.user_id;

    // 2. Intercambiar por long-lived token (60 días)
    const longRes = await axios.get(`${GRAPH_BASE}/access_token`, {
      params: {
        grant_type:    'ig_exchange_token',
        client_secret: process.env.META_APP_SECRET,
        access_token:  shortToken,
      },
    });

    const longToken = longRes.data.access_token;
    const expiresIn = longRes.data.expires_in;

    // 3. Obtener username
    const profileRes = await axios.get(`${GRAPH_BASE}/me`, {
      params: { fields: 'id,username', access_token: longToken },
    });

    const igUsername  = profileRes.data.username;
    const tokenExpiry = new Date(Date.now() + expiresIn * 1000);

    // 4. Guardar en el usuario
    await User.findByIdAndUpdate(userId, {
      instagramUserId:      igUserId,
      instagramUsername:    igUsername,
      instagramAccessToken: longToken,
      instagramTokenExpiry: tokenExpiry,
    });

    res.redirect(`${appUrl}/settings?ig_connected=1&ig_username=${encodeURIComponent(igUsername)}`);
  } catch (err) {
    console.error('[Instagram/Callback]', err.response?.data || err.message);
    const msg = err.response?.data?.error_message || err.response?.data?.error?.message || 'Error al conectar Instagram';
    res.redirect(`${appUrl}/settings?ig_error=${encodeURIComponent(msg)}`);
  }
});

// DELETE /api/instagram/disconnect
router.delete('/disconnect', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      instagramUserId:      null,
      instagramUsername:    null,
      instagramAccessToken: null,
      instagramTokenExpiry: null,
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al desconectar Instagram' });
  }
});

// POST /api/instagram/participants
router.post('/participants', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user?.instagramAccessToken) {
      return res.status(400).json({ error: 'No tenés una cuenta de Instagram conectada' });
    }

    const { postUrl, filters } = req.body;
    if (!postUrl) return res.status(400).json({ error: 'URL de publicación requerida' });

    const result = await getParticipants(postUrl, filters || {}, user.instagramAccessToken);
    res.json(result);
  } catch (err) {
    console.error('[Instagram/Participants]', err.message);
    if (err.response?.data?.error) {
      const apiErr = err.response.data.error;
      if (apiErr.code === 190) {
        return res.status(401).json({ error: 'Tu sesión de Instagram expiró. Reconectá tu cuenta.' });
      }
      return res.status(400).json({ error: apiErr.message || 'Error de la API de Instagram' });
    }
    res.status(500).json({ error: err.message || 'Error al obtener participantes' });
  }
});

module.exports = router;
