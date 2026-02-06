/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    // Map ESM .js import specifiers back to TS during tests.
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  // Only run TypeScript test files.
  testMatch: ["**/*.test.ts"],
  // Skip build and dependencies.
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  // Keep unit tests isolated.
  clearMocks: true,
  restoreMocks: true,
  globals: {
    "ts-jest": {
      // ESM mode is required because the backend uses NodeNext modules.
      useESM: true,
      // Separate TS config for tests to avoid emitting files.
      tsconfig: "./tsconfig.test.json",
    },
  },
};
