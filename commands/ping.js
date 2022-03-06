module.exports = {
  name: 'ping',
  description: 'ping the bot and return latency in ms',
  execute(message, args) {
    message.channel.send('Pinging...').then((msg) => {
      let ping = msg.createdTimestamp - message.createdTimestamp;
      msg.edit(`🏓  Pong! (${ping}ms)`);
    });
  }
}