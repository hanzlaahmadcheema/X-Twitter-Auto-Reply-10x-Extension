const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/x_reply_db';

// Disable prefetch for serverless environments (Netlify Functions)
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

module.exports = { db, client, connectionString };
