import type { Config } from "jest";

const config: Config = {
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  preset: 'jest-puppeteer',
  testMatch: [
    "<rootDir>/tests/**/*.test.ts",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/tests/walmart-scraper.test.ts"
  ],
  testTimeout: 100000000,
  moduleNameMapper: {
    "^(\\.\\.?\\/.+)\\.js$": "$1",
  },
  verbose: true,
};

export default config;
