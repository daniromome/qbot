import { Message } from 'discord.js';

export class Reaction {
    constructor() {}

    async success(message: Message) {
        await message.react('✅');
    }

    async failure(message: Message) {
        await message.reactions.removeAll();
        await message.react('❌');
    }
}

export const react = new Reaction();
