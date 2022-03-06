const { MessageEmbed } = require('discord.js');

const TEXT_COMMANDS = [
  { cmd: 'join', desc: 'Summon Voxel to your voice channel' },
  { cmd: 'play <song>', desc: 'Play a song from YouTube' },
  { cmd: 'skip', desc: 'Skips the song currently playing' },
  { cmd: 'queue', desc: 'Displays the current and upcoming songs' },
  { cmd: 'ping', desc: 'Ping the bot and print latency' },
  { cmd: 'leave', desc: 'Disconnect Voxel from your voice channel' },
];

const VOICE_COMMANDS = [
  'Voxel passively listens to the DJ while in a voice channel!',
  'The user who summoned Voxel to the channel is the DJ by default.',
  'To issue a command, say "hey voxel" followed by your command.',
  'Try "hey voxel, play hotel california", or "hey voxel, skip!"',
].join('\r\n');

function getTextHelp(prefix) {
  let helpStr = '';
  for (let command of TEXT_COMMANDS) {
    helpStr += '`' + prefix + command.cmd + '` - ' + command.desc + '\n';
  }
  return helpStr;
}

module.exports = {
  name: 'help',
  description: 'send help information',
  execute(message, args, cmd, client, Discord, prefix) {
    const helpEmbed = new MessageEmbed()
      .setColor('#ff204e')
      .setTitle('Voxel Help  🎶')
      .addFields(
        {
          name: 'Text Commands:',
          value: getTextHelp(prefix),
        },
        {
          name: 'Voice Commands:',
          value: VOICE_COMMANDS,
        }
      );
    message.channel.send(helpEmbed);
  },
};
