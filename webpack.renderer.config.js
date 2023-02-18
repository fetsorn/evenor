const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(m?js|node)$/,
        parser: { amd: false },
        use: {
          loader: "@vercel/webpack-asset-relocator-loader",
          options: {
            outputAssetBase: "native_modules",
          },
        },
      },
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
      {
        test: /native_modules\/.+\.node$/,
        use: "node-loader",
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
        // TODO: deduplicate wasm
        {
          context: "node_modules/@fetsorn/wasm-grep/pkg/bundler/",
          from: "**.wasm",
          to: "[name][ext]",
        },
        {
          context: "node_modules/@fetsorn/wasm-grep/pkg/bundler/",
          from: "**.wasm",
          to: "src_renderer_workers_query_worker_ts/[name][ext]",
        },
        {
          context: "node_modules/@fetsorn/wasm-grep/pkg/bundler/",
          from: "**.wasm",
          to: "vendors-node_modules_fetsorn_csvs-js_dist_csvs_js/[name][ext]",
        },
        //{ context: "node_modules/@ffmpeg/",  from: "**/*.wasm", to: "static/js/[name][ext]" },
        // {
        //   context: "node_modules/@hpcc-js/",
        //   from: "**/*.wasm",
        //   to: "[name][ext]",
        // },
        { context: "public/js/", from: "**", to: "[name][ext]" },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/renderer"),
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
