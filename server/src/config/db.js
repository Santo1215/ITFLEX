// db.js
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://ITFLEX_DB_owner:npg_kyLo8BlUTM9W@ep-blue-boat-a5xgfidn-pooler.us-east-2.aws.neon.tech/ITFLEX_DB?sslmode=require'
});
module.exports = pool;