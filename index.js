const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const rootDir = require('osenv').home()
const mkdirp = require('mkdirp')
const ora = require('ora')
const chalk = require('chalk')
const cmdDir = 'cmd'
const pkg = require('./package.json')

class Cli {
  /**
   * 命令入口
   */
  constructor() {
    this.bindVar()
    const cmds = fs.readdirSync(path.resolve(__dirname, cmdDir)).map(item =>item.split('.')[0])
    const cmd =  cmds.includes(process.argv[2]) ? process.argv[2] : 'help'
    const cmdFile = require(path.resolve(__dirname, cmdDir, cmd))
    cmdFile.call(this)
  }

  /**
   * 绑定全局变量
   */
  bindVar() {
    this.pkg = pkg
    this.ora = ora('')
    this.tmplDir = path.resolve(rootDir, '.tmpl')
  }

  /**
   * 创建模版临时仓
   */
  mkTmplDir() {
    mkdirp(this.tmplDir)
    const tpkg = path.resolve(this.tmplDir, 'package.json')
    if (!fs.existsSync(tpkg)) {
      fs.writeFileSync(tpkg, JSON.stringify({ name: '_', description: '_', repository: '_', license: 'MIT' }))
    }
  }

  /**
   * 检查脚手架版本
   */
  checkVersion() {
    const { name, version } = pkg
    const lastVersion = this.npmExecSync(`npm view ${name} version`) + ''
    if (lastVersion.trim() !== version) this.log(`cfe 版本过旧，建议执行 cfe update 升级 cfe：${version} -> ${lastVersion}`)
  }

  /**
   * 执行npm命令
   * @param {*} npm 
   * @param {*} options 
   */
  npmExecSync(npm, options='') {
    if (!npm) return
    const cmd = `${npm} --registry=https://registry.npmjs.org`
    return options ? execSync(cmd, options) : execSync(cmd)
  }

  /**
   * 进度条日志
   * @param {*} str 
   * @param {*} type 
   */
  spinner(str, type='start') {
    if (this.ora[type]) this.ora[type](str)
  }

  /**
   * 普通日志
   * @param {*} str 
   * @param {*} color 
   */
  log(str='', color='yellow') {
    const co = chalk[color] || chalk.yellow
    console.log(co(str))
  }

}

module.exports = new Cli()