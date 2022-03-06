const fs = require('fs');

module.exports = {
  name: 'leave',
  aliases: ['disconnect', 'dc'],
  cooldown: 0,
  description: 'Leave voice channel',
  async execute(message, args, cmd, client, Discord) {
    const voice_channel = message.member.voice.channel;
    if (!voice_channel)
      return message.channel.send(
        'You need to be in a channel to execute this command!'
      );
    const permissions = voice_channel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT'))
      return message.channel.send('You dont have the correct permissins');
    if (!permissions.has('SPEAK'))
      return message.channel.send('You dont have the correct permissions');
    message.member.voice.channel.leave();
  },
};
