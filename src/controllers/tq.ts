import { roles } from '../config/role';
import { CommandModel } from '../models/command';
import { Command } from '../interfaces/command';
import { createReadStream } from 'fs-extra';
import { MessageEmbed } from 'discord.js';

export class TeQuieroCommand implements Command {
    readonly aliases = ['tq', 'tqm', 'tkm'];
    readonly permission = roles.qbitor;

    getHelpMessage(): string {
        return `qbot will bring you love and comfort through rough times`;
    }

    async run(command: CommandModel): Promise<void> {
        await command.rawMessage.react('🥰');
        if (command.rawMessage.member?.voice.channel) {
            const permissions = command.rawMessage.member.voice.channel.permissionsFor(command.rawMessage.client.user!);
            if (permissions!.has("CONNECT") || permissions!.has("SPEAK")) {
                const connection = await command.rawMessage.member!.voice.channel.join();
                const dispatcher = connection.play(createReadStream('assets/tq.mp3'));
                dispatcher.on('start', async () => {
                    await command.rawMessage.channel.send('Now playing "tq.mp3" voiced by @deviru');
                });
                dispatcher.on('finish', async () => {
                    connection.disconnect();
                });
            } else {
                await command.rawMessage.channel.send(
                    new MessageEmbed()
                    .setTitle('I don\'t have enough permissions to do this')
                    .setDescription('I need the permissions to join and speak in your voice channel!')
                )
            }
        } else {
            await command.rawMessage.channel.send(
                new MessageEmbed()
                .setTitle('También te quiero 🤗')
                .setDescription('(Si te conectas a un canal de voz te lo puedo decir)')
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
