module.exports = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/src/__mocks__/fileMock.js",
    "\\.(css|scss|sass)$": "<rootDir>/src/__mocks__/styleMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],

  collectCoverage: true,
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 58,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }

};
