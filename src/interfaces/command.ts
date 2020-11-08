import { CommandModel } from '../models/command';

export interface Command {
    readonly aliases: string[];
    readonly permission: string | null;
    getHelpMessage(): string;
    run(commandString: CommandModel): Promise<void>;
    hasPermissionToRun(commandString: CommandModel): boolean;
}
