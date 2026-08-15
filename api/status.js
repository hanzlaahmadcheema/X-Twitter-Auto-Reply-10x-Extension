const { jwtVerify, importSPKI } = require('jose');
const { getDb } = require('./db');

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '') || req.query.token;

  if (!token) {
    return res.status(401).json({ verified: false, error: 'Missing token' });
  }

  try {
    const publicKey = await importSPKI(PUBLIC_KEY_PEM, 'RS256');
    const { payload } = await jwtVerify(token, publicKey);
    const email = payload.email?.toLowerCase()?.trim();

    if (!email) {
      return res.status(400).json({ verified: false, error: 'Invalid token payload' });
    }

    let isVerified = false;
    let userFound = false;
    const { client } = getDb();

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

    return res.status(200).json({
      email,
      verified: isVerified,
      userFound
    });
  } catch (err) {
    return res.status(401).json({ verified: false, error: 'Token verification failed' });
  }
};
