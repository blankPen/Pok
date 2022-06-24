import minimist from 'minimist';
import prompts from 'prompts';
import chalk from 'chalk';
import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto'
import shelljs from 'shelljs'
import klaw from 'klaw'
import hbs from 'handlebars'
import { Signale } from 'signale'

const hash = (str) => crypto.createHash('md5').update(str).digest('hex');
const tempCacheDir = path.join(os.homedir(), '.pok')
const options = {
    disabled: false,
    interactive: false,
    scope: 'Pok',
    types: {
        // time: {
        //     badge: '',
        //     color: 'green',
        //     label: 'success'
        // },
        santa: {
            badge: '🎅',
            color: 'red',
            label: 'santa'
        }
    },
    config: {
        // displayFilename: true,
        // displayTimestamp: true,
        // displayDate: true,
        // displayBadge: false,
    }
};

const logger = new Signale(options);

const inavLogger = new Signale({
    ...options,
    interactive: true,
});

// log4js.configure({
//     appenders: {
//         console: {
//             type: 'console'
//         }
//     },
//     categories: {
//         default: {
//             appenders: ['console'],
//             level: process.env.LEVEL || 'all'
//         }
//     }
// });

// const logger = logger.getLogger('Pok')

const configName = 'pok.config.js'
const contextLib = {
    prompts: prompts,
    shelljs: shelljs,
    chalk: chalk,
    userConfig: {} as object,
}

export type Context = typeof contextLib;
export interface CreatorConfig {
    name?: string;
    root?: string | (() => string);
    startText?: () => string;
    prompting?: () => object;
    render?: (file: { path: string, code: string }) => any;
    beforeInstall?: () => void;
    afterInstall?: () => void;
}

const scanFiles = (templateDir: string): Promise<string[]> => {
    let result = new Set<string>();
    return new Promise((resolve, reject) => {
        klaw(templateDir).on('data', (item) => {
            if (item.path.startsWith(`${templateDir}/.git/`)) return;
            if (!item.stats.isFile()) return;
            result.add(item.path);

        }).on('error', (err) => {
            return reject(err)
        }).on('end', () => {
            return resolve(Array.from(result))
        })
    })
}

export class Creator {
    context = {
        ...contextLib
    }

    private async loadCreator() {
        // logger.time('下载最新模板')
        const remote = 'ssh://git@git.sankuai.com/waimai-f2e/waimai_mach_project_template.git';
        const branch = 'react';
        const outputName = `${path.basename(remote, '.git')}_${hash(`${remote}/${branch}`)}`
        const tempOutputDir = path.join(tempCacheDir, outputName);
        await fs.ensureDir(tempCacheDir);
        if (!fs.existsSync(tempOutputDir)) {
            shelljs.exec(`git clone --depth 1 -b ${branch} ${remote} ${outputName}`, { cwd: tempCacheDir, silent: true });
        } else {
            shelljs.exec(`git fetch --all`, { cwd: tempOutputDir, silent: true });
            shelljs.exec(`git reset --hard ${branch}`, { cwd: tempOutputDir, silent: true });
            shelljs.exec(`git pull --force -X theirs --no-edit`, { cwd: tempOutputDir, silent: true });
        }
        // logger.log(fs.existsSync(tempOutputDir));
        // logger.timeEnd();
        const hasOutput = fs.existsSync(tempOutputDir);
        const configPath = path.join(tempOutputDir, configName)
        const hasConfig = fs.existsSync(configPath);

        if (!hasOutput) throw new Error(`Could not found dir: ${tempOutputDir}!`);
        if (hasConfig) {
            let creator = require(configPath);
            if (typeof creator !== 'function') {
                if (typeof creator.default === 'function') {
                    creator = creator.default;
                } else {
                    throw new Error(`The type of ${configName} export must be a function type, instead of ${typeof creator}!`);
                }
            }
            const creatorConfig = creator(this.context);
            if (creatorConfig && typeof creatorConfig !== 'object') {
                throw new Error(`Unknow return type of file ${configName}!`);
            }
            return {
                configPath,
                templateDir: tempOutputDir,
                config: creatorConfig,
            };
        } else {
            return {
                configPath,
                templateDir: tempOutputDir,
                config: {}
            }
        }
    }

    async run() {
        const pok = await this.loadCreator();
        await this.runPok(pok);
    }

    async runPok({ config, templateDir, configPath }: { config: CreatorConfig, templateDir: string, configPath: string }) {
        if (config.startText) logger.info(config.startText());
        // ask user config
        const params = config.prompting ? await config.prompting() : {};
        Object.assign(this.context.userConfig, params);

        // get output basePath
        let cwd = process.cwd();
        let root = cwd;
        if (typeof config.root === 'string') {
            root = path.join(process.cwd(), config.root);
        } else if (typeof config.root === 'function') {
            root = path.join(process.cwd(), config.root());
        }
        const rootExists = await fs.pathExists(root)
        if (rootExists) {
            const { overwrite } = await this.context.prompts({
                name: 'overwrite',
                type: 'toggle',
                message: `项目路径：${root.replace(cwd, '')} 已存在，是否进行覆盖？`,
                initial: false,
                active: '是',
                inactive: '否'
            })
            if (!overwrite) throw new Error(chalk.red('✖') + ' 操作取消')
        }

        // scan temp dir
        const files = await scanFiles(templateDir);
        // each render template
        await Promise.all(files.map(async filepath => {
            if (configPath === filepath) return;
            const relativePath = path.relative(templateDir, filepath)
            const outputFilePath = path.join(root, relativePath);
            let tempCode = await fs.readFile(filepath, 'utf8');
            try {
                tempCode = hbs.compile(tempCode)({ ...this.context.userConfig });
            } catch (error) {
                logger.error('hbs.compile 失败, 请检查模板是否正确:', relativePath);
                logger.error(error);
                process.exit(1);
            }
            if (config.render) {
                const result = config.render({ path: filepath, code: tempCode });
                // skip filter
                if (result === false) return;
                tempCode = String(result);
            }
            await fs.ensureDir(path.dirname(outputFilePath));
            await fs.writeFile(outputFilePath, tempCode);
        }))




        // initializing：初始化方法（检验当前项目状态、获取configs、等）
        // prompting：获取用户选项
        // configuring：保存配置（创建.editorconfig 文件）
        // default：如果函数名称如生命周期钩子不一样，则会被放进这个组
        // writing：写generator特殊的文件（路由、控制器、等）
        // conflicts：冲突后处理办法
        // install：正在安装（npm、bower）
        // end：安装结束、清除文件、设置good bye文案、等

        // prompts
        // 
    }
}
