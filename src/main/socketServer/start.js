const {runProxyServer} = require("./index")

export const startProxyServer = () => {
  try {
    // 启动服务
    // TODO: 查找free port
    const info = runProxyServer('22684')
    return info
  } catch (error) {
    return null
  }
}


