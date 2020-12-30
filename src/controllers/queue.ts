import { MessageEmbed } from 'discord.js';
import { roles } from './../config/role';
import { CommandModel } from '../models/command';
import { Command } from '../interfaces/command';
import { queue } from '../models/queue';

export class QueueCommand implements Command {
    readonly aliases = ['queue', 'q'];
    readonly permission = roles.qbitor;

    getHelpMessage(): string {
        return `Obtain the list of songs being played right now 🗒`;
    }

    async run(command: CommandModel): Promise<void> {
        const q = queue.get;
        if (q) {
            const songs = q.map((s, i) => `**${i+1})** ${s.title}`);
            await command.rawMessage.channel.send(
                new MessageEmbed()
                .setTitle('Now playing:')
                .setDescription(`${songs.join('\n')}`)
            );
        } else {
            await command.rawMessage.channel.send(
                new MessageEmbed()
                .setTitle('I can\'t do that!')
                .setDescription('there are no songs in the queue')
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
