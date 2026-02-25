/**
 * User model – Mongoose schema with bcrypt password hashing.
 *
 * Stores users in MongoDB for authentication.
 * Passwords are automatically hashed before saving.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

// ── Schema ─────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true },
        role: { type: String, default: 'admin' },
    },
    { timestamps: true }
);

// ── Pre-save hook: hash password ───────────────────────────────────────
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

// ── Instance method: compare password ──────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// ── Seed function ──────────────────────────────────────────────────────
/**
 * Create the initial admin user if it doesn't exist yet.
 * Uses ADMIN_USER / ADMIN_PASSWORD from .env as seed values.
 */
async function seedAdmin() {
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    const exists = await User.findOne({ username: adminUser });
    if (exists) {
        console.log(`ℹ️  Admin user "${adminUser}" already exists.`);
        return;
    }

    await User.create({ username: adminUser, password: adminPass, role: 'admin' });
    console.log(`✅  Admin user "${adminUser}" seeded successfully.`);
}

module.exports = { User, seedAdmin };
