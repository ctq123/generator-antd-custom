/**
 * cfe update
 * 更新脚手架
 */
module.exports = async function() {
  const { name } = this.pkg
  new Promise((resolve, reject) => {
    this.spinner(`正在升级 ${name} ...`)
    this.npmExec(`npm i -g ${name}@latest`, {}, err => err ? reject(err) : resolve())
  }).then(resp => {
    this.spinner(`${name}升级完成`, 'succeed')
  }).catch(e => {
    this.spinner(`${name}升级失败，请检查包名称是否正确`, 'fail')
    this.log(e, 'red')
  }).finally(() => {
    this.spinner('', 'stop')
  })
}