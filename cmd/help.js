/**
 * cfe help
 * 帮助命令
 */
module.exports = async function() {
  const msg = `
  ==========================================
  cfe 使用帮助:  $ cfe [command]

  $  cfe init [name]         # 初始化项目
  $  cfe update              # 更新脚手架
  $  cfe i [name]            # 安装模版
  $  cfe install [name]      # 安装模版
  $  cfe -v                  # 显示版本号
  $  cfe version             # 显示版本号
  $  cfe -h                  # 显示帮助信息
  $  cfe help                # 显示帮助信息
  ==========================================
  `
  console.log(msg)

}