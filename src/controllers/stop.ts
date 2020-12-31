import { queue } from './../models/queue';
import { roles } from './../config/role';
import { CommandModel } from '../models/command';
import { Command } from '../interfaces/command';
import { MessageEmbed } from 'discord.js';

export class StopCommand implements Command {
    readonly aliases = ['stop', 'pause', 'wait'];
    readonly permission = roles.qbitor;

    getHelpMessage(): string {
        return `qbot will pong(ping!?) you back.`;
    }

    async run(command: CommandModel): Promise<void> {
        try {
            queue.stop();
        } catch (error) {
            command.rawMessage.channel.send(
                new MessageEmbed()
                .setTitle('Couldn\'t pause')
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
