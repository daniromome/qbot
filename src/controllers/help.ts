import { CommandModel } from '../models/command';
import { Command } from '../interfaces/command';
import { EmbedFieldData, MessageEmbed } from 'discord.js';

export class HelpCommand implements Command {
    readonly aliases = ['help', 'halp', 'hlep'];
    readonly permission = null;

    private commands: Command[];

    constructor(commands: Command[]) {
        this.commands = commands;
    }

    async run(commandModel: CommandModel): Promise<void> {
        const enabledCommands = this.commands.filter((command) =>
            command.hasPermissionToRun(commandModel),
        );

        if (commandModel.args.length === 0) {
            const helpers: EmbedFieldData[] = [];
            enabledCommands.forEach((command) =>
                helpers.push({
                    name: `${commandModel.prefix}${command.aliases[0]}`,
                    value: command.getHelpMessage(),
                }),
            );
            await commandModel.rawMessage.channel.send(
                new MessageEmbed()
                    .setTitle('Qbot, developed by @dani9oo')
                    .setDescription('Official Qbit Shelter Bot')
                    .addFields(helpers),
            );
            return;
        }

        const matchedCommand = this.commands.find((command) =>
            command.aliases.includes(commandModel.args[0]),
        );
        if (!matchedCommand) {
            await commandModel.rawMessage.channel.send(
                new MessageEmbed().setDescription(
                    `I don't know that command 😢. Try ${commandModel.prefix}help to find all the commands you can use.`,
                ),
            );
            throw Error('Unrecognized command');
        }
        if (enabledCommands.includes(matchedCommand)) {
            await commandModel.rawMessage.channel.send(
                this.buildHelpMessageForCommand(matchedCommand, commandModel),
            );
        }
    }

    private buildHelpMessageForCommand(
        command: Command,
        model: CommandModel,
    ): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`${model.prefix}${command.aliases[0]}`)
            .setDescription(command.getHelpMessage())
            .addField('Aliases:', command.aliases.join(', '));
    }

    hasPermissionToRun(commandModel: CommandModel): boolean {
        return true;
    }

    getHelpMessage() {
        return 'get information about the commands I know 🤓';
    }
}
