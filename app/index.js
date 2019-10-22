const Generator = require('yeoman-generator');
const updateNotifier = require('update-notifier');
const chalk = require('chalk');
const yosay = require('yosay');
const beeper = require('beeper');
const path = require('path');
const _ = require('lodash');
const ora = require('ora');
const download = require('download-git-repo');
const fse = require('fs-extra');
const prompts = require('./prompts');
const pkg = require('../package.json');

/**
 * class函数分两类：
 * 1.自定义函数，以下划线_开头
 * 2.生命周期函数（yeoman）
 */
class GeneratorAntdCustom extends Generator {
  // 初始化
  initializing() {
    this.props = {};
    this.success = false;
    // 检查版本
    this._checkVersion();
  }

  // 用户交互
  prompting() {
    // 引入交互问题，赋值
    return this.prompt(prompts).then(props => {
      this.props = props;
    });
  }

  // 执行文件动作
  writing() {
    const { name, version, description, author, license } = this.props || {};
    const repo_base = 'https://github.com/';
    const repo_github = 'ctq123/antd-custom';

    let done = this.async();
    // 删除遗留文件
    this._removeDir(path.join(__dirname, 'templates'));

    let spinner = ora(`开始从仓库${chalk.blue(repo_base + repo_github)}下载模板...`);
    spinner.start();

    // 下载模板
    new Promise((resolve, reject) => {
      download(repo_github, path.join(__dirname, 'templates'), err => err ? reject(err) : resolve());
    }).then(() => {
      spinner.stopAndPersist({
        symbol: chalk.green('   ✔'),
        text: `下载模板${chalk.red('antd-custom')} 成功！`
      });

      // if (path.basename(this.destinationPath()) !== name) {
      //   this.log('正在创建目录' + name);
      //   mkdirp(name);
      //   this.destinationRoot(this.destinationPath(name));
      // }

      this.log(`开始复制模板...`);
      this._copyDir(path.join(__dirname, 'templates'), this.destinationRoot(name));

      const new_pkg = this.fs.readJSON(this.templatePath('package.json'), {});
      this.fs.writeJSON(this.destinationPath('package.json'), {
        ...new_pkg,
        name,
        version,
        description,
        author,
        license,
        keywords: [pkg.name]
      });

      this.fs.commit([], ()=>{
        this.log();
        this.log("复制模板成功！")
        this.success = true;
        done();
      });

    }).catch(err => {
      this.log(`模板操作失败！` + chalk.red(err));
      spinner.fail();
      this.success = false;
      this.env.error(err);
      // 异常退出
      process.exit(1);
    });
    
  }

  // 安装依赖包
  install() {
    if (this.success) {
      this.log();
      this.log(`开始安装依赖包...`);
      this.installDependencies({
        npm: true,
        yarn: false,
        bower: false,
      })
    }
  }
 
  // 结束
  end() {
    // 删除遗留文件
    this._removeDir(path.join(__dirname, 'templates'));
    if (this.success) {
      this.log();
      this.log(`一切准备就绪！启动项目请运行命令：${chalk.yellow('npm start')}`);
      // 正常退出
      process.exit(0);
    }
  }

  // 检查版本
  _checkVersion() {
    const version = `(v${pkg.version})`;
    this.log(yosay(`${chalk.red(pkg.name)}脚手架！`));
    this.log();
    this.log(`正在检查脚手架${chalk.red(pkg.name)}最新版本...`);
    const notifier = updateNotifier({
      pkg,
      updateCheckInterval: 0
    });
    notifier.notify();
    if (notifier.update) {
      // 更新脚手架
      this.log();
      // this.log(`npm i -g ${pkg.name}`);
      this.npmInstall([pkg.name], { '-g': true });
      beeper();

      // 打印更新的信息
      const { current, latest, name } = notifier.update;
      const vcurrent = `v${current}`;
      const vlatest = `v${latest}`;
      this.log(`更新脚手架${chalk.red(name)}版本成功：${chalk.yellow(vcurrent)} -> ${chalk.green(vlatest)}`);
    } else {
      this.log(`脚手架${chalk.red(pkg.name)}已是最新版本：${chalk.green(version)}`);
    }
  }

  // 复制文件/文件夹（异步）
  _copyDir(src, dist) {
    fse.copy(src, dist, { filter: this._filterFunc }, err => {
      if (err) {
        this.log(`复制模板失败！${err}`);
      }
    });
  }

  // 过滤文件/文件夹
  _filterFunc(src, dist) {
    // console.log("src", src);
    if (src && src.includes('package.json')) {
      return false;
    }
    return true;
  }

  // 删除文件/文件夹（同步）
  _removeDir(src) {
    fse.removeSync(src);
  }

};

module.exports = GeneratorAntdCustom;