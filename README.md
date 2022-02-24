# dokit-pc

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


### Compile electron app for development
```
npm run electron:serve
```

### Compile electron app for production
```
npm run electron:build
```

### 打包失败兜底方案
查看打包失败时用的electron版本
在 https://registry.npmmirror.com/binary.html?path=electron 下载对应的版本包和对应的 SHASUMS256.txt 文件 到electron缓存目录
MacOS的electron缓存目录一般为为 ~/Library/Caches/electron
文件放到缓存目录后 重新打包就能成功构建出app了
