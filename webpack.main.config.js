const webpack = require('webpack');
const path = require('path');

module.exports = {
  // target: 'electron-main',
  entry: './src/main/index.js',
  // mode: "development",
  // devtool: "source-map",
  module: {
    rules: [
      // Add support for native node modules
      // {
      //   // We're specifying native_modules in the test
      //   // because the asset relocator loader generates
      //   // a "fake" .node file which is really a cjs file.
      //   test: /\.(js|jsx)$/,
      //   use: "node-loader",
      // },
      // {
      //   test: /\.(m?js|node)$/,
      //   parser: { amd: false },
      //   use: {
      //     loader: "@vercel/webpack-asset-relocator-loader",
      //     options: {
      //       outputAssetBase: "native_modules",
      //     },
      //   },
      // },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  // plugins: [
  //   new webpack.DefinePlugin({
  //     URLSearchParams: ['url', 'URLSearchParams'],
  //   }),
  // ],
  // node: {
  //   global: true,
  //   __filename: true,
  //   __dirname: true,
  // },
  // externals: {
  //   fs: 'commonjs2 fs',
  //   path: 'commonjs2 path',
  //   child_process: 'commonjs2 child_process',
  //   os: 'commonjs2 os',
  //   util: 'commonjs2 util',
  //   electron: 'commonjs2 electron',
  //   "electron-devtools-installer": "commonjs2 electron-devtools-installer",
  //   // "word-extractor": "commonjs2 word-extractor",
  // },
  resolve: {
    alias: {
      lib: path.resolve(__dirname, './src/lib'),
    },
    extensions: ['.js', '.jsx', '.css', '.json'],
  },
};
