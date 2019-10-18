const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');
const _ = require('lodash');
const deepextend = require('deep-extend');
const mkdirp = require('mkdirp');
const prompts = require('./prompts');
const selfpkg = require('../package.json');

class GeneratorAntdCustom extends Generator {
  initializing() {
    this.props = {};
  }

  initializing() {
    this.log('开始构建项目...');
    this.log();
    this.log(chalk.grey('环境:'));
    this.log(chalk.grey(`Node\t${process.version}`));
  }

  prompting() {
    const version = `(v${selfpkg.version})`;
    this.log(yosay(
      `欢迎使用${chalk.red('generator-antd-custom')} ${chalk.grey(version)}`
    ));

    return this.prompt(prompts).then(props => {
      this.props = props;
    });
  }

  writing() {
    const { projectName, projectVersion, projectDesc, projectAuthor, projectLicense } = this.props || {}
    const repository = 'https://github.com/ctq123/antd-custom';
    let spinner = ora(`Loading ${chalk.red('antd-custom')} from ${chalk.grey(repository)}`).start();
    
    download('bitbucket:flippidippi/download-git-repo-fixture#my-branch', 'test/tmp', { clone: true }, (err) => {
      console.log(err ? 'Error' : 'Success')
      if (err) {

      } else {
        
      }
    });
    
    new Promise((resolve, reject) => {
      const dirPath = this.destinationPath(projectName);
      download(repository, dirPath, { clone: true }, err => err ? reject(err) : resolve());
    }).then(() => {
      spinner.stopAndPersist({
        symbol: chalk.green('   ✔'),
        text: `下载${chalk.red('antd-custom')} 成功！`
      });

      // 编写package.json
      const pkg = {};
      pkg.keywords = ['generator-antd-custom'];
      pkg.name = projectName;
      pkg.version = projectVersion;
      pkg.description = projectDesc;
      pkg.author = projectAuthor;
      pkg.license = projectLicense;

      this.fs.writeJSON(this.destinationPath('package.json'), pkg);

    }).catch(err => {
      spinner.fail();
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
    this.installDependencies()
  }

  end() {
    this.log();
    this.log(`一切准备就绪！启动项目请运行命令：${chalk.yellow('npm start')}`);
  }

};

module.exports = GeneratorAntdCustom;