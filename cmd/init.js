const inquirer = require('inquirer')
const env = require('yeoman-environment').createEnv()
const install = require('./install')
const reactTpl = require('../tpl/react-tpl')
const reactApp = 'react:app'

const getRealTmplName = (name) => {
  switch(name) {
    case 'react':
    case '@cf/react-tpl':
      return '@cf/react-tpl'
    default:
      return ''
  }
}

/**
 * cfe init 
 * cfe init [name]
 * 初始化项目
 */
module.exports = async function(name) {
  try {
    // 校验版本
    this.checkVersion()
    // 生成临时目录
    this.mkTmplDir()

    // 安装项目模版
    name = name || process.argv[3]
    if (!name) {
      const { tmpl } = await inquirer.prompt({ message: '请选择一个模版', type: 'list', name: 'tmpl', choices: ['react'] })
      name = tmpl
    }
    const realTmpl = getRealTmplName(name)
    if (!realTmpl) {
      this.log('初始化命令非法！尝试使用 cfe init ，查看更多 cfe -h')
      return
    }
    const status = this.getPackageStatus(realTmpl, this.tmplDir)
    switch(status) {
      case 0: // 没安装
        await install.call(this, realTmpl)
        break
      case 1: // 有版本更新
        const { update } = await inquirer.prompt({ message: '有最新模板是否更新：', type: 'list', name: 'update', choices: ['是', '否'] })
        if (update === '是') await install.call(this, realTmpl)
        break
      default:
        break
    }
    
    // 调用项目模版命令yoeman
    env.registerStub(reactTpl, reactApp)
    env.run(reactApp)

  } catch(e) {
    this.log(e, 'red')
  }
  
}