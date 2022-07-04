
<h1 align="center">❯ Pok</h1>

<p align="center">
  <a href="https://npmjs.org/package/pok">
    <img src="https://img.shields.io/npm/v/pok.svg" alt="version" />
  </a>
  <a href="https://travis-ci.org/terkelg/pok">
    <img src="https://img.shields.io/travis/terkelg/pok.svg" alt="travis" />
  </a>
  <a href="https://npmjs.org/package/pok">
    <img src="https://img.shields.io/npm/dm/pok.svg" alt="downloads" />
  </a>
</p>

<p align="center">
  <b>Simple and Elegant project creator</b><br />
  <sub>>_ Easier for create template projects with Git▌</sub>
</p>

<br />

<!-- * **Simple**: prompts has [no big dependencies](http://npm.anvaka.com/#/view/2d/prompts) nor is it broken into a [dozen](http://npm.anvaka.com/#/view/2d/inquirer) tiny modules that only work well together.
* **User friendly**: prompt uses layout and colors to create beautiful cli interfaces.
* **Promised**: uses promises and `async`/`await`. No callback hell.
* **Flexible**: all prompts are independent and can be used on their own.
* **Testable**: provides a way to submit answers programmatically.
* **Unified**: consistent experience across all [prompts](#-types). -->

## ❯ 安装
```
npm install pok -g
```


## ❯ 使用
### 同时CLI使用
```bash
# initial a project by pok-template
pok ssh://xxx.git
```
### 在NodeJS中使用
```js
const pok = require('pok')

pok.create({
    remote: 'ssh://xxx.git',
    branch: 'master'
})
```

## ❯ 创建一个Pok模板项目
### 初始化模板
```bash
pok git@github.com:blankPen/pok-example.git
```

### 配置pok.config.js
```js
module.exports = function creator(ctx) {
    return {
        name: 'pok-template',
        // 在模板初始化前执行，根据setup配置的参数进行项目生成
        async setup() {
            // 通过prompts与用户进行交互获取用户配置项
            const res = await ctx.prompts([
                {
                    name: 'projectName',
                    type: 'text',
                    message: '项目名:',
                    initial: defaultProjectName,
                    onState: (state) => (String(state.value).trim() || defaultProjectName)
                },
            ], {
                onCancel() {
                    process.exit(1);
                }
            });
            let sourceDir = 'normal';
            if (res.needRematch) sourceDir = 'rematch';

            // 返回setup所需配置参数
            return {
                autoInstall: true,
                sourceDir: sourceDir,
                outputDir: res.projectName,
                env: res
            };
        },
        // 项目创建结束后回调，一般用于打印结束日志
        end() {
            console.log(ctx.chalk.green(`\n  项目创建完成，快速启动: `))
            console.log(`    cd ${ctx.setupConfig.outputDir}`)
            console.log(`    npm run dev`)
        }
    }
}
```

### setup配置项
- **sourceDir**, 模板代码所在的文件夹，默认值：`./`
- **outputDir**, 要生成模板代码的输出目录，当未进行配置时 pok 会主动询问用户要输出的目录地址
- **autoInstall**, 是否自动执行 `npm install` 安装项目依赖，默认值：`false`
- **env**, 模板环境参数，配置的参数将用于hbs模板生成，具体参考：https://handlebarsjs.com/

### Context
为了方便模板创建提供的上下文，内置一些常用库
- **setupConfig**, `setup()` 返回的结果，方便在`end()`中使用
- [prompts](https://github.com/terkelg/prompts#readme) Lightweight, beautiful and user-friendly interactive prompts
- [shelljs](https://github.com/shelljs/shelljs)  🐚 Portable Unix shell commands for Node.js
- [chalk](https://github.com/chalk/chalk) 🖍 Terminal string styling done right


## ❯ Licence
MIT