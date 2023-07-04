module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/fod/' : '/',
  devServer: {
    host: '0.0.0.0',
    port: 8081,
    https: false,
  },
  pluginOptions: {
    i18n: {
      locale: "ko",
      fallbackLocale: "ko",
      localeDir: "locales",
      enableInSFC: false
    }
  }
};