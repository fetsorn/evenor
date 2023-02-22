const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  // target: 'electron-renderer', // do not set, causes "require is not defined" in electron-webpack-plugin
  entry: { renderer: "./src/renderer/renderer.jsx" },
  mode: "development",
  devtool: "source-map",
  module: {
    rules: [
      // {
      //   test: /native_modules\/.+\.node$/,
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
        }
      },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
    ],
    // parser: {
    //   javascript: {
    //     importMeta:false
    //   },
    // },
  },
  node: {
    global: true,
    __filename: true,
    __dirname: true,
  },
  experiments: {
    syncWebAssembly: true,
  },
  externals: {
    fs: 'commonjs2 fs',
    path: 'commonjs2 path',
    child_process: 'commonjs2 child_process',
    os: 'commonjs2 os',
    util: 'commonjs2 util',
    electron: 'commonjs2 electron',
    "electron-devtools-installer": "commonjs2 electron-devtools-installer",
    // "word-extractor": "commonjs2 word-extractor",
  },
  // optimization: {
  //   runtimeChunk: "single",
  // },
  plugins: [
    new webpack.DefinePlugin({
      __BUILD_MODE__: JSON.stringify("electron"),
      __filename: () => { console.log("hehe") }
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

  //   new CopyPlugin({
  //     patterns: [
  //       // TODO: deduplicate wasm
  //       {
  //         context: "node_modules/@fetsorn/wasm-grep/pkg/bundler/",
  //         from: "**.wasm",
  //         to: "[name][ext]",
  //       },
  //       {
  //         context: "node_modules/@fetsorn/wasm-grep/pkg/bundler/",
  //         from: "**.wasm",
  //         to: "src_renderer_workers_query_worker_js/[name][ext]",
  //       },
  //       {
  //         context: "node_modules/@fetsorn/wasm-grep/pkg/bundler/",
  //         from: "**.wasm",
  //         to: "vendors-node_modules_fetsorn_csvs-js_dist_csvs_js/[name][ext]",
  //       },
  //       //{ context: "node_modules/@ffmpeg/",  from: "**/*.wasm", to: "static/js/[name][ext]" },
  //       // {
  //       //   context: "node_modules/@hpcc-js/",
  //       //   from: "**/*.wasm",
  //       //   to: "[name][ext]",
  //       // },
  //       { context: "public/js/", from: "**", to: "[name][ext]" },
  //     ],
  //   }),
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
      os: require.resolve("os-browserify/browser"),
      http: require.resolve("stream-http"),
      events: require.resolve('events/'),
      string_decoder: require.resolve('string_decoder/'),
      crypto: require.resolve("crypto-browserify"),
      https: require.resolve("https-browserify"),
      path: require.resolve("path-browserify"),
      fs: false,
      buffer: require.resolve("buffer/"),
      util: require.resolve("util"),
      zlib: require.resolve("zlib-browserify"),
      process: require.resolve('process/browser'),
    },
    extensions: [".js", ".jsx", ".css"],
  },
};
