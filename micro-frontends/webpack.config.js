/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

const path = require("path");
const cssExtract = require("mini-css-extract-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const packageJson = require("./package.json");
const dependencies = packageJson.dependencies;

module.exports = {
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    alias: {
      react: path.resolve(__dirname, "./src/__mocks__/globalReact.js"),
      "react-dom": path.resolve(__dirname, "./src/__mocks__/globalReactDom.js"),
    },
  },
  entry: {
    ipd: "./src/ipd/index.js",
    "next-ui": "./src/next-ui/index.js",
    shared: "./src/shared.js",
  },
  output: {
    path: path.resolve(__dirname, "../ui/app/micro-frontends-dist"),
    filename: "[name].min.js",
    clean: true,
  },
  devServer: {},
  plugins: [
    new cssExtract({
      filename: "[name].min.css",
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "public", to: "../micro-frontends-dist/" }],
    }),
    new ModuleFederationPlugin({
      name: "bahmni_mfe_host",
      filename: "remoteEntry.js",
      remotes: {
        "@openmrs-mf/ipd": remoteProxiedAtHostDomain({ name: "bahmni_ipd", path: "ipd" }),
      },
      exposes: {},
      shared: {
        "carbon-components-react": {
          singleton: true,
          eager: true,
          requiredVersion: dependencies["carbon-components-react"],
        },
        "carbon-components": {
          singleton: true,
          eager: true,
          requiredVersion: dependencies["carbon-components"],
        },
        "bahmni-carbon-ui": {
          singleton: true,
          eager: true,
          requiredVersion: dependencies["bahmni-carbon-ui"],
        },
        react: {
          singleton: true,
          eager: true,
          requiredVersion: dependencies.react,
        },
        "react-dom": {
          singleton: true,
          eager: true,
          requiredVersion: dependencies["react-dom"],
        },
      },
    }),
  ],
  module: {
    // noParse: ['react'],
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
  },
  externals: {
    react: "React", // Exclude react from the bundled output
    "react-dom": "ReactDOM", // Exclude react-dom from the bundled output
  },
};
