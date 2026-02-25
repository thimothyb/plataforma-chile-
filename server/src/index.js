/**
 * Express server entry point.
 *
 * Loads environment variables, connects to MongoDB,
 * sets up middleware, mounts routes, and starts listening.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectMongo } = require('./mongoCache');
const { seedAdmin } = require('./userModel');
const statsRouter = require('./routes/stats');
const authRouter = require('./routes/auth');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3001;

// ── Middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/stats', statsRouter);

// Health-check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Start ──────────────────────────────────────────────────────────────
async function start() {
    await connectMongo();
    await seedAdmin();
    app.listen(PORT, () => {
        console.log(`✅  Course-Stats API listening on http://localhost:${PORT}`);
    });
}

start();
