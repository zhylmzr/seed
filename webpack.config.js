const path = require('path')

module.exports = {
  devtool: 'inline-source-map',
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  module: {
    rules: [{
      test: /.ts$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  }
}