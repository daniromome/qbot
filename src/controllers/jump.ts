import { queue } from './../models/queue';
import { roles } from './../config/role';
import { CommandModel } from '../models/command';
import { Command } from '../interfaces/command';
import { MessageEmbed } from 'discord.js';

export class JumpCommand implements Command {
    readonly aliases = ['jump'];
    readonly permission = roles.qbitor;

    getHelpMessage(): string {
        return `Tell me which song in the queue I should play`;
    }

    async run(command: CommandModel): Promise<void> {
        if(command.args[0]) {
            try {
                const pos = Number(command.args[0]);
                const song = queue.jump(pos);
                queue.play(song, command.rawMessage.channel);    
            } catch (error) {
                await command.rawMessage.channel.send(
                    new MessageEmbed()
                    .setTitle('I\'d spam ping you with \'**?**\' if we were on League I swear')
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
