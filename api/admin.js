const { getDb } = require('./db');

const ALLOWED_ADMIN_EMAILS = ['hanzlaahmad100@gmail.com', 'hbilawal590@gmail.com'];

const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs1jfwO+1U6khaDV+se3j
YvRQZ2RMkN1A8wLROiqdBUlR+qvrpzP5kBMUrEZE6Qhwi1/JCY4Oh1HTCUGHdduB
kSbhGOYBbQPo/8Fex9oX6LwrcNonydoA6B2o6eXfobsK8ufBzQ9lph+SsXGdmJAT
u9I2ElEzBNCA8LynxRHOZIALiczWEcn7XxOzZO12eRFcdMZyHf7LgwQV+yvoMeH5
95jyH6MS4apTjSPsbjdDDwarGVCJN4dG2qEnydPmmPwcZGY92BeWMMNoIjZLxea8
bBCc2NeWQwPPCf6dQwgeBdLj9Nr9QOIAeUHGSJrqb3b3QLlbplVg6/4G9agNPNzd
HQIDAQAB
-----END PUBLIC KEY-----`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract JWT Token
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '') || req.query.token;

  if (!token) {
    return res.status(401).json({ error: 'Missing admin authentication token. Please sign in with Google.' });
  }

  let adminEmail = '';
  try {
    const { jwtVerify, importSPKI } = await import('jose');
    const publicKey = await importSPKI(PUBLIC_KEY_PEM, 'RS256');
    const { payload } = await jwtVerify(token, publicKey);
    adminEmail = payload.email?.toLowerCase()?.trim() || '';
  } catch (err) {
    console.error('Admin token verification error:', err);
    return res.status(401).json({ error: `Invalid or expired authentication token: ${err.message || err}` });
  }

  if (!adminEmail || !ALLOWED_ADMIN_EMAILS.includes(adminEmail)) {
    return res.status(403).json({ error: `Unauthorized: ${adminEmail || 'User'} is not an authorized administrator.` });
  }

  const { client } = getDb();

  try {
    // Ensure tables exist
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

    await client`
      CREATE TABLE IF NOT EXISTS notices (
        id INT PRIMARY KEY DEFAULT 1,
        title VARCHAR(255) NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        button_text VARCHAR(255) DEFAULT '',
        button_url TEXT DEFAULT '',
        enabled BOOLEAN DEFAULT false NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await client`
      CREATE TABLE IF NOT EXISTS models_config (
        id INT PRIMARY KEY DEFAULT 1,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await client`
      CREATE TABLE IF NOT EXISTS app_config (
        key VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // ── GET /api/admin ──────────────────────────────────────────────
    if (req.method === 'GET') {
      if (req.query.type === 'notice') {
        const rows = await client`
          SELECT id, title, description, button_text as "buttonText", button_url as "buttonUrl", enabled, updated_at as "updatedAt"
          FROM notices
          WHERE id = 1
          LIMIT 1
        `;
        return res.status(200).json({ notice: rows && rows.length > 0 ? rows[0] : null });
      }

      if (req.query.type === 'models') {
        const rows = await client`
          SELECT data, updated_at as "updatedAt"
          FROM models_config
          WHERE id = 1
          LIMIT 1
        `;
        return res.status(200).json({ models: rows && rows.length > 0 ? rows[0].data : null });
      }

      if (req.query.type === 'config' || req.query.type === 'features' || req.query.type === 'tones' || req.query.type === 'lengths' || req.query.type === 'languages' || req.query.type === 'systemPrompt') {
        const targetKey = req.query.type === 'config' ? null : req.query.type;
        if (targetKey) {
          const rows = await client`SELECT data FROM app_config WHERE key = ${targetKey} LIMIT 1`;
          return res.status(200).json({ [targetKey]: rows && rows.length > 0 ? rows[0].data : null });
        }
        const rows = await client`SELECT key, data FROM app_config`;
        const result = {};
        if (rows) rows.forEach(r => { result[r.key] = r.data; });
        return res.status(200).json({ config: result });
      }

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

    // ── POST / PATCH /api/admin ─────────────────────────────────────
    if (req.method === 'POST' || req.method === 'PATCH') {
      const body = req.body || {};

      // Handle App Config Save/Update (features, tones, lengths, languages, systemPrompt, etc.)
      const configKey = req.query.type || body.type;
      if (['features', 'tones', 'lengths', 'languages', 'systemPrompt', 'app_config'].includes(configKey)) {
        const payloadData = body.data !== undefined ? body.data : body[configKey];
        if (payloadData === undefined) {
          return res.status(400).json({ error: `Missing payload data for ${configKey}` });
        }

        const updated = await client`
          INSERT INTO app_config (key, data, updated_at)
          VALUES (${configKey}, ${JSON.stringify(payloadData)}::jsonb, NOW())
          ON CONFLICT (key) DO UPDATE SET
            data = EXCLUDED.data,
            updated_at = NOW()
          RETURNING key, data, updated_at as "updatedAt"
        `;

        return res.status(200).json({ success: true, key: configKey, data: updated[0].data });
      }

      // Handle Notice Save/Update
      if (req.query.type === 'notice' || body.type === 'notice') {
        const title = (body.title || '').trim();
        const description = (body.description || '').trim();
        const buttonText = (body.buttonText || '').trim();
        const buttonUrl = (body.buttonUrl || '').trim();
        const enabled = Boolean(body.enabled);

        const updated = await client`
          INSERT INTO notices (id, title, description, button_text, button_url, enabled, updated_at)
          VALUES (1, ${title}, ${description}, ${buttonText}, ${buttonUrl}, ${enabled}, NOW())
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            button_text = EXCLUDED.button_text,
            button_url = EXCLUDED.button_url,
            enabled = EXCLUDED.enabled,
            updated_at = NOW()
          RETURNING id, title, description, button_text as "buttonText", button_url as "buttonUrl", enabled, updated_at as "updatedAt"
        `;

        return res.status(200).json({ success: true, notice: updated[0] });
      }

      // Handle Models Save/Update
      if (req.query.type === 'models' || body.type === 'models') {
        const modelsData = body.models || body.data;
        if (!modelsData || typeof modelsData !== 'object') {
          return res.status(400).json({ error: 'Invalid models configuration JSON payload.' });
        }

        const updated = await client`
          INSERT INTO models_config (id, data, updated_at)
          VALUES (1, ${JSON.stringify(modelsData)}::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET
            data = EXCLUDED.data,
            updated_at = NOW()
          RETURNING data, updated_at as "updatedAt"
        `;

        // Also sync into app_config table key 'models' for consistency
        await client`
          INSERT INTO app_config (key, data, updated_at)
          VALUES ('models', ${JSON.stringify(modelsData)}::jsonb, NOW())
          ON CONFLICT (key) DO UPDATE SET
            data = EXCLUDED.data,
            updated_at = NOW()
        `;

        return res.status(200).json({ success: true, models: updated[0].data });
      }

      // Handle User Verification Update
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
