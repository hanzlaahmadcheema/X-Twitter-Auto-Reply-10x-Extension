const { SignJWT, importPKCS8 } = require('jose');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
const PRIVATE_KEY_PEM = process.env.PRIVATE_KEY; // Must be PKCS8 PEM string

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
    // Exchange code for token
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

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    
    const userData = await userResponse.json();
    const email = userData.email?.toLowerCase();

    if (!email || !ALLOWED_EMAILS.includes(email)) {
      // Redirect back with error
      return {
        statusCode: 302,
        headers: {
          Location: `${redirectUri}?error=unauthorized`,
        },
      };
    }

    // Generate JWT
    const privateKey = await importPKCS8(PRIVATE_KEY_PEM, 'RS256');
    const jwt = await new SignJWT({ email, isActivated: true })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt()
      .setExpirationTime('10y')
      .sign(privateKey);

    // Redirect back to extension with token
    return {
      statusCode: 302,
      headers: {
        Location: `${redirectUri}?token=${jwt}`,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
};
