/**
 *
 * When inheriting from a class should always use super() after constructor
 * Classes have public, pprivate and protected modifiers
 * protected attributes get inherited contrary to private ones
 *
 * Abstract classees should be prefixed by abstract and their abstract methods
 * should look like this: abstract method([....args]): void
 * it can not be instantiated
 *
 * You can also usee interfaces to define the type of a specific function
 */

import { Client, Message } from 'discord.js';
import { config } from 'dotenv';
import { CommandProcessor } from './controllers/commandProcessor';
import { prefix } from './config/prefix';

config();
const qbot = new Client();
const commandProcessor = new CommandProcessor(prefix);

qbot.once('ready', () => {
    console.log('Qbot has been initialized');
});

qbot.on('message', (message: Message) => {
    commandProcessor.processMessage(message);
});

qbot.login(process.env.TOKEN);
