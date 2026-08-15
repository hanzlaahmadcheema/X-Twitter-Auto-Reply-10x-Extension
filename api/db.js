const { neon } = require('@neondatabase/serverless');

const connectionString = process.env.DATABASE_URL || 'postgresql://netlifydb_owner:npg_KN2cSdPv0LQH@ep-bitter-cake-at9c4huv.c-9.us-east-1.db.netlify.com/netlifydb?sslmode=require';

let sqlClient;

function getDb() {
  if (!sqlClient) {
    sqlClient = neon(connectionString);
  }
  return { client: sqlClient };
}

module.exports = { getDb, connectionString };
