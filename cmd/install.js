/**
 * cfe install [name]
 * 安装依赖包
 */
module.exports = async function(name) {
  name = name || process.argv[3]
  if (!name) return
  try {
    this.log(`正在安装 ${name} ...`)
    this.shellInstall(`npm i ${name}@latest -S -d`, { cwd: this.tmplDir })
    this.log(`${name} 安装完成`)
  } catch(e) {
    this.log(`${name} 安装失败，请检查包名称是否正确`)
    this.log(e, 'red')
  }

}