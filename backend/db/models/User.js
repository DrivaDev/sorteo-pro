const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  verified:     { type: Boolean, default: false },

  // Verificación de email
  verificationCode:   { type: String, default: null },
  verificationExpiry: { type: Date,   default: null },

  // Instagram OAuth
  instagramUserId:      { type: String, default: null },
  instagramUsername:    { type: String, default: null },
  instagramAccessToken: { type: String, default: null },
  instagramTokenExpiry: { type: Date,   default: null },

  // Plan y uso
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  rafflesThisMonth: { type: Number, default: 0 },
  lastRaffleReset:  { type: Date,   default: null },
  // Límite mensual (null = ilimitado durante el período de lanzamiento)
  monthlyLimit: { type: Number, default: null },

}, { timestamps: true });

module.exports = model('User', userSchema);
