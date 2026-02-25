/**
 * MySQL connection pool using mysql2/promise.
 *
 * Reads credentials from environment variables (loaded via dotenv in index.js).
 */

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'moodle',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Returns the Moodle table prefix (e.g. "mdl_").
 */
function prefix() {
  return process.env.DB_PREFIX || 'mdl_';
}

module.exports = { pool, prefix };
