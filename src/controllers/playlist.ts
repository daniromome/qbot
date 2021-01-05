import { MessageEmbed } from 'discord.js';
import { roles } from '../config/role';
import { CommandModel } from '../models/command';
import { Command } from '../interfaces/command';

export class PlaylistCommand implements Command {
    readonly aliases = ['playlist'];
    readonly permission = roles.qbitor;

    getHelpMessage(): string {
        return `Manage your playlists`;
    }

    async run(command: CommandModel): Promise<void> {
        switch (command.args[0]) {
            case 'create':
                break;
            case 'add':
                break;
            case 'delete':
                break;
            case 'remove':
                break;
            default:
                await command.rawMessage.channel.send(
                    new MessageEmbed()
                    .setTitle('I couldn\'t find that song!')
                    .setDescription('You could try with another one or a youtube link')
                );
                break;
        }
        await command.rawMessage.channel.send('Command behaviour');
    }

    hasPermissionToRun(commandModel: CommandModel): boolean {
        if (!this.permission) return true;
        return commandModel.rawMessage.member!.roles.cache.some(
            (r) => r.name === this.permission,
        );
    }
}