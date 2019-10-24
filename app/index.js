const Generator = require('yeoman-generator');
const updateNotifier = require('update-notifier');
const latestVersion = require('latest-version');
const chalk = require('chalk');
const yosay = require('yosay');
const beeper = require('beeper');
const path = require('path');
const _ = require('lodash');
const ora = require('ora');
const download = require('download-git-repo');
const fse = require('fs-extra');
const execSync = require('child_process').execSync;
const prompts = require('./prompts');
const pkg = require('../package.json');

let spinner = ora(`开始下载模板...`)
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

    this.log();
    spinner.start(`开始从仓库${chalk.blue(repo_base + repo_github)}下载模板...`);

    // 下载模板
    new Promise((resolve, reject) => {
      download(repo_github, path.join(__dirname, 'templates'), err => err ? reject(err) : resolve());
    }).then(() => {
      spinner.succeed(`下载模板${chalk.red('antd-custom')} 成功！`);
      spinner.stop();

      // if (path.basename(this.destinationPath()) !== name) {
      //   this.log('正在创建目录' + name);
      //   mkdirp(name);
      //   this.destinationRoot(this.destinationPath(name));
      // }

      this.log();
      this.log(`开始复制模板...`);
      this._copyDir(path.join(__dirname, 'templates'), this.destinationRoot(name));

      // 这种方式不需要在package.json中提前定义变量
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

      // 复制.gitignore，隐藏文件必须手动复制
      this.fs.copy(
        this.templatePath('.gitignore'),
        this.destinationPath('.gitignore')
      );

      // 复制.babelrc，隐藏文件必须手动复制
      this.fs.copy(
        this.templatePath('.babelrc'),
        this.destinationPath('.babelrc')
      );

      // 提交缓存，使package.json生效，不再提出询问是否覆盖
      this.fs.commit([], ()=>{
        this.success = true;
        this.log();
        this.log(`复制模板成功！`);
        done();
      });

    }).catch(err => {
      spinner.stop();
      this.log(`模板操作失败！`);
      this.success = false;
      this.env.error(err);
      // 异常退出
      process.exit(1);
    });
    
  }

  // 安装依赖包
  install() {
    if (this.success) {
      this.installDependencies({ bower: false });
      this.log(`开始安装项目依赖包...`);
      this.log();
    }
  }
 
  // 结束
  end() {
    // 删除遗留文件
    this._removeDir(path.join(__dirname, 'templates'));
    if (this.success) {
      this.log();
      this.log(`项目依赖包安装完成！`);
      this.log();
      this.log(`一切准备就绪！启动项目步骤如下：`);
      this.log(`1）进入当前目录：${chalk.yellow(this.props.name)}`);
      this.log(`2）手动运行命令：${chalk.yellow('npm start')}`);
      this.log();
      // 正常退出
      process.exit(0);
    }
  }

  // 检查版本
  _checkVersion() {
    this.log(yosay(`欢迎使用 ${chalk.red(pkg.name)} \n脚手架！`));
    this.log();
    let done = this.async();
    spinner.start(`正在检测脚手架${chalk.red(pkg.name)}最新版本`);
    latestVersion(pkg.name).then(latest => {
      const vcur = `v${pkg.version}`;
      const vlast = `v${latest}`;
      if (latest != pkg.version) {
        // 将会在install()生命周期中执行
        this.npmInstall([pkg.name], { 'global': true });
        // // 当前同步强制执行
        // execSync(`npm i ${pkg.name} -g`);
        spinner.succeed(`本次运行结束后，脚手架${chalk.red(pkg.name)}将自动升级：${chalk.yellow(vcur)} -> ${chalk.green(vlast)}`);
      } else {
        spinner.succeed(`当前脚手架${chalk.red(pkg.name)}@${chalk.green(pkg.version)}已是最新版本`);
      }
    }).catch(err => {
      spinner.succeed(`检测脚手架${chalk.red(pkg.name)}版本过程发生异常！`);
      this.log(`${chalk.red(err)}`);
      process.exit(1);
    }).finally(() => {
      this.log();
      spinner.stop();
      done();
    });
  }

  // 复制文件/文件夹（异步）
  _copyDir(src, dist) {
    fse.copy(src, dist, 
      { filter: (item) => !(item || '').includes('package.json') }, 
      err => { err && this.log(`复制模板失败！${chalk.red(err)}`)}
    );
  }

  // 删除文件/文件夹（同步）
  _removeDir(src) {
    fse.removeSync(src);
  }

};

module.exports = GeneratorAntdCustom;