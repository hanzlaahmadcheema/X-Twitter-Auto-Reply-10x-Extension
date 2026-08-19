const { getDb } = require('./db');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const query = req.query || {};
  const code = query.code;
  const state = query.state;
  let redirectUri = query.redirect_uri || query.redirectUri;
  let isRedirectFromGoogle = false;

  if (state && !query.redirect_uri && !query.redirectUri) {
    try {
      redirectUri = Buffer.from(state, 'base64').toString('ascii');
      isRedirectFromGoogle = true;
    } catch (e) {}
  }

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const PRIVATE_KEY_PEM = process.env.PRIVATE_KEY;

  const isLocal = (req.headers.host || '').includes('localhost');
  const googleTokenRedirectUri = isRedirectFromGoogle
    ? (isLocal ? `http://${req.headers.host}/api/callback` : `https://x-twitter-auto-reply-10x-extension.vercel.app/api/callback`)
    : (redirectUri || (isLocal ? `http://${req.headers.host}/api/callback` : `https://x-twitter-auto-reply-10x-extension.vercel.app/api/callback`));

  if (!code) {
    return res.status(400).json({ error: 'Missing code parameter' });
  }

  try {
    // 1. Exchange OAuth code for Google access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: googleTokenRedirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('Failed to obtain Google access token:', tokenData);
      return res.status(400).json({ error: 'Failed to obtain access token', details: tokenData });
    }

    // 2. Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    
    const userData = await userResponse.json();
    const email = userData.email?.toLowerCase()?.trim();
    const googleId = userData.id;
    const name = userData.name || userData.given_name || email?.split('@')[0] || 'User';

    if (!email || !googleId) {
      return res.status(400).json({ error: 'Failed to retrieve user email or Google ID' });
    }

    // 3. Query or Upsert User in PostgreSQL Database
    let isVerified = false;
    const { client } = getDb();

    try {
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

      const existing = await client`SELECT id, email, verified FROM users WHERE google_id = ${googleId} OR email = ${email} LIMIT 1`;

      if (existing && existing.length > 0) {
        // Existing user: Update last_login
        isVerified = Boolean(existing[0].verified);
        await client`UPDATE users SET last_login = NOW(), email = ${email}, google_id = ${googleId} WHERE id = ${existing[0].id}`;
      } else {
        // New user: Check if email is in ALLOWED_EMAILS whitelist
        const initialVerified = ALLOWED_EMAILS.includes(email);
        const newUser = await client`
          INSERT INTO users (email, google_id, verified, created_at, last_login)
          VALUES (${email}, ${googleId}, ${initialVerified}, NOW(), NOW())
          RETURNING verified
        `;
        isVerified = Boolean(newUser && newUser[0] && newUser[0].verified);
      }
    } catch (dbErr) {
      console.error('Database query error, falling back to ALLOWED_EMAILS check:', dbErr);
      isVerified = ALLOWED_EMAILS.includes(email);
    }

    // 4. Sign RSA JWT token
    const { SignJWT, importPKCS8 } = await import('jose');
    const privateKey = await importPKCS8(PRIVATE_KEY_PEM, 'RS256');
    const jwt = await new SignJWT({
      email,
      googleId,
      name,
      verified: isVerified,
      isActivated: isVerified
    })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt()
      .setExpirationTime('10y')
      .sign(privateKey);

    // 5. Send response
    if (state && redirectUri) {
      const targetUrl = new URL(redirectUri);
      targetUrl.searchParams.set('token', jwt);
      targetUrl.searchParams.set('verified', isVerified ? 'true' : 'false');
      targetUrl.searchParams.set('email', email);
      targetUrl.searchParams.set('name', name);
      return res.redirect(302, targetUrl.toString());
    }

    return res.status(200).json({
      success: true,
      token: jwt,
      verified: isVerified,
      email,
      name
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
