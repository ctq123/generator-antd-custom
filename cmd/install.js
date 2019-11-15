/**
 * cfe install [name]
 * 安装依赖包
 */
module.exports = async function(name) {
  name = name || process.argv[3]
  if (!name) return
  new Promise((resolve, reject) => {
    this.spinner(`正在安装 ${name} ...`, 'start')
    this.npmExec(`npm i ${name}@latest -S`, { cwd: this.tmplDir }, err => err ? reject(err) : resolve())
  }).then(resp => {
    this.spinner(`${name}安装完成`, 'succeed')
  }).catch(e => {
    this.spinner(`${name}安装失败，请检查包名称是否正确`, 'fail')
    this.log(e, 'red')
  }).finally(() => {
    this.spinner('', 'stop')
  })

}