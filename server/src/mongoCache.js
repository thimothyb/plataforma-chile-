/**
 * MongoDB cache layer using Mongoose.
 *
 * Stores computed Moodle statistics in MongoDB so the dashboard
 * loads instantly.  A manual "refresh" re-fetches from the Moodle
 * API and overwrites the cached documents.
 */

const mongoose = require('mongoose');

// ── Schema ─────────────────────────────────────────────────────────────
const statsCacheSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true }, // "global" | "courses"
        data: { type: mongoose.Schema.Types.Mixed, required: true },
    },
    { timestamps: true } // adds createdAt & updatedAt automatically
);

const StatsCache = mongoose.model('StatsCache', statsCacheSchema);

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Connect to MongoDB.  Call once at server startup.
 */
async function connectMongo() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/moodle_cache';
    try {
        await mongoose.connect(uri);
        console.log('✅  MongoDB connected →', uri);
    } catch (err) {
        console.error('❌  MongoDB connection error:', err.message);
        // Don't crash the server – the app can still work without cache
    }
}

/**
 * Retrieve cached stats by key ("global" or "courses").
 * Returns null if nothing is cached yet.
 */
async function getCachedStats(key) {
    const doc = await StatsCache.findOne({ key });
    return doc; // { key, data, updatedAt, … } or null
}

/**
 * Save / update cached stats for the given key.
 */
async function setCachedStats(key, data) {
    return StatsCache.findOneAndUpdate(
        { key },
        { key, data },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
}

module.exports = { connectMongo, getCachedStats, setCachedStats };
