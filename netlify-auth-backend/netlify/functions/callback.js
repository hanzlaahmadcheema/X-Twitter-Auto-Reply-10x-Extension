const { SignJWT, importPKCS8 } = require('jose');
const { db, client } = require('../../db/index');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
const PRIVATE_KEY_PEM = process.env.PRIVATE_KEY;

exports.handler = async (event) => {
  const code = event.queryStringParameters.code;
  const state = event.queryStringParameters.state;
  
  if (!code || !state) {
    return { statusCode: 400, body: 'Missing code or state' };
  }

  const redirectUri = Buffer.from(state, 'base64').toString('ascii');
  const host = event.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const callbackUrl = `${protocol}://${host}/.netlify/functions/callback`;

  try {
    // 1. Exchange OAuth code for Google access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return { statusCode: 400, body: 'Failed to obtain access token' };
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
      return { statusCode: 400, body: 'Failed to retrieve user email or Google ID' };
    }

    // 3. Query or Upsert User in PostgreSQL Database
    let isVerified = false;
    try {
      // Create table if not exists (automatic lightweight migration fallback)
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
        // New user: Check if email is in legacy ALLOWED_EMAILS whitelist for automatic migration
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

    // 4. Sign RSA JWT token with user identity and verification status
    const privateKey = await importPKCS8(PRIVATE_KEY_PEM, 'RS256');
    const jwt = await new SignJWT({
      email,
      googleId,
      name,
      verified: isVerified,
      isActivated: isVerified // Preserves backwards compatibility for extension verifyJWT
    })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt()
      .setExpirationTime('10y')
      .sign(privateKey);

    // 5. Redirect back to extension with token and verification status
    const targetUrl = new URL(redirectUri);
    targetUrl.searchParams.set('token', jwt);
    targetUrl.searchParams.set('verified', isVerified ? 'true' : 'false');
    targetUrl.searchParams.set('email', email);
    targetUrl.searchParams.set('name', name);

    return {
      statusCode: 302,
      headers: {
        Location: targetUrl.toString(),
      },
    };
  } catch (error) {
    console.error('OAuth callback error:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
};
