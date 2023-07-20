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
