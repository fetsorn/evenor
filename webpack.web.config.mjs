import path from "path";
import url from "url";
import webpack from "webpack";
// import CopyPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default (env) => {
  return {
    entry: "./src/renderer/renderer.jsx",
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
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          }
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __BUILD_MODE__: JSON.stringify(env.buildMode),
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

      // new CopyPlugin({
      //   patterns: [
      //     {
      //       context: "node_modules/@fetsorn/",
      //       from: "**/*.wasm",
      //       to: "[name][ext]",
      //     },
      //     //{ context: "node_modules/@ffmpeg/",  from: "**/*.wasm", to: "static/js/[name][ext]" },
      //     // {
      //     //   context: "node_modules/@hpcc-js/",
      //     //   from: "**/*.wasm",
      //     //   to: "[name][ext]",
      //     // },
      //     { context: "public/js/", from: "**", to: "[name][ext]" },
      //   ],
      // }),

      new HtmlWebpackPlugin({
        template: "./src/renderer/index.html",
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
};
