module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

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

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting to Google...</title>
  <meta http-equiv="refresh" content="0;url=${authUrl}">
</head>
<body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f1419; color: #fff;">
  <p>Redirecting to Google sign in...</p>
  <script>
    window.location.href = ${JSON.stringify(authUrl)};
  </script>
</body>
</html>`);
};
