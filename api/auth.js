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
  const callbackUrl = 'https://x-twitter-auto-reply-10x-extension.vercel.app/api/callback';
  const state = Buffer.from(redirectUri).toString('base64');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
    `response_type=code&` +
    `scope=email%20profile&` +
    `state=${state}`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <meta http-equiv="refresh" content="0;url=${authUrl}">
</head>
<body style="font-family:sans-serif;text-align:center;padding-top:40px;">
  <p>Redirecting to Google Sign-In...</p>
  <script>
    window.location.href = ${JSON.stringify(authUrl)};
  </script>
</body>
</html>`;

  return res.status(200).send(html);
};
