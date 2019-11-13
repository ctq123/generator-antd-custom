/**
 * cfe update
 * 更新脚手架
 */
module.exports = async function() {
  const { name } = this.pkg
  this.spinner(`正在安装最新版的 ${name} ...`)
  try {
    this.npmExecSync(`npm i -g ${name}@latest`)
    this.spinner('升级完成', 'succeed')
  } catch(e) {
    this.spinner(`安装失败，请检查网络是否正常`, 'fail')
  } finally {
    this.spinner('', 'stop')
  }
}