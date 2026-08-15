module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(200).end();
  }

  const redirectUri = req.query.redirect_uri || req.query.redirectUri;
  
  if (!redirectUri) {
    return res.status(400).send('Missing redirect_uri');
  }

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const isLocal = (req.headers.host || '').includes('localhost');
  const callbackUrl = isLocal 
    ? `http://${req.headers.host}/api/callback` 
    : `https://x-twitter-auto-reply-10x-extension.vercel.app/api/callback`;
  const state = Buffer.from(redirectUri).toString('base64');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
    `response_type=code&` +
    `scope=email%20profile&` +
    `state=${state}`;

  return res.redirect(302, authUrl);
};
