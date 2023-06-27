const path = require("path");
const cssExtract = require("mini-css-extract-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const packageJson = require("./package.json");
const dependencies = packageJson.dependencies;

const ipdURL = process.env.IPD_URL || "http://localhost:9001";

module.exports = {
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },
  entry: {
    index: "./src/index.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    // library: "BahmniNextUI",
    // libraryTarget: "umd",
    // umdNamedDefine: true,
    filename: "[name].[contenthash].js",
    clean: true,
  },
  devServer: {},
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new cssExtract({
      filename: "styles.css",
    }),
    new ModuleFederationPlugin({
      name: "bahmni_mfe_host",
      filename: "remoteEntry.js",
      remotes: {
          '@openmrs-mf/ipd': `bahmni_ipd@${ipdURL}/remoteEntry.js`,
      },
      exposes: {},
      shared: {
        ...dependencies,
        react: {
          singleton: true,
          requiredVersion: dependencies.react,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: dependencies["react-dom"],
        },
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.m?js/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/i,
        use: [cssExtract.loader, "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [cssExtract.loader, "css-loader", "sass-loader"],
      },
    ],
  }
};
