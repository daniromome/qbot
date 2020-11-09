import { Song } from './../interfaces/song';
import { referenceQueue } from './queue';
import { roles } from '../config/role';
import { CommandModel } from '../models/command';
import { Command } from '../interfaces/command';
import { MessageEmbed } from 'discord.js';
import { google } from 'googleapis';
import * as ytdl from "ytdl-core";


export class PlayCommand implements Command {
    readonly aliases = ['play', 'sing'];
    readonly permission = roles.qbitor;
    private queue = referenceQueue;
    private position = 0;

    getHelpMessage(): string {
        return `I can sing you a song if you'd like 🎤🎶`;
    }

    async run(command: CommandModel): Promise<void> {
        if (command.rawMessage.member?.voice.channel) {
            const permissions = command.rawMessage.member.voice.channel.permissionsFor(command.rawMessage.client.user!);
            if (permissions!.has("CONNECT") || permissions!.has("SPEAK")) {
                try {
                    const song = await this.searchFunction(command.args.length > 1 ? command.args.join(' ') : command.args[0]);
                    if (song) {
                        await this.addToQueue(song);
                        await command.rawMessage.channel.send(
                            new MessageEmbed()
                            .setTitle(`${song.title} added to the queue!`)
                        );
                        if(this.queue.length === 1) {
                            const connection = await command.rawMessage.member!.voice.channel.join();
                            const dispatcher = connection.play(ytdl.default(song.id, { filter: 'audioonly' }));
                            dispatcher.on('start', async () => {
                                await command.rawMessage.channel.send(
                                    new MessageEmbed()
                                    .setTitle(`Now playing: ${song.title}`)
                                );
                                this.position++;
                            });
                            dispatcher.on('finish', async () => {
                                if (this.queue[this.position]) {
                                    connection.play(ytdl.default(this.queue[this.position].id, { filter: 'audioonly' }));
                                    await command.rawMessage.channel.send(
                                        new MessageEmbed()
                                        .setTitle(`Now playing: ${this.queue[this.position].title}`)
                                    );
                                } else {
                                    connection.disconnect();
                                }
                            });
                        }
                    } else {
                        await command.rawMessage.channel.send(
                            new MessageEmbed()
                            .setTitle('I couldn\'t find that song!')
                            .setDescription('You could try with another one or a youtube link')
                        );
                    }
                } catch (error) {
                    console.log(error);
                }
            } else {
                await command.rawMessage.channel.send(
                    new MessageEmbed()
                    .setTitle('I don\'t have enough permissions to do this')
                    .setDescription('I need the permissions to join and speak in your voice channel!')
                )
            }
        } else {
            await command.rawMessage.channel.send(
                new MessageEmbed()
                .setTitle('You can only play music in a voice channel')
                .setDescription('Connect to a voice channel so I can sing you a song')
            );
        }
    }

    hasPermissionToRun(commandModel: CommandModel): boolean {
        if (!this.permission) return true;
        return commandModel.rawMessage.member!.roles.cache.some(
            (r) => r.name === this.permission,
        );
    }

    async searchFunction(query: string) {
        const regExp = new RegExp(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/);
        const match = query.match(regExp);
        const service = google.youtube('v3');
        const search = await service.search.list({
            q:  match && match[7].length == 11 ? match[7] : query,
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
            return;
        }
    }

    public get q(){
        return this.queue;
    }
    
    async addToQueue(song: Song) {
        this.queue.push(song);
        return this.queue.indexOf(song);
    }

    async removeFromQueue(index: number) {
        return this.queue.splice(index, 1);
    }
}
