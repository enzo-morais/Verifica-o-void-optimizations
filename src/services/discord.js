const fetch = require('node-fetch');

const DISCORD_API = 'https://discord.com/api/v10';

function getAuthURL(state) {
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email guilds.join',
    state,
  });
  return `https://discord.com/oauth2/authorize?${params}`;
}

async function exchangeCode(code) {
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.REDIRECT_URI,
    }),
  });
  if (!res.ok) throw new Error('Failed to exchange code');
  return res.json();
}

async function refreshAccessToken(refreshToken) {
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) throw new Error('Failed to refresh token');
  return res.json();
}

async function getUser(accessToken) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

async function addToGuild(accessToken, userId, guildId, roleId) {
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${userId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${process.env.BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      access_token: accessToken,
      roles: [roleId],
    }),
  });

  // 201 = added, 204 = already in guild
  if (res.status === 204) {
    // User already in guild, add role directly
    await addRole(userId, guildId, roleId);
    return { alreadyInGuild: true };
  }
  if (!res.ok) throw new Error(`Failed to add user to guild: ${res.status}`);
  return { alreadyInGuild: false };
}

async function addRole(userId, guildId, roleId) {
  const res = await fetch(
    `${DISCORD_API}/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${process.env.BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );
  if (!res.ok) {
    const body = await res.text();
    console.error(`addRole failed [${res.status}]:`, body);
    throw new Error(`Failed to add role: ${res.status}`);
  }
}

module.exports = {
  getAuthURL,
  exchangeCode,
  refreshAccessToken,
  getUser,
  addToGuild,
  addRole,
};
