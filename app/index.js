const Generator = require('yeoman-generator');
const updateNotifier = require('update-notifier');
const chalk = require('chalk');
const yosay = require('yosay');
const beeper = require('beeper');
const path = require('path');
const _ = require('lodash');
const ora = require('ora');
const download = require('download-git-repo');
const deepextend = require('deep-extend');
const mkdirp = require('mkdirp');
const prompts = require('./prompts');
const pkg = require('../package.json');


class GeneratorAntdCustom extends Generator {
  initializing() {
    this.props = {};
    this.success = false;
    this._checkVersion();
  }

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

  prompting() {
    return this.prompt(prompts).then(props => {
      this.props = props;
    });
  }

  writing() {
    const { projectName, projectVersion, projectDesc, projectAuthor, projectLicense } = this.props || {};
    const repo_base = 'https://github.com/';
    const repo_github = 'ctq123/antd-custom';
    
    let spinner = ora(`开始从仓库${chalk.blue(repo_base + repo_github)}下载模板...`);
    spinner.start();

    new Promise((resolve, reject) => {
      download(repo_github, projectName, err => err ? reject(err) : resolve());
    }).then(() => {
      spinner.stopAndPersist({
        symbol: chalk.green('   ✔'),
        text: `下载模板${chalk.red('antd-custom')} 成功！`
      });

      // 进入projectName目录
      this.destinationRoot(this.destinationPath(projectName))

      // 读取package.json
      const new_pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
      new_pkg.keywords = (new_pkg.keywords || []).push(pkg.name);
      new_pkg.name = projectName;
      new_pkg.version = projectVersion;
      new_pkg.description = projectDesc;
      new_pkg.author = projectAuthor;
      new_pkg.license = projectLicense;
      done();
      // 删除原package.json
      this.fs.delete(this.destinationPath('package.json'));
      beeper();
      // 传递新package.json变量
      return new_pkg;
    }).then(new_pkg => {
      // 重写package.json
      this.fs.writeJSON(this.destinationPath('package.json'), new_pkg);
      this.success = true;
    }).catch(err => {
      this.log(`模板操作失败！` + chalk.red(err));
      spinner.fail();
      this.success = false;
      this.env.error(err);
    });
    
    // // 检测并创建目录
    // if (path.basename(this.destinationPath()) !== projectName) {
    //   this.log(
    //     '正在创建目录' + projectName
    //   );
    //   mkdirp(projectName);
    //   this.destinationRoot(this.destinationPath(projectName));
    // }

    // // 创建src目录
    // mkdirp('src');

    // // 复制webpack.config.js
    // this.fs.copy(
    //   this.templatePath('webpack_tmpl.config.js'),
    //   this.destinationPath('webpack.config.js')
    // );

    // // 复制index.js
    // this.fs.copy(
    //   this.templatePath('index_tmpl.js'),
    //   this.destinationPath('src/index.js')
    // )
  }

  install() {
    if (this.success) {
      this.installDependencies()
    }
  }

  end() {
    if (this.success) {
      this.log();
      this.log(`一切准备就绪！启动项目请运行命令：${chalk.yellow('npm start')}`);
    }
  }

};

module.exports = GeneratorAntdCustom;