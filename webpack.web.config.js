const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env) => {
  return {
    // target: 'electron-renderer', // slightly changes js output
    entry: { renderer: "./src/renderer/renderer.tsx" },
    mode: process.env.production ? "production" : "development",
    output: {
      path: path.resolve(__dirname, "release/renderer"),
      filename: "[name].js",
    },
    experiments: {
      syncWebAssembly: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /(node_modules|\.webpack)/,
          use: {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        },
        {
          test: /\.css$/,
          use: [{ loader: "style-loader" }, { loader: "css-loader" }],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __BUILD_MODE__: JSON.stringify(env.buildMode),
      }),

      new ForkTsCheckerWebpackPlugin(),

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
            context: "node_modules/@fetsorn/",
            from: "**/*.wasm",
            to: "[name][ext]",
          },
          //{ context: "node_modules/@ffmpeg/",  from: "**/*.wasm", to: "static/js/[name][ext]" },
          {
            context: "node_modules/@hpcc-js/",
            from: "**/*.wasm",
            to: "[name][ext]",
          },
          { context: "public/js/", from: "**", to: "[name][ext]" },
        ],
      }),
      new HtmlWebpackPlugin({
        template: "./src/renderer/index.html",
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, './src/renderer'),
      },
      fallback: {
        // For WASM
        stream: require.resolve("stream-browserify"),
        // For Ethereum Web3
        os: require.resolve("os-browserify/browser"),
        http: require.resolve("stream-http"),
        crypto: require.resolve("crypto-browserify"),
        https: require.resolve("https-browserify"),
        path: require.resolve("path-browserify"),
        fs: false,
        buffer: require.resolve("buffer/"),
        util: require.resolve("util/"),
        zlib: require.resolve("zlib-browserify"),
        // process: require.resolve('process/browser'),
      },
      extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
    },
  };
};
