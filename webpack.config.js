// const TransferWebpackPlugin = require('transfer-webpack-plugin');

var path = require('path')
var webpack = require('webpack')

module.exports = {
  // devtool: 'cheap-module-eval-source-map',
  devtool: 'source-map',
  entry: [
    'webpack-hot-middleware/client',
    './src/index.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.js',
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: [ 'babel' ],
        exclude: /node_modules/,
        include: __dirname
      }
    ]
  }
}
