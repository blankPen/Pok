module.exports = function (ctx) {
    return {
        name: '',
        startText: () => '',
        prompting() {
            const result = ctx.prompt([
                {
                    name: 'projectName',
                    type: targetDir ? null : 'text',
                    message: '项目名:',
                    initial: defaultProjectName,
                    onState: (state) => (targetDir = String(state.value).trim() || defaultProjectName)
                },
                {
                    name: 'biz',
                    type: 'text',
                    message: '业务线名称:',
                    initial: defaultBizName,
                    onState: (state) => (targetDir = String(state.value).trim() || defaultBizName)
                },
                {
                    name: 'page',
                    type: 'text',
                    message: '页面名称:',
                    initial: defaultPageName,
                    onState: (state) => (targetDir = String(state.value).trim() || defaultPageName)
                },
                {
                    name: 'needRematch',
                    type: 'toggle',
                    message: '添加状态管理工具 @wmfe/mach-pro-store？',
                    initial: true,
                    active: 'Yes',
                    inactive: 'No'
                },
            ]);
            return result;
        }
    }
}