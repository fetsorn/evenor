const path = require('path');

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
  resolve: {
    alias: {
      lib: path.resolve(__dirname, './src/lib'),
    },
    extensions: ['.js', '.jsx', '.css', '.json'],
  },
};
