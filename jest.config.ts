import type { Config } from "jest";

const config: Config = {
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  preset: 'jest-puppeteer',
  testMatch: [
    "<rootDir>/tests/**/*.test.ts",
  ],
  testTimeout: 30000,
  moduleNameMapper: {
    "^(\\.\\.?\\/.+)\\.js$": "$1",
  },
  verbose: true,
};

export default config;
