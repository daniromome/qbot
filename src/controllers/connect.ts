import { roles } from './../config/role';
import { CommandModel } from '../models/command';
import { Command } from '../interfaces/command';
import { MessageEmbed } from 'discord.js';
import { queue } from '../models/queue';

export class ConnectCommand implements Command {
    readonly aliases = ['connect', 'join'];
    readonly permission = roles.qbitor;

    getHelpMessage(): string {
        return `I'll join your voice channel friend!`;
    }

    async run(command: CommandModel): Promise<void> {
        if (!queue.connection) {
            if (command.rawMessage.member?.voice.channel) {
                const permissions = command.rawMessage.member.voice.channel.permissionsFor(command.rawMessage.client.user!);
                if (permissions!.has("CONNECT") || permissions!.has("SPEAK")) {
                    queue.connection = await command.rawMessage.member!.voice.channel.join();
                }
            } else {
                await command.rawMessage.channel.send(
                    new MessageEmbed()
                    .setTitle('I am already connected')
                    .setDescription('You\'re confusing me smh')
                );
            }
        }
    }

    hasPermissionToRun(commandModel: CommandModel): boolean {
        if (!this.permission) return true;
        return commandModel.rawMessage.member!.roles.cache.some(
            (r) => r.name === this.permission,
        );
    }
}
