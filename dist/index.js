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
exports.Creator = void 0;
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
var hash = function (str) { return crypto_1.default.createHash('md5').update(str).digest('hex'); };
var tempCacheDir = path_1.default.join(os_1.default.homedir(), '.pok');
var options = {
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
var logger = new signale_1.Signale(options);
var inavLogger = new signale_1.Signale(__assign(__assign({}, options), { interactive: true }));
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
            if (item.path.startsWith(templateDir + "/.git/"))
                return;
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
var Creator = /** @class */ (function () {
    function Creator() {
        this.context = __assign({}, contextLib);
    }
    Creator.prototype.loadCreator = function () {
        return __awaiter(this, void 0, void 0, function () {
            var remote, branch, outputName, tempOutputDir, hasOutput, configPath, hasConfig, creator, creatorConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        remote = 'ssh://git@git.sankuai.com/waimai-f2e/waimai_mach_project_template.git';
                        branch = 'react';
                        outputName = path_1.default.basename(remote, '.git') + "_" + hash(remote + "/" + branch);
                        tempOutputDir = path_1.default.join(tempCacheDir, outputName);
                        return [4 /*yield*/, fs_extra_1.default.ensureDir(tempCacheDir)];
                    case 1:
                        _a.sent();
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
    Creator.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pok;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadCreator()];
                    case 1:
                        pok = _a.sent();
                        return [4 /*yield*/, this.runPok(pok)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Creator.prototype.runPok = function (_a) {
        var config = _a.config, templateDir = _a.templateDir, configPath = _a.configPath;
        return __awaiter(this, void 0, void 0, function () {
            var params, _b, cwd, root, rootExists, overwrite, files;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (config.startText)
                            logger.info(config.startText());
                        if (!config.prompting) return [3 /*break*/, 2];
                        return [4 /*yield*/, config.prompting()];
                    case 1:
                        _b = _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _b = {};
                        _c.label = 3;
                    case 3:
                        params = _b;
                        Object.assign(this.context.userConfig, params);
                        cwd = process.cwd();
                        root = cwd;
                        if (typeof config.root === 'string') {
                            root = path_1.default.join(process.cwd(), config.root);
                        }
                        else if (typeof config.root === 'function') {
                            root = path_1.default.join(process.cwd(), config.root());
                        }
                        return [4 /*yield*/, fs_extra_1.default.pathExists(root)];
                    case 4:
                        rootExists = _c.sent();
                        if (!rootExists) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.context.prompts({
                                name: 'overwrite',
                                type: 'toggle',
                                message: "\u9879\u76EE\u8DEF\u5F84\uFF1A" + root.replace(cwd, '') + " \u5DF2\u5B58\u5728\uFF0C\u662F\u5426\u8FDB\u884C\u8986\u76D6\uFF1F",
                                initial: false,
                                active: '是',
                                inactive: '否'
                            })];
                    case 5:
                        overwrite = (_c.sent()).overwrite;
                        if (!overwrite)
                            throw new Error(chalk_1.default.red('✖') + ' 操作取消');
                        _c.label = 6;
                    case 6: return [4 /*yield*/, scanFiles(templateDir)];
                    case 7:
                        files = _c.sent();
                        // each render template
                        return [4 /*yield*/, Promise.all(files.map(function (filepath) { return __awaiter(_this, void 0, void 0, function () {
                                var relativePath, outputFilePath, tempCode, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (configPath === filepath)
                                                return [2 /*return*/];
                                            relativePath = path_1.default.relative(templateDir, filepath);
                                            outputFilePath = path_1.default.join(root, relativePath);
                                            return [4 /*yield*/, fs_extra_1.default.readFile(filepath, 'utf8')];
                                        case 1:
                                            tempCode = _a.sent();
                                            try {
                                                tempCode = handlebars_1.default.compile(tempCode)(__assign({}, this.context.userConfig));
                                            }
                                            catch (error) {
                                                logger.error('hbs.compile 失败, 请检查模板是否正确:', relativePath);
                                                logger.error(error);
                                                process.exit(1);
                                            }
                                            if (config.render) {
                                                result = config.render({ path: filepath, code: tempCode });
                                                // skip filter
                                                if (result === false)
                                                    return [2 /*return*/];
                                                tempCode = String(result);
                                            }
                                            return [4 /*yield*/, fs_extra_1.default.ensureDir(path_1.default.dirname(outputFilePath))];
                                        case 2:
                                            _a.sent();
                                            return [4 /*yield*/, fs_extra_1.default.writeFile(outputFilePath, tempCode)];
                                        case 3:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))
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
                        ];
                    case 8:
                        // each render template
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Creator;
}());
exports.Creator = Creator;
