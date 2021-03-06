module.exports = (api, { entry, name }) => {
  const genConfig = (format, postfix = format) => {
    api.chainWebpack(config => {
      const libName = name || api.service.pkg.name

      config.entryPoints.clear()
      // set proxy entry for *.vue files
      if (/\.vue$/.test(entry)) {
        config
          .entry(`${libName}.${postfix}`)
            .add(require.resolve('./entry-lib.js'))
        config.resolve
          .alias
            .set('~entry', api.resolve(entry))
      } else {
        config
          .entry(`${libName}.${postfix}`)
            .add(api.resolve(entry))
      }

      config.output
        .filename(`[name].js`)
        .library(libName)
        .libraryExport('default')
        .libraryTarget(format)

      // adjust css output name
      config
        .plugin('extract-css')
          .tap(args => {
            args[0].filename = `${libName}.css`
            return args
          })

      // only minify min entry
      config
        .plugin('uglify')
          .tap(args => {
            args[0].include = /\.min\.js$/
            return args
          })

      // externalize Vue in case user imports it
      config
        .externals({
          vue: {
            commonjs: 'vue',
            commonjs2: 'vue',
            root: 'Vue'
          }
        })
    })

    return api.resolveWebpackConfig()
  }

  return [
    genConfig('commonjs2', 'common'),
    genConfig('umd'),
    genConfig('umd', 'umd.min')
  ]
}
