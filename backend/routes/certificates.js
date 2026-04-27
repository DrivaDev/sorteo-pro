const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const Raffle  = require('../db/models/Raffle');
const { generateCertificate } = require('../services/certificate');

// GET /api/certificates/:raffleId  → descarga el PDF del acta
router.get('/:raffleId', auth, async (req, res) => {
  try {
    const raffle = await Raffle.findOne({ _id: req.params.raffleId, userId: req.userId }).lean();
    if (!raffle) return res.status(404).json({ error: 'Sorteo no encontrado' });

    const filename = `acta-sorteo-${raffle._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    generateCertificate(raffle, res);
  } catch (err) {
    console.error('[Certificates]', err);
    res.status(500).json({ error: 'Error al generar el certificado' });
  }
});

module.exports = router;
