const path = require('path')

module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [{
      test: /.ts$/,
      use: ['ts-loader', 'eslint-loader'],
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  }
}