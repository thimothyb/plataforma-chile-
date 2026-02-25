/**
 * Express router for course-statistics endpoints.
 *
 * GET  /api/stats/global       → cached global stats (fast)
 * GET  /api/stats/courses      → cached per-course stats (fast)
 * GET  /api/stats/last-updated → timestamp of last cache refresh
 * POST /api/stats/refresh      → re-fetch from Moodle API → save to MongoDB
 *
 * All GET endpoints serve from MongoDB cache.  If no cache exists yet,
 * they transparently fetch from Moodle and populate the cache.
 */

const express = require('express');
const router = express.Router();
const { getGlobalStats, getPerCourseStats } = require('../dataHelper');
const { getCachedStats, setCachedStats } = require('../mongoCache');

/**
 * Parse the optional courseIds query string into an array of numbers.
 */
function parseCourseIds(raw) {
    if (!raw) return [];
    return raw
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n > 0);
}

// ── GET /api/stats/global ──────────────────────────────────────────────
router.get('/global', async (req, res) => {
    try {
        const courseIds = parseCourseIds(req.query.courseIds);
        const cacheKey = courseIds.length > 0 ? `global:${courseIds.sort().join(',')}` : 'global';

        // Try cache first
        const cached = await getCachedStats(cacheKey);
        if (cached) {
            console.log(`[cache hit] ${cacheKey}`);
            return res.json({ ...cached.data, _cachedAt: cached.updatedAt });
        }

        // No cache → fetch from Moodle and store
        console.log(`[cache miss] ${cacheKey} — fetching from Moodle…`);
        const stats = await getGlobalStats(courseIds);
        const doc = await setCachedStats(cacheKey, stats);
        res.json({ ...stats, _cachedAt: doc.updatedAt });
    } catch (err) {
        console.error('[/api/stats/global]', err);
        res.status(500).json({ error: 'Error fetching global statistics.', details: err.message });
    }
});

// ── GET /api/stats/courses ─────────────────────────────────────────────
router.get('/courses', async (req, res) => {
    try {
        const courseIds = parseCourseIds(req.query.courseIds);
        const cacheKey = courseIds.length > 0 ? `courses:${courseIds.sort().join(',')}` : 'courses';

        const cached = await getCachedStats(cacheKey);
        if (cached) {
            console.log(`[cache hit] ${cacheKey}`);
            return res.json(cached.data);
        }

        console.log(`[cache miss] ${cacheKey} — fetching from Moodle…`);
        const stats = await getPerCourseStats(courseIds);
        await setCachedStats(cacheKey, stats);
        res.json(stats);
    } catch (err) {
        console.error('[/api/stats/courses]', err);
        res.status(500).json({ error: 'Error fetching per-course statistics.', details: err.message });
    }
});

// ── GET /api/stats/last-updated ────────────────────────────────────────
router.get('/last-updated', async (_req, res) => {
    try {
        const cached = await getCachedStats('global');
        res.json({
            lastUpdated: cached ? cached.updatedAt : null,
        });
    } catch (err) {
        console.error('[/api/stats/last-updated]', err);
        res.status(500).json({ error: 'Error checking cache status.', details: err.message });
    }
});

// ── POST /api/stats/refresh ────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
    try {
        console.log('🔄  Manual refresh triggered — fetching from Moodle…');
        const [globalStats, courseStats] = await Promise.all([
            getGlobalStats(),
            getPerCourseStats(),
        ]);

        const globalDoc = await setCachedStats('global', globalStats);
        await setCachedStats('courses', courseStats);

        console.log('✅  Cache refreshed successfully.');
        res.json({
            global: { ...globalStats, _cachedAt: globalDoc.updatedAt },
            courses: courseStats,
            updatedAt: globalDoc.updatedAt,
        });
    } catch (err) {
        console.error('[/api/stats/refresh]', err);
        res.status(500).json({ error: 'Error refreshing statistics.', details: err.message });
    }
});

module.exports = router;
