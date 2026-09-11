const path = require('path')
const name = 'Vue Typescript Admin'
const IS_PROD = ['production', 'development'].includes(process.env.NODE_ENV)

module.exports = {
  'publicPath': process.env.NODE_ENV === 'production' ? './' : '/', // TODO: Remember to change this to fit your need
  'lintOnSave': process.env.NODE_ENV === 'development',
  // PWA 已禁用：workbox-build 在当前 Node 24 工具链下报 'assignWith is not defined'，管理端也不需要离线缓存
  // 'pwa': {
  //   'name': name
  // },
  'pluginOptions': {
    'style-resources-loader': {
      'preProcessor': 'scss',
      'patterns': [
        path.resolve(__dirname, 'src/styles/_variables.scss'),
        path.resolve(__dirname, 'src/styles/_mixins.scss')
      ]
    }
  },
  // 开启代理
  devServer: {
    host:'0.0.0.0',
    public: '0.0.0.0:8888', // 本地的ip:端口号
    port: 8888,
    open: true,
    disableHostCheck:true,
    hot:true,//自动保存
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      '/api': {
        target: process.env.VUE_APP_URL,
        ws: false,
        secure: false,
        changeOrigin: true,
        pathRewrite:{
          '^/api':''
        }
      }
    }
  },
  chainWebpack: (config) => {
    config.resolve.symlinks(true) // 修复热更新失效
    // Node24 下 workbox-build 崩溃（'assignWith is not defined'），管理端无需离线 SW，直接移除
    config.plugins.delete('workbox')
    // 生产打包跳过 TS 类型检查：重装依赖后的 .d.ts 使用了 TS3.8+ 语法（vue2.7/@types/node），
    // 与工程固定的 TS3.6.2 冲突，仅影响类型检查不影响运行产物；dev 环境保留检查
    if (process.env.NODE_ENV === 'production') {
      config.plugins.delete('fork-ts-checker')
    }
  },
  configureWebpack: {
    devtool: 'source-map'
  },

  css: {
    // 是否使用css分离插件 ExtractTextPlugin
    extract: IS_PROD,
    // 开启 CSS source maps?
    sourceMap: false,
    // css预设器配置项
    loaderOptions: {
    },
    // 启用 CSS modules for all css / pre-processor files.
    modules: false,
},
};
