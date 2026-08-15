const { getDb } = require('./db');

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'local-dev-admin-secret';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify Admin Secret
  const reqSecret = req.headers['x-admin-secret'] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!reqSecret || reqSecret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized admin access' });
  }

  const { client } = getDb();

  try {
    // Ensure table exists
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        google_id VARCHAR(255) NOT NULL UNIQUE,
        verified BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        last_login TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // ── GET /api/admin ──────────────────────────────────────────────
    if (req.method === 'GET') {
      const search = req.query.q?.toLowerCase()?.trim() || '';
      let users;
      if (search) {
        users = await client`
          SELECT id, email, google_id as "googleId", verified, created_at as "createdAt", last_login as "lastLogin"
          FROM users
          WHERE LOWER(email) LIKE ${'%' + search + '%'}
          ORDER BY created_at DESC
        `;
      } else {
        users = await client`
          SELECT id, email, google_id as "googleId", verified, created_at as "createdAt", last_login as "lastLogin"
          FROM users
          ORDER BY created_at DESC
        `;
      }

      return res.status(200).json({ users: users || [] });
    }

    // ── PATCH /api/admin ────────────────────────────────────────────
    if (req.method === 'PATCH') {
      const body = req.body || {};
      const userIdStr = req.query.id || body.id;
      const userId = parseInt(userIdStr, 10);

      if (!userId || isNaN(userId) || typeof body.verified !== 'boolean') {
        return res.status(400).json({ error: 'Invalid user ID or verified boolean status' });
      }

      const updatedUsers = await client`
        UPDATE users
        SET verified = ${body.verified}
        WHERE id = ${userId}
        RETURNING id, email, google_id as "googleId", verified, created_at as "createdAt", last_login as "lastLogin"
      `;

      if (!updatedUsers || updatedUsers.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ user: updatedUsers[0] });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('Admin API Error:', err);
    return res.status(500).json({ error: `Database Error: ${err.message || err}` });
  }
};
