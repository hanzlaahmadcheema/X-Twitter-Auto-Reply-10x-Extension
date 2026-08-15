const { jwtVerify, importSPKI } = require('jose');
const { client } = require('../../db/index');

const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs1jfwO+1U6khaDV+se3j
YvRQZ2RMkN1A8wLROiqdBUlR+qvrpzP5kBMUrEZE6Qhwi1/JCY4Oh1HTCUGHdduB
kSbhGOYBbQPo/8Fex9oX6LwrcNonydoA6B2o6eXfobsK8ufBzQ9lph+SsXGdmJAT
u9I2ElEzBNCA8LynxRHOZIALiczWEcn7XxOzZO12eRFcdMZyHf7LgwQV+yvoMeH5
95jyH6MS4apTjSPsbjdDDwarGVCJN4dG2qEnydPmmPwcZGY92BeWMMNoIjZLxea8
bBCc2NeWQwPPCf6dQwgeBdLj9Nr9QOIAeUHGSJrqb3b3QLlbplVg6/4G9agNPNzd
HQIDAQAB
-----END PUBLIC KEY-----`;

exports.handler = async (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '') || event.queryStringParameters?.token;

  if (!token) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ verified: false, error: 'Missing token' })
    };
  }

  try {
    const publicKey = await importSPKI(PUBLIC_KEY_PEM, 'RS256');
    const { payload } = await jwtVerify(token, publicKey);
    const email = payload.email?.toLowerCase()?.trim();

    if (!email) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ verified: false, error: 'Invalid token payload' })
      };
    }

    let isVerified = false;
    let userFound = false;

    try {
      const rows = await client`SELECT id, email, verified FROM users WHERE email = ${email} LIMIT 1`;
      if (rows && rows.length > 0) {
        userFound = true;
        isVerified = Boolean(rows[0].verified);
      }
    } catch (dbErr) {
      console.error('Status DB error, fallback to token payload:', dbErr);
      isVerified = Boolean(payload.verified || payload.isActivated);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({
        email,
        verified: isVerified,
        userFound
      })
    };
  } catch (err) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ verified: false, error: 'Token verification failed' })
    };
  }
};
