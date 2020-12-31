import { Song } from '../interfaces/song';
import { google } from 'googleapis';
import { DMChannel, NewsChannel, TextChannel, VoiceConnection, MessageEmbed } from 'discord.js';
import * as ytdl from 'ytdl-core';

class Queue {
    private nowPlaying = 0;
    private songList: Song[] = [];
    private loop : 'one' | 'queue' | 'disabled' = 'disabled';
    public connection : VoiceConnection | null = null;
    async searchSong(query: string) {
        const regExp = new RegExp(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/);
        const match = query.match(regExp);
        const service = google.youtube('v3');
        const search = await service.search.list({
            q: match && match[7].length == 11 ? match[7] : query,
            type: ['video'],
            maxResults: 1,
            part: ['snippet'],
            key: process.env.YOUTUBETOKEN
        });
        if (search.data.items!.length > 0) {
            const song: Song = {
                title: `${search.data.items![0].snippet!.title}`,
                id: `${search.data.items![0].id!.videoId}`
            }
            return song;
        } else {
            throw new Error('There aren\'t any songs that match your search query.');
        }
    }
    get get() {
        if (this.songList.length < 1) return null; return this.songList;
    }
    get startQueue() {
        return this.songList.length === this.nowPlaying+1
    }
    addToQueue(song: Song) {
        this.songList.push(song);
    }
    skip() {
        if (this.nowPlaying + 1 >= this.songList.length && this.loop === 'disabled') throw new Error('There are no more songs in the queue');
        if (this.loop === 'one') return this.songList[this.nowPlaying];
        if (this.nowPlaying + 1 >= this.songList.length && this.loop === 'queue') return this.songList[0];
        return this.songList[++this.nowPlaying];
    }
    play(song: Song, channel: TextChannel | DMChannel | NewsChannel) {
        if (this.connection) {
            const dispatcher = this.connection.play(ytdl.default(song.id, { filter: 'audioonly' }));
            dispatcher.on('start', async () => {
                await channel.send(
                    new MessageEmbed()
                    .setTitle('Now playing:')
                    .setDescription(`${song.title}`)
                );
            });
            dispatcher.on('finish', async () => {
                try {
                    const nextSong = queue.skip();
                    this.connection?.play(ytdl.default(nextSong.id, { filter: 'audioonly'}));
                    await channel.send(
                        new MessageEmbed()
                        .setTitle('Now playing:')
                        .setDescription(`${nextSong.title}`)
                    );
                } catch (error) {
                    this.connection?.disconnect();
                    this.connection = null;
                }
            });
        } else {
            throw new Error('I am unable to play anything while disconnected from a channel')
        }
    }
    stop() {
        if (this.connection) {
            this.connection.dispatcher.pause();
        } else {
            throw new Error('I\'m not playing anything bud');
        }
    }
    resume() {
        if (this.connection && this.connection.dispatcher.paused) {
            this.connection.dispatcher.resume();
        } else {
            throw new Error('I am already playing music -_-');
        }
    }
    jump(number: number) {
        const position = number-1;
        this.nowPlaying = position;
        if (number <= this.songList.length) return this.songList[position]; throw new Error(`There's no song in the position #${number}, select a song between 1 and ${this.songList.length}`);
    }
    kill() {
        if (this.connection) {
            this.connection.disconnect();
            this.connection = null;
            this.songList = [];
        } else {
            throw new Error('I am not connected to a Voice Channel!')
        }
    }
    loopQueue() {
        switch (this.loop) {
            case 'disabled':
                this.loop = 'queue';
            break;
            case 'queue':
                this.loop = 'one';
            break;
            case 'one':
                this.loop = 'disabled';
            break;
        }
        return this.loop;
    }
}

export const queue = new Queue();