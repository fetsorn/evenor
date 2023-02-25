import path from 'path';
import url from 'url';
import { createRequire } from 'module';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const require = createRequire(import.meta.url);
const dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default (env) => ({
  entry: './src/renderer/app.jsx',
  mode: process.env.production ? 'production' : 'development',
  devtool: 'source-map',
  output: {
    path: path.resolve(dirname, 'release/renderer'),
    filename: '[name].bundle.js',
  },
  experiments: {
    syncWebAssembly: true,
  },
  performance: {
    hints: false,
  },
  module: {
    rules: [
      {
        test: /\.(jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        // use: ['style-loader', 'css-loader'],
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __BUILD_MODE__: JSON.stringify(env.buildMode),
    }),

    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),

    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),

    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),

    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
      favicon: './public/favicon.ico',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src/renderer'),
      lib: path.resolve(dirname, './src/lib'),
    },
    fallback: {
      // For WASM
      stream: require.resolve('stream-browserify'),
      // For Ethereum Web3
      crypto: require.resolve('crypto-browserify'),
      fs: false,
      // path: require.resolve('path-browserify'),
      buffer: require.resolve('buffer/'),
      // util: require.resolve('util'),
      // zlib: require.resolve('zlib-browserify'),
      // process: require.resolve('process/browser'),
    },
    extensions: ['.js', '.jsx', '.css'],
  },
});
