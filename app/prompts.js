module.exports = [
  {
    type: 'input',
    name: 'projectName',
    message: '请输入项目名称(antd-custom):',
    default: 'antd-custom'
  },
  {
    type: 'input',
    name: 'projectVersion',
    message: '请输入项目版本号(1.0.0):',
    default: '1.0.0'
  },
  {
    type: 'input',
    name: 'projectDesc',
    message: '请输入项目描述:'
  },
  {
    type: 'input',
    name: 'projectAuthor',
    message: '请输入项目作者:',
  },
  {
    type: 'list',
    name: 'projectLicense',
    message: '请选择项目协议(ISC):',
    choices: ['ISC', 'MIT', 'Apache-2.0', 'AGPL-3.0'],
    default: 'ISC'
  },
]