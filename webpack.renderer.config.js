const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  // target: 'electron-renderer', // do not set,
  // causes "require is not defined" in electron-webpack-plugin
  entry: { renderer: "./src/renderer/app.jsx" },
  mode: process.env.production ? "production" : "development",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  experiments: {
    syncWebAssembly: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      __BUILD_MODE__: JSON.stringify("electron"),
    }),

    new MiniCssExtractPlugin({
      filename: "style.css",
    }),

    new webpack.ProvidePlugin({
      process: "process/browser",
    }),

    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),

    new CopyPlugin({
      patterns: [
        {
          context: "src-electron",
          from: "preload.js",
          to: "public/[name][ext]",
        },
        { context: "public/", from: "icon.png", to: "public/[name][ext]" },
        { context: "public/js/", from: "**", to: "[name][ext]" },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/renderer"),
      lib: path.resolve(__dirname, "./src/lib"),
    },
    fallback: {
      // For WASM
      stream: require.resolve("stream-browserify"),
      // For Ethereum Web3
      // os: require.resolve('os-browserify/browser'),
      // http: require.resolve('stream-http'),
      // events: require.resolve('events/'),
      // string_decoder: require.resolve('string_decoder/'),
      crypto: require.resolve("crypto-browserify"),
      // https: require.resolve('https-browserify'),
      path: require.resolve("path-browserify"),
      fs: false,
      buffer: require.resolve("buffer/"),
      // util: require.resolve('util'),
      // zlib: require.resolve('zlib-browserify'),
      // process: require.resolve('process/browser'),
    },
    extensions: [".js", ".jsx", ".css"],
  },
};
