import { queue } from './../models/queue';
import { roles } from './../config/role';
import { CommandModel } from '../models/command';
import { Command } from '../interfaces/command';
import { MessageEmbed } from 'discord.js';

export class RemoveCommand implements Command {
    readonly aliases = ['remove'];
    readonly permission = roles.qbitor;

    getHelpMessage(): string {
        return `I'll remove a song from the queue`;
    }

    async run(command: CommandModel): Promise<void> {
        if(command.args[0]) {
            try {
                const pos = Number(command.args[0]);
                const { removedSong, keepPlaying, nextSong } = queue.remove(pos);
                // console.log(nextSong);
                if (keepPlaying) {
                    if (nextSong) {
                        queue.play(nextSong, command.rawMessage.channel)
                    } else {
                        queue.connection?.disconnect();
                    }
                }
                await command.rawMessage.channel.send(
                    new MessageEmbed()
                    .setTitle('Removed song from the queue')
                    .setDescription(removedSong.title)
                );
            } catch (error) {
                await command.rawMessage.channel.send(
                    new MessageEmbed()
                    .setTitle('What are you even trying to do sis?')
                    .setDescription(error.message)
                );
            }
        } else {
            await command.rawMessage.channel.send(
                new MessageEmbed()
                .setTitle('I didn\'t quite got that')
                .setDescription('make sure you\'re using a number as the argument')
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
