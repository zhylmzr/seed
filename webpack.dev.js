const path = require('path')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    library: 'Seed',
    libraryTarget: 'window',
    libraryExport: 'default',
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  }
})