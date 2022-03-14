module.exports = {
  pluginOptions:{
    electronBuilder:{
      preload:'src/main/preload.ts',
      builderOptions: {
        asar: false,
        // extraResources: [{
        //   'from': './src/resources/socketServer/',
        //   'to': 'resources/socketServer',
        //   'filter': ['!**/*.ts']
        // }]
      }
    }
  }
}