const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../data.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expiration INTEGER NOT NULL,
    verified_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_guilds (
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, guild_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
  );
`);

module.exports = db;
