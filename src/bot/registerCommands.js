require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('puxar')
    .setDescription('Puxar um usuário verificado para este servidor')
    .addUserOption(o => o.setName('usuario').setDescription('Usuário para puxar').setRequired(true))
    .addRoleOption(o => o.setName('cargo').setDescription('Cargo para dar').setRequired(true))
    .toJSON(),

  new SlashCommandBuilder()
    .setName('puxartodos')
    .setDescription('Puxar TODOS os verificados para este servidor')
    .addRoleOption(o => o.setName('cargo').setDescription('Cargo para dar a todos').setRequired(true))
    .toJSON(),

  new SlashCommandBuilder()
    .setName('verificados')
    .setDescription('Listar todos os usuários verificados no banco')
    .toJSON(),
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('Registrando comandos globais...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('Comandos globais registrados! (pode levar até 1h pra aparecer em todos os servidores)');
  } catch (err) {
    console.error('Erro:', err);
  }
})();
