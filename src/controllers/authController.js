const crypto = require('crypto');
const discordService = require('../services/discord');
const userService = require('../services/userService');

// Simple in-memory state store (use Redis in production)
const states = new Map();

function authRedirect(req, res) {
  const state = crypto.randomBytes(16).toString('hex');
  states.set(state, { createdAt: Date.now() });
  // Clean old states (>10min)
  for (const [k, v] of states) {
    if (Date.now() - v.createdAt > 600000) states.delete(k);
  }
  res.redirect(discordService.getAuthURL(state));
}

async function callback(req, res) {
  const { code, state, error } = req.query;

  if (error || !code) {
    return res.redirect('/?status=error&msg=auth_denied');
  }

  if (!state || !states.has(state)) {
    return res.redirect('/?status=error&msg=invalid_state');
  }
  states.delete(state);

  try {
    // Exchange code for tokens
    const tokens = await discordService.exchangeCode(code);

    // Get user info
    const userData = await discordService.getUser(tokens.access_token);

    // Save to database
    userService.saveUser(userData, tokens);

    // Add to guild and give role
    const guildId = process.env.GUILD_ID;
    const roleId = process.env.ROLE_ID;

    try {
      await discordService.addToGuild(tokens.access_token, userData.id, guildId, roleId);
      userService.saveGuildJoin(userData.id, guildId);
    } catch (guildErr) {
      console.error('Guild/Role error (user still verified):', guildErr.message);
      // User is authenticated even if role fails
    }

    res.redirect(`/?status=success&user=${encodeURIComponent(userData.username)}`);
  } catch (err) {
    console.error('Callback error:', err);
    res.redirect('/?status=error&msg=server_error');
  }
}

module.exports = { authRedirect, callback };
