const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

exports.handler = async (event) => {
  const redirectUri = event.queryStringParameters.redirect_uri;
  
  if (!redirectUri) {
    return {
      statusCode: 400,
      body: 'Missing redirect_uri',
    };
  }

  const host = event.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const callbackUrl = `${protocol}://${host}/.netlify/functions/callback`;
  const state = Buffer.from(redirectUri).toString('base64');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
    `response_type=code&` +
    `scope=email%20profile&` +
    `state=${state}`;

  return {
    statusCode: 302,
    headers: {
      Location: authUrl,
    },
  };
};
