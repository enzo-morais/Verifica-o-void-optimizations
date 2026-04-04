const discordService = require('./discord');
const userService = require('./userService');

/**
 * Add a verified user to another guild using their stored token.
 * @param {string} userId - Discord user ID
 * @param {string} guildId - Target guild ID
 * @param {string} roleId - Role to assign
 */
async function addUserToGuild(userId, guildId, roleId) {
  const user = userService.getUser(userId);
  if (!user) throw new Error('User not found');

  let accessToken = user.access_token;

  // Refresh token if expired
  if (!userService.isTokenValid(user)) {
    const tokens = await discordService.refreshAccessToken(user.refresh_token);
    const expiration = Date.now() + tokens.expires_in * 1000;
    const db = require('../database/db');
    db.prepare('UPDATE users SET access_token = ?, refresh_token = ?, token_expiration = ? WHERE user_id = ?')
      .run(tokens.access_token, tokens.refresh_token, expiration, userId);
    accessToken = tokens.access_token;
  }

  await discordService.addToGuild(accessToken, userId, guildId, roleId);
  userService.saveGuildJoin(userId, guildId);
}

module.exports = { addUserToGuild };
