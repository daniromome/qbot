import { roles } from './../config/role';
import { CommandModel } from '../models/command';
import { Command } from '../interfaces/command';
import { queue } from '../models/queue';
import { MessageEmbed } from 'discord.js';

export class SongCommand implements Command {
    readonly aliases = ['song'];
    readonly permission = roles.qbitor;

    getHelpMessage(): string {
        return `See what's playing right now ▶`;
    }

    async run(command: CommandModel): Promise<void> {
        try {
            command.rawMessage.channel.send(
                new MessageEmbed()
                .setTitle('Current song on the queue:')
                .setDescription(queue.song.title)
            );    
        } catch (error) {
            command.rawMessage.channel.send(
                new MessageEmbed()
                .setTitle('The queue has been emptied')
                .setDescription('There\'s no song for me to display')
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
