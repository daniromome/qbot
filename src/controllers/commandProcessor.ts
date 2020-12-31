import { StopCommand } from './stop';
import { QueueCommand } from './queue';
import { roles } from './../config/role';
import { Message, MessageEmbed } from 'discord.js';
import { Command } from '../interfaces/command';
import { PingCommand } from './ping';
import { HelpCommand } from './help';
import { CommandModel } from '../models/command';
import { react } from './reaction';
import { TeQuieroCommand } from './tq';
import { PlayCommand } from './play';
import { SkipCommand } from './skip';
import { JumpCommand } from './jump';
import { ResumeCommand } from './resume';
import { KillCommand } from './kill';
import { LoopCommand } from './loop';
import { SongCommand } from './song';
import { ConnectCommand } from './connect';
import { ClearCommand } from './clear';
import { RemoveCommand } from './remove';

export class CommandProcessor {
    private commands: Command[];

    private readonly prefix: string;

    constructor(prefix: string) {
        const commandClasses = [
            PingCommand,
            TeQuieroCommand,
            PlayCommand,
            QueueCommand,
            SkipCommand,
            JumpCommand,
            StopCommand,
            ResumeCommand,
            KillCommand,
            LoopCommand,
            SongCommand,
            ConnectCommand,
            ClearCommand,
            RemoveCommand
        ];

        this.commands = commandClasses.map(
            (CommandClass) => new CommandClass(),
        );
        this.commands.push(new HelpCommand(this.commands));
        this.prefix = prefix;
    }

    async processMessage(message: Message): Promise<void> {
        if (message.author.bot || !this.isCommand(message)) {
            return;
        }

        const commandModel = new CommandModel(message, this.prefix);

        const enabledCommands = this.commands.filter((command) =>
            command.hasPermissionToRun(commandModel),
        );
        const matchedCommand = this.commands.find((command) =>
            command.aliases.includes(commandModel.commandString),
        );

        if (!matchedCommand) {
            await message.channel.send(
                new MessageEmbed()
                    .setTitle('Invalid command!')
                    .setDescription(
                        'I do not know what to respond to that, sorry 😢',
                    ),
            );
            await react.failure(message);
        } else if (!enabledCommands.includes(matchedCommand)) {
            const description =
                matchedCommand.permission === roles.qbitor
                    ? `I only have permission to talk to ${roles.qbitor.toLowerCase()}s 👉🏻👈🏻`
                    : `You don't have sufficient permissions to use that command 😅`;
            await message.channel.send(
                new MessageEmbed()
                    .setTitle(
                        "I don't know how to tell you this buuuuut...",
                    )
                    .setDescription(description)
                    .setColor('RED'),
            );
            await react.failure(message);
        } else {
            await matchedCommand
                .run(commandModel)
                .then(() => {
                    react.success(message);
                })
                .catch((reason) => {
                    react.failure(message);
                });
        }
    }
    
    private isCommand(message: Message): boolean {
        return message.content.startsWith(this.prefix);
    }
}
