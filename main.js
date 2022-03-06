require('dotenv').config();

const Discord = require('discord.js');
const Chokidar = require('chokidar');

const client = new Discord.Client();

const PREFIX = '$';

const fs = require('fs');

var DJmessage = undefined;

var watcher = Chokidar.watch('./temp_cmds/', {
  ignored: /^\./,
  ignoreInitial: true,
  persistent: true,
});

client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync('./commands/')
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  client.commands.set(command.name, command);
}

client.on('ready', () => {
  console.log(`${client.user.tag} has logged in`);
  client.user.setActivity(`${PREFIX}help`, {
    type: 'PLAYING',
  });
});

function callCommand(CMD_NAME, message, args) {
  switch (CMD_NAME) {
    case 'ping':
      client.commands.get('ping').execute(message, args);
      break;
    case 'play':
      if (!DJmessage) {
        DJmessage = message;
        client.commands
          .get('join')
          .execute(message, args, 'join', client, Discord);
      }
      client.commands
        .get('play')
        .execute(message, args, 'play', client, Discord);
      break;
    case 'skip':
      client.commands
        .get('play')
        .execute(message, args, 'skip', client, Discord);
      break;
    case 'stop':
      client.commands
        .get('play')
        .execute(message, args, 'stop', client, Discord);
      break;
    case 'queue':
      client.commands
        .get('play')
        .execute(message, args, 'queue', client, Discord);
      break;
    case 'join':
      DJmessage = message;
      client.commands
        .get('join')
        .execute(message, args, 'join', client, Discord);
      break;
    case 'connect':
      if (DJmessage) {
        message.channel.send('Already joined voice channel!');
      } else {
        DJmessage = message;
        client.commands
          .get('join')
          .execute(message, args, 'connect', client, Discord);
      }
      break;
    case 'leave':
      DJmessage = undefined;
      client.commands
        .get('leave')
        .execute(message, args, 'leave', client, Discord);
      break;
    case 'disconnect':
      DJmessage = undefined;
      client.commands
        .get('leave')
        .execute(message, args, 'disconnect', client, Discord);
      break;
    case 'disconnect':
      DJmessage = undefined;
      client.commands
        .get('leave')
        .execute(message, args, 'dc', client, Discord);
      break;
    case 'help':
      client.commands
        .get('help')
        .execute(message, args, 'help', client, Discord, PREFIX);
      break;
  }
}

client.on('message', (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(PREFIX)) {
    const [CMD_NAME, ...args] = message.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);
    callCommand(CMD_NAME, message, args);
  }
});

watcher.on('add', function (path) {
  let rawdata = fs.readFileSync(path);
  let data = JSON.parse(rawdata);
  let cmd = data['cmd'];
  let args = data['args'];
  callCommand(cmd, DJmessage, args);
});

client.login(process.env.VOXEL_BOT_TOKEN);
