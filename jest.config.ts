import type { Config } from "jest";

const config: Config = {
    preset: 'jest-puppeteer',
    testMatch: [
        "<rootDir>/tests/**/*.test.ts",
    ],
    testTimeout: 30000,
    verbose: true,
};

export default config;
