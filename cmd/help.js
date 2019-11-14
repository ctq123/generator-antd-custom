/**
 * cfe help
 * 帮助命令
 */
module.exports = async function() {
  const msg = `
  ==========================================
  cfe 使用帮助:  $ cfe [command]

  $  cfe init [name]         # 初始化项目
  $  cfe start               # 启动项目
  $  cfe build [env]         # 打包项目
  $  cfe update              # 更新脚手架
  $  cfe -v                  # 显示版本号
  $  cfe version             # 显示版本号
  $  cfe -h                  # 显示帮助信息
  $  cfe help                # 显示帮助信息
  ==========================================

  [name]  #项目模板名称，如react
  [env]   #打包环境，[dev, test, pre, prod]
  
  `
  console.log(msg)

}