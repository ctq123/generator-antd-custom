const fs = require('fs')
const path = require('path')
const Generator = require('yeoman-generator')
const chalk = require('chalk')
const rootDir = require('osenv').home()

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts)
    this.tmplDir = path.resolve(rootDir, '.tmpl/node_modules/antd-custom-tpl/templates')
  }

  prompting() {
    return this.prompt([
      {
        type: 'input',
        name: 'name',
        message: '请输入项目名称(antd-custom)：',
        default: 'antd-custom',
        validate(name) {
          if (fs.readdirSync('.').includes(name)) return '目录已存在'
          return true
        }
      },
      {
        type: 'input',
        name: 'version',
        message: '请输入项目版本号(0.0.1):',
        default: '0.0.1'
      },
      {
        type: 'input',
        name: 'description',
        message: '请输入项目描述:',
      },
    ]).then(answers => {
      this.answers = answers
    })
  }

  writing() {
    const { name } = this.answers
    let done = this.async()
    // 改写并复制package.json文件
    const tmplpkg = this.fs.readJSON(this.templatePath(this.tmplDir, 'package.json'), {})
    this.fs.writeJSON(this.destinationPath(name, 'package.json'), { ...tmplpkg, ...this.answers })
    this.fs.copyTpl(this.templatePath(this.tmplDir, 'env.local.json'), this.destinationPath(name, 'env.local.json'))
    this.fs.copyTpl(this.templatePath(this.tmplDir, 'env.dev.json'), this.destinationPath(name, 'env.dev.json'), { appName: name })
    this.fs.copyTpl(this.templatePath(this.tmplDir, 'env.test.json'), this.destinationPath(name, 'env.test.json'), { appName: name })
    this.fs.copyTpl(this.templatePath(this.tmplDir, 'env.pre.json'), this.destinationPath(name, 'env.pre.json'), { appName: name })
    this.fs.copyTpl(this.templatePath(this.tmplDir, 'env.prod.json'), this.destinationPath(name, 'env.prod.json'), { appName: name })
    // 复制其他文件
    fs.readdirSync(this.templatePath(this.tmplDir))
    .filter(item => 
      item !== 'package.json' &&
      !item.startsWith('env.')
    )
    .forEach(item => {
      let desItem = item
      // 由于原项目模板.gitignore发布后命名会被npm过滤和修改，需要调整回来
      if (item === '.npmignore') desItem = '.gitignore'
      this.fs.copy(this.templatePath(this.tmplDir, item), this.destinationPath(name, desItem))
    })
    // 使用commit确认马上提交，消除各种打印创建文件的无用日志
    this.fs.commit([], () => { done() })
  }

  install() {
    this.console(`开始安装项目依赖包...`)
    const projectDir = path.join(process.cwd(), this.answers.name)
    this.spawnCommandSync('npm', ['install', '--registry=https://registry.npm.taobao.org/'], { cwd: projectDir })
  }

  end() {
    this.console()
    this.console(`项目依赖包安装完成！`)
    this.console()
    this.console(`一切准备就绪！启动项目步骤如下：`)
    this.console(`1）进入当前目录：${this.answers.name}`)
    this.console(`2）手动运行命令：cfe start`)
    this.console()
    process.exit(0)
  }

  console(str='', color='yellow') {
    const co = chalk[color] || chalk.yellow
    console.log(co(str))
  }
}