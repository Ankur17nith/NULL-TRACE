import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema(
  {
    callsign: {
      type: String,
      required: [true, 'Callsign is required'],
      trim: true,
      uppercase: true,
      maxlength: [24, 'Callsign cannot exceed 24 characters'],
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be negative'],
    },
    rank: {
      type: String,
      default: 'OPERATOR',
      trim: true,
    },
    missionsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index score descending for optimized top leaderboard querying
leaderboardSchema.index({ score: -1, createdAt: -1 });

export const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
