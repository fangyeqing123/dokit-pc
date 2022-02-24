module.exports = {
  pluginOptions:{
    electronBuilder:{
      preload:'src/main/preload.js',
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