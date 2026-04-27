const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const User    = require('../db/models/User');
const Raffle  = require('../db/models/Raffle');
const { runRaffle } = require('../services/raffle');

// Verifica si el usuario alcanzó el límite mensual
async function checkMonthlyLimit(user) {
  if (user.monthlyLimit === null) return true; // ilimitado durante lanzamiento

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Resetear contador si cambió el mes
  if (!user.lastRaffleReset || user.lastRaffleReset < firstOfMonth) {
    await User.findByIdAndUpdate(user._id, { rafflesThisMonth: 0, lastRaffleReset: now });
    return true;
  }
  return user.rafflesThisMonth < user.monthlyLimit;
}

// GET /api/raffles  → historial del usuario
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [raffles, total] = await Promise.all([
      Raffle.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-participants') // no incluir la lista completa en el listado
        .lean(),
      Raffle.countDocuments({ userId: req.userId }),
    ]);
    res.json({ raffles, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener sorteos' });
  }
});

// GET /api/raffles/:id  → detalle de un sorteo
router.get('/:id', auth, async (req, res) => {
  try {
    const raffle = await Raffle.findOne({ _id: req.params.id, userId: req.userId }).lean();
    if (!raffle) return res.status(404).json({ error: 'Sorteo no encontrado' });
    res.json(raffle);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el sorteo' });
  }
});

// POST /api/raffles  → crear y ejecutar un sorteo
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const canRaffle = await checkMonthlyLimit(user);
    if (!canRaffle) {
      return res.status(403).json({
        error: `Alcanzaste el límite de ${user.monthlyLimit} sorteo(s) por mes. Actualizá tu plan para continuar.`,
        limitReached: true,
      });
    }

    const {
      title, type, instagramPostUrl, instagramPostId,
      filters, participants, winnersCount = 1, alternatesCount = 0,
    } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: 'El título es requerido' });
    if (!type || !['instagram', 'manual'].includes(type)) return res.status(400).json({ error: 'Tipo inválido' });
    if (!participants?.length) return res.status(400).json({ error: 'No hay participantes' });

    // Ejecutar el sorteo
    const { winners, alternates } = runRaffle(participants, parseInt(winnersCount), parseInt(alternatesCount));

    const raffle = await Raffle.create({
      userId:          req.userId,
      title:           title.trim(),
      type,
      instagramPostUrl: instagramPostUrl || null,
      instagramPostId:  instagramPostId  || null,
      filters:          filters || {},
      participants,
      participantCount: participants.length,
      winnersCount:     parseInt(winnersCount),
      alternatesCount:  parseInt(alternatesCount),
      winners,
      alternates,
      status:           'completed',
      executedAt:       new Date(),
    });

    // Incrementar contador mensual
    await User.findByIdAndUpdate(req.userId, {
      $inc: { rafflesThisMonth: 1 },
      lastRaffleReset: user.lastRaffleReset || new Date(),
    });

    res.status(201).json({
      raffle: {
        id:               raffle._id,
        title:            raffle.title,
        type:             raffle.type,
        participantCount: raffle.participantCount,
        winners:          raffle.winners,
        alternates:       raffle.alternates,
        executedAt:       raffle.executedAt,
      },
    });
  } catch (err) {
    console.error('[Raffles/Create]', err);
    res.status(500).json({ error: err.message || 'Error al ejecutar el sorteo' });
  }
});

// DELETE /api/raffles/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const raffle = await Raffle.findOne({ _id: req.params.id, userId: req.userId });
    if (!raffle) return res.status(404).json({ error: 'Sorteo no encontrado' });
    await raffle.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el sorteo' });
  }
});

module.exports = router;
