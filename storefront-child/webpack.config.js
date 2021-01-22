const webpack = require('webpack');
const path = require('path');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const config = {
  entry: './assets/js/src/index.js',
  output: {
    path: path.resolve(__dirname, 'assets/js/dist'),
    filename: 'bundle.js'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          /node_modules/,
          path.resolve(__dirname, 'assets/js/src/vendor')
        ],
        use: 'babel-loader'
      }
    ]
  },
  optimization: {
    minimize: false,
    minimizer: [
      new TerserPlugin()
    ]
  },
  plugins: [
    new BrowserSyncPlugin({
      files: '**/*.php',
      proxy: 'http://localhost:8888'
    })
  ]
};

module.exports = config;
