const http = require('http');
const dotenv = require('dotenv');
const { SignJWT, importPKCS8 } = require('jose');
dotenv.config({ path: 'netlify-auth-backend/.env' });

const modelsHandler = require('./api/models');
const authHandler = require('./api/auth');
const callbackHandler = require('./api/callback');
const statusHandler = require('./api/status');
const adminHandler = require('./api/admin');

function runHandler(handler, reqOptions, bodyData) {
  return new Promise((resolve, reject) => {
    const req = new http.IncomingMessage();
    req.method = reqOptions.method || 'GET';
    req.url = reqOptions.url || '/';
    req.headers = reqOptions.headers || {};

    const parsedUrl = new URL(req.url, 'http://localhost:3000');
    req.query = Object.fromEntries(parsedUrl.searchParams);
    req.body = bodyData || {};

    let statusCode = 200;
    const resHeaders = {};

    const res = {
      setHeader(k, v) { resHeaders[k.toLowerCase()] = v; },
      getHeader(k) { return resHeaders[k.toLowerCase()]; },
      status(c) { statusCode = c; return res; },
      json(data) {
        resolve({ statusCode, headers: resHeaders, body: data });
      },
      send(data) {
        resolve({ statusCode, headers: resHeaders, body: data });
      },
      end(data) {
        resolve({ statusCode, headers: resHeaders, body: data || '' });
      },
      redirect(code, url) {
        statusCode = code;
        resHeaders['location'] = url;
        resolve({ statusCode, headers: resHeaders, body: '', location: url });
      }
    };

    handler(req, res).catch(reject);
  });
}

async function runTestMatrix() {
  console.log('🧪 Starting Full Automated API Test Matrix for Vercel Functions...\n');

  // Test 1: GET /api/models
  console.log('1️⃣ Testing GET /api/models...');
  const resModels = await runHandler(modelsHandler, { method: 'GET', url: '/api/models' });
  console.log(`   Status: ${resModels.statusCode}`);
  if (resModels.statusCode === 200 && resModels.body.models.gemini) {
    console.log('   ✅ GET /api/models PASSED!\n');
  } else {
    throw new Error('GET /api/models failed');
  }

  // Test 2: GET /api/auth
  console.log('2️⃣ Testing GET /api/auth?redirect_uri=chrome-extension://test/oauth.html...');
  const resAuth = await runHandler(authHandler, {
    method: 'GET',
    url: '/api/auth?redirect_uri=chrome-extension://test/oauth.html',
    headers: { host: 'localhost:3000' }
  });
  console.log(`   Status: ${resAuth.statusCode}`);
  console.log(`   Location: ${resAuth.location}`);
  if (resAuth.statusCode === 302 && resAuth.location.includes('accounts.google.com')) {
    console.log('   ✅ GET /api/auth PASSED!\n');
  } else {
    throw new Error('GET /api/auth failed');
  }

  // Test 3: GET /api/status (unauthenticated)
  console.log('3️⃣ Testing GET /api/status (Unauthenticated)...');
  const resStatusNoToken = await runHandler(statusHandler, { method: 'GET', url: '/api/status' });
  console.log(`   Status: ${resStatusNoToken.statusCode}`);
  console.log(`   Response:`, resStatusNoToken.body);
  if (resStatusNoToken.statusCode === 401 && resStatusNoToken.body.error === 'Missing token') {
    console.log('   ✅ Unauthenticated /api/status PASSED!\n');
  } else {
    throw new Error('Unauthenticated /api/status failed');
  }

  // Test 4: GET /api/status (valid signed JWT token)
  console.log('4️⃣ Testing GET /api/status (With Valid RS256 JWT Token)...');
  const privateKey = await importPKCS8(process.env.PRIVATE_KEY, 'RS256');
  const testToken = await new SignJWT({
    email: 'wasilahmad100@gmail.com',
    googleId: '110904298845028038302',
    name: 'Wasil Ahmad',
    verified: true
  })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setExpirationTime('10y')
    .sign(privateKey);

  const resStatusAuth = await runHandler(statusHandler, {
    method: 'GET',
    url: '/api/status',
    headers: { authorization: `Bearer ${testToken}` }
  });
  console.log(`   Status: ${resStatusAuth.statusCode}`);
  console.log(`   Response:`, resStatusAuth.body);
  if (resStatusAuth.statusCode === 200 && resStatusAuth.body.verified === true && resStatusAuth.body.userFound === true) {
    console.log('   ✅ Authenticated /api/status PASSED!\n');
  } else {
    throw new Error('Authenticated /api/status failed');
  }

  // Test 5: GET /api/admin (unauthorized)
  console.log('5️⃣ Testing GET /api/admin (Without Admin Secret)...');
  const resAdminNoSecret = await runHandler(adminHandler, { method: 'GET', url: '/api/admin' });
  console.log(`   Status: ${resAdminNoSecret.statusCode}`);
  if (resAdminNoSecret.statusCode === 401 && resAdminNoSecret.body.error === 'Unauthorized admin access') {
    console.log('   ✅ Unauthorized /api/admin PASSED!\n');
  } else {
    throw new Error('Unauthorized /api/admin failed');
  }

  // Test 6: GET /api/admin (with valid admin secret)
  console.log('6️⃣ Testing GET /api/admin (With Valid Secret)...');
  const resAdminValid = await runHandler(adminHandler, {
    method: 'GET',
    url: '/api/admin',
    headers: { 'x-admin-secret': process.env.ADMIN_SECRET || 'local-dev-admin-secret' }
  });
  console.log(`   Status: ${resAdminValid.statusCode}`);
  console.log(`   Response Users Count: ${resAdminValid.body.users ? resAdminValid.body.users.length : 0}`);
  if (resAdminValid.statusCode === 200 && Array.isArray(resAdminValid.body.users)) {
    console.log('   ✅ Authorized /api/admin PASSED!\n');
  } else {
    throw new Error('Authorized /api/admin failed');
  }

  console.log('🎉 ALL 6 VERCEL API HANDLER TESTS PASSED WITH 100% SUCCESS!');
}

runTestMatrix().catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
