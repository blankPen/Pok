import prompts from 'prompts';
import chalk from 'chalk';
import shelljs from 'shelljs';
import hbs from 'handlebars';
export declare function shouldUseYarn(): boolean;
declare const contextLib: {
    prompts: typeof prompts;
    shelljs: typeof shelljs;
    chalk: chalk.Chalk & chalk.ChalkFunction & {
        supportsColor: false | chalk.ColorSupport;
        Level: chalk.Level;
        Color: "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "gray" | "grey" | "blackBright" | "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright" | "bgBlack" | "bgRed" | "bgGreen" | "bgYellow" | "bgBlue" | "bgMagenta" | "bgCyan" | "bgWhite" | "bgGray" | "bgGrey" | "bgBlackBright" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright";
        ForegroundColor: "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "gray" | "grey" | "blackBright" | "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright";
        BackgroundColor: "bgBlack" | "bgRed" | "bgGreen" | "bgYellow" | "bgBlue" | "bgMagenta" | "bgCyan" | "bgWhite" | "bgGray" | "bgGrey" | "bgBlackBright" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright";
        Modifiers: "reset" | "bold" | "dim" | "italic" | "underline" | "inverse" | "hidden" | "strikethrough" | "visible";
        stderr: chalk.Chalk & {
            supportsColor: false | chalk.ColorSupport;
        };
    };
    userConfig: object;
};
export interface PokCreateOptions {
    remote?: string;
    branch?: string;
}
export declare type Context = typeof contextLib;
export interface CreatorConfig {
    name?: string;
    autoInstall?: boolean | string;
    handlebars?: Parameters<typeof hbs.compile>[1];
    filter?: RegExp | ((path: string) => boolean);
    targetDir?: () => string;
    start?: () => string;
    prompting?: () => any;
    render?: (file: {
        path: string;
        code: string;
    }) => string;
    end?: () => void;
}
export declare class Creator {
    context: {
        prompts: typeof prompts;
        shelljs: typeof shelljs;
        chalk: chalk.Chalk & chalk.ChalkFunction & {
            supportsColor: false | chalk.ColorSupport;
            Level: chalk.Level;
            Color: "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "gray" | "grey" | "blackBright" | "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright" | "bgBlack" | "bgRed" | "bgGreen" | "bgYellow" | "bgBlue" | "bgMagenta" | "bgCyan" | "bgWhite" | "bgGray" | "bgGrey" | "bgBlackBright" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright";
            ForegroundColor: "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "gray" | "grey" | "blackBright" | "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright";
            BackgroundColor: "bgBlack" | "bgRed" | "bgGreen" | "bgYellow" | "bgBlue" | "bgMagenta" | "bgCyan" | "bgWhite" | "bgGray" | "bgGrey" | "bgBlackBright" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright";
            Modifiers: "reset" | "bold" | "dim" | "italic" | "underline" | "inverse" | "hidden" | "strikethrough" | "visible";
            stderr: chalk.Chalk & {
                supportsColor: false | chalk.ColorSupport;
            };
        };
        userConfig: object;
    };
    private loadCreator;
    run(params: PokCreateOptions): Promise<void>;
    runPok({ config, templateDir, configPath }: {
        config: CreatorConfig;
        templateDir: string;
        configPath: string;
    }): Promise<never>;
}
export declare function create(params?: PokCreateOptions): Promise<void>;
export {};
