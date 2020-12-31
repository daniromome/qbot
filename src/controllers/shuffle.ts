import { queue } from './../models/queue';
import { roles } from './../config/role';
import { CommandModel } from '../models/command';
import { Command } from '../interfaces/command';
import { MessageEmbed } from 'discord.js';

export class ShuffleCommand implements Command {
    readonly aliases = ['shuffle'];
    readonly permission = roles.qbitor;

    getHelpMessage(): string {
        return `I shall repeat that queue (or song) nonstop`;
    }

    async run(command: CommandModel): Promise<void> {
        try {
            queue.shuffleQueue();
            command.rawMessage.channel.send(
                new MessageEmbed()
                .setTitle('Queue has been shuffled')
                .setDescription(`Note: If loop is disabled past songs aren't going to be shuffled`)
            );
        } catch (error) {
            command.rawMessage.channel.send(
                new MessageEmbed()
                .setTitle('Something went wrong!')
                .setDescription(error.message)
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