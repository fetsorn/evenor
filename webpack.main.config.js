const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

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
        {
          context: 'node_modules/@fetsorn/wasm-grep/pkg/nodejs/',
          from: '*',
          to: '[name][ext]',
        },
        { context: 'public/js/', from: '**', to: '[name][ext]' },
      ],
    }),
  ],
  resolve: {
    alias: {
      lib: path.resolve(__dirname, './src/lib'),
    },
    extensions: ['.js', '.jsx', '.css', '.json'],
  },
};
