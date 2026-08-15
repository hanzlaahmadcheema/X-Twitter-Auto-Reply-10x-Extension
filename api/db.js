const { neon, neonConfig } = require('@neondatabase/serverless');
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL || 'postgresql://netlifydb_owner:npg_KN2cSdPv0LQH@ep-bitter-cake-at9c4huv.c-9.us-east-1.db.netlify.com/netlifydb?sslmode=require';

if (typeof globalThis.fetch !== 'undefined') {
  neonConfig.fetchFunction = globalThis.fetch;
}

let sqlClient;

function getDb() {
  if (!sqlClient) {
    try {
      sqlClient = neon(connectionString);
    } catch (err) {
      sqlClient = postgres(connectionString, { prepare: false, ssl: 'require' });
    }
  }
  return { client: sqlClient };
}

module.exports = { getDb, connectionString };
