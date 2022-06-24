import prompts from 'prompts';
import chalk from 'chalk';
import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto'
import shelljs from 'shelljs'
import klaw from 'klaw'
import hbs from 'handlebars'
import { Signale, SignaleOptions } from 'signale'
import { execSync } from 'child_process'

const hash = (str) => crypto.createHash('md5').update(str).digest('hex');
const tempCacheDir = path.join(os.homedir(), '.pok')
const options: SignaleOptions = {
    disabled: false,
    interactive: false,
    types: {},
    config: {
        displayLabel: false,
    }
};

const logger = new Signale(options);

const createInteractiveLogger = () => new Signale({
    ...options,
    interactive: true,
});

export function shouldUseYarn(): boolean {
    try {
        execSync('yarn --version', { stdio: 'ignore' })
        return true
    } catch (e) {
        return false
    }
}

const configName = 'pok.config.js'
const contextLib = {
    prompts: prompts,
    shelljs: shelljs,
    chalk: chalk,
    userConfig: {} as object,
}

export interface PokCreateOptions {
    remote?: string;
    branch?: string;
}

export type Context = typeof contextLib;
export interface CreatorConfig {
    name?: string;
    autoInstall?: boolean | string;
    handlebars?: Parameters<typeof hbs.compile>[1];
    filter?: RegExp | ((path: string) => boolean);
    targetDir?: () => string;
    start?: () => string;
    prompting?: () => any;
    render?: (file: { path: string, code: string }) => string;
    end?: () => void;
}

const scanFiles = (templateDir: string): Promise<string[]> => {
    let result = new Set<string>();
    return new Promise((resolve, reject) => {
        klaw(templateDir).on('data', (item) => {
            if (!item.stats.isFile()) return;
            result.add(item.path);

        }).on('error', (err) => {
            return reject(err)
        }).on('end', () => {
            return resolve(Array.from(result))
        })
    })
}

const cancel = () => {
    logger.log('')
    logger.error('操作取消');
    logger.log('')
    process.exit(1);
}

export class Creator {
    context = {
        ...contextLib
    }

    private async loadCreator({ remote, branch }: PokCreateOptions) {
        branch = branch || 'master';
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

    async run(params: PokCreateOptions) {
        if (!params.remote && !params.branch) {
            params = await this.context.prompts([
                {
                    name: 'remote',
                    type: 'text',
                    message: '请输入要创建的模板Git地址:',
                    validate: (value) => {
                        if (!/^(ssh|http|https):\/\//.test(value)) return '请输入正确的Git地址';
                        return true;
                    }
                },
                {
                    name: 'branch',
                    type: 'text',
                    message: '请输入模板所属分支:',
                    initial: 'master',
                },
            ])
        }

        const inc = createInteractiveLogger();
        inc.await('正在加载模板');
        const pok = await this.loadCreator(params);
        inc.success('模板加载完成');
        await this.runPok(pok);
    }

    async runPok({ config, templateDir, configPath }: { config: CreatorConfig, templateDir: string, configPath: string }) {
        if (config.start) config.start();
        // ask user config
        const params = config.prompting ? await config.prompting() : {};
        Object.assign(this.context.userConfig, params);

        // get output basePath
        let targetPath = process.cwd();
        if (config.targetDir) {
            targetPath = path.join(process.cwd(), await config.targetDir());
        } else if (params.projectName) {
            targetPath = params.projectName;
        } else {
            const { targetDir } = await this.context.prompts({
                name: 'targetDir',
                type: 'text',
                message: '项目路径:',
                validate: (value) => !!value || ''
            })
            targetPath = path.join(process.cwd(), targetDir);
        }
        const targetDir = targetPath.replace(process.cwd() + '/', '')
        const rootExists = await fs.pathExists(targetPath)
        if (rootExists) {
            const { overwrite } = await this.context.prompts({
                name: 'overwrite',
                type: 'toggle',
                message: `路径 ${targetDir} 已存在，是否进行覆盖？`,
                initial: false,
                active: '是',
                inactive: '否'
            })
            if (!overwrite) return cancel();
        }

        console.log('');
        // scan temp dir
        const files = await (await scanFiles(templateDir)).filter(filepath => {
            // filter file
            if (filepath.startsWith(`${templateDir}/.git/`)) return false;
            if (configPath === filepath) return false;
            if (config.filter) {
                let match = false
                if (typeof config.filter === 'function') {
                    match = config.filter(filepath);
                } else if (config.filter.test) {
                    match = config.filter.test(filepath);
                }
                if (!match) return;
            }
            return true
        }).sort();
        // each render template
        // await Promise.all();
        for (let i = 0; i < files.length; i++) {
            const filepath = files[i];
            const relativePath = path.relative(templateDir, filepath)
            const outputFilePath = path.join(targetPath, path.dirname(relativePath), path.basename(relativePath, '.hbs'));
            // compile temp
            let tempCode = await fs.readFile(filepath, 'utf8');
            try {
                tempCode = hbs.compile(tempCode, config.handlebars)({ ...this.context.userConfig });
            } catch (error) {
                logger.error('hbs.compile 失败, 请检查模板是否正确:', relativePath);
                logger.error(error);
                process.exit(1);
            }
            if (config.render) tempCode = config.render({ path: filepath, code: tempCode });
            // write temp
            await fs.ensureDir(path.dirname(outputFilePath));
            await fs.writeFile(outputFilePath, tempCode);

            logger.success(`${chalk.green('created')} ${relativePath}`);
        }

        // auto install
        if (config.autoInstall) {
            console.log('');
            logger.await(`开始安装依赖`);
            let cmd = ''
            if (config.autoInstall === 'npm' || config.autoInstall === 'yarn') {
                cmd = config.autoInstall
            } else {
                cmd = shouldUseYarn() ? 'yarn' : 'npm';
            }
            shelljs.exec(`${cmd} install`, { cwd: targetDir });
            logger.success(`依赖安装完成`);
        }

        // end
        if (config.end) {
            console.log('');
            await config.end();
            console.log('');
        } else {
            console.log('');
            logger.success('项目创建完成');
            console.log('');
        }
    }
}

export function create(params?: PokCreateOptions) {
    return new Creator().run(params || {})
}
