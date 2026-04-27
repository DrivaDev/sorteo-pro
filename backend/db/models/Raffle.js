const { Schema, model } = require('mongoose');

const participantSchema = new Schema({
  username:     { type: String, required: true },
  displayName:  { type: String, default: null },
  commentCount: { type: Number, default: 0 },
  liked:        { type: Boolean, default: false },
  comments:     [{ type: String }],
}, { _id: false });

const winnerSchema = new Schema({
  username:    { type: String, required: true },
  displayName: { type: String, default: null },
  position:    { type: Number, required: true },
}, { _id: false });

const raffleSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  title: { type: String, required: true, trim: true },
  type:  { type: String, enum: ['instagram', 'manual'], required: true },

  // Solo para sorteos de Instagram
  instagramPostUrl: { type: String, default: null },
  instagramPostId:  { type: String, default: null },

  // Filtros aplicados (se guarda el estado al momento del sorteo)
  filters: {
    commenters:         { type: Boolean, default: false },
    likers:             { type: Boolean, default: false },
    commentersAndLikers:{ type: Boolean, default: false },
    minMentions:        { type: Number,  default: 0 },
    requiredKeyword:    { type: String,  default: '' },
    noDuplicates:       { type: Boolean, default: true },
    excludeAccounts:    [{ type: String }],
  },

  participants:     [participantSchema],
  participantCount: { type: Number, default: 0 },

  winnersCount:   { type: Number, default: 1 },
  alternatesCount:{ type: Number, default: 0 },
  winners:        [winnerSchema],
  alternates:     [winnerSchema],

  status:     { type: String, enum: ['draft', 'completed'], default: 'draft' },
  executedAt: { type: Date, default: null },

}, { timestamps: true });

module.exports = model('Raffle', raffleSchema);
