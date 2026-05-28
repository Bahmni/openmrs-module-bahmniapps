/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

module.exports = {
  root: true,
  ignorePatterns: [
    "node_modules/*",
    "*.config.js",
    ".*",
    "**/__mocks__/*",
    "src/setupTests.js",
  ],
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react"],
  rules: {},
  settings: {
    react: {
      version: "detect",
    },
  },
  globals: {
    angular: "readonly",
  },
  overrides: [
    {
      files: ["*.spec.js", "*.spec.jsx"],
      plugins: ["jest"],
      extends: ["plugin:jest/recommended"],
      rules: {},
    },
  ],
};
