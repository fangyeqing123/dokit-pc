module.exports = {
  pluginOptions:{
    electronBuilder:{
      preload:'src/main/preload.ts',
      builderOptions: {
        productName:'DoKitStudio',
        asar: false,
        mac: {
          icon: "./public/dokit_pc_logo.ico"
        },
        win: { // win相关配置
          icon: './public/dokit_pc_logo.ico', // 图标，当前图标在根目录下，注意这里有两个坑
          requestedExecutionLevel: "requireAdministrator", //获取管理员权限
          target: [{
            target: 'nsis', // 利用nsis制作安装程序
            arch: [
              'x64', // 64位
              'ia32'
            ]
          }]
        },
        nsis: {
          oneClick: false, // 是否一键安装
          allowElevation: true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          allowToChangeInstallationDirectory: true, // 允许修改安装目录
          installerIcon: './public/dokit_pc_logo.ico', // 安装图标
          uninstallerIcon: './public/dokit_pc_logo.ico', // 卸载图标
          installerHeaderIcon: './public/dokit_pc_logo.ico', // 安装时头部图标
          createDesktopShortcut: true, // 创建桌面图标
          createStartMenuShortcut: true, // 创建开始菜单图标
          shortcutName: 'DoKitStudio' // 图标名称(项目名称)
        }
        // extraResources: [{
        //   'from': './src/resources/socketServer/',
        //   'to': 'resources/socketServer',
        //   'filter': ['!**/*.ts']
        // }]
      },
    }
  }
}