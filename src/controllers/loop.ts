import { queue } from './../models/queue';
import { roles } from './../config/role';
import { CommandModel } from '../models/command';
import { Command } from '../interfaces/command';
import { MessageEmbed } from 'discord.js';

export class LoopCommand implements Command {
    readonly aliases = ['loop', 'repeat'];
    readonly permission = roles.qbitor;

    getHelpMessage(): string {
        return `I shall repeat that queue (or song) nonstop`;
    }

    async run(command: CommandModel): Promise<void> {
        try {
            const loop = queue.loopQueue();
            command.rawMessage.channel.send(
                new MessageEmbed()
                .setTitle('Changed loop mode')
                .setDescription(`Queue set to loop '${loop}'`)
            );
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
