const fs = require('fs');

module.exports = {
  name: 'join',
  aliases: ['connect'],
  cooldown: 0,
  description: 'Join voice channel',
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
      return message.channel.send('You dont have the correct permissins');
    const connection = await message.member.voice.channel.join();
    message.channel.send(`👍 Joined voice and listening to ${message.author}.`);
    const record = () => {
      let receiver, path, writer, date;
      receiver = connection.receiver.createStream(message.member, {
        mode: 'pcm',
        end: 'silence',
      });
      date = Date.now();
      path = `./recordings_temp/rcd-${date}.pcm`;
      writer = receiver.pipe(fs.createWriteStream(path));
      writer.on('finish', () => {
        fs.rename(path, `./recordings_pcm/rcd-${date}.pcm`, (err) => {
          if (err) throw err;
        });
        console.log('Finished writing audio from ' + message.author);
        if (message.member.voice.channel) {
          record();
        }
      });
    };
    record();
  },
};
