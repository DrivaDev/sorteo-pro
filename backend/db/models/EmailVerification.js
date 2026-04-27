const { Schema, model } = require('mongoose');

const emailVerificationSchema = new Schema({
  email:     { type: String, required: true, lowercase: true, trim: true },
  code:      { type: String, required: true },
  expiresAt: { type: Date,   required: true },
  used:      { type: Boolean, default: false },
}, { timestamps: true });

// TTL: MongoDB elimina el documento automáticamente 1 hora después de expiresAt
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = model('EmailVerification', emailVerificationSchema);
