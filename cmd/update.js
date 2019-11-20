/**
 * cfe update
 * 更新脚手架
 */
module.exports = async function() {
  const { name } = this.pkg
  try {
    this.log(`正在升级 ${name} ...`)
    this.shellInstall(`npm i ${name}@latest -g -d`, { cwd: this.tmplDir })
    this.log(`${name} 升级完成`)
  } catch(e) {
    this.log(`${name} 升级失败，请检查包名称是否正确`)
    this.log(e, 'red')
  }

}