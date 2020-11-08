import { Message } from 'discord.js';

export class CommandModel {
    readonly commandString: string;

    readonly args: string[];

    readonly rawMessage: Message;

    readonly prefix: string;

    constructor(message: Message, prefix: string) {
        this.prefix = prefix;
        const splitMessage = message.content
            .slice(prefix.length)
            .trim()
            .split(/ +/g);

        this.commandString = splitMessage.shift()!.toLowerCase();
        this.args = splitMessage;
        this.rawMessage = message;
    }
}
