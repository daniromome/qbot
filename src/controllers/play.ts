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
        if (command.rawMessage.member?.voice.channel) {
            const permissions = command.rawMessage.member.voice.channel.permissionsFor(command.rawMessage.client.user!);
            if (permissions!.has("CONNECT") || permissions!.has("SPEAK")) {
                try {
                    const song = await queue.searchSong(command.args.length > 1 ? command.args.join(' ') : command.args[0]);
                    queue.addToQueue(song);
                    if (queue.startQueue) {
                        queue.connection = await command.rawMessage.member!.voice.channel.join();
                        queue.play(song, command.rawMessage.channel);
                    } else {
                        await command.rawMessage.channel.send(
                            new MessageEmbed()
                            .setTitle('Added to queue:')
                            .setDescription(`${song.title}`)
                        );
                    }
                } catch (error) {
                    await command.rawMessage.channel.send(
                        new MessageEmbed()
                        .setTitle('I couldn\'t find that song!')
                        .setDescription('You could try with another one or a youtube link')
                    );
                }
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

}
