#!usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync, exec } = require('child_process')
const rootDir = require('osenv').home()
const mkdirp = require('mkdirp')
const requireFrom = require('import-from').silent
const ora = require('ora')
const chalk = require('chalk')
const shell = require('shelljs')
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
    this.fs = fs
    this.path = path
  }

  /**
   * 创建模版临时仓
   */
  async mkTmplDir() {
    try {
      mkdirp(this.tmplDir)
      const tpkg = path.resolve(this.tmplDir, 'package.json')
      if (!fs.existsSync(tpkg)) {
        fs.writeFileSync(tpkg, JSON.stringify({ name: '_', description: '_', repository: '_', license: 'MIT' }))
      }
    } catch(e) {
      this.log(e, 'red')
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
   * 同步执行npm命令
   * @param {*} npm 
   * @param {*} options 
   */
  npmExecSync(npm, options='') {
    if (!npm) return
    const cmd = `${npm} --registry=https://registry.npm.taobao.org/`
    return options ? execSync(cmd, options) : execSync(cmd)
  }

  /**
   * shell安装npm命令
   * 区别child_process.exec：child_process.exec需要在callback中回调打印日志信息
   * @param {*} npm 
   * @param {*} options
   * @param {*} cb 
   */
  shellInstall(npm, options={}) {
    if (!npm) return
    const cmd = `${npm} --registry=https://registry.npm.taobao.org/`
    shell.exec(cmd, { ...options })
  }

  /**
   * 提取package.json文件
   * @param {*} dir 
   */
  getPackageFile(dir) {
    const p = path.resolve(dir, 'package.json')
    return fs.existsSync(p) ? require(p) : null
  }

  /**
   * 获取依赖包安装状态
   * 0: 未安装； 1: 版本落后； 2: 最新版本
   * @param {*} pkgName 
   * @param {*} dir 
   */
  getPackageStatus(pkgName, dir) {
    const des = (this.getPackageFile(dir) || {}).dependencies
    if (!des || !des[pkgName]) return 0
    const lastv = this.npmExecSync(`npm view ${pkgName} version`) + ''
    const curv = requireFrom(dir, path.join(pkgName, 'package.json')).version
    return lastv.trim() === curv ? 2 : 1
  }

  /**
   * 运行项目命令，如启动或打包等
   * 注意：用子进程child_process.exec调用npm，不会打印日志，这里采用shell命令调用项目命令
   * @param {*} cmdStr 
   */
  runScriptCmd(cmdStr='') {
    try {
      if (!cmdStr) throw Error('运行命令不能为空')
      let msg = '运行命令'
      // 提取当前目录package.json命令
      const cwd = process.cwd()
      const pkg = this.getPackageFile(cwd)
      const { scripts } = pkg || {}

      msg = cmdStr.startsWith('start') ? '项目启动' : msg
      msg = cmdStr.startsWith('build') ? '项目打包' : msg
      
      if (!pkg) throw Error(`${msg}失败！当前目录不存在package.json，请确认当前目录是否为工程目录`)
      if (!scripts || !scripts[cmdStr]) throw Error(`${msg}失败！当前目录下package.json的scripts中不存在 ${cmdStr} 命令`)
      // 通过shell运行项目命令
      shell.exec(`npm run ${cmdStr}`, { async: true })
      process.exitCode = 0
    } catch(e) {
      this.log(e, 'red')
    }
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
