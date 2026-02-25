/**
 * Auth route – validates credentials against MongoDB users.
 *
 * POST /api/auth/login  { username, password }
 *   → 200 { success: true, user, role }
 *   → 401 { success: false, error: '...' }
 */

const express = require('express');
const router = express.Router();
const { User } = require('../userModel');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Usuario y contraseña son requeridos' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
        }

        return res.json({ success: true, user: user.username, role: user.role });
    } catch (err) {
        console.error('[/api/auth/login]', err);
        return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});

module.exports = router;
