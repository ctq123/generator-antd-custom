/**
 * cfe update
 * 更新脚手架
 */
module.exports = async function() {
  const { name } = this.pkg
  this.spinner(`正在升级 ${name} ...`)
  this.log()
  try {
    this.npmExecSync(`npm i -g ${name}@latest`)
    this.spinner(`${name}升级完成`, 'succeed')
  } catch(e) {
    this.spinner(`${name}升级失败，请检查网络是否正常`, 'fail')
  } finally {
    this.spinner('', 'stop')
  }
}