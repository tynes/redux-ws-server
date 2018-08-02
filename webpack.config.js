const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, 'dist');
const APP_DIR = path.resolve(__dirname, 'src');

const WebpackConfig = {
  entry: `${APP_DIR}/index.js`,

  output: {
    path: BUILD_DIR,
    filename: 'index.js',
    libraryTarget: 'umd',
    library: 'redux-ws-server',
  },

  module: {
    rules: [
      {
        loader: 'babel-loader',
        test: /.js$/,
        exclude: /node_modules/,
        include: APP_DIR,
      },
    ],
  },
};

// webpack production config
if (process.env.NODE_ENV === 'production') {
  WebpackConfig.plugins = [
    new webpack.optimize.AggressiveMergingPlugin(),
    new UglifyJsPlugin({
      uglifyOptions: {
        beautify: false,
        comments: false,
      }
    }),
  ];
}

module.exports = WebpackConfig;
