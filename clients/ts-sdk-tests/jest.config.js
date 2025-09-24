/** @type {import('jest').Config} */
export default {
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/src/**/*.test.ts",
    "<rootDir>/__tests__/**/*.test.ts",
  ],
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts",
    "!<rootDir>/src/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  verbose: true,
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      useESM: true,
    }],
  },
};