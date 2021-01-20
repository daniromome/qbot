import { queue } from '../models/queue';
import { roles } from '../config/role';
import { CommandModel } from '../models/command';
import { Command } from '../interfaces/command';
import { MessageEmbed } from 'discord.js';

export class PlayCommand implements Command {
    readonly aliases = ['play', 'sing'];
    readonly permission = roles.qbitor;

    getHelpMessage(): string {
        return `I can sing you a song if you'd like 🎤🎶`;
    }

    async run(command: CommandModel): Promise<void> {
        if (!queue.connection) {
            if (command.rawMessage.member?.voice.channel) {
                const permissions = command.rawMessage.member.voice.channel.permissionsFor(command.rawMessage.client.user!);
                if (permissions!.has("CONNECT") || permissions!.has("SPEAK")) {
                    queue.connection = await command.rawMessage.member!.voice.channel.join();
                }
            } else {
                await command.rawMessage.channel.send(
                    new MessageEmbed()
                    .setTitle('You can only play music in a voice channel')
                    .setDescription('Connect to a voice channel so I can sing you a song')
                );
            }
        }

        try {
            const song = await queue.searchSong(command.args.length > 1 ? command.args.join(' ') : command.args[0]);
            const l = queue.get ? queue.get.length : 1;
            queue.addToQueue(song);
            if (queue.startQueue) {
                if (song.length > 1) {
                    await command.rawMessage.channel.send(
                        new MessageEmbed()
                        .setTitle('Added to queue:')
                        .setDescription(`${song.map((s, i) => `**${i+l})** ${s.title}`).join('\n')}`)
                    );
                }
                queue.play(song[0], command.rawMessage.channel);
            } else {
                await command.rawMessage.channel.send(
                    new MessageEmbed()
                    .setTitle('Added to queue:')
                    .setDescription(`${song.map((s, i) => `**${i+l})** ${s.title}`).join('\n')}`)
                );
            }
        } catch (error) {
            console.log(error);
            await command.rawMessage.channel.send(
                new MessageEmbed()
                .setTitle('I couldn\'t find that song!')
                .setDescription('You could try with another one or a youtube link')
            );
        }
    }

    hasPermissionToRun(commandModel: CommandModel): boolean {
        if (!this.permission) return true;
        return commandModel.rawMessage.member!.roles.cache.some(
            (r) => r.name === this.permission,
        );
    }

}
