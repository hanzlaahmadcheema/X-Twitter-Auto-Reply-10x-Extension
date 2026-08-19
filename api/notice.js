const { getDb } = require('./db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { client } = getDb();

  try {
    // Ensure table exists
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

    const rows = await client`
      SELECT id, title, description, button_text as "buttonText", button_url as "buttonUrl", enabled, updated_at as "updatedAt"
      FROM notices
      WHERE id = 1 AND enabled = true
      LIMIT 1
    `;

    if (rows && rows.length > 0) {
      return res.status(200).json({ notice: rows[0] });
    }

    return res.status(200).json({ notice: null });
  } catch (err) {
    console.error('Notice API Error:', err);
    return res.status(500).json({ error: `Database Error: ${err.message || err}` });
  }
};
