import { queue } from './../models/queue';
import { roles } from './../config/role';
import { CommandModel } from '../models/command';
import { Command } from '../interfaces/command';
import { MessageEmbed } from 'discord.js';

export class KillCommand implements Command {
    readonly aliases = ['goodbye', 'kill', 'die', 'kys'];
    readonly permission = roles.qbitor;

    getHelpMessage(): string {
        return `I'll disconnect and empty the queue`;
    }

    async run(command: CommandModel): Promise<void> {
        try {
            queue.kill();
        } catch (error) {
            command.rawMessage.channel.send(
                new MessageEmbed()
                .setTitle('Already disconnected')
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
