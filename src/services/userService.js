const db = require('../database/db');

const upsertUser = db.prepare(`
  INSERT INTO users (user_id, username, email, access_token, refresh_token, token_expiration, verified_at)
  VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  ON CONFLICT(user_id) DO UPDATE SET
    username = excluded.username,
    email = excluded.email,
    access_token = excluded.access_token,
    refresh_token = excluded.refresh_token,
    token_expiration = excluded.token_expiration,
    verified_at = datetime('now')
`);

const upsertGuild = db.prepare(`
  INSERT OR IGNORE INTO user_guilds (user_id, guild_id) VALUES (?, ?)
`);

const findUser = db.prepare('SELECT * FROM users WHERE user_id = ?');

function saveUser(userData, tokens) {
  const expiration = Date.now() + tokens.expires_in * 1000;
  upsertUser.run(
    userData.id,
    userData.username,
    userData.email || null,
    tokens.access_token,
    tokens.refresh_token,
    expiration
  );
  return findUser.get(userData.id);
}

function saveGuildJoin(userId, guildId) {
  upsertGuild.run(userId, guildId);
}

function getUser(userId) {
  return findUser.get(userId);
}

function isTokenValid(user) {
  return user && user.token_expiration > Date.now();
}

const allUsers = db.prepare('SELECT * FROM users');

function getAllUsers() {
  return allUsers.all();
}

module.exports = { saveUser, saveGuildJoin, getUser, isTokenValid, getAllUsers };
