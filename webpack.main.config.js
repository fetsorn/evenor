const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ThreadsPlugin = require('threads-plugin');

module.exports = {
  // target: 'electron-main',
  entry: './src/main/index.js',
  // mode: "development",
  // devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  experiments: {
    asyncWebAssembly: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { context: 'src/lib/api/', from: 'grep.worker.js', to: '[name][ext]' },
        { context: 'src/lib/api/', from: 'grep.worker.js', to: '[name][ext]' },
        {
          context: 'node_modules/@fetsorn/wasm-grep/pkg/nodejs/',
          from: '*',
          to: '[name][ext]',
        },
      ],
    }),

    new ThreadsPlugin({
      target: 'electron-node-worker',
    }),
  ],
  resolve: {
    alias: {
      lib: path.resolve(__dirname, './src/lib'),
    },
    extensions: ['.js', '.jsx', '.css', '.json'],
  },
};
