"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.Creator = exports.shouldUseYarn = void 0;
var prompts_1 = __importDefault(require("prompts"));
var chalk_1 = __importDefault(require("chalk"));
var os_1 = __importDefault(require("os"));
var path_1 = __importDefault(require("path"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var crypto_1 = __importDefault(require("crypto"));
var shelljs_1 = __importDefault(require("shelljs"));
var klaw_1 = __importDefault(require("klaw"));
var handlebars_1 = __importDefault(require("handlebars"));
var signale_1 = require("signale");
var child_process_1 = require("child_process");
var hash = function (str) { return crypto_1.default.createHash('md5').update(str).digest('hex'); };
var tempCacheDir = path_1.default.join(os_1.default.homedir(), '.pok');
var options = {
    disabled: false,
    interactive: false,
    types: {},
    config: {
        displayLabel: false,
    }
};
var logger = new signale_1.Signale(options);
var createInteractiveLogger = function () { return new signale_1.Signale(__assign(__assign({}, options), { interactive: true })); };
function shouldUseYarn() {
    try {
        child_process_1.execSync('yarn --version', { stdio: 'ignore' });
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.shouldUseYarn = shouldUseYarn;
var configName = 'pok.config.js';
var contextLib = {
    prompts: prompts_1.default,
    shelljs: shelljs_1.default,
    chalk: chalk_1.default,
    userConfig: {},
};
var scanFiles = function (templateDir) {
    var result = new Set();
    return new Promise(function (resolve, reject) {
        klaw_1.default(templateDir).on('data', function (item) {
            if (!item.stats.isFile())
                return;
            result.add(item.path);
        }).on('error', function (err) {
            return reject(err);
        }).on('end', function () {
            return resolve(Array.from(result));
        });
    });
};
var cancel = function () {
    logger.log('');
    logger.error('操作取消');
    logger.log('');
    process.exit(1);
};
var Creator = /** @class */ (function () {
    function Creator() {
        this.context = __assign({}, contextLib);
    }
    Creator.prototype.loadCreator = function (_a) {
        var remote = _a.remote, branch = _a.branch;
        return __awaiter(this, void 0, void 0, function () {
            var outputName, tempOutputDir, hasOutput, configPath, hasConfig, creator, creatorConfig;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        branch = branch || 'master';
                        outputName = path_1.default.basename(remote, '.git') + "_" + hash(remote + "/" + branch);
                        tempOutputDir = path_1.default.join(tempCacheDir, outputName);
                        return [4 /*yield*/, fs_extra_1.default.ensureDir(tempCacheDir)];
                    case 1:
                        _b.sent();
                        if (!fs_extra_1.default.existsSync(tempOutputDir)) {
                            shelljs_1.default.exec("git clone --depth 1 -b " + branch + " " + remote + " " + outputName, { cwd: tempCacheDir, silent: true });
                        }
                        else {
                            shelljs_1.default.exec("git fetch --all", { cwd: tempOutputDir, silent: true });
                            shelljs_1.default.exec("git reset --hard " + branch, { cwd: tempOutputDir, silent: true });
                            shelljs_1.default.exec("git pull --force -X theirs --no-edit", { cwd: tempOutputDir, silent: true });
                        }
                        hasOutput = fs_extra_1.default.existsSync(tempOutputDir);
                        configPath = path_1.default.join(tempOutputDir, configName);
                        hasConfig = fs_extra_1.default.existsSync(configPath);
                        if (!hasOutput)
                            throw new Error("Could not found dir: " + tempOutputDir + "!");
                        if (hasConfig) {
                            creator = require(configPath);
                            if (typeof creator !== 'function') {
                                if (typeof creator.default === 'function') {
                                    creator = creator.default;
                                }
                                else {
                                    throw new Error("The type of " + configName + " export must be a function type, instead of " + typeof creator + "!");
                                }
                            }
                            creatorConfig = creator(this.context);
                            if (creatorConfig && typeof creatorConfig !== 'object') {
                                throw new Error("Unknow return type of file " + configName + "!");
                            }
                            return [2 /*return*/, {
                                    configPath: configPath,
                                    templateDir: tempOutputDir,
                                    config: creatorConfig,
                                }];
                        }
                        else {
                            return [2 /*return*/, {
                                    configPath: configPath,
                                    templateDir: tempOutputDir,
                                    config: {}
                                }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Creator.prototype.run = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var inc, pok;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!params.remote && !params.branch)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.context.prompts([
                                {
                                    name: 'remote',
                                    type: 'text',
                                    message: '请输入要创建的模板Git地址:',
                                    validate: function (value) {
                                        if (!/^(ssh|http|https):\/\//.test(value))
                                            return '请输入正确的Git地址';
                                        return true;
                                    }
                                },
                                {
                                    name: 'branch',
                                    type: 'text',
                                    message: '请输入模板所属分支:',
                                    initial: 'master',
                                },
                            ])];
                    case 1:
                        params = _a.sent();
                        _a.label = 2;
                    case 2:
                        inc = createInteractiveLogger();
                        inc.await('正在加载模板');
                        return [4 /*yield*/, this.loadCreator(params)];
                    case 3:
                        pok = _a.sent();
                        inc.success('模板加载完成');
                        return [4 /*yield*/, this.runPok(pok)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Creator.prototype.runPok = function (_a) {
        var config = _a.config, templateDir = _a.templateDir, configPath = _a.configPath;
        return __awaiter(this, void 0, void 0, function () {
            var params, _b, targetPath, _c, _d, _e, targetDir_1, targetDir, rootExists, overwrite, files, i, filepath, relativePath, outputFilePath, tempCode, cmd;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (config.start)
                            config.start();
                        if (!config.prompting) return [3 /*break*/, 2];
                        return [4 /*yield*/, config.prompting()];
                    case 1:
                        _b = _f.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _b = {};
                        _f.label = 3;
                    case 3:
                        params = _b;
                        Object.assign(this.context.userConfig, params);
                        targetPath = process.cwd();
                        if (!config.targetDir) return [3 /*break*/, 5];
                        _d = (_c = path_1.default).join;
                        _e = [process.cwd()];
                        return [4 /*yield*/, config.targetDir()];
                    case 4:
                        targetPath = _d.apply(_c, _e.concat([_f.sent()]));
                        return [3 /*break*/, 8];
                    case 5:
                        if (!params.projectName) return [3 /*break*/, 6];
                        targetPath = params.projectName;
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, this.context.prompts({
                            name: 'targetDir',
                            type: 'text',
                            message: '项目路径:',
                            validate: function (value) { return !!value || ''; }
                        })];
                    case 7:
                        targetDir_1 = (_f.sent()).targetDir;
                        targetPath = path_1.default.join(process.cwd(), targetDir_1);
                        _f.label = 8;
                    case 8:
                        targetDir = targetPath.replace(process.cwd() + '/', '');
                        return [4 /*yield*/, fs_extra_1.default.pathExists(targetPath)];
                    case 9:
                        rootExists = _f.sent();
                        if (!rootExists) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.context.prompts({
                                name: 'overwrite',
                                type: 'toggle',
                                message: "\u8DEF\u5F84 " + targetDir + " \u5DF2\u5B58\u5728\uFF0C\u662F\u5426\u8FDB\u884C\u8986\u76D6\uFF1F",
                                initial: false,
                                active: '是',
                                inactive: '否'
                            })];
                    case 10:
                        overwrite = (_f.sent()).overwrite;
                        if (!overwrite)
                            return [2 /*return*/, cancel()];
                        _f.label = 11;
                    case 11:
                        console.log('');
                        return [4 /*yield*/, scanFiles(templateDir)];
                    case 12: return [4 /*yield*/, (_f.sent()).filter(function (filepath) {
                            // filter file
                            if (filepath.startsWith(templateDir + "/.git/"))
                                return false;
                            if (configPath === filepath)
                                return false;
                            if (config.filter) {
                                var match = false;
                                if (typeof config.filter === 'function') {
                                    match = config.filter(filepath);
                                }
                                else if (config.filter.test) {
                                    match = config.filter.test(filepath);
                                }
                                if (!match)
                                    return;
                            }
                            return true;
                        }).sort()];
                    case 13:
                        files = _f.sent();
                        i = 0;
                        _f.label = 14;
                    case 14:
                        if (!(i < files.length)) return [3 /*break*/, 19];
                        filepath = files[i];
                        relativePath = path_1.default.relative(templateDir, filepath);
                        outputFilePath = path_1.default.join(targetPath, path_1.default.dirname(relativePath), path_1.default.basename(relativePath, '.hbs'));
                        return [4 /*yield*/, fs_extra_1.default.readFile(filepath, 'utf8')];
                    case 15:
                        tempCode = _f.sent();
                        try {
                            tempCode = handlebars_1.default.compile(tempCode, config.handlebars)(__assign({}, this.context.userConfig));
                        }
                        catch (error) {
                            logger.error('hbs.compile 失败, 请检查模板是否正确:', relativePath);
                            logger.error(error);
                            process.exit(1);
                        }
                        if (config.render)
                            tempCode = config.render({ path: filepath, code: tempCode });
                        // write temp
                        return [4 /*yield*/, fs_extra_1.default.ensureDir(path_1.default.dirname(outputFilePath))];
                    case 16:
                        // write temp
                        _f.sent();
                        return [4 /*yield*/, fs_extra_1.default.writeFile(outputFilePath, tempCode)];
                    case 17:
                        _f.sent();
                        logger.success(chalk_1.default.green('created') + " " + relativePath);
                        _f.label = 18;
                    case 18:
                        i++;
                        return [3 /*break*/, 14];
                    case 19:
                        // auto install
                        if (config.autoInstall) {
                            console.log('');
                            logger.await("\u5F00\u59CB\u5B89\u88C5\u4F9D\u8D56");
                            cmd = '';
                            if (config.autoInstall === 'npm' || config.autoInstall === 'yarn') {
                                cmd = config.autoInstall;
                            }
                            else {
                                cmd = shouldUseYarn() ? 'yarn' : 'npm';
                            }
                            shelljs_1.default.exec(cmd + " install", { cwd: targetDir });
                            logger.success("\u4F9D\u8D56\u5B89\u88C5\u5B8C\u6210");
                        }
                        if (!config.end) return [3 /*break*/, 21];
                        console.log('');
                        return [4 /*yield*/, config.end()];
                    case 20:
                        _f.sent();
                        console.log('');
                        return [3 /*break*/, 22];
                    case 21:
                        console.log('');
                        logger.success('项目创建完成');
                        console.log('');
                        _f.label = 22;
                    case 22: return [2 /*return*/];
                }
            });
        });
    };
    return Creator;
}());
exports.Creator = Creator;
function create(params) {
    return new Creator().run(params || {});
}
exports.create = create;
