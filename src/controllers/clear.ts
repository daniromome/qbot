import { MessageEmbed } from 'discord.js';
import { roles } from './../config/role';
import { CommandModel } from '../models/command';
import { Command } from '../interfaces/command';
import { queue } from '../models/queue';

export class ClearCommand implements Command {
    readonly aliases = ['clear', 'empty'];
    readonly permission = roles.qbitor;

    getHelpMessage(): string {
        return `Empty the current queue`;
    }

    async run(command: CommandModel): Promise<void> {
        const q = queue.get;
        if (q) {
            queue.resetQueue();
            await command.rawMessage.channel.send(
                new MessageEmbed()
                .setTitle('Queue has been emptied')
                .setDescription('I love cleaning up your messes (not really lol)')
            );
        } else {
            await command.rawMessage.channel.send(
                new MessageEmbed()
                .setTitle('I can\'t do that!')
                .setDescription('Queue is already empty')
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