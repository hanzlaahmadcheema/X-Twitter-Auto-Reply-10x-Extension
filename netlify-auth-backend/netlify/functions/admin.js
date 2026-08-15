const { client } = require('../../db/index');

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'local-dev-admin-secret';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-secret',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // Verify Admin Secret (from local proxy / local server)
  const reqSecret = event.headers['x-admin-secret'] || event.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!reqSecret || reqSecret !== ADMIN_SECRET) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Unauthorized admin access' })
    };
  }

  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'DATABASE_URL environment variable is missing on Netlify. Please add DATABASE_URL in Netlify Site Settings -> Environment variables.'
      })
    };
  }

  const path = event.path.replace(/\/\.netlify\/functions\/admin\/?/, '');
  const method = event.httpMethod;

  try {
    // Auto-create users table if not existing
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

    // ── GET /admin/users ──────────────────────────────────────────────
    if (method === 'GET') {
      const search = event.queryStringParameters?.q?.toLowerCase()?.trim() || '';
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

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ users: users || [] })
      };
    }

    // ── PATCH /admin/users/:id ────────────────────────────────────────
    if (method === 'PATCH') {
      let body;
      try { body = JSON.parse(event.body); } catch (e) { body = {}; }
      
      const userIdStr = event.queryStringParameters?.id || path.split('/')[0];
      const userId = parseInt(userIdStr, 10);

      if (!userId || isNaN(userId) || typeof body.verified !== 'boolean') {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Invalid user ID or verified boolean status' })
        };
      }

      const updatedUsers = await client`
        UPDATE users
        SET verified = ${body.verified}
        WHERE id = ${userId}
        RETURNING id, email, google_id as "googleId", verified, created_at as "createdAt", last_login as "lastLogin"
      `;

      if (!updatedUsers || updatedUsers.length === 0) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'User not found' })
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ user: updatedUsers[0] })
      };
    }

    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  } catch (err) {
    console.error('Admin API Error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: `Database Error: ${err.message || err}` })
    };
  }
};
