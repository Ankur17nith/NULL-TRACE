import { Leaderboard } from '../models/Leaderboard.js';
import { isDbConnected } from '../config/db.js';

// In-memory cache for fallback when MongoDB is not connected
let inMemoryLeaderboard = [
  { callsign: 'CIPHER_99', score: 9850, rank: 'GHOST', createdAt: new Date() },
  { callsign: 'ZERO_COOL', score: 8400, rank: 'SPEC_OPS', createdAt: new Date() },
  { callsign: 'NEO_TRACE', score: 7150, rank: 'OPERATOR', createdAt: new Date() },
];

export const getLeaderboard = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        source: 'memory_fallback',
        data: inMemoryLeaderboard.sort((a, b) => b.score - a.score),
      });
    }

    const leaderboard = await Leaderboard.find({})
      .sort({ score: -1, createdAt: -1 })
      .limit(50)
      .select('callsign score rank missionsCompleted createdAt');

    return res.status(200).json({
      success: true,
      source: 'database',
      data: leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

export const submitScore = async (req, res, next) => {
  try {
    const { callsign, score, rank = 'OPERATOR', missionsCompleted = 0, timeSpent = 0 } = req.body;

    if (!callsign || typeof callsign !== 'string' || callsign.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'A valid callsign is required',
      });
    }

    if (score === undefined || typeof score !== 'number' || score < 0) {
      return res.status(400).json({
        success: false,
        error: 'A valid non-negative numeric score is required',
      });
    }

    const cleanCallsign = callsign.trim().toUpperCase().slice(0, 24);

    if (!isDbConnected()) {
      // In-memory fallback
      const existingIdx = inMemoryLeaderboard.findIndex(e => e.callsign === cleanCallsign);
      if (existingIdx >= 0) {
        if (score > inMemoryLeaderboard[existingIdx].score) {
          inMemoryLeaderboard[existingIdx].score = score;
          inMemoryLeaderboard[existingIdx].rank = rank;
        }
      } else {
        inMemoryLeaderboard.push({
          callsign: cleanCallsign,
          score,
          rank,
          missionsCompleted,
          timeSpent,
          createdAt: new Date(),
        });
      }

      return res.status(201).json({
        success: true,
        source: 'memory_fallback',
        data: {
          callsign: cleanCallsign,
          score,
          rank,
        },
      });
    }

    // Persist to MongoDB
    // If callsign already exists, update if score is higher, or record new run
    let entry = await Leaderboard.findOne({ callsign: cleanCallsign });

    if (entry) {
      if (score > entry.score) {
        entry.score = score;
        entry.rank = rank;
        entry.missionsCompleted = Math.max(entry.missionsCompleted, missionsCompleted);
        entry.timeSpent = timeSpent;
        await entry.save();
      }
    } else {
      entry = await Leaderboard.create({
        callsign: cleanCallsign,
        score,
        rank,
        missionsCompleted,
        timeSpent,
      });
    }

    return res.status(201).json({
      success: true,
      source: 'database',
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};
