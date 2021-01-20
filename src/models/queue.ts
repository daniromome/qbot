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
        const regExp = new RegExp(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/|[\w\-]+\?list=)?)([\w\-]+)(\S+)?$/);
        const match = query.match(regExp);
        const service = google.youtube('v3');
        if (match) {
            if (match[4] === '/playlist?list=') {
                const search = await service.playlistItems.list({
                    part: ['snippet', 'id'],
                    playlistId: match[5],
                    key: process.env.YOUTUBETOKEN,
                    maxResults: 50
                });
                const songs : Song[] = [];
                if (search.data.items && search.data.items.length > 0 ) {
                    search.data.items.forEach(i => songs.push({ title: i.snippet?.title!, id: i.snippet?.resourceId?.videoId!}));
                } else {
                    throw new Error('I was unable to find the playlist you were looking for');
                }
                let total = search.data.pageInfo?.totalResults!;
                let next = search.data.nextPageToken;
                while (songs.length !== total && next) {
                    const search = await service.playlistItems.list({
                        part: ['snippet', 'id'],
                        playlistId: match[5],
                        key: process.env.YOUTUBETOKEN,
                        maxResults: 50,
                        pageToken: next
                    });
                    search.data.items?.forEach(i => {
                        if (i.snippet?.title !== 'Deleted video') {
                            songs.push({ title: i.snippet?.title!, id: i.snippet?.resourceId?.videoId!});
                        } else { 
                            --total;
                        }
                    });
                }
                return songs;
            }
        }
        const search = await service.search.list({
            q: match && match[5].length == 11 ? match[5] : query,
            type: ['video'],
            maxResults: 1,
            part: ['snippet'],
            key: process.env.YOUTUBETOKEN
        });
        
        if (search.data.items && search.data.items.length > 0) {
            const song: Song = {
                title: `${search.data.items[0].snippet!.title}`,
                id: `${search.data.items[0].id!.videoId}`
            }
            return [song];
        } else {
            throw new Error('There aren\'t any songs that match your search query.');
        }
    }
    get get() {
        if (this.songList.length < 1) return null; return this.songList;
    }
    get startQueue() {
        return this.songList.length > 0 && this.nowPlaying === 0
    }
    get song() {
        const song: Song = this.songList[this.nowPlaying];
        return song;
    }
    addToQueue(song: Song[]) {
        this.songList.push(...song);
    }
    skip() {
        if (this.nowPlaying + 1 >= this.songList.length && this.loop === 'disabled') throw new Error('There are no more songs in the queue');
        if (this.loop === 'one') return this.songList[this.nowPlaying];
        if (this.nowPlaying + 1 >= this.songList.length && this.loop === 'queue') {
            this.nowPlaying = 0;
            return this.songList[0];
        }
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
    remove(number: number) {
        const position = number - 1;
        const response : { removedSong: Song, keepPlaying?: boolean, nextSong?: Song } = {
            removedSong: this.songList.splice(position, 1)[0]
        }
        // console.log('position', position);
        // console.log('now', this.nowPlaying);
        // console.log('list', this.songList);
        if (position === this.nowPlaying) {
            response['keepPlaying'] = true;
            response['nextSong'] = this.songList[position];
        }
        return response;
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
    resetQueue() {
        this.nowPlaying = 0;
        this.songList = [];
    }
    async shuffleQueue() {
        if (this.loop === 'disabled') {
            const queue = this.songList.splice(this.nowPlaying + 1, this.songList.length - this.nowPlaying + 1);
            const shuffledQueue = await this.shuffle(queue) as Song[];
            this.songList = [ ...this.songList, ...shuffledQueue ];
        } else {
            const currentSong = this.songList[this.nowPlaying];
            const shuffledQueue = await this.shuffle(this.songList) as Song[];
            this.nowPlaying = shuffledQueue.indexOf(currentSong);
            this.songList = shuffledQueue;
        }
    }
    private shuffle(array: Array<any>) {
        return new Promise(resolve => {
            for (let index = array.length-1; index > 0; index--) {
                const r = Math.floor(Math.random() * (index + 1))
                let swap = array[index];
                array[index] = array[r]
                array[r] = swap;
            }
            resolve(array);
        });
    }
}

export const queue = new Queue();