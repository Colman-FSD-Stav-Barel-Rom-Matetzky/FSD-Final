/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  detectOpenHandles: true,
  forceExit: true,
  setupFiles: ['<rootDir>/src/tests/setup.ts'],
};
