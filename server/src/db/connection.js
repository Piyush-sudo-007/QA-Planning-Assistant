import { createClient } from '@libsql/client';
import config from '../config.js';

let db = null;

export function getDb() {
  if (!db) {
    const options = { url: config.databaseUrl };
    if (config.databaseAuthToken) {
      options.authToken = config.databaseAuthToken;
    }
    db = createClient(options);
    console.log(`[DB] Connected to ${config.databaseUrl.startsWith('file:') ? 'local SQLite' : 'Turso'}`);
  }
  return db;
}

export default getDb;
