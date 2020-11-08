import { roles } from './../config/role';
import { CommandModel } from '../models/command';
import { Command } from '../interfaces/command';

export class PingCommand implements Command {
    readonly aliases = ['ping', 'pong'];
    readonly permission = roles.qbitor;

    getHelpMessage(): string {
        return `qbot will pong(ping!?) you back.`;
    }

    async run(command: CommandModel): Promise<void> {
        if (command.commandString === 'ping')
            await command.rawMessage.channel.send('pong! 🏓');
        if (command.commandString === 'pong')
            await command.rawMessage.channel.send('ping!? 🤔');
    }

    hasPermissionToRun(commandModel: CommandModel): boolean {
        if (!this.permission) return true;
        return commandModel.rawMessage.member!.roles.cache.some(
            (r) => r.name === this.permission,
        );
    }
}
