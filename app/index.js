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
    let spinner = ora(`开始从仓库${chalk.blue(repo_base + repo_github)}下载模板...`);
    spinner.start();

    // 下载模板
    new Promise((resolve, reject) => {
      download(repo_github, path.join(__dirname, 'templates'), err => err ? reject(err) : resolve());
    }).then(() => {
      spinner.stopAndPersist({
        symbol: chalk.green('✔'),
        text: `下载模板${chalk.red('antd-custom')} 成功！`
      });

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

      // 提交缓存，使package.json生效，不再提出询问是否覆盖
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
      });
    }
  }
 
  // 结束
  end() {
    // 删除遗留文件
    this._removeDir(path.join(__dirname, 'templates'));
    if (this.success) {
      this.log();
      this.log(`依赖包安装完成！`);
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
    let spinner = ora(`正在检测脚手架${chalk.red(pkg.name)}最新版本`).start();
    latestVersion(pkg.name).then(latest => {
      const vcur = `v${pkg.version}`;
      const vlast = `v${latest}`;
      if (latest != pkg.version) {
        spinner.stop();
        // this.npmInstall([pkg.name], { 'global': true });
        spinner = ora(`脚手架${chalk.red(pkg.name)}正在更新版本：${chalk.yellow(vcur)} -> ${chalk.green(vlast)}`).start();
        execSync(`npm i ${pkg.name} -g`);
        spinner.stopAndPersist({
          symbol: chalk.green('✔'),
          text: `脚手架${chalk.red(pkg.name)}更新版本成功！${chalk.yellow(vcur)} -> ${chalk.green(vlast)}`
        });
        // 正常退出
        process.exit(0);
        // 重新运行命令
        this.log();
        this.log(`请重新运行命令：${chalk.yellow('yo antd-custom')}`);
        this.log();
      } else {
        spinner.stopAndPersist({
          symbol: chalk.green('✔'),
          text: `当前脚手架${chalk.red(pkg.name)}@${chalk.green(pkg.version)}已是最新版本`
        });
      }
    }).catch(err => {
      this.log(`检测脚手架${chalk.red(pkg.name)}版本过程发生异常！${err}`);
      spinner && spinner.fail();
      process.exit(1);
    }).finally(() => {
      this.log();
      done();
    });
  }

  // 复制文件/文件夹（异步）
  _copyDir(src, dist) {
    fse.copy(src, dist, 
      { filter: (item) => !(item || '').includes('package.json') }, 
      err => { err && this.log(`复制模板失败！${err}`)}
    );
  }

  // 删除文件/文件夹（同步）
  _removeDir(src) {
    fse.removeSync(src);
  }

};

module.exports = GeneratorAntdCustom;