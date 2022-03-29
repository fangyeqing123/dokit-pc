module.exports = {
  pluginOptions:{
    electronBuilder:{
      preload:'src/main/preload.ts',
      builderOptions: {
        asar: false,
        // mac: {
        //   icon: "./public/favicon.ico"
        // },
        // extraResources: [{
        //   'from': './src/resources/socketServer/',
        //   'to': 'resources/socketServer',
        //   'filter': ['!**/*.ts']
        // }]
      },
    }
  }
}