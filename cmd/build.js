const help = require('./help')
/**
 * cfe build
 * 启动项目命令
 */
module.exports = async function(env) {
  env = env || process.argv[3]
  if (!env) {
    help.call(this)
    return
  }
  const cmd = 'build:' + env
  this.runScriptCmd(cmd)
}