// Credit to CodeLyon for base music bot tutorial

const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

const queue = new Map();

module.exports = {
  name: 'play',
  aliases: ['skip', 'stop', 'queue'],
  cooldown: 0,
  description: 'Advanced music bot',
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

    const server_queue = queue.get(message.guild.id);
    if (cmd === 'play') {
      if (!args.length)
        return message.channel.send('You need to send the second argument!');
      let song = {};

      if (ytdl.validateURL(args[0])) {
        const song_info = await ytdl.getInfo(args[0]);
        song = {
          title: song_info.videoDetails.title,
          url: song_info.videoDetails.video_url,
        };
      } else {
        const video_finder = async (query) => {
          const video_result = await ytSearch(query);
          return video_result.videos.length > 1 ? video_result.videos[0] : null;
        };

        let video = await video_finder(args.join(' '));
        if (!video) {
          args.pop();
          video = await video_finder(args.join(' '));
          if (!video) {
            video = await video_finder('1 second black screen video')
          }
        }
        song = { title: video.title, url: video.url };
      }

      if (!server_queue) {
        const queue_constructor = {
          voice_channel: voice_channel,
          text_channel: message.channel,
          connection: null,
          songs: [],
        };

        queue.set(message.guild.id, queue_constructor);
        queue_constructor.songs.push(song);

        try {
          const connection = await voice_channel.join();
          queue_constructor.connection = connection;
          video_player(message.guild, queue_constructor.songs[0], message);
        } catch (err) {
          queue.delete(message.guild.id);
          message.channel.send('There was an error connecting!');
          throw err;
        }
      } else {
        server_queue.songs.push(song);
        return message.channel.send(`???? **${song.title}** added to queue!`);
      }
    } else if (cmd === 'skip') {
      skip_song(message, server_queue);
    } else if (cmd === 'stop') {
      stop_song(message, server_queue);
    } else if (cmd === 'queue') {
      display_queue(message, server_queue, Discord);
    }
  },
};

const video_player = async (guild, song, message) => {
  const song_queue = queue.get(guild.id);

  if (!song) {
    // song_queue.voice_channel.leave();
    queue.delete(guild.id);
    return message.channel.send(`???? **End of queue!** Listening for more commands...`);;
  }
  const stream = ytdl(song.url, { filter: 'audioonly' });
  song_queue.connection
    .play(stream, { seek: 0, volume: 0.5 })
    .on('finish', () => {
      song_queue.songs.shift();
      video_player(guild, song_queue.songs[0], message);
    });
  await song_queue.text_channel.send(`???? Now playing **${song.title}**`);
};

const skip_song = (message, server_queue) => {
  if (!message.member.voice.channel)
    return message.channel.send(
      'You need to be in a channel to execute this command!'
    );
  if (!server_queue) {
    return message.channel.send(`There are no songs in queue ????`);
  }
  server_queue.connection.dispatcher.end();
};

const stop_song = (message, server_queue) => {
  if (!message.member.voice.channel)
    return message.channel.send(
      'You need to be in a channel to execute this command!'
    );
  server_queue.songs = [];
  server_queue.connection.dispatcher.end();
};

const display_queue = (message, server_queue, Discord) => {
  if (!server_queue) {
    return message.channel.send(`There are no songs in queue ????`);
  }
  let upcoming_songs = server_queue.songs.map(function (song) {
    return song.title;
  });
  upcoming_songs = upcoming_songs.map(
    (song) => '`' + (upcoming_songs.indexOf(song) + 1) + '` ' + song
  );
  upcoming_songs.shift();
  upcoming_songs.join('\r\n');
  return message.channel.send(
    new Discord.MessageEmbed()
      .setColor('#ff204e')
      .setTitle('Voxel Queue  ????')
      .addFields(
        {
          name: 'Now Playing:',
          value: `\`1\` ${server_queue.songs[0].title}`,
        },
        {
          name: 'Queued:',
          value:
            server_queue.songs.length > 1 ? upcoming_songs : '[No Songs Yet!]',
        }
      )
  );
};
